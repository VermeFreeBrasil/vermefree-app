// Service worker do app VermeFree.
// Páginas: rede primeiro, com a última versão em cache para abrir sem internet.
// Arquivos com hash (/assets/) e ícones: cache primeiro.
// A API (Supabase) nunca passa por cache.
const CACHE = "vf-app-v1"

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/", "/manifest.webmanifest"])).then(() => self.skipWaiting()))
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.method !== "GET") return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone()
          caches.open(CACHE).then((c) => c.put("/", copia))
          return res
        })
        .catch(() => caches.match("/")),
    )
    return
  }

  if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copia = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copia))
            return res
          }),
      ),
    )
  }
})
