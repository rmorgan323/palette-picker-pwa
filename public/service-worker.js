this.addEventListener('install', event => {
  event.waitUntil(
    caches.open('assets-v1').then(cache => {
      return cache.addAll([
        '/',
        '/assets/lock-0.svg',
        '/assets/lock-1.svg',
        '/assets/lock-open-0.svg',
        '/assets/lock-open-1.svg',
        '/assets/pencil.svg',
        '/assets/trash.svg',
        '/assets/icon-192.png',
        '/assets/icon-48.png',
        '/assets/icon-512.png',
        '/assets/icon-96.png',
        '/bundle.js',
        '/css/styles.css',
        '/css/normalize.css',
        '/js/scripts.js',
        '/js/jquery-3.1.1.js'
      ])
    })
  );
});

this.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

this.addEventListener('activate', (event) => {
  let cacheWhitelist = ['assets-v1'];

  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (cacheWhitelist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    }).then(() => clients.claim())
  );
});