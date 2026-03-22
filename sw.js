// ─────────────────────────────────────────────────────────────
//  Service Worker — Platine Guides PWA
//  Stratégie : Cache-first pour assets statiques,
//              Stale-while-revalidate pour les guides HTML,
//              Network-first pour games.json (catalogue).
//  Mise à jour : dès qu'une nouvelle version est détectée,
//              skipWaiting() + clients.claim() → actif immédiatement.
// ─────────────────────────────────────────────────────────────

const VERSION   = '__BUILD_VERSION__';   // remplacé par GitHub Actions
const APP_CACHE = `platine-app-v${VERSION}`;
const GDE_CACHE = `platine-guides-v${VERSION}`;

// Assets de l'app shell — mis en cache à l'installation
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './games.json',
];

// ── INSTALL : précache du shell ─────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())   // activation immédiate
  );
});

// ── ACTIVATE : suppression des anciens caches ───────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== APP_CACHE && k !== GDE_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())  // prise de contrôle immédiate
  );
});

// ── FETCH : stratégie par type de ressource ─────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // games.json → Network-first (catalogue toujours frais)
  if (url.pathname.endsWith('games.json')) {
    event.respondWith(networkFirst(event.request, APP_CACHE));
    return;
  }

  // Guides HTML → Stale-while-revalidate (rapide + auto-update)
  if (url.pathname.includes('/guides/')) {
    event.respondWith(staleWhileRevalidate(event.request, GDE_CACHE));
    return;
  }

  // App shell & assets → Cache-first
  event.respondWith(cacheFirst(event.request, APP_CACHE));
});

// ── STRATÉGIES ──────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Ressource non disponible hors-ligne.', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Lancement de la mise à jour en arrière-plan
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  // Retourner le cache immédiatement si disponible, sinon attendre le réseau
  return cached || fetchPromise;
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('{}', { headers: { 'Content-Type': 'application/json' } });
  }
}

// ── MESSAGE : forcer la mise à jour depuis l'appli ──────────
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
