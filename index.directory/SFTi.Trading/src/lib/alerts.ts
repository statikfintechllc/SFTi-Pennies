import { PriceAlert, Stock, NotificationSettings, PatternAnalysis, RealTimePattern } from '@/types';
import { aiPatternService } from '@/lib/aiPatterns';
import { toast } from 'sonner';

/**
 * Price Alert and Notification Service
 * Monitors stock prices and triggers alerts based on user-defined conditions
 */
export class AlertService {
  private alerts: Map<string, PriceAlert> = new Map();
  private priceHistory: Map<string, number[]> = new Map();
  private patternHistory: Map<string, RealTimePattern[]> = new Map();
  private lastPatternCheck: Date = new Date();
  private settings: NotificationSettings = {
    enabled: true,
    sound: true,
    desktop: true,
    priceAlerts: true,
    volumeAlerts: true,
    newsAlerts: true
  };

  constructor() {
    this.requestNotificationPermission();
  }

  /**
   * Request browser notification permission
   */
  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  /**
   * Add a new price alert
   */
  addAlert(alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>): string {
    const id = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newAlert: PriceAlert = {
      ...alert,
      id,
      createdAt: new Date(),
      triggered: false
    };
    
    this.alerts.set(id, newAlert);
    return id;
  }

  /**
   * Remove an alert
   */
  removeAlert(id: string): boolean {
    return this.alerts.delete(id);
  }

