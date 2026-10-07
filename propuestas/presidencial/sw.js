/* Presidencial shell cache.
   Scope is the directory of this file. On GitHub Pages that is
   /khepani-sitio/propuestas/presidencial/ — the same scope as manifest.webmanifest.
   Asset URLs are relative so they resolve under that subpath. */
var CACHE = "khepani-presidencial-v7";
var SHELL = [
  "./",
  "./index.html",
  "./presidencial.css",
  "./asistente.js",
  "./conocimiento.json",
  "./manifest.webmanifest",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "../photos/logo-oficial.png",
  "../photos/hero-campus-hd.jpg",
  "../photos/campus-primaria-sep18.jpg",
  "../photos/campus-secundaria-sep17.jpg",
  "../photos/galeria-fachada-lateral.webp",
  "../photos/campus-cancha-cubierta-sep18.jpg",
  "../photos/campus-bandera-sep18.jpg",
  "../photos/galeria-cancha-frontal.webp",
  "../photos/vida-paz.webp",
  "../photos/galeria-entrada.webp",
  "../photos/letrero-misio-vision.webp",
  "../photos/miss-sandy-english.jpg",
  "../photos/galeria-explanada.webp",
  "../photos/proximamente/cafeteria-aerea.webp",
  "../photos/proximamente/anfiteatro.webp",
  "../photos/proximamente/jardineras.webp",
  "../photos/proximamente/plan-maestro.webp",
  "../photos/proximamente/terraza-pista.webp"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(SHELL);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
        return key !== CACHE;
      }).map(function (key) {
        return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function sameOrigin(url) {
  return url.origin === self.location.origin;
}

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (!sameOrigin(url)) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (cache) {
          cache.put("./index.html", copy);
        });
        return res;
      }).catch(function () {
        return caches.match("./index.html").then(function (cached) {
          return cached || caches.match("./");
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function (cached) {
      var network = fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(req, copy);
          });
        }
        return res;
      }).catch(function () {
        return cached;
      });
      return cached || network;
    })
  );
});
