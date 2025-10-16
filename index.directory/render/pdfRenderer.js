/**
 * PDF Renderer
 * Handles PDF rendering with smooth scrolling and zoom controls using PDF.js
 */

class PDFRenderer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.pdfjsLib = window.pdfjsLib;
    
    if (!this.container) {
      throw new Error(`Container ${containerId} not found`);
    }
    
    if (!this.pdfjsLib) {
      throw new Error('PDF.js library not loaded');
    }
    
    this.options = {
      scale: options.scale || 1.5,
      enableZoom: options.enableZoom !== false,
      enableScroll: options.enableScroll !== false,
      ...options
    };
    
    this.pdfDoc = null;
    this.currentScale = this.options.scale;
    this.pages = [];
    this.isRendering = false;
    
    this.initializeContainer();
  }

  /**
   * Initialize the PDF container
   */
  initializeContainer() {
    this.container.innerHTML = '';
    this.container.className = 'pdf-viewer-container';
    
    // Create scroll container
    this.scrollContainer = document.createElement('div');
    this.scrollContainer.className = 'pdf-scroll-container';
    
    // Create controls if enabled
    if (this.options.enableZoom) {
      this.createControls();
    }
    
    this.container.appendChild(this.scrollContainer);
  }

  /**
   * Create zoom and navigation controls
   */
  createControls() {
    const controls = document.createElement('div');
    controls.className = 'pdf-controls';
    controls.innerHTML = `
      <button class="pdf-control-btn pdf-zoom-out" title="Zoom Out">−</button>
      <span class="pdf-zoom-level">100%</span>
      <button class="pdf-control-btn pdf-zoom-in" title="Zoom In">+</button>
      <button class="pdf-control-btn pdf-fit-width" title="Fit Width">⬌</button>
    `;
    
    this.container.insertBefore(controls, this.container.firstChild);
    
    // Bind control events
    controls.querySelector('.pdf-zoom-in').addEventListener('click', () => this.zoomIn());
    controls.querySelector('.pdf-zoom-out').addEventListener('click', () => this.zoomOut());
    controls.querySelector('.pdf-fit-width').addEventListener('click', () => this.fitToWidth());
  }

  /**
   * Load PDF from URL
   */
  async loadPDF(url) {
    if (this.isRendering) {
      console.warn('PDF is already being rendered');
      return;
    }
    
    this.isRendering = true;
    this.scrollContainer.innerHTML = '<div class="pdf-loading">Loading PDF...</div>';
    
    try {
      console.log('Loading PDF from:', url);
      
      const loadingTask = this.pdfjsLib.getDocument(url);
      this.pdfDoc = await loadingTask.promise;
      
      console.log('PDF loaded successfully. Pages:', this.pdfDoc.numPages);
      
      await this.renderAllPages();
      
      this.isRendering = false;
      return this.pdfDoc;
    } catch (error) {
      this.isRendering = false;
      console.error('PDF loading error:', error);
      this.scrollContainer.innerHTML = `
        <div class="pdf-error">
          <p>Error loading PDF</p>
          <p class="pdf-error-details">${error.message}</p>
        </div>
      `;
      throw error;
    }
  }

  /**
   * Render all PDF pages for smooth scrolling
   */
  async renderAllPages() {
    this.scrollContainer.innerHTML = '';
    this.pages = [];
    
    const numPages = this.pdfDoc.numPages;
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      await this.renderPage(pageNum);
    }
    
    console.log('All pages rendered');
  }

  /**
   * Render a single page
   */
  async renderPage(pageNum) {
    try {
      const page = await this.pdfDoc.getPage(pageNum);
      
      // Create page container
      const pageContainer = document.createElement('div');
      pageContainer.className = 'pdf-page-container';
      pageContainer.dataset.pageNumber = pageNum;
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Calculate scale
      const viewport = page.getViewport({ scale: this.currentScale });
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Render page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      // Add page number label
      const pageLabel = document.createElement('div');
      pageLabel.className = 'pdf-page-label';
      pageLabel.textContent = `Page ${pageNum}`;
      
      pageContainer.appendChild(canvas);
      pageContainer.appendChild(pageLabel);
      this.scrollContainer.appendChild(pageContainer);
      
      this.pages.push({
        number: pageNum,
        container: pageContainer,
        canvas: canvas,
        page: page
      });
      
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
    }
  }

  /**
   * Zoom in
   */
  zoomIn() {
    this.setScale(this.currentScale * 1.2);
  }

  /**
   * Zoom out
   */
  zoomOut() {
    this.setScale(this.currentScale / 1.2);
  }

  /**
   * Fit to width
   */
  fitToWidth() {
    if (!this.pdfDoc || this.pages.length === 0) return;
    
    const containerWidth = this.scrollContainer.clientWidth - 40; // Account for padding
    const firstPage = this.pages[0].page;
    const viewport = firstPage.getViewport({ scale: 1 });
    const scale = containerWidth / viewport.width;
    
    this.setScale(scale);
  }

  /**
   * Set zoom scale
   */
  async setScale(newScale) {
    newScale = Math.max(0.5, Math.min(3, newScale)); // Limit between 50% and 300%
    
    if (newScale === this.currentScale) return;
    
    this.currentScale = newScale;
    
    // Update zoom level display
    const zoomLevel = this.container.querySelector('.pdf-zoom-level');
    if (zoomLevel) {
      zoomLevel.textContent = `${Math.round(newScale * 100)}%`;
    }
    
    // Re-render all pages with new scale
    await this.renderAllPages();
  }

  /**
   * Get current page number based on scroll position
   */
  getCurrentPage() {
    const scrollTop = this.scrollContainer.scrollTop;
    const containerHeight = this.scrollContainer.clientHeight;
    
    for (let i = 0; i < this.pages.length; i++) {
      const page = this.pages[i];
      const rect = page.container.getBoundingClientRect();
      
      if (rect.top >= 0 && rect.top < containerHeight / 2) {
        return i + 1;
      }
    }
    
    return 1;
  }

  /**
   * Scroll to specific page
   */
  scrollToPage(pageNum) {
    if (pageNum < 1 || pageNum > this.pages.length) return;
    
    const pageContainer = this.pages[pageNum - 1].container;
    pageContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Destroy the renderer and clean up
   */
  destroy() {
    this.pdfDoc = null;
    this.pages = [];
    this.scrollContainer.innerHTML = '';
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.PDFRenderer = PDFRenderer;
}