  /**
   * Get all alerts
   */
  getAlerts(): PriceAlert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Get alerts for a specific symbol
   */
  getAlertsForSymbol(symbol: string): PriceAlert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.symbol === symbol);
  }

  /**
   * Update alert settings
   */
  updateSettings(settings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get current settings
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Check alerts against current stock data
   */
  checkAlerts(stocks: Stock[]): void {
    if (!this.settings.enabled) return;

    stocks.forEach(stock => {
      this.updatePriceHistory(stock.symbol, stock.price);
      this.checkPriceAlerts(stock);
      this.checkVolumeAlerts(stock);
      this.checkBreakoutAlerts(stock);
    });

    // Check for pattern recognition alerts every 30 seconds
    const now = new Date();
    if (now.getTime() - this.lastPatternCheck.getTime() > 30000) {
      this.checkPatternAlerts(stocks);
      this.lastPatternCheck = now;
    }
  }

  /**
   * Update price history for breakout detection
   */
  private updatePriceHistory(symbol: string, price: number): void {
    if (!this.priceHistory.has(symbol)) {
      this.priceHistory.set(symbol, []);
    }
    
    const history = this.priceHistory.get(symbol)!;
    history.push(price);
    
    // Keep only last 20 prices for analysis
    if (history.length > 20) {
      history.shift();
    }
  }

  /**
   * Check price-based alerts
   */
  private checkPriceAlerts(stock: Stock): void {
    if (!this.settings.priceAlerts) return;

    const symbolAlerts = this.getAlertsForSymbol(stock.symbol).filter(
      alert => alert.enabled && !alert.triggered && 
      (alert.type === 'price_above' || alert.type === 'price_below')
    );

    symbolAlerts.forEach(alert => {
      let triggered = false;
      let message = '';

      switch (alert.type) {
        case 'price_above':
          if (stock.price >= alert.value) {
            triggered = true;
            message = `${stock.symbol} hit target price $${alert.value.toFixed(4)} (Current: $${stock.price.toFixed(4)})`;
          }
          break;
        case 'price_below':
          if (stock.price <= alert.value) {
            triggered = true;
            message = `${stock.symbol} dropped below $${alert.value.toFixed(4)} (Current: $${stock.price.toFixed(4)})`;
          }
          break;
      }

      if (triggered) {
        this.triggerAlert(alert, message);
      }
    });
  }

  /**
   * Check volume spike alerts
   */
  private checkVolumeAlerts(stock: Stock): void {
    if (!this.settings.volumeAlerts) return;

    const volumeAlerts = this.getAlertsForSymbol(stock.symbol).filter(
      alert => alert.enabled && !alert.triggered && alert.type === 'volume_spike'
    );

    volumeAlerts.forEach(alert => {
      // Check if volume is X times higher than alert value (representing average volume)
      const volumeMultiplier = stock.volume / alert.value;
      
      if (volumeMultiplier >= 2) { // 2x volume spike
        const message = `${stock.symbol} volume spike! Current: ${this.formatVolume(stock.volume)} (${volumeMultiplier.toFixed(1)}x average)`;
        this.triggerAlert(alert, message);
      }
    });
  }

  /**
   * Check breakout pattern alerts
   */
  private checkBreakoutAlerts(stock: Stock): void {
    const breakoutAlerts = this.getAlertsForSymbol(stock.symbol).filter(
      alert => alert.enabled && !alert.triggered && alert.type === 'breakout'
    );

    if (breakoutAlerts.length === 0) return;

    const priceHistory = this.priceHistory.get(stock.symbol);
    if (!priceHistory || priceHistory.length < 10) return;

    const breakout = this.detectBreakout(priceHistory, stock.price);
    
    if (breakout) {
      breakoutAlerts.forEach(alert => {
        const message = `${stock.symbol} breakout detected! ${breakout.direction === 'up' ? '🚀' : '📉'} Breaking ${breakout.direction} from $${breakout.level.toFixed(4)}`;
        this.triggerAlert(alert, message);
      });
    }
  }

  /**
   * Detect breakout patterns
   */
  private detectBreakout(history: number[], currentPrice: number): { direction: 'up' | 'down', level: number } | null {
    if (history.length < 10) return null;

    // Simple resistance/support breakout detection
    const recentHigh = Math.max(...history.slice(-10));
    const recentLow = Math.min(...history.slice(-10));
    const avgPrice = history.slice(-5).reduce((sum, price) => sum + price, 0) / 5;

    // Breakout above resistance
    if (currentPrice > recentHigh && currentPrice > avgPrice * 1.02) {
      return { direction: 'up', level: recentHigh };
    }

    // Breakdown below support
    if (currentPrice < recentLow && currentPrice < avgPrice * 0.98) {
      return { direction: 'down', level: recentLow };
    }

    return null;
  }

  /**
   * Trigger an alert notification
   */
  private triggerAlert(alert: PriceAlert, message: string): void {
    // Mark alert as triggered
    alert.triggered = true;
    alert.message = message;

    // Emit event for UI updates
    window.dispatchEvent(new CustomEvent('alertTriggered', { detail: { alert } }));

    // Show toast notification
    const toastType = alert.type === 'price_below' || alert.type === 'breakout' ? 'warning' : 'success';
    toast[toastType](message, {
      duration: 6000,
      action: {
        label: 'View Chart',
        onClick: () => {
          // Emit event to open chart for this symbol
          window.dispatchEvent(new CustomEvent('openChart', { detail: { symbol: alert.symbol } }));
        }
      }
    });

    // Play sound if enabled
    if (this.settings.sound) {
      this.playAlertSound();
    }

    // Show desktop notification if enabled and permitted
    if (this.settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`Penny Stock Alert: ${alert.symbol}`, {
        body: message,
        icon: '/favicon.ico',
        tag: alert.id // Prevent duplicate notifications
      });
    }

    console.log(`Alert triggered: ${message}`);
  }

  /**
   * Play alert sound
   */
  private playAlertSound(): void {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('Failed to play alert sound:', error);
    }
  }

  /**
   * Format volume numbers for display
   */
  private formatVolume(volume: number): string {
    if (volume >= 1_000_000) {
      return `${(volume / 1_000_000).toFixed(1)}M`;
    } else if (volume >= 1_000) {
      return `${(volume / 1_000).toFixed(1)}K`;
    }
    return volume.toString();
  }

  /**
   * Clear all triggered alerts
   */
  clearTriggeredAlerts(): void {
    this.alerts.forEach((alert, id) => {
      if (alert.triggered) {
        this.alerts.delete(id);
      }
    });
  }

  /**
   * Reset alert (mark as not triggered)
   */
  resetAlert(id: string): boolean {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.triggered = false;
      alert.message = undefined;
      return true;
    }
    return false;
  }

  /**
   * Check for pattern recognition alerts
   */
  private async checkPatternAlerts(stocks: Stock[]): Promise<void> {
    try {
      const patterns = aiPatternService.analyzeRealTimePatterns(stocks);
      
      patterns.forEach(pattern => {
        if (!pattern.actionable || pattern.strength < 0.7) return;

        // Check if we already alerted for this pattern recently
        const symbolPatterns = this.patternHistory.get(pattern.symbol) || [];
        const recentPattern = symbolPatterns.find(p => 
          p.pattern.pattern === pattern.pattern.pattern && 
          new Date().getTime() - p.timestamp.getTime() < 300000 // 5 minutes
        );

        if (recentPattern) return;

        // Store this pattern
        symbolPatterns.push(pattern);
        this.patternHistory.set(pattern.symbol, symbolPatterns.slice(-5)); // Keep last 5

        // Create pattern alert
        const alertId = this.addAlert({
          symbol: pattern.symbol,
          type: 'pattern_recognition',
          value: pattern.price,
          enabled: true,
          pattern: pattern.pattern,
          confidence: pattern.strength
        });

        const alert = this.alerts.get(alertId);
        if (alert) {
          const message = `${pattern.symbol}: ${pattern.pattern.pattern} pattern detected! Confidence: ${(pattern.strength * 100).toFixed(0)}%`;
          this.triggerAlert(alert, message);
        }
      });
    } catch (error) {
      console.warn('Pattern alert check failed:', error);
    }
  }

  /**
   * Add AI signal alert
   */
  addAISignalAlert(symbol: string, signal: string, confidence: number, pattern?: PatternAnalysis): string {
    return this.addAlert({
      symbol,
      type: 'ai_signal',
      value: confidence,
      enabled: true,
      pattern,
      confidence,
      message: signal
    });
  }

  /**
   * Get pattern history for a symbol
   */
  getPatternHistory(symbol: string): RealTimePattern[] {
    return this.patternHistory.get(symbol) || [];
  }

  /**
   * Clear pattern history
   */
  clearPatternHistory(symbol?: string): void {
    if (symbol) {
      this.patternHistory.delete(symbol);
    } else {
      this.patternHistory.clear();
    }
  }
}

// Singleton instance
export const alertService = new AlertService();