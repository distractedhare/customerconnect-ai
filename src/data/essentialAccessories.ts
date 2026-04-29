// Essential accessories pricing data — shared between Live (InstantPlays) and Learn (AccessoriesReference)

export interface EssentialItem {
  name: string;
  price: string;
  bundle: string | null;
  originalPrice?: string;
  imageUrl?: string;
  /** What makes this product good — specs, differentiators, review highlights */
  why: string;
  /** One-liner the rep can say out loud to the customer */
  pitch: string;
  /** Which phone ecosystems this works with */
  worksWith?: ('iPhone' | 'Samsung' | 'Pixel' | 'All')[];
  /** Estimated rep bonus payout per unit sold */
  bonus?: string;
  /** Outcome bucket(s): Protect it, Power it, etc. */
  outcomes?: string[];
}

export interface EssentialCategory {
  category: string;
  id: string; // stable key for expand/collapse state
  items: EssentialItem[];
}

export interface BigAddItem {
  name: string;
  price: string;
  note: string;
  imageUrl?: string;
  /** What makes this product worth the price — specs, differentiators, standout features */
  why: string;
  /** One-liner the rep can say to pitch it */
  pitch: string;
  /** Which demographics this appeals to most */
  bestFor?: string[];
  /** Estimated rep bonus payout per unit sold */
  bonus?: string;
  /** Outcome bucket(s) */
  outcomes?: string[];
}

