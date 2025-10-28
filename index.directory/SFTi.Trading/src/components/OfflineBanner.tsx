import { useState, useEffect } from 'react';
import { offlineManager } from '@/lib/offline';
import { cn } from '@/lib/utils';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(offlineManager.getOnlineStatus());
  const [show, setShow] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineManager.onStatusChange((online) => {
      setIsOnline(online);
      
      if (!online) {
        setShow(true);
      } else {
        // Hide after a delay when back online
        setTimeout(() => setShow(false), 3000);
      }
    });

    // Show banner initially if offline
    if (!isOnline) {
      setShow(true);
    }

    return unsubscribe;
  }, [isOnline]);

  if (!show) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      "px-4 py-2 text-center text-sm font-medium",
      isOnline 
        ? "bg-green-600 text-white" 
        : "bg-yellow-600 text-white"
    )}>
      {isOnline ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
          Back online! All features restored.
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
          You're offline. App running in cached mode.
        </div>
      )}
    </div>
  );
}