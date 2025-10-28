/**
 * Review Trades JavaScript
 * Handles the review trades workflow UI interactions
 */

// API Configuration
const API_BASE = 'http://localhost:3001/api';

// State
let currentWeek = null;
let currentTrades = [];
let selectedTrades = [];
let formData = {};
let generatedDrafts = {
  monthly: null,
  yearly: null
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeTabs();
  loadWeeks();
  setupEventListeners();
});

/**
 * Initialize tab switching
 */
function initializeTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Hide all tab contents
      document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
      });
      
      // Show selected tab content
      const tabName = tab.getAttribute('data-tab');
      document.getElementById(`${tabName}-tab`).style.display = 'block';
    });
  });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Week selection
  document.getElementById('week-select').addEventListener('change', onWeekSelected);
  
  // Weekly summary actions
  document.getElementById('save-draft-btn')?.addEventListener('click', saveDraft);
  document.getElementById('publish-btn')?.addEventListener('click', publishWeeklySummary);
  
  // Monthly summary
  document.getElementById('ai-consent-monthly')?.addEventListener('change', (e) => {
    document.getElementById('generate-monthly-btn').disabled = !e.target.checked;
  });
  document.getElementById('generate-monthly-btn')?.addEventListener('click', generateMonthlySummary);
  document.getElementById('publish-monthly-btn')?.addEventListener('click', publishMonthlySummary);
  
  // Yearly summary
  document.getElementById('ai-consent-yearly')?.addEventListener('change', (e) => {
    document.getElementById('generate-yearly-btn').disabled = !e.target.checked;
  });
  document.getElementById('generate-yearly-btn')?.addEventListener('click', generateYearlySummary);
  document.getElementById('publish-yearly-btn')?.addEventListener('click', publishYearlySummary);
}

/**
 * Load available weeks from API
 */
async function loadWeeks() {
  try {
    const response = await fetch(`${API_BASE}/weeks`);
    const data = await response.json();
    
    if (data.success) {
      populateWeekSelect(data.weeks);
    } else {
      showError('Failed to load weeks: ' + data.error);
    }
  } catch (error) {
    showError('Failed to connect to API. Make sure the server is running.');
    console.error('Error loading weeks:', error);
  }
}

/**
 * Populate week select dropdown
 */
function populateWeekSelect(weeks) {
  const select = document.getElementById('week-select');
  select.innerHTML = '<option value="">Select a week...</option>';
  
  weeks.forEach(week => {
    const option = document.createElement('option');
    option.value = week.id;
    option.textContent = `Week ${week.week}, ${week.year}`;
    select.appendChild(option);
  });
}

/**
 * Handle week selection
 */
async function onWeekSelected(e) {
  const weekId = e.target.value;
  if (!weekId) {
    // Hide sections if no week selected
    document.getElementById('trades-section').style.display = 'none';
    document.getElementById('summary-form').style.display = 'none';
    document.getElementById('actions-section').style.display = 'none';
    return;
  }
  
  currentWeek = weekId;
  await loadWeekTrades(weekId);
}

/**
 * Load trade files for a week
 */
async function loadWeekTrades(weekId) {
  try {
    showLoading('Loading trades...');
    
    const response = await fetch(`${API_BASE}/trades/${weekId}`);
    const data = await response.json();
    
    if (data.success) {
      currentTrades = data.trades;
      selectedTrades = data.trades.map((t, i) => i); // Select all by default
      
      displayTrades(data.trades);
      generateSummaryForm(data.trades);
      updatePreview();
      
      // Show sections
      document.getElementById('trades-section').style.display = 'block';
      document.getElementById('summary-form').style.display = 'block';
      document.getElementById('actions-section').style.display = 'block';
      
      hideLoading();
    } else {
      showError('Failed to load trades: ' + data.error);
    }
  } catch (error) {
    showError('Error loading trades: ' + error.message);
  }
}

/**
 * Display trade files list
 */