export const ESSENTIALS_TABLE: EssentialCategory[] = [
  { category: 'Cases', id: 'cases', items: [
    {
      name: 'Tech21 EvoLite w/ MagSafe',
      price: '$39.99', bundle: '~$30.00',
      why: '12ft drop protection using FlexShock material that absorbs and distributes impact. Slim profile — doesn\'t add bulk. Built-in MagSafe magnets for snap-on chargers and car mounts. Antimicrobial coating kills 99.99% of surface bacteria. Best value MagSafe case we carry.',
      pitch: '"This one\'s our best seller — 12-foot drop protection, super slim, and it snaps right onto MagSafe chargers."',
      worksWith: ['iPhone'],
      bonus: '$3',
      outcomes: ['Protect it'],
    },
    {
      name: 'Tech21 EvoClear w/ MagSafe',
      price: '$49.99', bundle: '~$37.50',
      why: 'Same 12ft FlexShock drop protection as EvoLite but fully clear — shows off the phone color. UV-yellowing resistance keeps it clear for the life of the case. MagSafe built in. Slightly more premium feel with polished edges.',
      pitch: '"If they want to show off the phone color — this one stays crystal clear and won\'t yellow over time."',
      worksWith: ['iPhone'],
      bonus: '$4',
      outcomes: ['Protect it', 'Show personality'],
    },
    {
      name: 'ZAGG Crystal Palace Snap w/ Kickstand',
      price: '$54.99', bundle: '~$41.25',
      why: 'Clear case with D3O impact material — military-grade 13ft drop protection. Built-in kickstand pops out for hands-free video calls and streaming. MagSafe compatible via Snap magnets. Graphene coating for heat dissipation during gaming/charging.',
      pitch: '"This has a kickstand built right in — great for video calls or watching stuff hands-free. Plus 13-foot drop protection."',
      worksWith: ['iPhone', 'Samsung'],
      bonus: '$4',
      outcomes: ['Protect it'],
    },
    {
      name: 'ZAGG Rainier Snap w/ Kickstand',
      price: '$69.99', bundle: '~$52.50',
      why: 'ZAGG\'s premium rugged case — 16ft drop protection with D3O Bio material. Textured grip sides reduce drops in the first place. Multi-angle kickstand for landscape and portrait. MagSafe Snap compatible. Best case for people who are hard on phones.',
      pitch: '"This is the tank — 16-foot drop rated, textured grip so it doesn\'t slip, and a kickstand. If they\'re rough on phones, this is the one."',
      worksWith: ['iPhone', 'Samsung'],
      bonus: '$5',
      outcomes: ['Protect it'],
    },
    {
      name: 'GoTo Flex Case (Galaxy A16)',
      price: '$9.97', originalPrice: '$19.99', bundle: null,
      why: 'T-Mobile\'s house brand budget case. Flexible TPU material, basic 6ft drop protection. Raised edges protect screen and camera from flat-surface drops. Good enough for budget-conscious customers on the A16.',
      pitch: '"It\'s on sale for under $10 — basic protection, gets the job done for the A16."',
      worksWith: ['Samsung'],
      bonus: '$1',
      outcomes: ['Protect it'],
    },
  ]},
  { category: 'Screen Protectors', id: 'screen', items: [
    {
      name: 'ZAGG Glass Elite (standard)',
      price: '$44.99', bundle: '~$33.75',
      why: 'Ion-exchange tempered glass — same hardening process as Gorilla Glass. Edge-to-edge coverage with precise cutouts. Anti-smudge Clearprint coating reduces fingerprints. Reinforced edges resist chipping. ZAGG lifetime warranty: if it cracks, they replace it free (customer just pays shipping). P360 replaces it in-store for free.',
      pitch: '"This is tempered glass, edge to edge. If it ever cracks, ZAGG replaces it free — and with P360 we\'ll do it right here in store."',
      worksWith: ['All'],
      bonus: '$4',
      outcomes: ['Protect it'],
    },
    {
      name: 'ZAGG Glass Elite Privacy 360 (iPhone)',
      price: '$59.99', bundle: '~$45.00',
      why: 'Same tempered glass as standard Glass Elite but adds a 4-way privacy filter — blocks viewing from all side angles, not just left/right. Screen looks normal to the user head-on. Huge seller for younger customers who use their phones on transit and in public. Also popular with professionals who handle sensitive info on their phones.',
      pitch: '"This one blocks the screen from side angles — nobody can read their texts or see what they\'re doing. Huge with younger customers."',
      worksWith: ['iPhone'],
      bonus: '$5',
      outcomes: ['Protect it'],
    },
  ]},
  { category: 'Chargers + Cables', id: 'chargers', items: [
    {
      name: 'Samsung 25W Power Adapter',
      price: '$19.99', bundle: '~$15.00',
      why: 'USB-C PD fast charger — takes a Galaxy S26 from 0 to 50% in about 30 minutes. Works with any USB-C phone (iPhone 15+, Pixel, etc.) at up to 25W. Compact single-port wall charger. New phones don\'t come with a charger in the box — this is the entry-level must-have.',
      pitch: '"New phones don\'t come with a charger anymore. This gets you to 50% in 30 minutes — it\'s the easiest add."',
      worksWith: ['All'],
      bonus: '$2',
      outcomes: ['Power it'],
    },
    {
      name: 'Samsung 45W Power Adapter',
      price: '$39.99', bundle: '~$30.00',
      why: 'The fastest wall charger Samsung makes — 45W USB-C PD 3.0 with PPS. Takes the S26 Ultra from 0 to 65% in 30 minutes (vs ~50% on 25W). Noticeably faster for Galaxy flagship users. Diminishing returns on iPhone (caps at ~27W) but still works fine.',
      pitch: '"If they want the fastest charge possible — this is 45 watts, noticeably faster than the 25W. Best for Galaxy flagship owners."',
      worksWith: ['All'],
      bonus: '$3',
      outcomes: ['Power it'],
    },
    {
      name: 'Samsung USB-C Cable (1m)',
      price: '$19.99', bundle: '~$15.00',
      why: '3A USB-C to USB-C cable. Supports 25W fast charging. 1 meter (3.3ft) length — good for nightstand or desk charging. Braided nylon exterior resists fraying. Every current phone uses USB-C now (iPhone 15+, all Android).',
      pitch: '"Short cable for the nightstand — braided so it won\'t fray. Supports full fast charging speed."',
      worksWith: ['All'],
      bonus: '$2',
      outcomes: ['Power it'],
    },
    {
      name: 'Samsung USB-C Cable (1.8m)',
      price: '$24.99', bundle: '~$18.75',
      why: '5A USB-C to USB-C cable — supports up to 45W super fast charging. 1.8 meters (6ft) length gives you reach from a wall outlet to the couch. Required for the 45W charger to hit full speed (3A cables cap at 25W).',
      pitch: '"This is the longer cable — 6 feet, so you can actually use the phone while it charges. And it supports the full 45W speed."',
      worksWith: ['All'],
      bonus: '$2',
      outcomes: ['Power it'],
    },
    {
      name: 'Samsung Ultimate Charging Bundle',
      price: '$69.99', bundle: '~$52.50',
      why: 'All-in-one kit: 25W wall charger + 40W dual-port car charger + USB-C cables for both. Covers home and car charging in one purchase. Better value than buying the wall charger + car charger separately. The car charger has two ports — charge the phone and a passenger\'s device simultaneously.',
      pitch: '"This bundle covers home AND car — wall charger, car charger with two ports, and the cables. Better deal than buying them separately."',
      worksWith: ['All'],
      bonus: '$5',
      outcomes: ['Power it', 'Travel easier'],
    },
  ]},
  { category: 'Wireless Chargers', id: 'wireless', items: [
    {
      name: 'mophie 15W Wireless Charging Pad',
      price: '$39.99', bundle: '~$30.00',
      why: '15W Qi2 certified — fastest standard wireless charging speed. Flat pad design works on nightstands, desks, and kitchen counters. No magnets — works with any Qi-compatible phone (iPhone, Samsung, Pixel). LED indicator shows charging status. Simple: just set the phone down.',
      pitch: '"Just set the phone down and it charges — no cables, no fiddling. Works with any phone that does wireless charging."',
      worksWith: ['All'],
      bonus: '$3',
      outcomes: ['Power it'],
    },
    {
      name: 'Apple MagSafe Charger (2m)',
      price: '$49.99', bundle: '~$37.50',
      why: 'Apple\'s official magnetic wireless charger — snaps onto iPhone 12+ with perfect alignment every time. 15W charging speed (vs 7.5W on generic Qi pads). 2-meter cable gives plenty of reach. Also works with Qi2-compatible Pixels. Does NOT work with Samsung Galaxy (no MagSafe/Qi2 support).',
      pitch: '"This snaps right onto the back of the iPhone magnetically — charges at double the speed of a regular wireless pad. The long cable is nice too."',
      worksWith: ['iPhone', 'Pixel'],
      bonus: '$4',
      outcomes: ['Power it'],
    },
  ]},
  { category: 'Camera Protectors', id: 'camera', items: [
    {
      name: 'ZAGG Camera Protector (S26 Ultra)',
      price: '$24.99', bundle: '~$18.75',
      why: 'Tempered glass cover for the S26 Ultra\'s camera bump. The Ultra has a 200MP main sensor + 4 lenses that protrude significantly — very prone to scratches when set on tables face-up. Precise fit doesn\'t interfere with photo quality. Cheap insurance for a $1,300 phone\'s best feature.',
      pitch: '"The camera lenses stick out — this protects them from scratches when you set it down. Cheap insurance for a $1,300 phone."',
      worksWith: ['Samsung'],
      bonus: '$2',
      outcomes: ['Protect it'],
    },
    {
      name: 'ZAGG Camera Protector (S26+)',
      price: '$24.99', bundle: '~$18.75',
      why: 'Same tempered glass camera protection sized for the S26+ lens layout. The S26+ camera bump is still significant and vulnerable to micro-scratches from keys, coins, and surfaces. Doesn\'t affect photo or video quality.',
      pitch: '"Same deal — protects those camera lenses from scratches. Doesn\'t affect picture quality at all."',
      worksWith: ['Samsung'],
      bonus: '$2',
      outcomes: ['Protect it'],
    },
  ]},
  { category: 'Other Essentials', id: 'other', items: [
    {
      name: 'iOttie Qi2 Mini Wireless Charging Car Mount',
      price: '$54.95', bundle: '~$41.21',
      why: 'Qi2 magnetic car mount — phone snaps on and charges at 15W while acting as your GPS. One-hand mount and dismount. Adjustable arm fits any car vent. Works with iPhone 12+ and Qi2 Pixels natively; Samsung needs a MagSafe-compatible case. iOttie is the #1 car mount brand.',
      pitch: '"If they use their phone for maps — this mounts magnetically on the vent and charges while they drive. One hand to snap it on."',
      worksWith: ['iPhone', 'Pixel'],
      bonus: '$4',
      outcomes: ['Travel easier', 'Power it'],
    },
    {
      name: 'PopSockets PopGrip for MagSafe',
      price: '$29.99', bundle: '~$22.50',
      why: 'Magnetic PopGrip — snaps on via MagSafe, pops off for wireless charging (old glue-on PopSockets blocked wireless charging). Works as a grip, stand, and fidget toy. Swappable tops in dozens of designs. Huge with 18-24 demographic — it\'s basically a phone personality accessory.',
      pitch: '"This pops on magnetically so it doesn\'t block wireless charging. Great grip, doubles as a stand, and they can swap the designs."',
      worksWith: ['iPhone', 'Pixel'],
      bonus: '$2',
      outcomes: ['Show personality', 'Everyday add-on'],
    },
    {
      name: 'Samsung Magnetic Battery',
      price: '$64.99', bundle: '~$48.75',
      why: 'Samsung\'s answer to MagSafe battery packs — magnetically attaches to the back of Galaxy S26 series. 5,000mAh capacity adds roughly 50-70% extra battery life. Qi wireless out so it can charge a second device. Samsung\'s own ecosystem play — doesn\'t work with iPhone MagSafe. Great for heavy users and travelers.',
      pitch: '"If their battery ever dies on the go — this snaps on the back magnetically and adds another 50-70% battery. No cables needed."',
      worksWith: ['Samsung'],
      bonus: '$5',
      outcomes: ['Power it', 'Travel easier'],
    },
  ]},
];

