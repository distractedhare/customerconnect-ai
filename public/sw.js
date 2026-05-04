const CACHE_NAME = 'customerconnect-v16';
const IMAGE_ASSET_PATTERN = /\.(png|webp|svg|jpe?g)$/i;
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
const RUNNER_CHARACTER_SLUGS = [
  'apple_titanium_duelist',
  'samsung_foldwing_warrior',
  'tcl_display_brawler',
  'motorola_flip_rider',
  'pixel_scout',
];
const RUNNER_CHARACTER_ASSETS = RUNNER_CHARACTER_SLUGS.flatMap((slug) =>
  [
    `cards/${slug}_card`,
    `heroes/${slug}_hero`,
    `portraits/${slug}_portrait`,
    `avatars/${slug}_avatar`,
    `banners/${slug}_banner`,
    `mobile/${slug}_mobile`,
  ].flatMap((path) => [`/levelup/runner/${path}.png`, `/levelup/runner/${path}.webp`])
);
const RUNNER_ABILITY_ASSETS = ['apple', 'samsung', 'tcl', 'motorola', 'pixel', 'kip'].flatMap((runner) =>
  ['smash', 'blast', 'core'].flatMap((slot) => [
    `/levelup/runner/abilities/${runner}-${slot}.png`,
    `/levelup/runner/abilities/${runner}-${slot}.webp`,
  ])
);
const RUNNER_BOSS_ASSETS = [
  'atlas-backbone',
  'redline-commander',
  'patchwork-hydra',
  'throttle-maw',
  'dead-zone-titan',
  'bell',
  'bell-encounter',
].flatMap((boss) =>
  ['avatar', 'banner', 'portrait'].flatMap((slot) => [
    `/levelup/runner/bosses/${boss}-${slot}.png`,
    `/levelup/runner/bosses/${boss}-${slot}.webp`,
  ])
);
const RUNNER_SIDEKICK_ASSETS = [
  '/levelup/runner/cards/tmobile_sidekick_core_command_card_v2.png',
  '/levelup/runner/cards/tmobile_sidekick_core_command_card_v2.webp',
  '/levelup/runner/portraits/tmobile_sidekick_core_portrait.png',
  '/levelup/runner/portraits/tmobile_sidekick_core_portrait.webp',
];
const RUNNER_ART_ASSETS = [
  ...RUNNER_CHARACTER_ASSETS,
  ...RUNNER_ABILITY_ASSETS,
  ...RUNNER_BOSS_ASSETS,
  ...RUNNER_SIDEKICK_ASSETS,
];
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/weekly-update.json',
  '/knowledge/tmobile-knowledge-raw.json',
  '/device-ecosystem-matrix.json',
  '/states-10m.json',
  '/tmo-logo-v4.svg',
  '/icon-192.png',
  '/icon-512.png',
  ...KIP_AVATAR_ASSETS,
  ...RUNNER_ART_ASSETS,
];

const isValidAssetResponse = (response, pathname) => {
  if (!response || !response.ok) return false;
  const contentType = response.headers.get('Content-Type') || '';
  if (IMAGE_ASSET_PATTERN.test(pathname)) return contentType.startsWith('image/');
  return !contentType.includes('text/html');
};

const fetchAndCacheAsset = (request, pathname) =>
  fetch(request).then((response) => {
    if (isValidAssetResponse(response, pathname)) {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
    }
    return response;
  });

const networkFirstAsset = (request, pathname) =>
  fetchAndCacheAsset(request, pathname).catch(() =>
    caches.match(request).then((cached) =>
      isValidAssetResponse(cached, pathname)
        ? cached
        : new Response('', { status: 503 })
    )
  );

const cacheFirstJsonAsset = (request, fallbackBody) =>
  caches.match(request).then((cached) => {
    if (cached) return cached;

    return fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        new Response(fallbackBody, {
          headers: { 'Content-Type': 'application/json' },
        })
      );
  });

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

  if (url.pathname === '/knowledge/tmobile-knowledge-raw.json') {
    event.respondWith(cacheFirstJsonAsset(event.request, '[]'));
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

  // Runner art must never serve a stale app shell from cache under an image URL.
  if (url.pathname.startsWith('/levelup/runner/')) {
    event.respondWith(networkFirstAsset(event.request, url.pathname));
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