function displayTrades(trades) {
  const container = document.getElementById('trades-list');
  const countSpan = document.getElementById('trade-count');
  
  countSpan.textContent = `(${trades.length} trades)`;
  container.innerHTML = '';
  
  trades.forEach((trade, index) => {
    const item = document.createElement('div');
    item.className = 'trade-item selected';
    item.dataset.index = index;
    
    const fm = trade.frontmatter || {};
    const ticker = fm.ticker || 'Unknown';
    const pnl = fm.pnl_usd || 0;
    const pnlClass = pnl >= 0 ? 'color: #00ff88' : 'color: #ff4444';
    
    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>${ticker}</strong> - ${fm.entry_date || 'N/A'}
          <br>
          <small style="color: #888;">${trade.fileName}</small>
        </div>
        <div style="text-align: right;">
          <div style="${pnlClass}; font-weight: bold;">
            ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}
          </div>
          <small style="color: #888;">${fm.direction || 'LONG'}</small>
        </div>
      </div>
    `;
    
    item.addEventListener('click', () => toggleTradeSelection(index, item));
    container.appendChild(item);
  });
}

/**
 * Toggle trade selection
 */
function toggleTradeSelection(index, element) {
  if (selectedTrades.includes(index)) {
    selectedTrades = selectedTrades.filter(i => i !== index);
    element.classList.remove('selected');
  } else {
    selectedTrades.push(index);
    element.classList.add('selected');
  }
  
  // Update form with selected trades
  generateSummaryForm(currentTrades.filter((t, i) => selectedTrades.includes(i)));
  updatePreview();
}

/**
 * Generate summary form from merged template
 */
function generateSummaryForm(trades) {
  // Calculate stats from selected trades
  const stats = calculateStats(trades);
  
  // Get canonical template
  const template = typeof getCanonicalTemplate === 'function' 
    ? getCanonicalTemplate() 
    : { sections: [] };
  
  // Generate form fields
  const container = document.getElementById('form-fields');
  container.innerHTML = '';
  
  // Add fields for each section
  template.sections?.forEach(section => {
    const sectionDiv = document.createElement('div');
    sectionDiv.style.marginBottom = '20px';
    
    const heading = document.createElement('h4');
    heading.style.color = '#00ff88';
    heading.style.marginBottom = '10px';
    heading.textContent = section.name;
    sectionDiv.appendChild(heading);
    
    // Add fields
    if (section.fields) {
      section.fields.forEach(field => {
        const fieldDiv = createFormField(field, stats);
        sectionDiv.appendChild(fieldDiv);
      });
    }
    
    // Add subsections
    if (section.subsections) {
      section.subsections.forEach(subsection => {
        const fieldDiv = createFormField(subsection, stats);
        sectionDiv.appendChild(fieldDiv);
      });
    }
    
    // Handle section-level fields
    if (section.type === 'text') {
      const field = {
        key: section.key,
        name: section.name,
        type: 'textarea',
        required: section.required
      };
      const fieldDiv = createFormField(field, stats);
      sectionDiv.appendChild(fieldDiv);
    }
    
    container.appendChild(sectionDiv);
  });
  
  // Update preview when form changes
  container.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', updatePreview);
  });
}

/**
 * Create a form field element
 */
function createFormField(field, stats) {
  const fieldDiv = document.createElement('div');
  fieldDiv.className = 'form-field';
  
  const label = document.createElement('label');
  label.textContent = field.name + (field.required ? ' *' : '');
  label.htmlFor = `field-${field.key}`;
  fieldDiv.appendChild(label);
  
  let input;
  const fieldType = field.type || 'text';
  
  if (fieldType === 'textarea' || fieldType === 'text') {
    input = document.createElement('textarea');
    input.rows = 4;
  } else {
    input = document.createElement('input');
    input.type = fieldType === 'currency' || fieldType === 'percentage' || fieldType === 'number' || fieldType === 'shares' ? 'number' : 'text';
    if (fieldType === 'currency' || fieldType === 'percentage') {
      input.step = '0.01';
    }
  }
  
  input.id = `field-${field.key}`;
  input.name = field.key;
  input.placeholder = field.placeholder || `Enter ${field.name.toLowerCase()}...`;
  input.required = field.required || false;
  
  // Pre-fill with calculated stats if available
  if (stats[field.key] !== undefined) {
    input.value = stats[field.key];
  }
  
  fieldDiv.appendChild(input);
  return fieldDiv;
}

/**
 * Calculate statistics from trades
 */
function calculateStats(trades) {
  if (!trades || trades.length === 0) {
    return {
      total_trades: 0,
      winning_trades: 0,
      losing_trades: 0,
      win_rate: 0,
      total_pnl: 0,
      avg_pnl: 0,
      best_trade: 'N/A',
      worst_trade: 'N/A',
      total_volume: 0,
      wins: 0,
      losses: 0,
      breakeven: 0,
      avg_win: 0,
      avg_loss: 0,
      largest_win: 0,
      largest_loss: 0,
      profit_factor: 0,
      gross_profit: 0,
      gross_loss: 0
    };
  }
  
  let totalPnl = 0;
  let winners = [];
  let losers = [];
  let breakeven = 0;
  let totalVolume = 0;
  
  trades.forEach(trade => {
    const fm = trade.frontmatter || {};
    const pnl = parseFloat(fm.pnl_usd || 0);
    const volume = parseFloat(fm.position_size || 0);
    
    totalPnl += pnl;
    totalVolume += volume;
    
    if (pnl > 0) winners.push({ pnl, ticker: fm.ticker });
    else if (pnl < 0) losers.push({ pnl, ticker: fm.ticker });
    else breakeven++;
  });
  
  const totalTrades = trades.length;
  const winRate = totalTrades > 0 ? (winners.length / totalTrades * 100).toFixed(1) : 0;
  const avgPnl = totalTrades > 0 ? (totalPnl / totalTrades).toFixed(2) : 0;
  
  const bestTrade = winners.length > 0 
    ? winners.reduce((max, t) => t.pnl > max.pnl ? t : max)
    : { ticker: 'N/A', pnl: 0 };
  const worstTrade = losers.length > 0
    ? losers.reduce((min, t) => t.pnl < min.pnl ? t : min)
    : { ticker: 'N/A', pnl: 0 };
  
  const avgWin = winners.length > 0 ? (winners.reduce((sum, t) => sum + t.pnl, 0) / winners.length).toFixed(2) : 0;
  const avgLoss = losers.length > 0 ? (losers.reduce((sum, t) => sum + t.pnl, 0) / losers.length).toFixed(2) : 0;
  const largestWin = winners.length > 0 ? Math.max(...winners.map(t => t.pnl)).toFixed(2) : 0;
  const largestLoss = losers.length > 0 ? Math.min(...losers.map(t => t.pnl)).toFixed(2) : 0;
  
  const grossProfit = winners.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losers.reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : 0;
  
  return {
    total_trades: totalTrades,
    winning_trades: winners.length,
    losing_trades: losers.length,
    win_rate: winRate,
    total_pnl: totalPnl.toFixed(2),
    avg_pnl: avgPnl,
    best_trade: `${bestTrade.ticker} (+$${bestTrade.pnl.toFixed(2)})`,
    worst_trade: `${worstTrade.ticker} ($${worstTrade.pnl.toFixed(2)})`,
    total_volume: totalVolume,
    wins: winners.length,
    losses: losers.length,
    breakeven,
    avg_win: avgWin,
    avg_loss: avgLoss,
    largest_win: largestWin,
    largest_loss: largestLoss,
    profit_factor: profitFactor,
    gross_profit: grossProfit.toFixed(2),
    gross_loss: grossLoss.toFixed(2)
  };
}

/**
 * Update markdown preview
 */
function updatePreview() {
  const formData = collectFormData();
  const markdown = generateMarkdown(formData);
  
  const previewPane = document.getElementById('preview-pane');
  if (typeof marked !== 'undefined') {
    previewPane.innerHTML = marked.parse(markdown);
  } else {
    previewPane.textContent = markdown;
  }
}

/**
 * Collect form data
 */
function collectFormData() {
  const data = {};
  document.querySelectorAll('#form-fields input, #form-fields textarea').forEach(input => {
    data[input.name] = input.value;
  });
  return data;
}

/**
 * Generate markdown from form data
 */
function generateMarkdown(data) {
  const weekInfo = currentWeek ? currentWeek.split('.') : ['2025', '43'];
  const year = weekInfo[0];
  const week = weekInfo[1];
  
  let md = `# Week ${week}, ${year} - Trading Summary\n\n`;
  md += `## Overview\n\n`;
  md += `This week's trading session included **${data.total_trades || 0} trades** with a total P&L of **$${data.total_pnl || 0}**.\n\n`;
  
  md += `## Performance Metrics\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Total Trades | ${data.total_trades || 0} |\n`;
  md += `| Total P&L | $${data.total_pnl || 0} |\n`;
  md += `| Win Rate | ${data.win_rate || 0}% |\n`;
  md += `| Wins | ${data.wins || 0} |\n`;
  md += `| Losses | ${data.losses || 0} |\n`;
  md += `| Breakeven | ${data.breakeven || 0} |\n`;
  md += `| Average Win | $${data.avg_win || 0} |\n`;
  md += `| Average Loss | $${data.avg_loss || 0} |\n`;
  md += `| Largest Win | $${data.largest_win || 0} |\n`;
  md += `| Largest Loss | $${data.largest_loss || 0} |\n`;
  md += `| Profit Factor | ${data.profit_factor || 0} |\n`;
  md += `| Gross Profit | $${data.gross_profit || 0} |\n`;
  md += `| Gross Loss | $${data.gross_loss || 0} |\n\n`;
  
  md += `## Performance Analysis\n\n`;
  md += `### What Went Well\n\n${data.what_went_well || '_To be filled in..._'}\n\n`;
  md += `### What Needs Improvement\n\n${data.what_needs_improvement || '_To be filled in..._'}\n\n`;
  md += `### Key Lessons Learned\n\n${data.key_lessons || '_To be filled in..._'}\n\n`;
  
  md += `## Weekly Reflection\n\n${data.weekly_reflection || '_Add your weekly reflection..._'}\n\n`;
  
  md += `---\n\n`;
  md += `*Generated on ${new Date().toISOString().split('T')[0]}*\n`;
  
  return md;
}

/**
 * Save draft
 */
async function saveDraft() {
  const formData = collectFormData();
  const markdown = generateMarkdown(formData);
  const weekInfo = currentWeek.split('.');
  
  try {
    showLoading('Saving draft...');
    
    const response = await fetch(`${API_BASE}/summaries/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        period: 'weekly',
        year: parseInt(weekInfo[0]),
        week: parseInt(weekInfo[1]),
        content: markdown
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess('Draft saved successfully!');
    } else {
      showError('Failed to save draft: ' + data.error);
    }
  } catch (error) {
    showError('Error saving draft: ' + error.message);
  }
}

/**
 * Publish weekly summary
 */
async function publishWeeklySummary() {
  if (!confirm('Are you sure you want to publish this weekly summary? This will overwrite any existing published summary.')) {
    return;
  }
  
  const formData = collectFormData();
  const markdown = generateMarkdown(formData);
  const weekInfo = currentWeek.split('.');
  const fileName = `weekly-${weekInfo[0]}-W${weekInfo[1].padStart(2, '0')}.md`;
  
  try {
    showLoading('Publishing summary...');
    
    const response = await fetch(`${API_BASE}/summaries/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName,
        content: markdown
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess('Weekly summary published successfully!');
    } else {
      showError('Failed to publish: ' + data.error);
    }
  } catch (error) {
    showError('Error publishing: ' + error.message);
  }
}

/**
 * Generate monthly summary with AI
 */
async function generateMonthlySummary() {
  const year = parseInt(document.getElementById('monthly-year').value);
  const month = parseInt(document.getElementById('monthly-month').value);
  const includeAnalysis = document.getElementById('include-analysis').checked;
  const includeRecommendations = document.getElementById('include-recommendations').checked;
  
  try {
    showLoading('Generating monthly summary with AI...');
    
    const response = await fetch(`${API_BASE}/summaries/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        period: 'month',
        year,
        month,
        includeTrades: [], // TODO: Collect relevant trades
        includeWeeklies: [], // TODO: Collect relevant weeklies
        options: {
          includeAnalysis,
          includeRecommendations
        }
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      generatedDrafts.monthly = data.draftContent;
      const preview = document.getElementById('monthly-preview');
      preview.innerHTML = typeof marked !== 'undefined' 
        ? marked.parse(data.draftContent) 
        : data.draftContent;
      document.getElementById('monthly-actions').style.display = 'block';
      showSuccess('Monthly draft generated successfully!');
    } else {
      showError('Failed to generate: ' + data.error);
    }
  } catch (error) {
    showError('Error generating summary: ' + error.message);
  }
}

/**
 * Publish monthly summary
 */
async function publishMonthlySummary() {
  if (!generatedDrafts.monthly) {
    showError('No draft to publish. Generate a draft first.');
    return;
  }
  
  if (!confirm('Are you sure you want to publish this monthly summary?')) {
    return;
  }
  
  const year = document.getElementById('monthly-year').value;
  const month = document.getElementById('monthly-month').value.padStart(2, '0');
  const fileName = `monthly-${year}-${month}.md`;
  
  try {
    showLoading('Publishing monthly summary...');
    
    const response = await fetch(`${API_BASE}/summaries/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName,
        content: generatedDrafts.monthly
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess('Monthly summary published successfully!');
      generatedDrafts.monthly = null;
    } else {
      showError('Failed to publish: ' + data.error);
    }
  } catch (error) {
    showError('Error publishing: ' + error.message);
  }
}

/**
 * Generate yearly summary with AI
 */
async function generateYearlySummary() {
  const year = parseInt(document.getElementById('yearly-year').value);
  const includeAnalysis = document.getElementById('include-analysis-yearly').checked;
  const includeRecommendations = document.getElementById('include-recommendations-yearly').checked;
  
  try {
    showLoading('Generating yearly summary with AI...');
    
    const response = await fetch(`${API_BASE}/summaries/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        period: 'year',
        year,
        includeTrades: [], // TODO: Collect relevant trades
        includeWeeklies: [], // TODO: Collect relevant weeklies
        options: {
          includeAnalysis,
          includeRecommendations
        }
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      generatedDrafts.yearly = data.draftContent;
      const preview = document.getElementById('yearly-preview');
      preview.innerHTML = typeof marked !== 'undefined' 
        ? marked.parse(data.draftContent) 
        : data.draftContent;
      document.getElementById('yearly-actions').style.display = 'block';
      showSuccess('Yearly draft generated successfully!');
    } else {
      showError('Failed to generate: ' + data.error);
    }
  } catch (error) {
    showError('Error generating summary: ' + error.message);
  }
}

/**
 * Publish yearly summary
 */
async function publishYearlySummary() {
  if (!generatedDrafts.yearly) {
    showError('No draft to publish. Generate a draft first.');
    return;
  }
  
  if (!confirm('Are you sure you want to publish this yearly summary?')) {
    return;
  }
  
  const year = document.getElementById('yearly-year').value;
  const fileName = `yearly-${year}.md`;
  
  try {
    showLoading('Publishing yearly summary...');
    
    const response = await fetch(`${API_BASE}/summaries/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName,
        content: generatedDrafts.yearly
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess('Yearly summary published successfully!');
      generatedDrafts.yearly = null;
    } else {
      showError('Failed to publish: ' + data.error);
    }
  } catch (error) {
    showError('Error publishing: ' + error.message);
  }
}

/**
 * Show loading message
 */
function showLoading(message) {
  const statusDiv = document.getElementById('status-message');
  statusDiv.innerHTML = `
    <div style="background: rgba(0, 255, 136, 0.1); border: 1px solid rgba(0, 255, 136, 0.3); padding: 15px; border-radius: 6px; display: flex; align-items: center; gap: 10px;">
      <div class="loading"></div>
      <span>${message}</span>
    </div>
  `;
}

/**
 * Hide loading message
 */
function hideLoading() {
  document.getElementById('status-message').innerHTML = '';
}

/**
 * Show success message
 */
function showSuccess(message) {
  const statusDiv = document.getElementById('status-message');
  statusDiv.innerHTML = `
    <div style="background: rgba(0, 255, 136, 0.1); border: 1px solid #00ff88; padding: 15px; border-radius: 6px;">
      ✅ ${message}
    </div>
  `;
  setTimeout(() => hideLoading(), 5000);
}

/**
 * Show error message
 */
function showError(message) {
  const statusDiv = document.getElementById('status-message');
  statusDiv.innerHTML = `
    <div style="background: rgba(255, 68, 68, 0.1); border: 1px solid #ff4444; padding: 15px; border-radius: 6px;">
      ❌ ${message}
    </div>
  `;
  setTimeout(() => hideLoading(), 5000);
}
