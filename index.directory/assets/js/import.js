/**
 * Import Page JavaScript
 * Handles CSV upload, broker detection, preview, and import workflow
 * 
 * TODO: Implement full import workflow with backend integration
 */

// State management
let uploadedFile = null;
let parsedTrades = [];
let detectedBroker = null;

// DOM elements
const csvFileInput = document.getElementById('csv-file-input');
const csvFileInfo = document.getElementById('csv-file-info');
const csvFilename = document.getElementById('csv-filename');
const csvFilesize = document.getElementById('csv-filesize');
const clearCsvBtn = document.getElementById('clear-csv-btn');
const brokerSelect = document.getElementById('broker-select');
const brokerInfo = document.getElementById('broker-info');
const brokerInfoText = document.getElementById('broker-info-text');
const previewContainer = document.getElementById('preview-container');
const previewPlaceholder = document.getElementById('preview-placeholder');
const previewSummary = document.getElementById('preview-summary');
const previewTableBody = document.getElementById('preview-table-body');
const validateBtn = document.getElementById('validate-btn');
const importBtn = document.getElementById('import-btn');
const downloadMappingBtn = document.getElementById('download-mapping-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const importStatus = document.getElementById('import-status');

/**
 * Initialize event listeners
 */
function initImportPage() {
  csvFileInput?.addEventListener('change', handleFileUpload);
  clearCsvBtn?.addEventListener('click', clearFile);
  brokerSelect?.addEventListener('change', handleBrokerChange);
  validateBtn?.addEventListener('click', handleValidate);
  importBtn?.addEventListener('click', handleImport);
  downloadMappingBtn?.addEventListener('click', handleDownloadMapping);
  exportCsvBtn?.addEventListener('click', handleExportCsv);
}

/**
 * Handle CSV file upload
 */
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  uploadedFile = file;
  
  // Show file info
  csvFilename.textContent = file.name;
  csvFilesize.textContent = formatFileSize(file.size);
  csvFileInfo.style.display = 'block';
  
  // Read and parse file
  const reader = new FileReader();
  reader.onload = (e) => {
    const csvContent = e.target.result;
    
    // TODO: Auto-detect broker
    // For now, just enable validation
    validateBtn.disabled = false;
    
    showStatus('File uploaded successfully. Select broker and click Validate.', 'info');
  };
  reader.readAsText(file);
}

/**
 * Clear uploaded file
 */
function clearFile() {
  uploadedFile = null;
  parsedTrades = [];
  detectedBroker = null;
  
  csvFileInput.value = '';
  csvFileInfo.style.display = 'none';
  brokerInfo.style.display = 'none';
  previewContainer.style.display = 'none';
  previewPlaceholder.style.display = 'block';
  
  validateBtn.disabled = true;
  importBtn.disabled = true;
  
  hideStatus();
}

/**
 * Handle broker selection change
 */
function handleBrokerChange(event) {
  const broker = event.target.value;
  
  if (broker) {
    detectedBroker = broker;
    brokerInfoText.textContent = `Selected: ${getBrokerDisplayName(broker)}`;
    brokerInfo.style.display = 'block';
  } else {
    brokerInfo.style.display = 'none';
  }
}

/**
 * Handle validate button click
 */
function handleValidate() {
  if (!uploadedFile) {
    showStatus('Please upload a CSV file first.', 'error');
    return;
  }
  
  // TODO: Implement actual validation
  // For now, show placeholder preview
  showStatus('TODO: Validation logic not yet implemented. This is a UI scaffold.', 'warning');
  
  // Mock preview data
  const mockTrades = [
    {
      status: 'valid',
      ticker: 'AAPL',
      entry_date: '2025-01-15',
      entry_price: 150.25,
      exit_date: '2025-01-16',
      exit_price: 152.50,
      position_size: 100,
      direction: 'LONG',
      pnl_usd: 225.00
    },
    {
      status: 'valid',
      ticker: 'TSLA',
      entry_date: '2025-01-17',
      entry_price: 245.75,
      exit_date: '2025-01-18',
      exit_price: 243.20,
      position_size: 50,
      direction: 'LONG',
      pnl_usd: -127.50
    }
  ];
  
  parsedTrades = mockTrades;
  displayPreview(mockTrades);
  
  importBtn.disabled = false;
}

/**
 * Handle import button click
 */
