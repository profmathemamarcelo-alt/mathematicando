/* Treino do Dia · service worker: depois do 1º acesso, a página abre mesmo com sinal fraco ou sem internet.
   Estratégia: mostra a cópia guardada na hora e atualiza em segundo plano para a próxima visita. */
var CACHE = 'treino-do-dia-v2';
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.add('treino.html'); }).catch(function () { }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || !/\/treino\.html$/.test(url.pathname)) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    var key = new Request(url.origin + url.pathname);
    return c.match(key).then(function (hit) {
      var rede = fetch(req).then(function (r) { if (r && r.ok) c.put(key, r.clone()); return r; }).catch(function () { return null; });
      if (hit) { e.waitUntil(rede); return hit; }
      return rede.then(function (r) { return r || new Response('Sem conexão. Abra o Treino do Dia uma vez com internet para usar offline.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }); });
    });
  }));
});
