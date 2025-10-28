/**
 * Review Trades Backend Server
 * Provides API endpoints for the review trades workflow
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { AIProviderFactory } = require('../lib/aiProvider.js');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting configuration (simple in-memory rate limiter)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

/**
 * Rate limiting middleware
 */
function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, []);
  }
  
  const requests = rateLimitStore.get(ip).filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (requests.length >= RATE_LIMIT_MAX) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded'
    });
  }
  
  requests.push(now);
  rateLimitStore.set(ip, requests);
  next();
}

// Apply rate limiting to all routes
app.use(rateLimiter);

// Paths
const REPO_ROOT = path.join(__dirname, '..', '..');
const TRADES_DIR = path.join(REPO_ROOT, 'index.directory', 'SFTi.Tradez');
const SUMMARIES_DIR = path.join(REPO_ROOT, 'index.directory', 'summaries');
const HISTORY_DIR = path.join(SUMMARIES_DIR, 'history');

/**
 * Validate week ID format (YYYY.WW)
 */
function isValidWeekId(weekId) {
  return /^\d{4}\.\d{1,2}$/.test(weekId);
}

/**
 * Validate file name to prevent path traversal
 * Allows: alphanumeric, dash, underscore, dot, and colon (for time format like 10:23:2025.1.md)
 */
function isValidFileName(fileName) {
  // Only allow alphanumeric, dash, underscore, colon, dot, ending with .md
  // Colon is allowed for time-based filenames but limited to 2 occurrences max
  const colonCount = (fileName.match(/:/g) || []).length;
  if (colonCount > 2) return false; // Prevent abuse of colons
  return /^[a-zA-Z0-9\-_:.]{1,100}\.md$/.test(fileName);
}

/**
 * Sanitize path to prevent traversal attacks
 */
function sanitizePath(basePath, relativePath) {
  const fullPath = path.resolve(basePath, relativePath);
  // Ensure the resolved path is within the base path
  if (!fullPath.startsWith(path.resolve(basePath))) {
    throw new Error('Invalid path');
  }
  return fullPath;
}

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(SUMMARIES_DIR, { recursive: true });
  await fs.mkdir(HISTORY_DIR, { recursive: true });
}

/**
 * GET /api/weeks
 * List all available weeks with trade data
 */
