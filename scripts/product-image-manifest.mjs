#!/usr/bin/env node

/**
 * Product image manifest.
 * Each entry has:
 *   path        — destination path under public/
 *   sourceUrls  — ordered list of URLs to try (product pages get scraped; direct image URLs are downloaded)
 *   fallbackSource — local fallback if all sourceUrls fail
 *   kind        — 'device' | 'accessory' | 'learn' | 'fallback'
 *   label       — human-readable name for logging
 */

// Per-brand SVG fallbacks — shown if product image can't be downloaded
const APPLE_FALLBACK = '/images/brands/apple.svg';
const SAMSUNG_FALLBACK = '/images/brands/samsung.svg';
const GOOGLE_FALLBACK = '/images/brands/google.svg';
const MOTOROLA_FALLBACK = '/images/brands/motorola.svg';
const TMOBILE_FALLBACK = '/images/brands/tmobile.svg';
const THIRD_PARTY_FALLBACK = '/images/brands/third-party.svg';
// Generic fallback for learn/UI cards
const LEARN_FALLBACK = '/images/ui/product-fallback.png';
const LOGO_FALLBACK = '/images/brands/tmobile.svg';

const TM = 'https://www.t-mobile.com';

export async function getProductImageManifest() {
  return [

    // ═══════════════════════════════════════════════════════════
    // DEVICES (44)
    // ═══════════════════════════════════════════════════════════

    // ── iPhones ──────────────────────────────────────────────
    {
      path: '/images/devices/iphone-17-pro-max.png',
      kind: 'device',
      label: 'iPhone 17 Pro Max',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/apple-iphone-17-pro-max`,
        'https://www.apple.com/shop/buy-iphone/iphone-17-pro',
      ],
    },
    {
      path: '/images/devices/iphone-17-pro.png',
      kind: 'device',
      label: 'iPhone 17 Pro',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/apple-iphone-17-pro`,
        'https://www.apple.com/shop/buy-iphone/iphone-17-pro',
      ],
    },
    {
      path: '/images/devices/iphone-air.png',
      kind: 'device',
      label: 'iPhone Air',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/apple-iphone-air`,
        'https://www.apple.com/shop/buy-iphone/iphone-air',
      ],
    },
    {
      path: '/images/devices/iphone-17.png',
      kind: 'device',
      label: 'iPhone 17',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/apple-iphone-17`,
        'https://www.apple.com/shop/buy-iphone/iphone-17',
      ],
    },
    {
      path: '/images/devices/iphone-17e.png',
      kind: 'device',
      label: 'iPhone 17e',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/apple-iphone-17e`,
        'https://www.apple.com/shop/buy-iphone/iphone-17e',
      ],
    },
    {
      path: '/images/devices/iphone-16.png',
      kind: 'device',
      label: 'iPhone 16',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/apple-iphone-16`,
        'https://www.apple.com/shop/buy-iphone/iphone-16',
      ],
    },

    // ── Samsung Galaxy S26 series ─────────────────────────────
    {
      path: '/images/devices/galaxy-s26-ultra.png',
      kind: 'device',
      label: 'Galaxy S26 Ultra',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/samsung-galaxy-s26-ultra`,
        'https://www.samsung.com/us/smartphones/galaxy-s26-ultra/',
      ],
    },
    {
      path: '/images/devices/galaxy-s26-plus.png',
      kind: 'device',
      label: 'Galaxy S26+',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/samsung-galaxy-s26-plus`,
        'https://www.samsung.com/us/smartphones/galaxy-s26/',
      ],
    },
    {
      path: '/images/devices/galaxy-s26.png',
      kind: 'device',
      label: 'Galaxy S26',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/samsung-galaxy-s26`,
        'https://www.samsung.com/us/smartphones/galaxy-s26/',
      ],
    },

    // ── Samsung Galaxy Z series ───────────────────────────────
    {
      path: '/images/devices/galaxy-z-fold7.png',
      kind: 'device',
      label: 'Galaxy Z Fold7',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/samsung-galaxy-z-fold7`,
        'https://www.samsung.com/us/smartphones/galaxy-z-fold7/',
      ],
    },
    {
      path: '/images/devices/galaxy-z-flip7.png',
      kind: 'device',
      label: 'Galaxy Z Flip7',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/samsung-galaxy-z-flip7`,
        'https://www.samsung.com/us/smartphones/galaxy-z-flip7/',
      ],
    },

    // ── Samsung Galaxy A / XCover ─────────────────────────────
    {
      path: '/images/devices/galaxy-a17-5g.png',
      kind: 'device',
      label: 'Galaxy A17 5G',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/samsung-galaxy-a17-5g`,
        'https://www.samsung.com/us/smartphones/galaxy-a17-5g/',
      ],
    },
    {
      path: '/images/devices/samsung-galaxy-xcover7-pro.png',
      kind: 'device',
      label: 'Samsung Galaxy XCover7 Pro',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/samsung-galaxy-xcover7-pro-5g`,
        'https://www.samsung.com/us/smartphones/galaxy-xcover7-pro/',
      ],
    },

    // ── Google Pixel phones ───────────────────────────────────
    {
      path: '/images/devices/pixel-10-pro-xl.png',
      kind: 'device',
      label: 'Pixel 10 Pro XL',
      fallbackSource: GOOGLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/google-pixel-10-pro-xl`,
        'https://store.google.com/product/pixel_10_pro',
      ],
    },
    {
      path: '/images/devices/pixel-10-pro.png',
      kind: 'device',
      label: 'Pixel 10 Pro',
      fallbackSource: GOOGLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/google-pixel-10-pro`,
        'https://store.google.com/product/pixel_10_pro',
      ],
    },
    {
      path: '/images/devices/pixel-10.png',
      kind: 'device',
      label: 'Pixel 10',
      fallbackSource: GOOGLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/google-pixel-10`,
        'https://store.google.com/product/pixel_10',
      ],
    },
    {
      path: '/images/devices/pixel-10-pro-fold.png',
      kind: 'device',
      label: 'Pixel 10 Pro Fold',
      fallbackSource: GOOGLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/google-pixel-10-pro-fold`,
        'https://store.google.com/product/pixel_10_pro_fold',
      ],
    },
    {
      path: '/images/devices/pixel-10a.png',
      kind: 'device',
      label: 'Pixel 10a',
      fallbackSource: GOOGLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/google-pixel-10a`,
        'https://store.google.com/product/pixel_10a',
      ],
    },

    // ── Motorola / REVVL ──────────────────────────────────────
    {
      path: '/images/devices/motorola-moto-g-2026.png',
      kind: 'device',
      label: 'Motorola moto g 2026',
      fallbackSource: MOTOROLA_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/motorola-moto-g-2026`,
        'https://www.motorola.com/us/smartphones-moto-g-2026',
      ],
    },
    {
      path: '/images/devices/t-mobile-revvl-8-pro.png',
      kind: 'device',
      label: 'T-Mobile REVVL 8 Pro',
      fallbackSource: TMOBILE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/t-mobile-revvl-8-pro`,
      ],
    },
    {
      path: '/images/devices/t-mobile-revvl-8.png',
      kind: 'device',
      label: 'T-Mobile REVVL 8',
      fallbackSource: TMOBILE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/t-mobile-revvl-8`,
      ],
    },

    // ── T-Mobile IoT / Hotspot ────────────────────────────────
    {
      path: '/images/devices/franklin-t10.png',
      kind: 'device',
      label: 'Franklin T10',
      fallbackSource: TMOBILE_FALLBACK,
      sourceUrls: [
        `${TM}/hotspot-iot-connected-devices/franklin-t10-mobile-hotspot`,
        `${TM}/hotspots-iot-connected-devices/brand/franklin`,
      ],
    },
    {
      path: '/images/devices/syncup-drive.png',
      kind: 'device',
      label: 'T-Mobile SyncUP Drive',
      fallbackSource: TMOBILE_FALLBACK,
      sourceUrls: [
        `${TM}/hotspot-iot-connected-devices/t-mobile-syncup-drive`,
        `${TM}/iot-devices/syncup-drive-connected-car`,
      ],
    },
    {
      path: '/images/devices/syncup-tracker-2.png',
      kind: 'device',
      label: 'T-Mobile SyncUP Tracker 2',
      fallbackSource: TMOBILE_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/internet-devices/TCL/TCL-SyncUP-TRACKER-2/Black/TCL-SyncUP-TRACKER-2-Black-frontimage_v2.png',
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/internet-devices/TCL/TCL-SyncUP-TRACKER-2/Black/TCL-SyncUP-TRACKER-2-Black-backimage_v2.png',
      ],
    },
    {
      path: '/images/devices/t-mobile-syncup-kids-watch-2.png',
      kind: 'device',
      label: 'T-Mobile SyncUP Kids Watch 2',
      fallbackSource: TMOBILE_FALLBACK,
      sourceUrls: [
        `${TM}/smart-watch/t-mobile-syncup-kids-watch-2`,
        `${TM}/devices/iot/syncup-kids-smartwatch`,
      ],
    },
    {
      path: '/images/devices/tcl-linkport-ik511.png',
      kind: 'device',
      label: 'TCL LinkPort IK511',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/hotspot-iot-connected-devices/tcl-linkport-ik511`,
        `${TM}/hotspots-iot-connected-devices/brand/tcl`,
      ],
    },

    // ── iPads ─────────────────────────────────────────────────
    {
      path: '/images/devices/ipad-a16.png',
      kind: 'device',
      label: 'iPad (A16)',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/apple-ipad-a16`,
        'https://www.apple.com/shop/buy-ipad/ipad',
      ],
    },
    {
      path: '/images/devices/ipad-mini-a17-pro.png',
      kind: 'device',
      label: 'iPad mini (A17 Pro)',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/apple-ipad-mini-a17-pro`,
        'https://www.apple.com/shop/buy-ipad/ipad-mini',
      ],
    },
    {
      path: '/images/devices/ipad-air-11-m4.png',
      kind: 'device',
      label: 'iPad Air 11" (M4)',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/apple-ipad-air-11-m4`,
        'https://www.apple.com/shop/buy-ipad/ipad-air',
      ],
    },
    {
      path: '/images/devices/ipad-air-13-m4.png',
      kind: 'device',
      label: 'iPad Air 13" (M4)',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/apple-ipad-air-13-m4`,
        'https://www.apple.com/shop/buy-ipad/ipad-air',
      ],
    },
    {
      path: '/images/devices/ipad-pro-11-m5.png',
      kind: 'device',
      label: 'iPad Pro 11" (M5)',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/apple-ipad-pro-11-m5`,
        'https://www.apple.com/shop/buy-ipad/ipad-pro',
      ],
    },
    {
      path: '/images/devices/ipad-pro-13-m5.png',
      kind: 'device',
      label: 'iPad Pro 13" (M5)',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/apple-ipad-pro-13-m5`,
        'https://www.apple.com/shop/buy-ipad/ipad-pro',
      ],
    },

    // ── Samsung Tablets ───────────────────────────────────────
    {
      path: '/images/devices/samsung-galaxy-tab-s10-plus-5g.png',
      kind: 'device',
      label: 'Samsung Galaxy Tab S10+ 5G',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/samsung-galaxy-tab-s10-plus-5g`,
        'https://www.samsung.com/us/tablets/galaxy-tab-s10/',
      ],
    },
    {
      path: '/images/devices/samsung-galaxy-tab-s10-fe-5g.png',
      kind: 'device',
      label: 'Samsung Galaxy Tab S10 FE 5G',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/samsung-galaxy-tab-s10-fe-5g`,
        'https://www.samsung.com/us/tablets/galaxy-tab-s10-fe/',
      ],
    },
    {
      path: '/images/devices/samsung-galaxy-tab-a11-plus-5g.png',
      kind: 'device',
      label: 'Samsung Galaxy Tab A11+ 5G',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/samsung-galaxy-tab-a11-plus-5g`,
        'https://www.samsung.com/us/tablets/',
      ],
    },

    // ── Apple Watches ─────────────────────────────────────────
    {
      path: '/images/devices/apple-watch-series-11.png',
      kind: 'device',
      label: 'Apple Watch Series 11',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/apple-watch-series-11`,
        'https://www.apple.com/shop/buy-watch/apple-watch',
      ],
    },
    {
      path: '/images/devices/apple-watch-se-3.png',
      kind: 'device',
      label: 'Apple Watch SE 3',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/apple-watch-se-3rd-gen`,
        `${TM}/cell-phone/apple-watch-se-3`,
        'https://www.apple.com/shop/buy-watch/apple-watch-se',
      ],
    },
    {
      path: '/images/devices/apple-watch-se-2nd-gen.png',
      kind: 'device',
      label: 'Apple Watch SE 2nd Gen',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/apple-watch-se-2nd-gen`,
        'https://www.apple.com/shop/buy-watch/apple-watch-se',
      ],
    },
    {
      path: '/images/devices/apple-watch-ultra-3.png',
      kind: 'device',
      label: 'Apple Watch Ultra 3',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/apple-watch-ultra-3`,
        'https://www.apple.com/shop/buy-watch/apple-watch-ultra',
      ],
    },

    // ── Samsung Galaxy Watches ────────────────────────────────
    {
      path: '/images/devices/samsung-galaxy-watch8-ultra.png',
      kind: 'device',
      label: 'Samsung Galaxy Watch8 Ultra',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/samsung-galaxy-watch8-ultra`,
        'https://www.samsung.com/us/smartphones/galaxy-watch8-ultra/',
      ],
    },
    {
      path: '/images/devices/samsung-galaxy-watch8-classic.png',
      kind: 'device',
      label: 'Samsung Galaxy Watch8 Classic',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/samsung-galaxy-watch8-classic`,
        'https://www.samsung.com/us/smartphones/galaxy-watch8-classic/',
      ],
    },
    {
      path: '/images/devices/samsung-galaxy-watch8.png',
      kind: 'device',
      label: 'Samsung Galaxy Watch8',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone/samsung-galaxy-watch8`,
        'https://www.samsung.com/us/smartphones/galaxy-watch8/',
      ],
    },
    {
      path: '/images/devices/samsung-galaxy-ring.png',
      kind: 'device',
      label: 'Samsung Galaxy Ring',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/samsung-galaxy-ring-titanium-black`,
        `${TM}/accessory/samsung-galaxy-ring-titanium-silver`,
        'https://www.samsung.com/us/smartphones/galaxy-ring/',
      ],
    },

    // ── Google Pixel Watch ────────────────────────────────────
    {
      path: '/images/devices/pixel-watch-4.png',
      kind: 'device',
      label: 'Google Pixel Watch 4',
      fallbackSource: GOOGLE_FALLBACK,
      sourceUrls: [
        `${TM}/smart-watch/google-pixel-watch-4-45mm`,
        'https://store.google.com/product/pixel_watch_4',
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // ACCESSORIES (62)
    // ═══════════════════════════════════════════════════════════

    // ── Apple audio ───────────────────────────────────────────
    {
      path: '/images/accessories/airpods-4.png',
      kind: 'accessory',
      label: 'Apple AirPods 4',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/apple-airpods-4`,
        'https://www.apple.com/shop/buy-airpods/airpods-4',
      ],
    },
    {
      path: '/images/accessories/airpods-pro-2.png',
      kind: 'accessory',
      label: 'Apple AirPods Pro 2',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/195950543698/195950543698-frontimage.png',
        `${TM}/accessory/apple-airpods-pro-2`,
      ],
    },
    {
      path: '/images/accessories/airpods-pro-3.png',
      kind: 'accessory',
      label: 'Apple AirPods Pro 3',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/apple-airpods-pro-3`,
        'https://www.apple.com/shop/buy-airpods/airpods-pro',
      ],
    },

    // ── Apple charging ────────────────────────────────────────
    {
      path: '/images/accessories/apple-magsafe-charger-2m.png',
      kind: 'accessory',
      label: 'Apple MagSafe Charger 2m',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/195949590634/195949590634-frontimage.png',
        `${TM}/accessory/apple-magsafe-charger-2-m`,
      ],
    },
    {
      path: '/images/accessories/magsafe-charger-apple.png',
      kind: 'accessory',
      label: 'Apple MagSafe Charger',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/195950637014/195950637014-frontimage.png',
        `${TM}/accessory/apple-magsafe-charger-2-m`,
      ],
    },
    {
      path: '/images/accessories/magsafe-qi2-wireless-charger.png',
      kind: 'accessory',
      label: 'MagSafe / Qi2 Wireless Charger',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/745883943166/745883943166-frontimage.png',
        `${TM}/accessory/belkin-boost-charge-pro-magsafe-2-in-1-magnetic-wireless-charger`,
      ],
    },

    // ── Apple Pencil / S Pen ──────────────────────────────────
    {
      path: '/images/accessories/apple-pencil-s-pen.png',
      kind: 'accessory',
      label: 'Apple Pencil / S Pen',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/195949133626/195949133626-frontimage.png',
        `${TM}/accessory/apple-pencil-pro`,
      ],
    },

    // ── Backbone gaming ───────────────────────────────────────
    {
      path: '/images/accessories/backbone-gaming-controller.png',
      kind: 'accessory',
      label: 'Backbone Gaming Controller',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/backbone-one-controller-usb-c-port`,
        `${TM}/accessory/backbone-one-controller-usb-c`,
      ],
    },
    {
      path: '/images/accessories/backbone-one-controller.png',
      kind: 'accessory',
      label: 'Backbone One Controller',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/backbone-one-controller-usb-c-port`,
        `${TM}/accessory/backbone-one-controller-usb-c`,
      ],
    },

    // ── Beats ─────────────────────────────────────────────────
    {
      path: '/images/accessories/beats-solo-4.png',
      kind: 'accessory',
      label: 'Beats Solo 4',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/beats-solo-4-headphones`,
        'https://www.beatsbydre.com/headphones/over-ear/solo4',
      ],
    },

    // ── Belkin ────────────────────────────────────────────────
    {
      path: '/images/accessories/belkin-magsafe-car-mount.png',
      kind: 'accessory',
      label: 'Belkin MagSafe Car Mount',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/belkin-75w-car-charger-with-retractable-cable`,
        `${TM}/accessory/belkin-67w-adapter-with-retractable-cable`,
        `${TM}/accessory/belkin-42w-dual-car-charger-with-usb-c-to-usb-c-cable-1m`,
      ],
    },
    {
      path: '/images/accessories/belkin-qi2-charger.png',
      kind: 'accessory',
      label: 'Belkin Qi2 Charger',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/745883943166/745883943166-frontimage.png',
        `${TM}/accessory/belkin-boost-charge-pro-magsafe-2-in-1-magnetic-wireless-charger`,
      ],
    },

    // ── Cases (generic / multi-brand) ─────────────────────────
    {
      path: '/images/accessories/camera-lens-protector.png',
      kind: 'accessory',
      label: 'Camera Lens Protector',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/840390356994/840390356994-frontimage.png',
        `${TM}/accessory/zagg-glass-elite-camera-protector-for-apple-iphone-16-pro-16-pro-max`,
      ],
    },
    {
      path: '/images/accessories/car-mount-car-charger.png',
      kind: 'accessory',
      label: 'Car Mount + Car Charger',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/belkin-75w-car-charger-with-retractable-cable`,
        `${TM}/accessory/belkin-42w-dual-car-charger-with-usb-c-to-usb-c-cable-1m`,
      ],
    },
    {
      path: '/images/accessories/case-mate-tech21-case.png',
      kind: 'accessory',
      label: 'Case-Mate / Tech21 Case',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/840459607258/840459607258-frontimage.png',
        `${TM}/accessory/tech21-evoclear-case-with-magsafe-for-apple-iphone-17-pro`,
      ],
    },
    {
      path: '/images/accessories/case.png',
      kind: 'accessory',
      label: 'Protective Case',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/840304750016/840304750016-frontimage.png',
        `${TM}/accessory/otterbox-commuter-lite-series-for-samsung-galaxy-a16-5g`,
      ],
    },
    {
      path: '/images/accessories/otterbox-case-mate-case.png',
      kind: 'accessory',
      label: 'OtterBox / Case-Mate Case',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/840304752003/840304752003-frontimage.png',
        `${TM}/accessory/otterbox-defender-pro-series-for-samsung-galaxy-s25-ultra`,
      ],
    },
    {
      path: '/images/accessories/protective-case.png',
      kind: 'accessory',
      label: 'Protective Case',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/otterbox-commuter-lite-series-for-samsung-galaxy-a16-5g`,
        `${TM}/accessory/goto-pro-case-for-samsung-galaxy-a16-5g`,
      ],
    },
    {
      path: '/images/accessories/protection-360.png',
      kind: 'accessory',
      label: '360 Protection Bundle',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/otterbox-defender-pro-series-for-samsung-galaxy-s25-ultra`,
        `${TM}/accessory/zagg-glass-elite-privacy-xtr-screen-protector-for-iphone-17-pro`,
      ],
    },

    // ── Samsung earbuds ───────────────────────────────────────
    {
      path: '/images/accessories/galaxy-buds4.png',
      kind: 'accessory',
      label: 'Samsung Galaxy Buds4',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/samsung-galaxy-buds4`,
        'https://www.samsung.com/us/mobile-phones-accessories/galaxy-buds4/',
      ],
    },
    {
      path: '/images/accessories/galaxy-buds4-pro.png',
      kind: 'accessory',
      label: 'Samsung Galaxy Buds4 Pro',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/samsung-galaxy-buds4-pro`,
        'https://www.samsung.com/us/mobile-phones-accessories/galaxy-buds4-pro/',
      ],
    },

    // ── GoTo ──────────────────────────────────────────────────
    {
      path: '/images/accessories/goto-flex-case-galaxy-a16.png',
      kind: 'accessory',
      label: 'GoTo Flex Case Galaxy A16',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/goto-flex-case-for-samsung-galaxy-a16-5g`,
        `${TM}/accessory/goto-clear-case-for-samsung-galaxy-a16-5g`,
      ],
    },

    // ── iOttie ────────────────────────────────────────────────
    {
      path: '/images/accessories/iottie-qi2-mini-wireless-charging-car-mount.png',
      kind: 'accessory',
      label: 'iOttie Qi2 Mini Wireless Car Mount',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/belkin-75w-car-charger-with-retractable-cable`,
        `${TM}/accessory/belkin-42w-dual-car-charger-with-usb-c-to-usb-c-cable-1m`,
      ],
    },

    // ── JBL ───────────────────────────────────────────────────
    {
      path: '/images/accessories/jbl-flip-6.png',
      kind: 'accessory',
      label: 'JBL Flip 6',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/610214687500/610214687500-frontimage.png',
        `${TM}/accessory/jbl-flip-7`,
      ],
    },

    // ── Mophie ────────────────────────────────────────────────
    {
      path: '/images/accessories/mophie-15w-wireless-charging-pad.png',
      kind: 'accessory',
      label: 'Mophie 15W Wireless Charging Pad',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/mophie-15w-wireless-charging-pad`,
        'https://www.mophie.com/products/wireless-charging-pads',
      ],
    },
    {
      path: '/images/accessories/mophie-magsafe-battery-pack.png',
      kind: 'accessory',
      label: 'Mophie MagSafe Battery Pack',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/mophie-magnetic-charger`,
        `${TM}/accessory/mophie-15w-wireless-charging-pad`,
      ],
    },

    // ── Google Pixel Buds ─────────────────────────────────────
    {
      path: '/images/accessories/pixel-buds-pro-2.png',
      kind: 'accessory',
      label: 'Google Pixel Buds Pro 2',
      fallbackSource: GOOGLE_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/google-pixel-buds-pro2`,
        'https://store.google.com/product/pixel_buds_pro',
      ],
    },

    // ── PopSocket ─────────────────────────────────────────────
    {
      path: '/images/accessories/popsocket-magsafe-grip.png',
      kind: 'accessory',
      label: 'PopSocket MagSafe Grip',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/SUPM54557/SUPM54557-frontimage.png',
        `${TM}/accessory/popsockets-popgrip-for-magsafe`,
      ],
    },
    {
      path: '/images/accessories/popsockets-popgrip-for-magsafe.png',
      kind: 'accessory',
      label: 'PopSockets PopGrip for MagSafe',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/840473353339/840473353339-frontimage.png',
        `${TM}/accessory/popsockets-popgrip-for-magsafe`,
      ],
    },

    // ── Generic ───────────────────────────────────────────────
    {
      path: '/images/accessories/portable-battery-pack.png',
      kind: 'accessory',
      label: 'Portable Battery Pack',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/mophie-15w-wireless-charging-pad`,
        `${TM}/accessory/samsung-wireless-charger-portable-battery-pack`,
      ],
    },
    {
      path: '/images/accessories/premium-wireless-audio.png',
      kind: 'accessory',
      label: 'Premium Wireless Audio',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/beats-solo-4-headphones`,
        `${TM}/accessory/jbl-flip-7`,
      ],
    },
    {
      path: '/images/accessories/extra-watch-band.png',
      kind: 'accessory',
      label: 'Extra Watch Band',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/198957262029/198957262029-frontimage.png',
        `${TM}/accessory/samsung-wireless-charger-portable-battery-pack`,
      ],
    },
    {
      path: '/images/accessories/fast-charger-plus-cable.png',
      kind: 'accessory',
      label: 'Fast Charger + Cable Bundle',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/samsung-45w-power-adapter`,
        `${TM}/accessory/samsung-usb-c-to-usb-c-cable-5-amp-1-8m-5-9ft`,
      ],
    },
    {
      path: '/images/accessories/screen-protector.png',
      kind: 'accessory',
      label: 'Screen Protector',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/zagg-glass-elite-privacy-xtr-screen-protector-for-iphone-17`,
        `${TM}/accessory/zagg-xtr5-screen-protector-for-apple-iphone-17-16-pro`,
      ],
    },
    {
      path: '/images/accessories/watch-screen-protector.png',
      kind: 'accessory',
      label: 'Watch Screen Protector',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/zagg-glass-elite-privacy-xtr-screen-protector-for-iphone-17`,
        `${TM}/accessory/zagg-glass-elite-privacy-xtr-screen-protector-for-iphone-17-pro`,
      ],
    },
    {
      path: '/images/accessories/wireless-charger-watch.png',
      kind: 'accessory',
      label: 'Wireless Charger for Watch',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/samsung-galaxy-watch-cable`,
        `${TM}/accessory/belkin-portable-usb-c-apple-watch-charger`,
      ],
    },
    {
      path: '/images/accessories/wireless-earbuds.png',
      kind: 'accessory',
      label: 'Wireless Earbuds',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/google-pixel-buds-pro2`,
        `${TM}/accessory/samsung-galaxy-buds4`,
      ],
    },
    {
      path: '/images/accessories/tablet-keyboard-case.png',
      kind: 'accessory',
      label: 'Tablet Keyboard Case',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/840390370884/840390370884-frontimage.png',
        `${TM}/accessory/zagg-rugged-messenger-keyboard-case-for-ipad`,
      ],
    },
    {
      path: '/images/accessories/tablet-screen-protector.png',
      kind: 'accessory',
      label: 'Tablet Screen Protector',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/840390356895/840390356895-frontimage.png',
        `${TM}/accessory/zagg-glass-elite-privacy-xtr-screen-protector-for-iphone-17`,
      ],
    },

    // ── Ray-Ban Meta ──────────────────────────────────────────
    {
      path: '/images/accessories/ray-ban-meta-smart-glasses.png',
      kind: 'accessory',
      label: 'Ray-Ban Meta Smart Glasses',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/610214688712/610214688712-frontimage.png',
        `${TM}/accessory/ray-ban-meta-smart-glasses-wayfarer-polarized-brown-lens`,
      ],
    },
    {
      path: '/images/accessories/ray-ban-meta-wayfarer-transitions.png',
      kind: 'accessory',
      label: 'Ray-Ban Meta Wayfarer Transitions',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/610214688743/610214688743-frontimage.png',
        `${TM}/accessory/ray-ban-meta-glasses-wayfarer-transitions-green-lens`,
      ],
    },

    // ── Samsung power & cables ────────────────────────────────
    {
      path: '/images/accessories/samsung-25w-power-adapter.png',
      kind: 'accessory',
      label: 'Samsung 25W Power Adapter',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/samsung-25w-power-adapter`,
        'https://www.samsung.com/us/mobile-phones-accessories/chargers/',
      ],
    },
    {
      path: '/images/accessories/samsung-45w-power-adapter.png',
      kind: 'accessory',
      label: 'Samsung 45W Power Adapter',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/samsung-45w-power-adapter`,
        'https://www.samsung.com/us/mobile-phones-accessories/chargers/',
      ],
    },
    {
      path: '/images/accessories/samsung-usb-c-cable-1m.png',
      kind: 'accessory',
      label: 'Samsung USB-C Cable 1m',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/samsung-usb-c-to-usb-c-cable-3-amp-1m-3-3ft`,
        'https://www.samsung.com/us/mobile-phones-accessories/cables/',
      ],
    },
    {
      path: '/images/accessories/samsung-usb-c-cable-1-8m.png',
      kind: 'accessory',
      label: 'Samsung USB-C Cable 1.8m',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/samsung-usb-c-to-usb-c-cable-5-amp-1-8m-5-9ft`,
        'https://www.samsung.com/us/mobile-phones-accessories/cables/',
      ],
    },
    {
      path: '/images/accessories/samsung-wireless-charger-duo.png',
      kind: 'accessory',
      label: 'Samsung Wireless Charger Duo',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/198957262029/198957262029-frontimage.png',
        `${TM}/accessory/samsung-wireless-charger-portable-battery-pack`,
      ],
    },
    {
      path: '/images/accessories/samsung-clear-case-otterbox.png',
      kind: 'accessory',
      label: 'Samsung Clear Case / OtterBox',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/840304752003/840304752003-frontimage.png',
        `${TM}/accessory/otterbox-symmetry-series-for-samsung-galaxy-s25-ultra`,
      ],
    },
    {
      path: '/images/accessories/samsung-magnetic-battery.png',
      kind: 'accessory',
      label: 'Samsung Magnetic Battery Pack',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/samsung-wireless-charger-portable-battery-pack`,
        `${TM}/accessory/mophie-magnetic-charger`,
      ],
    },
    {
      path: '/images/accessories/samsung-ultimate-charging-bundle.png',
      kind: 'accessory',
      label: 'Samsung Ultimate Charging Bundle',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/TMOM80693/TMOM80693-frontimage.png',
        `${TM}/accessory/samsung-ultimate-charging-bundle`,
      ],
    },

    // ── Scosche ───────────────────────────────────────────────
    {
      path: '/images/accessories/scosche-car-charger.png',
      kind: 'accessory',
      label: 'Scosche Car Charger',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/belkin-75w-car-charger-with-retractable-cable`,
        `${TM}/accessory/belkin-42w-dual-car-charger-with-usb-c-to-usb-c-cable-1m`,
      ],
    },

    // ── T-Mobile SyncUP (as accessories) ─────────────────────
    {
      path: '/images/accessories/syncup-drive.png',
      kind: 'accessory',
      label: 'T-Mobile SyncUP Drive',
      fallbackSource: TMOBILE_FALLBACK,
      sourceUrls: [
        `${TM}/hotspot-iot-connected-devices/t-mobile-syncup-drive`,
        `${TM}/iot-devices/syncup-drive-connected-car`,
      ],
    },
    {
      path: '/images/accessories/syncup-tracker.png',
      kind: 'accessory',
      label: 'T-Mobile SyncUP Tracker',
      fallbackSource: TMOBILE_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/internet-devices/TCL/TCL-SyncUP-TRACKER-2/Black/TCL-SyncUP-TRACKER-2-Black-frontimage_v2.png',
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/internet-devices/TCL/TCL-SyncUP-TRACKER-2/Black/TCL-SyncUP-TRACKER-2-Black-backimage_v2.png',
      ],
    },

    // ── Tech21 ────────────────────────────────────────────────
    {
      path: '/images/accessories/tech21-evoclear-w-magsafe.png',
      kind: 'accessory',
      label: 'Tech21 EvoClr w/ MagSafe',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/tech21-evoclear-case-with-magsafe-for-apple-iphone-17-pro`,
        `${TM}/accessory/tech21-evoclear-case-with-magsafe-for-apple-iphone-air`,
        'https://www.tech21.com/collections/magsafe-cases',
      ],
    },
    {
      path: '/images/accessories/tech21-evolite-w-magsafe.png',
      kind: 'accessory',
      label: 'Tech21 EvoLite w/ MagSafe',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/tech21-evolite-case-with-magsafe-for-apple-iphone-16`,
        `${TM}/accessory/tech21-evolite-case-with-magsafe-for-apple-iphone-16e-15-14-13`,
        'https://www.tech21.com/collections/magsafe-cases',
      ],
    },

    // ── ZAGG ──────────────────────────────────────────────────
    {
      path: '/images/accessories/zagg-camera-protector-s26-plus.png',
      kind: 'accessory',
      label: 'ZAGG Camera Protector Galaxy S26+',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/840390381040/840390381040-frontimage.png',
        `${TM}/accessory/zagg-glass-elite-camera-protector-for-apple-iphone-16-pro-16-pro-max`,
      ],
    },
    {
      path: '/images/accessories/zagg-camera-protector-s26-ultra.png',
      kind: 'accessory',
      label: 'ZAGG Camera Protector Galaxy S26 Ultra',
      fallbackSource: SAMSUNG_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/840390381057/840390381057-frontimage.png',
        `${TM}/accessory/zagg-glass-elite-camera-protector-for-apple-iphone-16-pro-16-pro-max`,
      ],
    },
    {
      path: '/images/accessories/zagg-crystal-palace-snap-w-kickstand.png',
      kind: 'accessory',
      label: 'ZAGG Crystal Palace Snap w/ Kickstand',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/zagg-crystal-palace-snap-case-with-kickstand-magsafe-for-apple-iphone-16-pro-max`,
        `${TM}/accessory/zagg-crystal-palace-snap-magnetic-case-w-kickstand-for-samsung-galaxy-s25-ultra`,
      ],
    },
    {
      path: '/images/accessories/zagg-glass-elite-privacy-360-iphone.png',
      kind: 'accessory',
      label: 'ZAGG Glass Elite Privacy 360 for iPhone',
      fallbackSource: APPLE_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/zagg-glass-elite-privacy-xtr-screen-protector-for-iphone-17-pro`,
        `${TM}/accessory/zagg-glass-elite-privacy-xtr-screen-protector-for-iphone-17`,
      ],
    },
    {
      path: '/images/accessories/zagg-glass-elite-standard.png',
      kind: 'accessory',
      label: 'ZAGG Glass Elite Standard',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/zagg-xtr5-screen-protector-for-apple-iphone-17-16-pro`,
        `${TM}/accessory/zagg-glass-elite-privacy-xtr-screen-protector-for-iphone-17`,
      ],
    },
    {
      path: '/images/accessories/zagg-keyboard-case.png',
      kind: 'accessory',
      label: 'ZAGG Keyboard Case',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/840390370884/840390370884-frontimage.png',
        `${TM}/accessory/zagg-rugged-messenger-keyboard-case-for-ipad`,
      ],
    },
    {
      path: '/images/accessories/zagg-rainier-snap-w-kickstand.png',
      kind: 'accessory',
      label: 'ZAGG Rainier Snap w/ Kickstand',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        `${TM}/accessory/zagg-rainier-case-with-kickstand-and-magsafe-for-apple-iphone-17-pro-max`,
        `${TM}/accessory/zagg-rainier-case-with-kickstand-and-magsafe-for-apple-iphone-17-pro`,
      ],
    },
    {
      path: '/images/accessories/zagg-screen-protector.png',
      kind: 'accessory',
      label: 'ZAGG Screen Protector',
      fallbackSource: THIRD_PARTY_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/840390356895/840390356895-frontimage.png',
        `${TM}/accessory/zagg-glass-elite-privacy-xtr-screen-protector-for-iphone-17`,
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // LEARN — Plan & HINT imagery (8)
    // ═══════════════════════════════════════════════════════════

    {
      path: '/images/ui/plan-essentials.png',
      kind: 'learn',
      label: 'Plan: Essentials',
      fallbackSource: LEARN_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone-plans`,
        `${TM}/plans`,
      ],
    },
    {
      path: '/images/ui/plan-essentials-saver.png',
      kind: 'learn',
      label: 'Plan: Essentials Saver',
      fallbackSource: LEARN_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone-plans`,
        `${TM}/plans`,
      ],
    },
    {
      path: '/images/ui/plan-experience-more.png',
      kind: 'learn',
      label: 'Plan: Go5G Experience More',
      fallbackSource: LEARN_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone-plans`,
        `${TM}/plans`,
      ],
    },
    {
      path: '/images/ui/plan-experience-beyond.png',
      kind: 'learn',
      label: 'Plan: Go5G Experience Beyond',
      fallbackSource: LEARN_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone-plans`,
        `${TM}/plans`,
      ],
    },
    {
      path: '/images/ui/plan-better-value.png',
      kind: 'learn',
      label: 'Plan: Better Value',
      fallbackSource: LEARN_FALLBACK,
      sourceUrls: [
        `${TM}/cell-phone-plans`,
        `${TM}/plans`,
      ],
    },
    // ═══════════════════════════════════════════════════════════
    // FALLBACK (1)
    // ═══════════════════════════════════════════════════════════

    {
      path: '/images/ui/product-card-fallback.svg',
      kind: 'fallback',
      label: 'Product Card Fallback',
      fallbackSource: LOGO_FALLBACK,
      sourceUrls: [
        'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/TMOM80693/TMOM80693-frontimage.png',
        `${TM}/`,
      ],
    },
  ];
}
