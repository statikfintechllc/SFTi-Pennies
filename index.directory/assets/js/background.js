/**
 * SFTi-Pennies Trading Journal - Background Animation
 * Creates an animated matrix-style background with trading symbols
 */

class BackgroundAnimation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    
    // Animation parameters
    this.columns = Math.floor(this.canvas.width / 20);
    this.drops = new Array(this.columns).fill(1);
    // Matrix-style digital rain characters: numbers, letters, and special symbols
    this.symbols = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?/~`'.split('');
    
    // Bind methods
    this.animate = this.animate.bind(this);
    this.resizeCanvas = this.resizeCanvas.bind(this);
    
    // Handle resize
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.columns = Math.floor(this.canvas.width / 20);
      this.drops = new Array(this.columns).fill(1);
    });
    
    // Start animation
    this.animate();
  }
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  animate() {
    // Semi-transparent black for trail effect
    this.ctx.fillStyle = 'rgba(10, 14, 39, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Set text style
    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = '15px JetBrains Mono, monospace';
    
    // Draw symbols
    for (let i = 0; i < this.drops.length; i++) {
      // Random symbol
      const symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
      const x = i * 20;
      const y = this.drops[i] * 20;
      
      this.ctx.fillText(symbol, x, y);
      
      // Reset drop to top randomly
      if (y > this.canvas.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }
      
      // Increment Y coordinate
      this.drops[i]++;
    }
    
    requestAnimationFrame(this.animate);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BackgroundAnimation('bg-canvas');
});
