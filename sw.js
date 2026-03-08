// Your JavaScript code here
console.log("Hello, JavaScript!");const CACHE = ‘sayac-v3’;
const FILES = [
‘./’,
‘./index.html’,
‘./manifest.json’,
‘./icon.svg’
];

// Kurulum: tüm dosyaları cache’e al
self.addEventListener(‘install’, e => {
e.waitUntil(
caches.open(CACHE).then(cache => {
return cache.addAll(FILES);
}).then(() => self.skipWaiting())
);
});

// Aktivasyon: eski cache’leri temizle
self.addEventListener(‘activate’, e => {
e.waitUntil(
caches.keys().then(keys =>
Promise.all(
keys.filter(k => k !== CACHE).map(k => caches.delete(k))
)
).then(() => self.clients.claim())
);
});

// Fetch: önce cache’e bak, yoksa network’ten al ve cache’e kaydet
self.addEventListener(‘fetch’, e => {
// Sadece GET isteklerini handle et
if (e.request.method !== ‘GET’) return;

e.respondWith(
caches.open(CACHE).then(cache => {
return cache.match(e.request).then(cached => {
if (cached) {
// Cache’de varsa hemen ver, arka planda güncelle
fetch(e.request).then(response => {
if (response && response.status === 200) {
cache.put(e.request, response.clone());
}
}).catch(() => {});
return cached;
}

```
    // Cache'de yoksa network'ten al
    return fetch(e.request).then(response => {
      if (response && response.status === 200) {
        cache.put(e.request, response.clone());
      }
      return response;
    }).catch(() => {
      // Network de yoksa index.html'i ver
      return cache.match('./index.html');
    });
  });
})
```

);
});

// Her 6 saatte bir cache’i tazele
self.addEventListener(‘periodicsync’, e => {
if (e.tag === ‘cache-refresh’) {
e.waitUntil(
caches.open(CACHE).then(cache => cache.addAll(FILES))
);
}
});