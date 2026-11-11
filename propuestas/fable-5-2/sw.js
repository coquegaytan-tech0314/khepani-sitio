/* Instituto Khépani · propuesta Fable 5.2 · service worker
   - Usa su propia caché (khepani-fable-5-2-*) y solo borra versiones viejas de esa misma caché.
   - Alcance limitado a esta carpeta: no intercepta rutas de Presidencial ni de otras propuestas.
   - Nunca intercepta peticiones a otros dominios (asistente/Cloud Function, WhatsApp, Maps).
   - No se toca conocimiento.json ni la Cloud Function. */
const PREFIJO = "khepani-fable-5-2-";
const CACHE = PREFIJO + "v1";

const BASICOS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "manifest.webmanifest"
];

const ALCANCE = new URL("./", self.location.href).pathname;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(BASICOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith(PREFIJO) && key !== CACHE).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function guardar(request, response) {
  if (response && response.ok && response.type === "basic") {
    const url = new URL(request.url);
    if (url.pathname.startsWith(ALCANCE)) {
      const copia = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copia)).catch(() => undefined);
    }
  }
  return response;
}

function guardado(request, opciones) {
  return caches.open(CACHE).then((cache) => cache.match(request, opciones));
}

function redPrimero(request) {
  return fetch(request)
    .then((response) => guardar(request, response))
    .catch(() => guardado(request, { ignoreSearch: true })
      .then((hit) => hit || (request.mode === "navigate" ? guardado("index.html") : undefined))
      .then((hit) => hit || Response.error()));
}

function cachePrimero(request) {
  return guardado(request).then((hit) => {
    const red = fetch(request).then((response) => guardar(request, response));
    if (hit) {
      red.catch(() => undefined);
      return hit;
    }
    return red;
  });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(ALCANCE)) return;

  if (request.mode === "navigate" || /\.(?:html|json|webmanifest)$/.test(url.pathname)) {
    event.respondWith(redPrimero(request));
    return;
  }
  event.respondWith(cachePrimero(request));
});
