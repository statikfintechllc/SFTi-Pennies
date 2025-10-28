/**
 * Integration Test for Review Trades Workflow
 * Tests the full workflow from API calls to summary generation
 */

const http = require('http');
const path = require('path');

// Test configuration
const API_BASE = 'http://localhost:3001/api';
let serverProcess = null;

class IntegrationTestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        message || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`
      );
    }
  }

  async run() {
    console.log(`\nRunning ${this.tests.length} integration tests...\n`);

    for (const test of this.tests) {
      try {
        await test.fn();
        this.passed++;
        console.log(`✅ ${test.name}`);
      } catch (error) {
        this.failed++;
        console.log(`❌ ${test.name}`);
        console.log(`   Error: ${error.message}\n`);
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`Total: ${this.tests.length}`);
    console.log(`Passed: ${this.passed}`);
    console.log(`Failed: ${this.failed}`);
    console.log(`${'='.repeat(50)}\n`);

    return this.failed === 0;
  }
}

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
}

/**
 * Wait for server to be ready
 */
async function waitForServer(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await makeRequest(`${API_BASE}/health`);
      return true;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  throw new Error('Server did not start in time');
}

/**
 * Start the server
 */
async function startServer() {
  const { spawn } = require('child_process');
  
  console.log('Starting server...');
  
  serverProcess = spawn('node', ['index.directory/server/server.js'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe',
    env: {
      ...process.env,
      ENABLE_AI: 'true',
      AI_PROVIDER: 'mock',
      PORT: '3001'
    }
  });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    await waitForServer();
    console.log('Server started successfully\n');
  } catch (error) {
    console.error('Failed to start server:', error.message);
    throw error;
  }
}

/**
 * Stop the server
 */
function stopServer() {
  if (serverProcess) {
    console.log('\nStopping server...');
    serverProcess.kill();
    serverProcess = null;
  }
}

// Tests
const runner = new IntegrationTestRunner();

// Test: Health check
runner.test('GET /api/health returns healthy status', async () => {
  const response = await makeRequest(`${API_BASE}/health`);
  runner.assertEqual(response.statusCode, 200, 'Status should be 200');
  runner.assert(response.body.success, 'Should return success');
  runner.assertEqual(response.body.status, 'healthy', 'Status should be healthy');
});

// Test: List weeks
runner.test('GET /api/weeks returns list of weeks', async () => {
  const response = await makeRequest(`${API_BASE}/weeks`);
  runner.assertEqual(response.statusCode, 200, 'Status should be 200');
  runner.assert(response.body.success, 'Should return success');
  runner.assert(Array.isArray(response.body.weeks), 'Should return weeks array');
});

// Test: Get trades for a week (if weeks exist)
runner.test('GET /api/trades/:week returns trade data', async () => {
  // First get available weeks
  const weeksResponse = await makeRequest(`${API_BASE}/weeks`);
  
  if (weeksResponse.body.weeks && weeksResponse.body.weeks.length > 0) {
    const weekId = weeksResponse.body.weeks[0].id;
    const response = await makeRequest(`${API_BASE}/trades/${weekId}`);
    
    runner.assertEqual(response.statusCode, 200, 'Status should be 200');
    runner.assert(response.body.success, 'Should return success');
    runner.assert(Array.isArray(response.body.trades), 'Should return trades array');
    runner.assertEqual(response.body.week, weekId, 'Should return correct week ID');
  } else {
    console.log('   (Skipped - no weeks available)');
  }
});

// Test: List summaries
runner.test('GET /api/summaries returns summaries list', async () => {
  const response = await makeRequest(`${API_BASE}/summaries`);
  runner.assertEqual(response.statusCode, 200, 'Status should be 200');
  runner.assert(response.body.success, 'Should return success');
  runner.assert(Array.isArray(response.body.summaries), 'Should return summaries array');
});

// Test: Save draft
runner.test('POST /api/summaries/draft saves a draft', async () => {
  const response = await makeRequest(`${API_BASE}/summaries/draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      period: 'weekly',
      year: 2025,
      week: 99,
      content: '# Test Week 99 Summary\n\nThis is a test draft.'
    })
  });
  
  runner.assertEqual(response.statusCode, 200, 'Status should be 200');
  runner.assert(response.body.success, 'Should return success');
  runner.assert(response.body.fileName, 'Should return filename');
  runner.assert(response.body.fileName.includes('draft'), 'Filename should include "draft"');
});

// Test: Generate AI summary
runner.test('POST /api/summaries/generate creates AI summary', async () => {
  const response = await makeRequest(`${API_BASE}/summaries/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      period: 'month',
      year: 2025,
      month: 10,
      includeTrades: [],
      includeWeeklies: [],
      options: {
        includeAnalysis: true,
        includeRecommendations: true
      }
    })
  });
  
  runner.assertEqual(response.statusCode, 200, 'Status should be 200');
  runner.assert(response.body.success, 'Should return success');
  runner.assert(response.body.draftContent, 'Should have draft content');
  runner.assert(response.body.metadata, 'Should have metadata');
  runner.assertEqual(response.body.metadata.provider, 'mock', 'Should use mock provider');
});

// Test: Invalid endpoints return errors
runner.test('GET /api/trades/nonexistent returns 404', async () => {
  const response = await makeRequest(`${API_BASE}/trades/nonexistent`);
  runner.assertEqual(response.statusCode, 404, 'Status should be 404');
  runner.assert(!response.body.success, 'Should return failure');
});

// Test: Missing required fields return 400
runner.test('POST /api/summaries/draft without content returns 400', async () => {
  const response = await makeRequest(`${API_BASE}/summaries/draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      period: 'weekly',
      year: 2025,
      week: 99
      // missing content
    })
  });
  
  runner.assertEqual(response.statusCode, 400, 'Status should be 400');
  runner.assert(!response.body.success, 'Should return failure');
});

// Main execution
async function main() {
  try {
    await startServer();
    const success = await runner.run();
    stopServer();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Test setup failed:', error);
    stopServer();
    process.exit(1);
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  stopServer();
  process.exit(1);
});

process.on('SIGTERM', () => {
  stopServer();
  process.exit(1);
});

if (require.main === module) {
  main();
}

module.exports = { runner, startServer, stopServer };
