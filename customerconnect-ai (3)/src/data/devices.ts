import { DEVICE_IMAGE_PATHS } from './deviceImagePaths';

export interface Device {
  name: string;
  category: 'iphone' | 'samsung' | 'pixel' | 'other' | 'tablet' | 'watch' | 'hotspot';
  startingPrice: number | string;
  released: string;
  keySpecs: string;
  imageUrl?: string;
  /** Deeper selling points — ecosystem hooks, comparison data, use cases */
  sellingNotes?: string;
  // Note: promos are NOT stored here — they come exclusively from weekly-update.json
  // to prevent stale promo data. Only specs, price, and release info stay here.
}

function withDeviceImage(device: Device): Device {
  const imageUrl = DEVICE_IMAGE_PATHS[device.name];
  return imageUrl ? { ...device, imageUrl } : device;
}

export const PHONES: Device[] = ([
  // iPhone lineup
  {
    name: 'iPhone 17 Pro Max',
    category: 'iphone',
    startingPrice: 1199,
    released: 'Sept 2025',
    keySpecs: '6.9" OLED 120Hz (2868x1320, 460ppi), A19 Pro, 12GB RAM, triple 48MP (W+UW+4x Tele) / 18MP front, 256GB–2TB, 4,823–5,088 mAh, 40W wired + 25W MagSafe, vapour chamber cooling, Ceramic Shield 2',
    sellingNotes: 'Best battery in any iPhone ever (39hr video). 2TB storage option is new. Vapour chamber keeps it cool during heavy AI tasks. A19 Pro runs local AI agents on-device for privacy. "Liquid Glass" back feels premium. Ceramic Shield 2 is 3x more scratch-resistant. Visual Intelligence reads what\'s on screen. Ecosystem anchor — pairs instantly with AirPods, Apple Watch, iPad.',
  },
  {
    name: 'iPhone 17 Pro',
    category: 'iphone',
    startingPrice: 1099,
    released: 'Sept 2025',
    keySpecs: '6.3" OLED 120Hz (460ppi), A19 Pro, 12GB RAM, triple 48MP (W+UW+4x Tele) / 18MP front, 256GB–1TB, 40W wired + 25W MagSafe, vapour chamber cooling, Ceramic Shield 2',
    sellingNotes: 'Same A19 Pro power as the Max in a smaller form factor. 12GB RAM for on-device AI. Siri On-Screen Awareness — reads your screen and acts on it (e.g. "add this flight to my calendar" from a text thread). Great for people who want flagship power but prefer a one-hand phone.',
  },
  {
    name: 'iPhone Air',
    category: 'iphone',
    startingPrice: 999,
    released: 'Sept 2025',
    keySpecs: '6.5", A19 Pro, thinnest iPhone ever, Apple C1X modem',
    sellingNotes: 'The "MacBook Air" of iPhones — thin, light, premium. Apple C1X is their first custom modem chip. Great positioning for people who want something different from the Pro but still flagship quality.',
  },
  {
    name: 'iPhone 17',
    category: 'iphone',
    startingPrice: 799,
    released: 'Sept 2025',
    keySpecs: '6.3" OLED 120Hz (2622x1206, 460ppi), A19, 8GB RAM, dual 48MP (W+UW) / 18MP front, 256GB/512GB, 3,692 mAh, 30–40W wired + 25W MagSafe',
    sellingNotes: '256GB base is a big deal — no more 128GB. 8GB RAM still runs on-device AI. Solid mid-tier pick for people who want the latest without paying Pro prices. $799–$1,029.',
  },
  {
    name: 'iPhone 17e',
    category: 'iphone',
    startingPrice: 599.99,
    released: 'March 2026',
    keySpecs: '6.3" OLED 120Hz (460ppi), A19, 8GB RAM, dual 48MP / 18MP front, 256GB/512GB, 30–40W wired + 25W MagSafe, MagSafe/Qi2',
    sellingNotes: 'The value play — brings A19 AI power, MagSafe, and 256GB storage to $599. Same local AI features as the Pro models. Great for "Value Explorer" customers who want 2026 tech at an accessible price.',
  },
  { name: 'iPhone 16', category: 'iphone', startingPrice: 799, released: 'Sept 2024', keySpecs: 'Still sold; 128GB base' },
  // Samsung Galaxy lineup
  {
    name: 'Galaxy S26 Ultra',
    category: 'samsung',
    startingPrice: 1299.99,
    released: 'March 2026',
    keySpecs: '6.9" QHD+ AMOLED (3120x1440, 500ppi, 120Hz), Snapdragon 8 Elite Gen 5, 12/16GB RAM, 200MP Wide + 50MP UW + 50MP 5x Tele + 10MP 3x Tele / 12MP front, 256GB/512GB/1TB, 5,000 mAh, 60W wired + 25W wireless, S Pen, Flex Magic Privacy Display, 7.9mm thin',
    sellingNotes: 'Flex Magic Privacy Display narrows viewing angle so screen looks black to people next to you — huge for commuters/business users on trains or planes. Thinnest Ultra ever at 7.9mm with rounded corners (finally). 200MP camera with 100x Space Zoom. 60W charging (vs Apple\'s 40W). On-device AI via "Now Nudge" predicts your needs proactively. One UI 8.5 on Android 16 with 7 years of updates. $1,299.99–$1,799.99.',
  },
  {
    name: 'Galaxy S26+',
    category: 'samsung',
    startingPrice: 1099.99,
    released: 'March 2026',
    keySpecs: '6.7" QHD+ AMOLED (516ppi, 120Hz), Snapdragon 8 Elite Gen 5, 12GB RAM, 50MP Wide + 12MP UW + 10MP 3x Tele / 12MP front, 256GB+, 4,900 mAh, 45W wired + 20W wireless',
    sellingNotes: 'Same Snapdragon 8 Elite Gen 5 as the Ultra. Big screen without the S Pen premium. 45W charging. Now Nudge AI and on-device processing built in. Good middle ground.',
  },
  {
    name: 'Galaxy S26',
    category: 'samsung',
    startingPrice: 899.99,
    released: 'March 2026',
    keySpecs: '6.3" FHD+ AMOLED (2340x1080, 411ppi, 120Hz), Snapdragon 8 Elite Gen 5, 12GB RAM, 50MP Wide + 12MP UW + 10MP 3x Tele / 12MP front, 256GB/512GB, 4,300 mAh, 25W wired + 15W wireless',
    sellingNotes: '256GB minimum (no more 128GB). Same processor as Ultra — on-device AI is the same. Most affordable way into the S26 ecosystem. Compare to iPhone 17 at $799 — similar positioning.',
  },
  { name: 'Galaxy Z Fold7', category: 'samsung', startingPrice: 1799.99, released: '2025', keySpecs: 'Slimmer, virtually invisible crease, no S Pen' },
  { name: 'Galaxy Z Flip7', category: 'samsung', startingPrice: 1099.99, released: '2025', keySpecs: 'Slimmest Flip ever (6.35mm), edge-to-edge external display' },
  { name: 'Galaxy A17 5G', category: 'samsung', startingPrice: 229.99, released: '2026', keySpecs: 'Budget 5G phone' },
  // Google Pixel lineup
  { name: 'Pixel 10 Pro XL', category: 'pixel', startingPrice: 1099, released: 'Aug 2025', keySpecs: 'Largest Pixel battery (5,200mAh), Tensor G5' },
  { name: 'Pixel 10 Pro', category: 'pixel', startingPrice: 999, released: 'Aug 2025', keySpecs: 'Tensor G5, 100x zoom' },
  { name: 'Pixel 10', category: 'pixel', startingPrice: 799, released: 'Aug 2025', keySpecs: 'Tensor G5, 4,970mAh' },
  { name: 'Pixel 10 Pro Fold', category: 'pixel', startingPrice: 1799, released: 'Oct 2025', keySpecs: 'Foldable, dual-cell 5,015mAh, Tensor G5' },
  { name: 'Pixel 10a', category: 'pixel', startingPrice: 499.99, released: 'March 2026', keySpecs: 'Tensor G5, 128GB, Gorilla Glass 7i, 30+ hr battery' },
  // Other / Niche
  { name: 'Samsung Galaxy XCover7 Pro', category: 'other', startingPrice: 499.99, released: '2025', keySpecs: 'MIL-STD-810H rugged, IP68, removable battery, programmable key. Great backup phone for B2G1 deals — basically a satellite phone on Beyond.' },
  { name: 'Motorola moto g 2026', category: 'other', startingPrice: 189.99, released: '2026', keySpecs: 'Budget device, solid for first-time smartphone users or kids' },
  { name: 'T-Mobile REVVL 8 Pro', category: 'other', startingPrice: 249.99, released: '2025', keySpecs: '6.7" display. T-Mobile own-brand. Solid budget option — great for B2G1 third line, backup phones, or price-sensitive customers' },
  { name: 'T-Mobile REVVL 8', category: 'other', startingPrice: 199.99, released: '2025', keySpecs: 'T-Mobile own-brand. Lowest cost option — kids phones, basic line adds, or backup devices' },
] satisfies Device[]).map(withDeviceImage);

