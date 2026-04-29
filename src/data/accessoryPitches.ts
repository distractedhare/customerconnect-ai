/** Device-to-accessory mappings with transition scripts for reps */

export interface AccessoryPitch {
  name: string;
  category: 'protection' | 'audio' | 'charging' | 'case' | 'tracker' | 'other';
  price: string;
  imageUrl?: string;
  margin: 'high' | 'medium' | 'low';
  transitionScript: string;
}

export interface DeviceAccessoryMap {
  devicePattern: string; // regex-friendly pattern to match device names
  ecosystem: 'apple' | 'samsung' | 'pixel' | 'any';
  accessories: AccessoryPitch[];
}

export const DEVICE_ACCESSORY_MAP: DeviceAccessoryMap[] = [
  {
    devicePattern: 'iPhone',
    ecosystem: 'apple',
    accessories: [
      { name: 'Protection 360', category: 'protection', price: '$13-18/mo', margin: 'high', transitionScript: '"Before I hand this over — P360 covers everything. Drops, theft, even the screen at $0. Plus AppleCare is included for the first 24 months. Want me to add it?"' },
      { name: 'ZAGG Screen Protector', category: 'protection', price: '$40-55', margin: 'high', transitionScript: '"Let me put a screen protector on before you leave — saves you the headache later. ZAGG is the best and P360 replaces it free if it cracks."' },
      { name: 'MagSafe Charger (Apple)', category: 'charging', price: '$39', margin: 'medium', transitionScript: '"Do you have a MagSafe charger at home? It snaps right on — way faster than regular wireless. Most people grab one for the nightstand."' },
      { name: 'Belkin MagSafe Car Mount', category: 'charging', price: '$35-50', margin: 'medium', transitionScript: '"If you use your phone for maps in the car, this mount is a game-changer. Snaps on magnetically, charges while you drive."' },
      { name: 'AirPods Pro 2', category: 'audio', price: '$249', margin: 'medium', transitionScript: '"If you\'re getting a new iPhone, AirPods Pro 2 pair instantly. Noise canceling, spatial audio — and they work as hearing aids now."' },
      { name: 'Beats Solo 4', category: 'audio', price: '$199', margin: 'medium', transitionScript: '"Need headphones? Beats Solo 4 work great with iPhone — 50 hours battery, and they fold flat for travel."' },
      { name: 'OtterBox / Case-Mate Case', category: 'case', price: '$30-60', margin: 'high', transitionScript: '"Want a case to go with it? OtterBox if you\'re hard on phones, Case-Mate if you want something that looks good."' },
      { name: 'mophie MagSafe Battery Pack', category: 'charging', price: '$50-70', margin: 'medium', transitionScript: '"If your battery ever dies on the go, this snaps right on the back. No cables needed."' },
    ],
  },
  {
    devicePattern: 'Galaxy S2[0-9]|Galaxy Z',
    ecosystem: 'samsung',
    accessories: [
      { name: 'Protection 360', category: 'protection', price: '$13-26/mo', margin: 'high', transitionScript: '"P360 is a must on Samsung flagships — covers drops, theft, screen at $0, and you get JUMP! upgrades. Want me to add it?"' },
      { name: 'ZAGG Screen Protector', category: 'protection', price: '$40-55', margin: 'high', transitionScript: '"Let me put a screen protector on right now — it\'ll protect that beautiful display. P360 replaces it free if it cracks."' },
      { name: 'Samsung Wireless Charger Duo', category: 'charging', price: '$50-70', margin: 'medium', transitionScript: '"The Wireless Charger Duo charges your phone AND watch at the same time. Great for the nightstand."' },
      { name: 'Galaxy Buds4 Pro', category: 'audio', price: '$229', margin: 'medium', transitionScript: '"$40 off Galaxy Buds4 Pro when you buy an S26. They auto-switch between your phone and watch."' },
      { name: 'Samsung Clear Case / OtterBox', category: 'case', price: '$30-60', margin: 'high', transitionScript: '"Want a case? Samsung\'s clear case shows off the color, or OtterBox if you need serious protection."' },
      { name: 'SCOSCHE Car Charger', category: 'charging', price: '$25-40', margin: 'medium', transitionScript: '"Do you charge in the car? USB-C fast charger gets you to 50% in about 30 minutes."' },
      { name: 'JBL Flip 6', category: 'audio', price: '$130', margin: 'low', transitionScript: '"If you play music at home or outdoors, the JBL Flip 6 is waterproof and sounds amazing for its size."' },
    ],
  },
  {
    devicePattern: 'Pixel',
    ecosystem: 'pixel',
    accessories: [
      { name: 'Protection 360', category: 'protection', price: '$11-18/mo', margin: 'high', transitionScript: '"P360 covers everything — drops, theft, screen at $0. Pixel screens are great but pricey to replace. Worth adding."' },
      { name: 'ZAGG Screen Protector', category: 'protection', price: '$35-50', margin: 'high', transitionScript: '"Let me get a screen protector on this before you head out. P360 replaces it free anytime."' },
      { name: 'Pixel Buds Pro 2', category: 'audio', price: '$229', margin: 'medium', transitionScript: '"Pixel Buds Pro 2 pair instantly and have Google\'s best noise canceling. Plus they\'re the lightest earbuds on the market."' },
      { name: 'Belkin Qi2 Charger', category: 'charging', price: '$30-45', margin: 'medium', transitionScript: '"Pixel 10 supports Qi2 — this charger snaps on magnetically, 15W fast charging. Way more convenient than a cable."' },
      { name: 'Case-Mate / Tech21 Case', category: 'case', price: '$30-50', margin: 'high', transitionScript: '"Want a case? Tech21 has great drop protection without the bulk."' },
    ],
  },
  {
    devicePattern: 'iPad|Galaxy Tab',
    ecosystem: 'any',
    accessories: [
      { name: 'Protection 360', category: 'protection', price: '$7-15/mo', margin: 'high', transitionScript: '"P360 for tablets is a no-brainer at this price — covers drops, cracks, even theft."' },
      { name: 'ZAGG Keyboard Case', category: 'other', price: '$80-120', margin: 'medium', transitionScript: '"If you\'re using this for work or school, a keyboard case turns it into a mini laptop."' },
      { name: 'Apple Pencil / S Pen', category: 'other', price: '$79-129', margin: 'medium', transitionScript: '"Do you take notes or sketch? The Pencil/S Pen makes the tablet way more useful."' },
    ],
  },
  {
    devicePattern: 'Watch|watch',
    ecosystem: 'any',
    accessories: [
      { name: 'Extra Watch Band', category: 'other', price: '$20-50', margin: 'high', transitionScript: '"Want a second band? A lot of people grab a sport band for workouts and a nicer one for everyday."' },
      { name: 'Wireless Charger (Watch)', category: 'charging', price: '$25-40', margin: 'medium', transitionScript: '"Grab a second charger — one for home, one for travel. That way you never forget it."' },
    ],
  },
];

