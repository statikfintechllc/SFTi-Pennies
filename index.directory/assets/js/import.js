/**
 * CSV Import JavaScript
 * Handles CSV file upload and preview
 */

class CSVImporter {
  constructor() {
    this.selectedBroker = 'robinhood';
    this.selectedFile = null;
    this.init();
  }

  init() {
    this.setupBrokerSelection();
    this.setupFileUpload();
    this.setupDragAndDrop();
  }

  setupBrokerSelection() {
    const brokerButtons = document.querySelectorAll('.broker-btn');
    brokerButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (btn.disabled) return;
        
        // Update active state
        brokerButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        this.selectedBroker = btn.dataset.broker;
        console.log('Selected broker:', this.selectedBroker);
      });
    });
  }

  setupFileUpload() {
    const fileInput = document.getElementById('csv-file-input');
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleFile(file);
      }
    });
  }

  setupDragAndDrop() {
    const dropZone = document.getElementById('drop-zone');
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        dropZone.style.borderColor = 'var(--accent-green)';
        dropZone.style.backgroundColor = 'var(--bg-tertiary)';
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        dropZone.style.borderColor = 'var(--border-color)';
        dropZone.style.backgroundColor = 'var(--bg-secondary)';
      }, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFile(files[0]);
      }
    }, false);

    // Click to browse
    dropZone.addEventListener('click', () => {
      document.getElementById('csv-file-input').click();
    });
  }

  handleFile(file) {
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      this.showStatus('error', 'Please select a CSV file.');
      return;
    }

    this.selectedFile = file;
    this.displayFileInfo(file);
    this.readAndPreviewFile(file);
  }

  displayFileInfo(file) {
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');

    fileName.textContent = file.name;
    fileSize.textContent = this.formatFileSize(file.size);
    fileInfo.style.display = 'block';
  }

  async readAndPreviewFile(file) {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        this.showStatus('error', 'CSV file appears to be empty or invalid.');
        return;
      }

      const headers = this.parseCSVLine(lines[0]);
      const sampleRows = lines.slice(1, Math.min(6, lines.length)).map(line => this.parseCSVLine(line));

      this.showPreview(headers, sampleRows);
      this.validateCSVFormat(headers);
    } catch (error) {
      console.error('Error reading file:', error);
      this.showStatus('error', 'Failed to read CSV file. Please check the file format.');
    }
  }

  parseCSVLine(line) {
    // Simple CSV parser (handles basic cases, not complex escaping)
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  showPreview(headers, rows) {
    const statusDiv = document.getElementById('import-status');
    const messageDiv = document.getElementById('status-message');

    let previewHTML = `
      <div style="margin-bottom: 1rem;">
        <h4 style="color: var(--accent-green); margin-bottom: 0.5rem;">✓ File loaded successfully</h4>
        <p style="color: var(--text-secondary);">Preview of first ${rows.length} rows:</p>
      </div>
      <div style="overflow-x: auto; background-color: var(--bg-tertiary); padding: 1rem; border-radius: 8px;">
        <table style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 0.875rem;">
          <thead>
            <tr>
              ${headers.map(h => `<th style="padding: 0.5rem; text-align: left; color: var(--accent-green); border-bottom: 1px solid var(--border-color);">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr style="border-bottom: 1px solid var(--border-color);">
                ${row.map(cell => `<td style="padding: 0.5rem; color: var(--text-primary);">${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div style="margin-top: 1rem;">
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">
          <strong>Note:</strong> CSV import is currently disabled. To import trades, please commit this file to <code>data/imports/</code> in the repository, and the workflow will process it automatically.
        </p>
        <p style="color: var(--text-dim); font-size: 0.875rem;">
          Future versions will support direct upload via authenticated API.
        </p>
      </div>
    `;

    messageDiv.innerHTML = previewHTML;
    statusDiv.style.display = 'block';
  }

  validateCSVFormat(headers) {
    const requiredHeaders = {
      robinhood: ['Symbol', 'Activity Date', 'Activity Type', 'Quantity', 'Price', 'Amount'],
      ibkr: [], // Not yet supported
      schwab: [], // Not yet supported
      webull: [] // Not yet supported
    };

    const required = requiredHeaders[this.selectedBroker] || [];
    const missing = required.filter(h => !headers.some(header => 
      header.toLowerCase() === h.toLowerCase()
    ));

    if (missing.length > 0) {
      this.showStatus('warning', `Missing required columns: ${missing.join(', ')}`);
      return false;
    }

    return true;
  }

  showStatus(type, message) {
    const statusDiv = document.getElementById('import-status');
    const messageDiv = document.getElementById('status-message');

    const icons = {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ'
    };

    const colors = {
      success: 'var(--accent-green)',
      error: 'var(--accent-red)',
      warning: 'var(--accent-yellow)',
      info: 'var(--accent-green)'
    };

    messageDiv.innerHTML = `
      <p style="color: ${colors[type]}; font-weight: 600;">
        ${icons[type]} ${message}
      </p>
    `;
    statusDiv.style.display = 'block';
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Initialize importer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CSVImporter();
});