export const TABLETS: Device[] = ([
  { name: 'iPad (A16)', category: 'tablet', startingPrice: 499.99, released: '2024', keySpecs: '10.9", A16 chip, USB-C, 128GB. Solid entry iPad for media, school, and light productivity.' },
  { name: 'iPad mini (A17 Pro)', category: 'tablet', startingPrice: 499, released: '2024', keySpecs: '8.3", A17 Pro chip. Most portable iPad — great for reading, notes, and on-the-go productivity.' },
  { name: 'iPad Air 11" (M4)', category: 'tablet', startingPrice: 599, released: 'March 2026', keySpecs: '11", M4 chip, Apple Pencil Pro support. Best balance of power and price.' },
  { name: 'iPad Air 13" (M4)', category: 'tablet', startingPrice: 799, released: 'March 2026', keySpecs: '13", M4 chip, Apple Pencil Pro support. Bigger screen for productivity and creative work.' },
  { name: 'iPad Pro 11" (M5)', category: 'tablet', startingPrice: 999, released: '2025', keySpecs: '11" OLED, M5 chip, ProMotion 120Hz, Thunderbolt. Laptop replacement for creatives and pros.' },
  { name: 'iPad Pro 13" (M5)', category: 'tablet', startingPrice: 1299, released: '2025', keySpecs: '13" OLED, M5 chip, ProMotion 120Hz, Thunderbolt. Ultimate creative canvas.' },
  { name: 'Samsung Galaxy Tab S10+ 5G', category: 'tablet', startingPrice: 999.99, released: '2025', keySpecs: '5G, Samsung DeX desktop mode multitasking. Pairs with Galaxy ecosystem.' },
  { name: 'Samsung Galaxy Tab S10 FE 5G', category: 'tablet', startingPrice: 599.99, released: '2025', keySpecs: '5G tablet with S Pen included. Samsung DeX desktop mode. Pairs with Galaxy ecosystem.' },
  { name: 'Samsung Galaxy Tab A11+ 5G', category: 'tablet', startingPrice: 289.99, released: '2026', keySpecs: 'Budget 5G tablet. Great for kids in the car, streaming, or as a second screen. FREE with S26 purchase + tablet line.' },
] satisfies Device[]).map(withDeviceImage);