/** Get accessories for a specific device */
export function getAccessoriesForDevice(deviceName: string): AccessoryPitch[] {
  for (const mapping of DEVICE_ACCESSORY_MAP) {
    const regex = new RegExp(mapping.devicePattern, 'i');
    if (regex.test(deviceName)) {
      return mapping.accessories;
    }
  }
  // Default: P360 + screen protector + case (works for any device)
  return [
    { name: 'Protection 360', category: 'protection', price: '$7-26/mo', margin: 'high', transitionScript: '"P360 covers drops, theft, screen repairs at $0 — it\'s the best protection we offer. Want me to add it?"' },
    { name: 'ZAGG Screen Protector', category: 'protection', price: '$35-55', margin: 'high', transitionScript: '"Let me put a screen protector on before you go. P360 replaces it free if it cracks."' },
    { name: 'Case', category: 'case', price: '$30-60', margin: 'high', transitionScript: '"Want a case to protect it? We\'ve got slim and rugged options."' },
  ];
}

/** Priority order for pitching accessories (highest commission first) */
export const PITCH_ORDER = ['protection', 'case', 'audio', 'charging', 'tracker', 'other'] as const;

/** Sort accessories by pitch priority (highest margin/commission first) */
export function sortByPitchPriority(accessories: AccessoryPitch[]): AccessoryPitch[] {
  return [...accessories].sort((a, b) => {
    const aIdx = PITCH_ORDER.indexOf(a.category);
    const bIdx = PITCH_ORDER.indexOf(b.category);
    if (aIdx !== bIdx) return aIdx - bIdx;
    const marginOrder = { high: 0, medium: 1, low: 2 };
    return marginOrder[a.margin] - marginOrder[b.margin];
  });
}
