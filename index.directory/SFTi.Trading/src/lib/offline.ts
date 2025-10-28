/**
 * Offline detection and management for PWA
 * Provides offline state and graceful fallbacks
 */

export class OfflineManager {
  private isOnline: boolean = navigator.onLine;
  private listeners: Set<(online: boolean) => void> = new Set();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 Back online');
      this.isOnline = true;
      this.notifyListeners();
    });

    window.addEventListener('offline', () => {
      console.log('📱 Gone offline');
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public onStatusChange(callback: (online: boolean) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.isOnline));
  }

  /**
   * Check if we can reach the server
   */
  public async checkServerConnection(): Promise<boolean> {
    if (!this.isOnline) return false;
    
    try {
      const response = await fetch('/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Check if IBKR Gateway is accessible
   */
  public async checkIBKRConnection(): Promise<boolean> {
    if (!this.isOnline) return false;
    
    try {
      const response = await fetch('https://localhost:5000/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const offlineManager = new OfflineManager();