export const WATCHES: Device[] = ([
  {
    name: 'Apple Watch Series 11',
    category: 'watch',
    startingPrice: 399,
    released: '2025',
    keySpecs: 'Latest Apple Watch flagship, Apple Pay, haptic maps, health sensors, fall detection',
    sellingNotes: 'Acts as a mini travel assistant — Apple Pay for contactless transit, haptic directions on your wrist so you never look at your phone while navigating. Ecosystem lock-in: automatic handoff with iPhone, AirPods seamless switching.',
  },
  {
    name: 'Apple Watch SE 3',
    category: 'watch',
    startingPrice: 299.99,
    released: '2025',
    keySpecs: '40mm/44mm, sleep score, activity rings, crash detection, Apple Pay',
    sellingNotes: 'Best-value Apple Watch at $299.99 (40mm). Great for kids and teens — cellular means they can call/text without a phone.',
  },
  {
    name: 'Apple Watch SE 2nd Gen',
    category: 'watch',
    startingPrice: 249,
    released: '2024',
    keySpecs: '40mm/44mm. Previous-gen SE still available at lower price.',
  },
  {
    name: 'Apple Watch Ultra 3',
    category: 'watch',
    startingPrice: 799,
    released: '2025',
    keySpecs: 'Advanced sports metrics, rugged titanium build, dual-frequency GPS, 36hr battery',
    sellingNotes: 'Built for extreme sports, diving, hiking. Action button for quick access. Premium positioning — sells itself to outdoor enthusiasts.',
  },
  {
    name: 'Samsung Galaxy Watch8 Ultra',
    category: 'watch',
    startingPrice: 649.99,
    released: '2025',
    keySpecs: '47mm, Wear OS, BioActive Sensor (body composition, heart rate, SpO2)',
    sellingNotes: 'Samsung\'s answer to the Apple Watch Ultra. BioActive Sensor does body composition analysis. Premium titanium build for outdoor/adventure users.',
  },
  {
    name: 'Samsung Galaxy Watch8 Classic',
    category: 'watch',
    startingPrice: 349.99,
    released: '2025',
    keySpecs: '46mm, rotating bezel, ECG, Wear OS',
    sellingNotes: 'Physical rotating bezel is back — classic look that appeals to traditional watch wearers. ECG and heart monitoring built in.',
  },
  {
    name: 'Samsung Galaxy Watch8',
    category: 'watch',
    startingPrice: 399.99,
    released: '2025',
    keySpecs: '40mm ($399.99) / 44mm ($429.99), sleep & stress tracking, Wear OS, GPS',
    sellingNotes: 'FREE with new wearable line (36 monthly credits). Focuses on durability and GPS for active users. Pairs with Galaxy Buds for workout audio. Galaxy ecosystem — Now Nudge AI integration.',
  },
  {
    name: 'Samsung Galaxy Ring',
    category: 'watch',
    startingPrice: 399.99,
    released: '2025',
    keySpecs: 'Health & wellness tracking ring. No screen, no charging dock needed daily. Sleep, heart rate, activity.',
    sellingNotes: 'For customers who don\'t want a watch but want health tracking. Discreet, fashionable. Pairs with Galaxy phone for full health dashboard.',
  },
  {
    name: 'Pixel Watch 4',
    category: 'watch',
    startingPrice: 449.99,
    released: '2025',
    keySpecs: '41mm ($449.99) / 45mm, Fitbit health integration, Gemini AI, Google Assistant',
    sellingNotes: 'Fitbit health metrics built in. Gemini AI on-wrist. Best watch for Google ecosystem users.',
  },
  {
    name: 'T-Mobile SyncUP KIDS Watch 2',
    category: 'watch',
    startingPrice: 174,
    released: '2025',
    keySpecs: 'Real-time GPS, dual cameras, Bluetooth, LED flashlight. For kids who aren\'t ready for a phone.',
    sellingNotes: 'Parents can track location in real time, set geofences, and kids can call/text approved contacts. Dual cameras let kids share photos. LED flashlight is a fun bonus. $174 + wearable line.',
  },
] satisfies Device[]).map(withDeviceImage);

