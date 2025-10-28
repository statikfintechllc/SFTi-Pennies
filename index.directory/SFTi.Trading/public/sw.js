// SFTi Stock Scanner Service Worker
// Professional PWA implementation for mobile and desktop offline functionality

const CACHE_NAME = 'sfti-scanner-v6.0';
const RUNTIME_CACHE = 'sfti-runtime-v6.0';

// Core app files that MUST be cached for offline functionality
const ESSENTIAL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/index-BhsIAwIG.js',           // Main app bundle
  '/assets/index-DccMJiop.css',          // App styles
  '/assets/stock-chart-icon-CTrtmrCD.svg', // App icon
  '/assets/graph-icon-512-kNIw7ysk.png',   // PWA icons
  '/assets/icon-KZOwbQl8.png'              // Additional icon
];

// External resources that should be cached when available
const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2'
];

// Install event - cache essential files immediately
self.addEventListener('install', (event) => {
  console.log('🔧 SFTi SW v6.0 installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache essential app files
      caches.open(CACHE_NAME).then(cache => {
        console.log('📦 Caching essential app files...');
        return cache.addAll(ESSENTIAL_FILES);
      }),
      // Pre-cache external resources (non-blocking)
      caches.open(RUNTIME_CACHE).then(cache => {
        console.log('🌐 Pre-caching external resources...');
        return Promise.allSettled(
          EXTERNAL_RESOURCES.map(url => 
            fetch(url).then(response => {
              if (response.ok) {
                cache.put(url, response);
              }
            }).catch(() => {
              console.log('⚠️ Could not pre-cache:', url);
            })
          )
        );
      })
    ]).then(() => {
      console.log('✅ SFTi SW v6.0 installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - cleanup and take control
self.addEventListener('activate', (event) => {
  console.log('🚀 SFTi SW v6.0 activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      // Delete old caches
      const deletePromises = cacheNames
        .filter(name => !name.includes('v6.0'))
        .map(name => {
          console.log('🗑️ Deleting old cache:', name);
          return caches.delete(name);
        });
      
      return Promise.all(deletePromises);
    }).then(() => {
      console.log('✅ SFTi SW v6.0 activated and controlling all pages');
      return self.clients.claim();
    })
  );
});

// Fetch event - intelligent request handling
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle GET requests
  if (request.method !== 'GET') return;
  
  // Route requests based on type
  if (isAppNavigation(request)) {
    event.respondWith(handleNavigation(request));
  } else if (isAppAsset(url)) {
    event.respondWith(handleAppAsset(request));
  } else if (isIBKRRequest(url)) {
    event.respondWith(handleIBKRRequest(request));
  } else if (isGoogleFonts(url)) {
    event.respondWith(handleFontsRequest(request));
  } else if (isExternalAPI(url)) {
    event.respondWith(handleExternalAPI(request));
  }
  // Let browser handle other requests normally
});

// Check if request is app navigation
function isAppNavigation(request) {
  return request.mode === 'navigate' || 
         (request.destination === 'document' && request.headers.get('accept')?.includes('text/html'));
}

// Check if URL is an app asset
function isAppAsset(url) {
  return url.origin === self.location.origin && (
    url.pathname.startsWith('/assets/') ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/favicon.ico' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg')
  );
}

// Check if request is to IBKR services
function isIBKRRequest(url) {
  return url.hostname.includes('interactivebrokers.com') ||
         (url.hostname === 'localhost' && url.port === '5000') ||
         url.pathname.startsWith('/v1/api/iserver');
}

// Check if request is to Google Fonts
function isGoogleFonts(url) {
  return url.hostname.includes('fonts.googleapis.com') || 
         url.hostname.includes('fonts.gstatic.com');
}

// Check if request is to external APIs
function isExternalAPI(url) {
  return url.origin !== self.location.origin && 
         !isGoogleFonts(url) && 
         !isIBKRRequest(url);
}

