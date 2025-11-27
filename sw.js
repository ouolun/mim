/*V1.5.0 Release*/
/*
 * Copyright (C) 2025 ouolun
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

const CACHE_NAME = 'MIM V1.5.0 Release'; 
const REPO_NAME = '/mim';

const urlsToCache = [
  `${REPO_NAME}/`,
  `${REPO_NAME}/index.html`,
  `${REPO_NAME}/style.css`,
  `${REPO_NAME}/script.js`,
  `${REPO_NAME}/purify.min.js`,
  `${REPO_NAME}/marked.min.js`,
  `${REPO_NAME}/manifest.json`,
  `${REPO_NAME}/201511.json`,
  `${REPO_NAME}/201504.json`,
  `${REPO_NAME}/201611.json`,
  `${REPO_NAME}/201604.json`,
  `${REPO_NAME}/201711.json`,
  `${REPO_NAME}/201704.json`,
  `${REPO_NAME}/201811.json`,
  `${REPO_NAME}/201804.json`,
  `${REPO_NAME}/201911.json`,
  `${REPO_NAME}/201904.json`,
  `${REPO_NAME}/202011.json`,
  `${REPO_NAME}/202004.json`,
  `${REPO_NAME}/202111.json`,
  `${REPO_NAME}/202104.json`,
  `${REPO_NAME}/202211.json`,
  `${REPO_NAME}/202204.json`,
  `${REPO_NAME}/202304.json`,
  `${REPO_NAME}/202311.json`,
  `${REPO_NAME}/202404.json`,
  `${REPO_NAME}/202411.json`,
  `${REPO_NAME}/202504.json`,
  `${REPO_NAME}/apple-touch-icon.png`,
  `${REPO_NAME}/favicon.png`,
  `${REPO_NAME}/favicon.ico`
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