export const HOTSPOTS: Device[] = ([
  { name: 'TCL LINKPORT IK511', category: 'hotspot', startingPrice: 96, released: 'Oct 2025', keySpecs: '5G RedCap, max 220Mbps down / 120Mbps up, OpenWrt OS, 256MB RAM, 1.01 oz, USB-C. Connects a single device (no Wi-Fi sharing). Bus-powered.' },
  { name: 'Franklin T10', category: 'hotspot', startingPrice: 'Available', released: '2025', keySpecs: '4G LTE, Wi-Fi 5, connects up to 15 devices simultaneously. Traditional mobile hotspot.' },
  { name: 'SyncUP DRIVE', category: 'hotspot', startingPrice: 108, released: '2025', keySpecs: 'OBD-II plug-in. Vehicle health diagnostics, 5G Wi-Fi hotspot (up to 5 devices), real-time GPS, trip history, speed/boundary alerts for teen drivers. FREE w/ 24 bill credits.' },
  { name: 'SyncUP TRACKER 2', category: 'hotspot', startingPrice: 54, released: '2025', keySpecs: 'LTE/GPS tracking, IP67 weather-resistant, 890 mAh battery (up to 7 days). Real-time location via cellular — works anywhere, not just near phones like AirTag. FREE w/ 24 bill credits.' },
] satisfies Device[]).map(withDeviceImage);

