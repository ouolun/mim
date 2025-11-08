/*V1.2.0 Release*/
const CACHE_NAME = 'MIM V1.2.0 Release'; 
const REPO_NAME = '/mim';

const urlsToCache = [
  `${REPO_NAME}/`,
  `${REPO_NAME}/index.html`,
  `${REPO_NAME}/style.css`,
  `${REPO_NAME}/script.js`,
  `${REPO_NAME}/purify.min.js`,
  `${REPO_NAME}/marked.min.js`,
  `${REPO_NAME}/202404.json`,
  `${REPO_NAME}/202411.json`,
  `${REPO_NAME}/202504.json`,
  `${REPO_NAME}/apple-touch-icon.png`,
  `${REPO_NAME}/favicon.png`,
  `${REPO_NAME}/favicon.ico`,
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW:Downloading Cache...');
        return cache.addAll(urlsToCache).catch(error => {
            console.error('SW:Warning, fail to access some cache:', error);
        });
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW:Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); 
});

self.addEventListener('fetch', event => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request);
        }
      )
    );
  }
});

self.addEventListener('message', event => {
    if (event.data && event.data.action === 'skipWaiting') {
        console.log('SW:Get skipWaiting request, now loading...');
        self.skipWaiting();
    }
});
