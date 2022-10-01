const CACHE_NAME = 'npk_raspisanie';
const toCache = [
	'/',
	'/index.html',
	'/pwa.webmanifest',
	'/js/pwa.js',
	'/js/status.js',
	'/js/table.js',
	'/bootstrap/bootstrap.min.css',
	'/bootstrap/bootstrap.min.css.map',
	'/main.css',
	'/api/get',
	'/icons/icon-144x144.png',
];

self.addEventListener('install', function (event) {
	event.waitUntil(
		caches.open(CACHE_NAME)
		.then(function (cache) {
			return cache.addAll(toCache)
		})
		.then(self.skipWaiting())
	)
})

self.addEventListener('fetch', function (event) {
	event.respondWith(
		fetch(event.request)
		.catch(() => {
			return caches.open(CACHE_NAME)
				.then((cache) => {
					return cache.match(event.request)
				})
		})
	)
})

self.addEventListener('activate', function (event) {
	event.waitUntil(
		caches.keys()
		.then((keyList) => {
			return Promise.all(keyList.map((key) => {
				if (key !== CACHE_NAME) {
					console.log('[ServiceWorker] Removing old cache', key)
					return caches.delete(key)
				}
			}))
		})
		.then(() => self.clients.claim())
	)
})

self.addEventListener('push', ev => {
	//const data = ev.data.json();
	console.log('Got push', ev);

	ev.waitUntil(
		self.registration.showNotification("НПК: Расписание", {
			body: 'Расписание было обновлено.'
		})
	);

	self.clients.matchAll().then(all => all.forEach(client => {
		client.postMessage("upd_rasp");
	}));
});

self.addEventListener("message", function(event) {
    self.clients.matchAll().then(all => all.forEach(client => {
        client.postMessage("Responding to " + event.data);
    }));
});

self.addEventListener('notificationclick', event => {
    const rootUrl = new URL('/', location).href;
    event.notification.close();
    event.waitUntil(
      clients.matchAll().then(matchedClients => {
        for (let client of matchedClients) {
          if (client.url === rootUrl) {
            return client.focus();
          }
        }
        return clients.openWindow("/");
      })
    );
});