// Handle navigation requests (app pages)
async function handleNavigation(request) {
  console.log('🧭 Navigation request:', request.url);
  
  try {
    // For navigation, always serve the cached index.html in offline mode
    const cache = await caches.open(CACHE_NAME);
    const cachedIndex = await cache.match('/index.html');
    
    if (cachedIndex) {
      console.log('📱 Serving cached app for navigation');
      return cachedIndex;
    }
    
    // If no cached version, try network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful response
      cache.put('/index.html', networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
    
  } catch (error) {
    console.log('⚠️ Navigation failed, serving offline fallback');
    return createOfflinePage();
  }
}

// Handle app assets (JS, CSS, images)
async function handleAppAsset(request) {
  console.log('🎨 Asset request:', request.url);
  
  try {
    // Cache-first strategy for app assets
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('💾 Serving cached asset');
      return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('📥 Cached new asset');
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
    
  } catch (error) {
    console.log('❌ Asset request failed:', request.url);
    
    // Return placeholder for critical assets
    if (request.url.endsWith('.js')) {
      return new Response('console.log("Offline: JS asset not available");', {
        headers: { 'Content-Type': 'application/javascript' }
      });
    } else if (request.url.endsWith('.css')) {
      return new Response('/* Offline: CSS asset not available */', {
        headers: { 'Content-Type': 'text/css' }
      });
    }
    
    throw error;
  }
}

// Handle IBKR API requests - always try network, graceful degradation
async function handleIBKRRequest(request) {
  console.log('🏦 IBKR API request:', request.url);
  
  try {
    // Always try network first for IBKR - real-time data
    const response = await fetch(request, { 
      timeout: 5000 // 5 second timeout for API calls
    });
    
    console.log('✅ IBKR API response:', response.status);
    return response;
    
  } catch (error) {
    console.log('⚠️ IBKR API unavailable (offline mode)');
    
    // Return structured offline response for API calls
    return new Response(JSON.stringify({
      error: 'offline_mode',
      message: 'IBKR services unavailable - running in demo mode',
      timestamp: Date.now()
    }), {
      status: 503,
      headers: { 
        'Content-Type': 'application/json',
        'X-Offline-Mode': 'true'
      }
    });
  }
}

// Handle Google Fonts - cache aggressively
async function handleFontsRequest(request) {
  console.log('🔤 Font request:', request.url);
  
  try {
    // Check cache first for fonts
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('💾 Serving cached font');
      return cachedResponse;
    }
    
    // Fetch from network and cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('📥 Cached font');
      return networkResponse;
    }
    
    throw new Error('Font fetch failed');
    
  } catch (error) {
    console.log('⚠️ Font request failed, app will use fallback fonts');
    // Let the app handle font fallbacks naturally
    throw error;
  }
}

// Handle external API requests - network-first with timeout
async function handleExternalAPI(request) {
  console.log('🌐 External API request:', request.url);
  
  try {
    // Try network with timeout
    const response = await fetch(request, { timeout: 3000 });
    
    // Don't cache API responses - they should be fresh
    return response;
    
  } catch (error) {
    console.log('⚠️ External API request failed');
    
    // Check if we have a cached version as last resort
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📦 Serving stale cached API response');
      return cachedResponse;
    }
    
    throw error;
  }
}

// Create offline page when all else fails
function createOfflinePage() {
  const offlineHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SFTi Stock Scanner - Offline</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 20px;
        }
        .container {
            max-width: 400px;
            padding: 40px 20px;
        }
        .icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        h1 {
            color: #10b981;
            margin-bottom: 16px;
            font-size: 24px;
        }
        p {
            margin-bottom: 24px;
            opacity: 0.8;
            line-height: 1.5;
        }
        .btn {
            background: #10b981;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .btn:hover {
            background: #059669;
        }
        .status {
            margin-top: 20px;
            font-size: 14px;
            opacity: 0.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📱</div>
        <h1>SFTi Stock Scanner</h1>
        <p>You're currently offline. The app will restore full functionality when you reconnect to the internet.</p>
        <button class="btn" onclick="window.location.reload()">
            Reload App
        </button>
        <div class="status">
            PWA Offline Mode • Service Worker v6.0
        </div>
    </div>
    <script>
        // Auto-reload when connection is restored
        window.addEventListener('online', () => {
            console.log('Connection restored, reloading app...');
            setTimeout(() => window.location.reload(), 1000);
        });
        
        // Update status based on connection
        function updateStatus() {
            const status = document.querySelector('.status');
            if (navigator.onLine) {
                status.textContent = 'PWA Online Mode • Service Worker v6.0';
            } else {
                status.textContent = 'PWA Offline Mode • Service Worker v6.0';
            }
        }
        
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
        updateStatus();
    </script>
</body>
</html>
  `;
  
  return new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html' },
    status: 200
  });
}

// Service worker ready
console.log('🎯 SFTi Stock Scanner Service Worker v6.0 loaded and ready');
console.log('📦 Caching strategy: Cache-first for app assets, Network-first for APIs');
console.log('📱 PWA offline functionality enabled for mobile and desktop');