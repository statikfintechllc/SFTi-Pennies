/**
 * Service Worker for SFTi-Pennies Trading Journal
 * Provides offline support and caching for PWA functionality
 * Version: 1.0.0
 */

const CACHE_NAME = 'sfti-pennies-v1.0.0';
const RUNTIME_CACHE = 'sfti-pennies-runtime';

// Core assets to cache for offline use
const CORE_ASSETS = [
  '/SFTi-Pennies/',
  '/SFTi-Pennies/index.html',
  '/SFTi-Pennies/manifest.json',
  '/SFTi-Pennies/index.directory/analytics.html',
  '/SFTi-Pennies/index.directory/add-trade.html',
  '/SFTi-Pennies/index.directory/all-trades.html',
  '/SFTi-Pennies/index.directory/import.html',
  '/SFTi-Pennies/index.directory/assets/css/main.css',
  '/SFTi-Pennies/index.directory/assets/css/glass-effects.css',
  '/SFTi-Pennies/index.directory/assets/js/utils.js',
  '/SFTi-Pennies/index.directory/assets/js/eventBus.js',
  '/SFTi-Pennies/index.directory/assets/js/chartConfig.js',
  '/SFTi-Pennies/index.directory/assets/js/accountManager.js',
  '/SFTi-Pennies/index.directory/assets/js/analytics.js',
  '/SFTi-Pennies/index.directory/assets/js/app.js',
  '/SFTi-Pennies/index.directory/assets/js/navbar.js',
  '/SFTi-Pennies/index.directory/assets/js/footer.js',
  '/SFTi-Pennies/index.directory/assets/icons/icon-192.png',
  '/SFTi-Pennies/index.directory/assets/icons/icon-512.png'
];

// Data files to cache (JSON)
const DATA_ASSETS = [
  '/SFTi-Pennies/index.directory/trades-index.json',
  '/SFTi-Pennies/index.directory/account-config.json',
  '/SFTi-Pennies/index.directory/assets/charts/analytics-data.json',
  '/SFTi-Pennies/index.directory/books-index.json',
  '/SFTi-Pennies/index.directory/notes-index.json'
];

/**
 * Install event - cache core assets
 */
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('[ServiceWorker] Core assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[ServiceWorker] Cache failed:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Activated');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - serve from cache, fallback to network
 * Strategy: Cache First for assets, Network First for data
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests (CDN, APIs, etc.)
  if (!url.origin.includes(location.origin) && !url.pathname.startsWith('/SFTi-Pennies/')) {
    return;
  }
  
  // Determine strategy based on request type
  if (isDataRequest(request)) {
    // Network First for data (JSON files) - always get fresh data when online
    event.respondWith(networkFirstStrategy(request));
  } else {
    // Cache First for static assets - faster offline experience
    event.respondWith(cacheFirstStrategy(request));
  }
});

/**
 * Check if request is for data (JSON)
 */
function isDataRequest(request) {
  return request.url.includes('.json') || 
         request.url.includes('/assets/charts/') ||
         request.url.includes('index.json');
}

/**
 * Cache First Strategy - for static assets
 * Serves from cache if available, falls back to network
 */
async function cacheFirstStrategy(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[ServiceWorker] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    console.log('[ServiceWorker] Fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    
    // Return offline fallback if available
    return caches.match('/SFTi-Pennies/offline.html').then((response) => {
      return response || new Response('Offline - Please check your connection', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'text/plain'
        })
      });
    });
  }
}

/**
 * Network First Strategy - for data files
 * Tries network first, falls back to cache if offline
 */
async function networkFirstStrategy(request) {
  try {
    console.log('[ServiceWorker] Fetching fresh data:', request.url);
    const networkResponse = await fetch(request);
    
    // Cache the fresh data
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, serving from cache:', request.url);
    
    // Fallback to cache
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Also check main cache
    const mainCache = await caches.open(CACHE_NAME);
    const mainCachedResponse = await mainCache.match(request);
    
    if (mainCachedResponse) {
      return mainCachedResponse;
    }
    
    // Return error response
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'Data not available offline. Please connect to the internet.',
      cached: false
    }), {
      status: 503,
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }
}

/**
 * Message event - handle messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        console.log('[ServiceWorker] All caches cleared');
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

console.log('[ServiceWorker] Loaded');
