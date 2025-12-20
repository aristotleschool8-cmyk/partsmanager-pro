// Anti-scraping and protection service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installed - protecting your app');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
});

// Prevent offline access
self.addEventListener('fetch', (event) => {
  // Only allow requests to same origin
  const url = new URL(event.request.url);
  
  // Allow all netlify.app and vercel.app subdomains, localhost
  const isAllowedDomain = 
    self.location.hostname.includes('netlify.app') ||
    self.location.hostname.includes('vercel.app') ||
    self.location.hostname === 'localhost' ||
    self.location.hostname === '127.0.0.1';
  
  if (!isAllowedDomain) {
    event.respondWith(
      new Response('Access Denied', {
        status: 403,
        statusText: 'Forbidden',
      })
    );
    return;
  }
  
  // Normal fetch
  event.respondWith(fetch(event.request));
});