/** SyncUP tracker comparison data from Google NotebookLM research */
export const TRACKER_COMPARISON = [
  { name: 'SyncUP Tracker 2', connection: 'LTE / GPS', useCase: 'Real-time monitoring of pets or luggage across the country. Works from thousands of miles away — no nearby phone needed.' },
  { name: 'Apple AirTag', connection: 'Bluetooth / Precision Finding', useCase: 'Finding keys or wallets within a house or nearby. Requires a nearby iPhone to relay location.' },
  { name: 'Chipolo Card', connection: 'Bluetooth', useCase: 'Slim credit-card sized tracker for passports and wallets.' },
];

/** Ecosystem selling points — why staying in one brand matters */
export const ECOSYSTEM_HOOKS = {
  apple: [
    'Siri On-Screen Awareness: Siri can "read" your screen — "add this flight to my calendar" from a text thread',
    'Automatic Device Handoff: Move audio from iPad to iPhone instantly, auto-switch AirPods between devices',
    'AirPods Pro 3 + iPhone: H2 Chip enables seamless automatic switching — only works within Apple ecosystem',
    'Apple Pay on Watch: Contactless transit and payments from your wrist',
    'Haptic directions: Apple Watch taps your wrist for turn-by-turn — no screen needed',
    'AirPods Pro 3 Hearing Aid: Advanced hearing aid/hearing protection built natively into AirPods Pro 3 — no separate device needed',
  ],
  samsung: [
    'Now Nudge AI: Proactively predicts your needs — browsed a restaurant Wednesday, suggests booking Friday. Cross-app delegation via Google Gemini, Bixby, or Perplexity.',
    'Flex Magic Privacy Display (S26 Ultra): Hardware-based — limits horizontal viewing angles to block onlookers. Huge for commuters on trains/planes.',
    'Samsung Seamless Codec (SSC UHQ): Proprietary 24-bit/96kHz high-res audio — only unlocked when Galaxy phone pairs with Galaxy Buds. Not available on iPhone.',
    'Samsung DeX: Plug Galaxy Tab into a monitor for desktop mode — productivity without a laptop',
    'Galaxy ecosystem: Watch, Buds, Tab, Ring, and Phone all share health data, notifications, and settings automatically',
    '60W wired charging on S26 Ultra — significantly faster than Apple\'s 40W max',
  ],
};

export const CONNECTED_DEVICE_INFO = {
  plans: {
    magentaDrive: { price: 20, desc: 'Unlimited in-car Wi-Fi for up to 8 simultaneous connections' },
    tabletLine: { price: '5–20', desc: '$5/mo on Experience Beyond or Better Value; $20/mo on other plans (with voice line discount)' },
    wearableLine: { price: '5–15', desc: '$5/mo on Experience Beyond or Better Value; $10–$15/mo on other plans (with AutoPay)' },
    syncUpTracker: { price: 5, desc: '$5/month with AutoPay' },
    homeInternet: { desc: 'Up to $300 virtual prepaid card rebate + "Month On Us" promo' },
  },
  installmentTerms: 'Watches and tablets on 36-month EIP; phones remain 24-month',
  deviceConnectionCharge: 35,
};

export const SAMSUNG_NOTE = 'Galaxy S26 series does NOT support Qi2/MagSafe. All S26 models run One UI 8.5 on Android 16 with 7 years of updates.';
