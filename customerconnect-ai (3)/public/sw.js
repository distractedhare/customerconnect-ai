const CACHE_NAME = 'customerconnect-v12';
const KIP_AVATAR_ASSETS = [
  '/assets/kip/kip_16_idle.svg',
  '/assets/kip/kip_16_listening.svg',
  '/assets/kip/kip_16_tip.svg',
  '/assets/kip/kip_16_alert.svg',
  '/assets/kip/kip_16_success.svg',
  '/assets/kip/kip_16_loading.svg',
  '/assets/kip/kip_16_speaking.svg',
  '/assets/kip/kip_32_idle.svg',
  '/assets/kip/kip_32_listening.svg',
  '/assets/kip/kip_32_tip.svg',
  '/assets/kip/kip_32_alert.svg',
  '/assets/kip/kip_32_success.svg',
  '/assets/kip/kip_32_loading.svg',
  '/assets/kip/kip_32_speaking.svg',
  '/assets/kip/kip_64_idle.svg',
  '/assets/kip/kip_64_listening.svg',
  '/assets/kip/kip_64_tip.svg',
  '/assets/kip/kip_64_alert.svg',
  '/assets/kip/kip_64_success.svg',
  '/assets/kip/kip_64_loading.svg',
  '/assets/kip/kip_64_speaking.svg',
  '/assets/kip/kip_128_idle.svg',
  '/assets/kip/kip_128_listening.svg',
  '/assets/kip/kip_128_tip.svg',
  '/assets/kip/kip_128_alert.svg',
  '/assets/kip/kip_128_success.svg',
  '/assets/kip/kip_128_loading.svg',
  '/assets/kip/kip_128_speaking.svg',
];
const RUNNER_FACTION_ASSETS = [
  '/assets/factions/apple/cutout_transparent.png',
  '/assets/factions/apple/hud_portrait.png',
  '/assets/factions/apple/avatar_small.png',
  '/assets/factions/apple/abilities/smash.svg',
  '/assets/factions/apple/abilities/blast.svg',
  '/assets/factions/apple/abilities/core.svg',
  '/assets/factions/samsung/cutout_transparent.png',
  '/assets/factions/samsung/hud_portrait.png',
  '/assets/factions/samsung/avatar_small.png',
  '/assets/factions/samsung/abilities/smash.svg',
  '/assets/factions/samsung/abilities/blast.svg',
  '/assets/factions/samsung/abilities/core.svg',
  '/assets/factions/tcl/cutout_transparent.png',
  '/assets/factions/tcl/hud_portrait.png',
  '/assets/factions/tcl/avatar_small.png',
  '/assets/factions/tcl/abilities/smash.svg',
  '/assets/factions/tcl/abilities/blast.svg',
  '/assets/factions/tcl/abilities/core.svg',
  '/assets/factions/motorola/cutout_transparent.png',
  '/assets/factions/motorola/hud_portrait.png',
  '/assets/factions/motorola/avatar_small.png',
  '/assets/factions/motorola/abilities/smash.svg',
  '/assets/factions/motorola/abilities/blast.svg',
  '/assets/factions/motorola/abilities/core.svg',
  '/assets/factions/pixel/cutout_transparent.png',
  '/assets/factions/pixel/hud_portrait.png',
  '/assets/factions/pixel/avatar_small.png',
  '/assets/factions/pixel/abilities/smash.svg',
  '/assets/factions/pixel/abilities/blast.svg',
  '/assets/factions/pixel/abilities/core.svg',
  '/assets/factions/pixel/abilities/swarm.svg',
  '/assets/factions/pixel/abilities/laser.svg',
  '/assets/factions/pixel/abilities/protocol.svg',
];
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/weekly-update.json',
  '/device-ecosystem-matrix.json',
  '/states-10m.json',
  '/tmo-logo-v4.svg',
  '/icon-192.png',
  '/icon-512.png',
  ...KIP_AVATAR_ASSETS,
  ...RUNNER_FACTION_ASSETS,
];

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// On install, cache static shell assets (not index.html — that uses network-first)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        APP_SHELL_ASSETS.map(async (asset) => {
          try {
            await cache.add(asset);
          } catch (_) {
            // Missing optional assets should never block the install.
          }
        })
      );
    })
  );
  // Activate immediately — don't wait for old SW to finish
  self.skipWaiting();
});

// On activate, claim all clients and clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean old cache versions
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      ),
      // Take control of all open tabs immediately
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    // For cross-origin, try cache then network
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  // Navigation requests — NETWORK FIRST so new deploys always load
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch('/index.html')
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', clone));
          }
          return response;
        })
        .catch(() =>
          caches.match('/index.html').then((cached) =>
            cached || new Response('Offline — please reconnect and reload once.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' },
            })
          )
        )
    );
    return;
  }

  // Time-sensitive JSON — network first so updates propagate
  if (
    url.pathname === '/weekly-update.json'
    || url.pathname === '/device-ecosystem-matrix.json'
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) =>
          cached || new Response('{}', { headers: { 'Content-Type': 'application/json' } })
        ))
    );
    return;
  }

  // Kip avatars are core PWA UI assets — cache first for offline floor use.
  if (url.pathname.startsWith('/assets/kip/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => caches.match('/assets/kip/kip_32_idle.svg').then((cached) =>
          cached || new Response('', { status: 503 })
        ));
      })
    );
    return;
  }

  // Native runner selection cards must be available offline before gameplay.
  if (url.pathname.startsWith('/assets/factions/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  // Hashed assets (JS/CSS with content hashes) — network first, fall back to cache
  // These filenames change on every build, so stale cache = white page
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) =>
            cached || new Response('', { status: 503 })
          )
        )
    );
    return;
  }

  // Everything else (SVGs, fonts, static files) — cache first, then network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => new Response('', { status: 503 }));
    })
  );
});