app.get('/api/weeks', async (req, res) => {
  try {
    const entries = await fs.readdir(TRADES_DIR, { withFileTypes: true });
    const weeks = entries
      .filter(entry => entry.isDirectory() && entry.name.startsWith('week.'))
      .map(entry => {
        const weekName = entry.name.replace('week.', '');
        const [year, week] = weekName.split('.');
        return {
          id: weekName,
          name: entry.name,
          year: parseInt(year),
          week: parseInt(week),
          path: entry.name
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.week - a.week;
      });

    res.json({
      success: true,
      weeks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/trades/:week
 * Get all trade files for a specific week
 */
app.get('/api/trades/:week', async (req, res) => {
  try {
    const weekId = req.params.week;
    
    // Validate week ID format
    if (!isValidWeekId(weekId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid week ID format'
      });
    }
    
    const weekDir = sanitizePath(TRADES_DIR, `week.${weekId}`);

    // Check if week directory exists
    try {
      await fs.access(weekDir);
    } catch {
      return res.status(404).json({
        success: false,
        error: 'Week not found'
      });
    }

    // Read all markdown files except master.trade.md
    const files = await fs.readdir(weekDir);
    const tradeFiles = files.filter(f => isValidFileName(f) && f !== 'master.trade.md');

    const trades = [];
    for (const file of tradeFiles) {
      const filePath = path.join(weekDir, file);
      const content = await fs.readFile(filePath, 'utf-8');

      // Parse frontmatter
      const frontmatterMatch = content.match(/^---\s*\n(.*?)\n---\s*\n(.*)$/s);
      if (frontmatterMatch) {
        const frontmatter = yaml.load(frontmatterMatch[1]);
        const body = frontmatterMatch[2];

        trades.push({
          fileName: file,
          path: `week.${weekId}/${file}`,
          frontmatter,
          body: body.substring(0, 500) + (body.length > 500 ? '...' : ''), // Truncate body
          fullPath: filePath
        });
      }
    }

    // Try to read master.trade.md if it exists
    let masterSummary = null;
    try {
      const masterPath = path.join(weekDir, 'master.trade.md');
      const masterContent = await fs.readFile(masterPath, 'utf-8');
      masterSummary = masterContent;
    } catch {
      // Master file doesn't exist yet
    }

    res.json({
      success: true,
      week: weekId,
      trades,
      masterSummary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/trades/:week/:file
 * Get full content of a specific trade file
 */
app.get('/api/trades/:week/:file', async (req, res) => {
  try {
    const { week, file } = req.params;
    
    // Validate inputs
    if (!isValidWeekId(week) || !isValidFileName(file)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters'
      });
    }
    
    const filePath = sanitizePath(TRADES_DIR, path.join(`week.${week}`, file));

    const content = await fs.readFile(filePath, 'utf-8');
    
    // Parse frontmatter
    const frontmatterMatch = content.match(/^---\s*\n(.*?)\n---\s*\n(.*)$/s);
    if (frontmatterMatch) {
      const frontmatter = yaml.load(frontmatterMatch[1]);
      const body = frontmatterMatch[2];

      res.json({
        success: true,
        fileName: file,
        frontmatter,
        body,
        raw: content
      });
    } else {
      res.json({
        success: true,
        fileName: file,
        raw: content
      });
    }
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Trade file not found'
    });
  }
});

/**
 * GET /api/summaries
 * List all summaries (drafts and published)
 */
app.get('/api/summaries', async (req, res) => {
  try {
    const { period, status } = req.query; // period: weekly/monthly/yearly, status: draft/published

    const files = await fs.readdir(SUMMARIES_DIR);
    const summaries = [];

    for (const file of files) {
      if (!file.endsWith('.md') && !file.endsWith('.draft.md')) continue;

      const isDraft = file.endsWith('.draft.md');
      const filePeriod = file.startsWith('weekly-') ? 'weekly' :
                        file.startsWith('monthly-') ? 'monthly' :
                        file.startsWith('yearly-') ? 'yearly' : 'unknown';

      // Filter by period if specified
      if (period && filePeriod !== period) continue;
      
      // Filter by status if specified
      if (status === 'draft' && !isDraft) continue;
      if (status === 'published' && isDraft) continue;

      const filePath = path.join(SUMMARIES_DIR, file);
      const stats = await fs.stat(filePath);

      summaries.push({
        fileName: file,
        period: filePeriod,
        isDraft,
        path: `summaries/${file}`,
        modifiedAt: stats.mtime,
        size: stats.size
      });
    }

    // Sort by modified date descending
    summaries.sort((a, b) => b.modifiedAt - a.modifiedAt);

    res.json({
      success: true,
      summaries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/summaries/draft
 * Save a draft summary
 */
app.post('/api/summaries/draft', async (req, res) => {
  try {
    const { period, year, month, week, content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }
    
    // Validate inputs
    if (!['weekly', 'monthly', 'yearly'].includes(period)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid period'
      });
    }
    
    if (!year || year < 2000 || year > 2100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year'
      });
    }

    // Generate filename
    let fileName;
    if (period === 'weekly' && week) {
      if (week < 1 || week > 53) {
        return res.status(400).json({
          success: false,
          error: 'Invalid week number'
        });
      }
      fileName = `weekly-${year}-W${String(week).padStart(2, '0')}.draft.md`;
    } else if (period === 'monthly' && month) {
      if (month < 1 || month > 12) {
        return res.status(400).json({
          success: false,
          error: 'Invalid month'
        });
      }
      fileName = `monthly-${year}-${String(month).padStart(2, '0')}.draft.md`;
    } else if (period === 'yearly') {
      fileName = `yearly-${year}.draft.md`;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid period or missing required parameters'
      });
    }
    
    // Validate filename format
    if (!isValidFileName(fileName)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename generated'
      });
    }

    const filePath = path.join(SUMMARIES_DIR, fileName);
    await fs.writeFile(filePath, content, 'utf-8');

    res.json({
      success: true,
      fileName,
      path: `summaries/${fileName}`,
      message: 'Draft saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to save draft'
    });
  }
});

/**
 * POST /api/summaries/publish
 * Publish a summary (move from draft to published)
 */
app.post('/api/summaries/publish', async (req, res) => {
  try {
    const { fileName, content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }
    
    // Validate filename
    if (!fileName || !isValidFileName(fileName.replace('.draft', ''))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename'
      });
    }

    // Determine published filename
    const publishedFileName = fileName.replace('.draft.md', '.md');
    const publishedPath = path.join(SUMMARIES_DIR, publishedFileName);
    const draftPath = path.join(SUMMARIES_DIR, fileName);

    // If published version already exists, move it to history
    try {
      await fs.access(publishedPath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const historyFileName = publishedFileName.replace('.md', `.${timestamp}.md`);
      const historyPath = path.join(HISTORY_DIR, historyFileName);
      await fs.rename(publishedPath, historyPath);
    } catch {
      // Published version doesn't exist, no need to archive
    }

    // Write published version
    await fs.writeFile(publishedPath, content, 'utf-8');

    // Remove draft if it exists
    try {
      await fs.unlink(draftPath);
    } catch {
      // Draft might not exist as a file
    }

    res.json({
      success: true,
      fileName: publishedFileName,
      path: `summaries/${publishedFileName}`,
      message: 'Summary published successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to publish summary'
    });
  }
});

/**
 * POST /api/summaries/generate
 * Generate a summary using AI
 */
app.post('/api/summaries/generate', async (req, res) => {
  try {
    const {
      period,
      year,
      month,
      includeTrades = [],
      includeWeeklies = [],
      options = {}
    } = req.body;

    // Validate period
    if (!period || !['month', 'year'].includes(period)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid period'
      });
    }
    
    // Validate year
    if (!year || year < 2000 || year > 2100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year'
      });
    }

    if (period === 'month') {
      if (!month || month < 1 || month > 12) {
        return res.status(400).json({
          success: false,
          error: 'Invalid month'
        });
      }
    }

    // Load trade files with validation
    const tradeFiles = [];
    for (const tradePath of includeTrades) {
      try {
        // Validate trade path format
        if (typeof tradePath !== 'string' || !tradePath.match(/^week\.\d{4}\.\d{1,2}\/[a-zA-Z0-9\-_:.]+\.md$/)) {
          continue;
        }
        const filePath = sanitizePath(TRADES_DIR, tradePath);
        const content = await fs.readFile(filePath, 'utf-8');
        const frontmatterMatch = content.match(/^---\s*\n(.*?)\n---\s*\n(.*)$/s);
        if (frontmatterMatch) {
          const frontmatter = yaml.load(frontmatterMatch[1]);
          tradeFiles.push(frontmatter);
        }
      } catch (error) {
        // Skip invalid files
        continue;
      }
    }

    // Load weekly summaries with validation
    const weeklySummaries = [];
    for (const weeklyPath of includeWeeklies) {
      try {
        // Validate weekly path format
        if (typeof weeklyPath !== 'string' || !isValidFileName(weeklyPath)) {
          continue;
        }
        const filePath = sanitizePath(SUMMARIES_DIR, weeklyPath);
        const content = await fs.readFile(filePath, 'utf-8');
        weeklySummaries.push(content);
      } catch (error) {
        // Skip invalid files
        continue;
      }
    }

    // Create AI provider
    const aiProvider = AIProviderFactory.createFromEnv();

    // Check if AI is available
    const isAvailable = await aiProvider.isAvailable();
    if (!isAvailable) {
      return res.status(503).json({
        success: false,
        error: 'AI provider is not available or not configured'
      });
    }

    // Generate summary
    const result = await aiProvider.generateSummary({
      period,
      year,
      month,
      tradeFiles,
      weeklySummaries,
      generationOptions: options
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate summary'
      });
    }

    // Save as draft
    let fileName;
    if (period === 'month') {
      fileName = `monthly-${year}-${String(month).padStart(2, '0')}.draft.md`;
    } else if (period === 'year') {
      fileName = `yearly-${year}.draft.md`;
    }

    const filePath = path.join(SUMMARIES_DIR, fileName);
    await fs.writeFile(filePath, result.draftContent, 'utf-8');

    res.json({
      success: true,
      draftContent: result.draftContent,
      fileName,
      path: `summaries/${fileName}`,
      metadata: result.metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Start server
ensureDirectories().then(() => {
  app.listen(PORT, () => {
    console.log(`Review Trades API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
