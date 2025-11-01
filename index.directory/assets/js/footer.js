/**
 * Footer Component
 * Dynamically generates and inserts the footer into pages
 */

// Use utilities from global SFTiUtils

class Footer {
  constructor() {
    this.render();
  }

  /**
   * Generate the footer HTML
   * @returns {string} HTML string for footer
   */
  getFooterHTML() {
    return `
<footer class="footer">
  <p>&copy; 2025 SFTi-Pennies Trading Journal</p>
  <p>
    <a href="https://www.linkedin.com/in/statikfintech-llc-780804368" target="_blank" style="color: var(--accent-green, #00ff88);">LinkedIn</a> |
    <a href="https://github.com/statikfintechllc" target="_blank" style="color: var(--accent-green, #00ff88);">Builds</a> |
    <a href="https://github.com/statikfintechllc/SFTi-Pennies/blob/master/LICENSE.md" target="_blank" style="color: var(--accent-green, #00ff88);">License</a>
  </p>
</footer>`;
  }

  /**
   * Render footer into the page
   */
  render() {
    // Check if footer already exists in HTML
    const existingFooter = document.querySelector('footer.footer');
    if (existingFooter) {
      // Replace existing footer
      existingFooter.outerHTML = this.getFooterHTML();
    } else {
      // Insert at the end of body
      const footer = document.createElement('div');
      footer.innerHTML = this.getFooterHTML();
      document.body.appendChild(footer.firstElementChild);
    }
  }
}

// Auto-initialize footer when DOM is ready
SFTiUtils.onDOMReady(() => {
  new Footer();
});