export const BIG_ADDS: BigAddItem[] = [
  {
    name: 'AirPods 4',
    price: '$129.99',
    note: 'No bundle discount',
    why: 'Apple\'s entry-level wireless earbuds — H2 chip with personalized Spatial Audio, adaptive EQ, and USB-C charging. Open-ear design (no silicone tips) is comfortable for all-day wear. Auto-pairs instantly with any iPhone. 30-hour total battery with the case. The "w/ ANC" version ($179) adds active noise cancellation and transparency mode.',
    pitch: '"These pair instantly with iPhone — just open the case. Great sound, 30 hours battery. Easiest audio add we have."',
    bestFor: ['18-24', '25-34'],
    bonus: '$7',
    outcomes: ['Hear better'],
  },
  {
    name: 'Galaxy Buds4',
    price: '$179.99',
    note: 'No bundle discount',
    why: 'Samsung\'s latest earbuds — 2-way speakers with ANC, 360 Audio, and auto-switch between Galaxy devices (phone, watch, tablet). IPX7 water resistant — survived in the washing machine per reviews. Comfortable fit with three ear tip sizes. 6.5 hours per charge, 30 hours total with case. Voice detect pauses music when you talk.',
    pitch: '"These auto-switch between their Galaxy phone and watch. Noise canceling, waterproof, and they pause when you start talking."',
    bestFor: ['18-24', '25-34'],
    bonus: '$10',
    outcomes: ['Hear better'],
  },
  {
    name: 'AirPods Pro 3',
    price: '$249.99',
    note: 'No bundle discount',
    why: 'Apple\'s premium earbuds — H3 chip with 2x better ANC than Pro 2. Clinical-grade hearing test and hearing aid functionality (FDA-cleared). Adaptive transparency lets outside sound through naturally. Conversation awareness lowers volume when you speak. Personalized spatial audio with head tracking. USB-C, IP54 dust/water resistant, 6 hours per charge.',
    pitch: '"These double as FDA-cleared hearing aids now — plus the best noise canceling Apple\'s ever made. Big deal for the 35+ crowd."',
    bestFor: ['25-34', '35-54'],
    bonus: '$13',
    outcomes: ['Hear better'],
  },
  {
    name: 'Backbone One Controller',
    price: '$99.99',
    note: 'Gen Z / gamers',
    why: 'Turns any phone into a handheld gaming console — console-quality thumbsticks, triggers, and bumpers. USB-C passthrough charging so battery doesn\'t drain during sessions. Works with Xbox Game Pass, PS Remote Play, Apple Arcade, and hundreds of mobile games. iPhone and Android versions available. Backbone app includes game discovery and screen recording.',
    pitch: '"If they\'re a gamer — this turns their phone into a Switch-like setup. Works with Xbox Game Pass, PlayStation Remote Play, everything."',
    bestFor: ['18-24'],
    bonus: '$5',
    outcomes: ['Just have fun'],
  },
  {
    name: 'Ray-Ban Meta Wayfarer (Transitions)',
    price: '$379.99',
    note: 'Tech-forward / social media',
    why: 'Smart glasses with built-in camera (12MP), speakers, and Meta AI assistant. Livestream to Instagram/Facebook hands-free. Transitions lenses auto-darken in sunlight — no need for prescription swap. Take calls, listen to music, and get AI answers without pulling out the phone. 4 hours continuous use. Looks like regular Ray-Bans — not dorky tech glasses.',
    pitch: '"These look like regular Ray-Bans but they take photos, play music, and have Meta AI built in. The Transitions lenses darken automatically outside."',
    bestFor: ['25-34', '35-54'],
    bonus: '$15',
    outcomes: ['Show personality', 'Just have fun'],
  },
];

// Which categories to auto-expand based on intent
export type Intent = 'exploring' | 'ready to buy' | 'upgrade / add a line' | 'order support' | 'tech support' | 'account support';

export function getRecommendedCategories(intent: Intent, age?: string): string[] {
  // Always recommend cases + screen protectors for sales intents
  const recs = ['cases', 'screen'];

  if (intent === 'ready to buy') {
    // They're buying — push the full protection suite + charging
    recs.push('chargers');
  } else if (intent === 'upgrade / add a line') {
    // New device — camera protection + charging essentials
    recs.push('camera', 'chargers');
  }

  // Age-based additions
  if (age === '18-24') {
    // Younger — grips, battery packs (on the go)
    if (!recs.includes('other')) recs.push('other');
  } else if (age === '35-54' || age === '55+') {
    // Older — wireless chargers (convenience)
    if (!recs.includes('wireless')) recs.push('wireless');
  }

  return recs;
}