function handleImport() {
  if (!parsedTrades || parsedTrades.length === 0) {
    showStatus('No trades to import. Please validate first.', 'error');
    return;
  }
  
  // TODO: Implement actual import logic
  // This would:
  // 1. Send trades to backend/GitHub API
  // 2. Create trade markdown files
  // 3. Update trades-index.json
  // 4. Trigger workflow
  
  showStatus('TODO: Import logic not yet implemented. This is a UI scaffold.', 'warning');
}

/**
 * Handle download sample mapping
 */
function handleDownloadMapping() {
  const broker = detectedBroker || brokerSelect.value;
  
  if (!broker) {
    showStatus('Please select a broker first.', 'error');
    return;
  }
  
  // TODO: Generate actual mapping based on broker
  const mapping = {
    broker: getBrokerDisplayName(broker),
    fields: {
      'Broker_Field_1': 'ticker',
      'Broker_Field_2': 'entry_date',
      'Broker_Field_3': 'entry_price',
      // TODO: Add actual broker-specific mappings
    },
    notes: 'TODO: Implement broker-specific field mappings'
  };
  
  const blob = new Blob([JSON.stringify(mapping, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${broker}-field-mapping.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  showStatus('Sample mapping downloaded.', 'info');
}

/**
 * Handle export to CSV
 */
function handleExportCsv() {
  // TODO: Implement export logic
  // Fetch trades-index.json and convert to CSV
  showStatus('TODO: Export logic not yet implemented. This is a UI scaffold.', 'warning');
}

/**
 * Display preview of parsed trades
 */
function displayPreview(trades) {
  if (!trades || trades.length === 0) {
    previewContainer.style.display = 'none';
    previewPlaceholder.style.display = 'block';
    return;
  }
  
  // Show preview
  previewPlaceholder.style.display = 'none';
  previewContainer.style.display = 'block';
  
  // Update summary
  const validCount = trades.filter(t => t.status === 'valid').length;
  const invalidCount = trades.length - validCount;
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl_usd || 0), 0);
  
  previewSummary.innerHTML = `
    <div class="preview-summary-item">
      <div class="preview-summary-label">Total Trades</div>
      <div class="preview-summary-value">${trades.length}</div>
    </div>
    <div class="preview-summary-item">
      <div class="preview-summary-label">Valid</div>
      <div class="preview-summary-value" style="color: var(--accent-green);">${validCount}</div>
    </div>
    <div class="preview-summary-item">
      <div class="preview-summary-label">Invalid</div>
      <div class="preview-summary-value" style="color: var(--accent-red);">${invalidCount}</div>
    </div>
    <div class="preview-summary-item">
      <div class="preview-summary-label">Total P&L</div>
      <div class="preview-summary-value" style="color: ${totalPnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">
        $${totalPnl.toFixed(2)}
      </div>
    </div>
  `;
  
  // Update table
  previewTableBody.innerHTML = trades.map(trade => `
    <tr>
      <td>
        <span class="trade-status-badge ${trade.status}">
          ${trade.status}
        </span>
      </td>
      <td><strong>${trade.ticker}</strong></td>
      <td>${trade.entry_date}</td>
      <td>$${trade.entry_price?.toFixed(2)}</td>
      <td>${trade.exit_date}</td>
      <td>$${trade.exit_price?.toFixed(2)}</td>
      <td>${trade.position_size}</td>
      <td>${trade.direction}</td>
      <td style="color: ${trade.pnl_usd >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">
        $${trade.pnl_usd?.toFixed(2)}
      </td>
    </tr>
  `).join('');
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
  importStatus.style.display = 'block';
  importStatus.className = `import-status ${type}`;
  
  const icon = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  importStatus.querySelector('.import-status-icon').textContent = icon;
  importStatus.querySelector('.import-status-message').textContent = message;
}

/**
 * Hide status message
 */
function hideStatus() {
  importStatus.style.display = 'none';
}

/**
 * Get broker display name
 */
function getBrokerDisplayName(broker) {
  const names = {
    'ibkr': 'Interactive Brokers (IBKR)',
    'schwab': 'Charles Schwab / TD Ameritrade',
    'robinhood': 'Robinhood',
    'webull': 'Webull'
  };
  return names[broker] || broker;
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initImportPage);
} else {
  initImportPage();
}
