export interface ProtectionTier {
  tier: number;
  devices: string;
  monthlyCost: string;
}

export const PROTECTION_360_TIERS: ProtectionTier[] = [
  { tier: 1, devices: 'Budget phones', monthlyCost: '~$7' },
  { tier: 2, devices: 'Mid-range smartphones', monthlyCost: '~$9' },
  { tier: 3, devices: 'Upper mid-range', monthlyCost: '~$11' },
  { tier: 4, devices: 'Flagships', monthlyCost: '~$13-15' },
  { tier: 5, devices: 'Premium flagships (Pro Max, Ultra, foldables, BYOD)', monthlyCost: '~$18-26' },
];

export const PROTECTION_360_COVERAGE = [
  'Unlimited accidental damage claims (drops, cracks, spills)',
  '$0 front screen repair',
  '$29 back glass repair',
  'Up to 5 loss/theft replacements per 12 months',
  'Unlimited mechanical/electrical failure claims (even after manufacturer warranty)',
  'AppleCare Services for iPhones (first 24 months)',
  'JUMP! upgrades (after 50% device paid)',
  'McAfee Security with ID theft protection',
  'Unlimited screen protector replacements in-store',
  'Next-day replacement delivery',
  'Tech PHD support by Assurant',
  'Deductibles range from $10 to $249 by tier and claim type',
];

export const P360_VS_APPLECARE = 'AppleCare+ costs ~$9.99/month — covers accidental damage (2 incidents/year, $29 screen/$99 other) but does NOT cover loss or theft unless upgraded to AppleCare+ with Theft & Loss ($13.49/month). P360 includes AppleCare Services for 24 months PLUS loss/theft coverage, McAfee security, JUMP! upgrades, and unlimited screen protector replacements — all in one plan. Sales pitch: "P360 gives you everything AppleCare offers plus loss and theft protection, identity protection, and free screen protector replacements."';

export const BASIC_DEVICE_PROTECTION = '$1/month less per tier, but limited to 2 claims per 12 months with higher deductibles and no AppleCare, JUMP!, or McAfee.';

export const MAGSAFE_INFO = {
  compatibility: 'Compatible with iPhone 12 and all newer models (12 through 17 series including iPhone Air). Qi2 is the open standard equivalent — iPhone 15+ supports MagSafe/Qi2 at 15W+. Google Pixel 10 supports Qi2. Samsung Galaxy S26 does NOT support Qi2/MagSafe.',
  categories: 'Apple MagSafe chargers, Belkin and mophie wireless chargers, MagSafe cases, wallets, car mounts (iOttie), PopGrips for MagSafe, battery packs.',
};

export const USB_C_NOTE = 'All iPhones since iPhone 15 (2023) and all current Android flagships use USB-C. The accessory inventory has fully transitioned to USB-C cables and chargers.';

export const KEY_ACCESSORY_BRANDS = {
  premium: ['Apple', 'Samsung', 'Google', 'Beats', 'Belkin', 'Bose', 'JBL', 'mophie', 'OtterBox', 'Sony'],
  protection: ['Case-Mate', 'kate spade', 'Pelican', 'PureGear', 'Tech21', 'UAG', 'ZAGG'],
  charging: ['Belkin', 'iOttie', 'mophie', 'SCOSCHE', 'Nimble'],
  misc: ['Backbone (gaming)', 'Chipolo (trackers)', 'PopSockets'],
  tmobile: ['GoTo (T-Mobile brand)', 'Pivet'],
};

export const ESSENTIAL_BUNDLE_DEAL = {
  headline: 'Save 25% on 3+ Accessories',
  detail: 'Anything in the Essential Accessories collection qualifies — cases, screen protectors, chargers, cables, mounts, grips, and more. Mix and match any 3+.',
  pitch: 'If they\'re grabbing even one accessory, ask what else they need. Most customers don\'t realize how much they save by adding a second or third item.',
};

import { SalesContext, AccessoryRecommendation } from '../types';

/** Build personalized accessory recommendations based on customer context */
export function buildAccessoryRecommendations(context: SalesContext): AccessoryRecommendation[] {
  const recs: AccessoryRecommendation[] = [];
  const products = context.product;
  const age = context.age;
  const isSupport = ['order support', 'tech support', 'account support'].includes(context.purchaseIntent);

  // --- PHONE ACCESSORIES ---
  if (products.includes('Phone') || products.includes('No Specific Product')) {

    // Case
    recs.push({
      name: 'Protective Case',
      why: age === '18-24'
        ? 'Phones take a beating — gym bags, back pockets, dropped on concrete. A good case is cheaper than a P360 deductible. ZAGG Rainier and Tech21 EvoClear are the popular picks right now, and both come with MagSafe/magnet support.'
        : age === '55+'
          ? 'A sturdy case means they don\'t have to worry about handling the phone carefully. OtterBox Defender gives serious drop protection. Tech21 EvoClear is lighter if they don\'t want bulk. Either way, it\'s peace of mind every time they pick it up.'
          : age === '35-54'
            ? 'Kids grab phones, phones slide off counters — a case pays for itself the first time it saves a screen. OtterBox and UAG are built for real life. Tech21 if they want something slimmer that still protects.'
            : 'A cracked screen on day one ruins the experience. Cases from ZAGG and Tech21 now come with built-in MagSafe magnets, so they work with snap-on chargers and car mounts too — it\'s not just protection, it\'s part of the ecosystem.',
      priceRange: '$30–$70',
      verifiedPrices: [
        { item: 'Tech21 EvoClear w/ MagSafe', fullPrice: '$49.99' },
        { item: 'Tech21 EvoLite w/ MagSafe', fullPrice: '$39.99' },
        { item: 'ZAGG Crystal Palace Snap w/ Kickstand', fullPrice: '$54.99' },
        { item: 'ZAGG Rainier Snap w/ Kickstand', fullPrice: '$69.99' },
        { item: 'GoTo Flex Case (Galaxy A16)', fullPrice: '$19.99', salePrice: '$9.97' },
      ],
      brands: ['ZAGG', 'Tech21', 'OtterBox', 'Case-Mate', 'UAG'],
      bundleEligible: true,
    });

    // Screen protector
    recs.push({
      name: 'Screen Protector',
      why: age === '18-24'
        ? 'ZAGG Glass Elite Privacy is the move for this age group — it blocks side-angle viewing so nobody can read their texts or see their screen on the bus. Full edge-to-edge tempered glass, and if it cracks, ZAGG replaces it.'
        : age === '55+'
          ? 'Tempered glass protectors keep the screen scratch-free and make fingerprints easier to wipe off. ZAGG Glass Elite has an anti-smudge coating. If it ever breaks, ZAGG does a free replacement.'
          : 'Even with P360\'s $0 screen repair, a protector means they never have to deal with a claim at all. ZAGG Glass Elite is the top seller — tempered glass, edge-to-edge coverage, and a lifetime replacement guarantee from ZAGG.',
      priceRange: '$25–$60',
      verifiedPrices: [
        { item: 'ZAGG Glass Elite Privacy 360 (iPhone)', fullPrice: '$59.99' },
        { item: 'ZAGG Glass Elite (standard)', fullPrice: '$44.99' },
      ],
      brands: ['ZAGG', 'PureGear', 'Belkin'],
      bundleEligible: true,
    });

    // Charger / Cable
    recs.push({
      name: 'Fast Charger + Cable',
      why: 'New phones don\'t come with a charger in the box — just a USB-C cable. If they\'re upgrading from an older phone, their old charger is probably USB-A and won\'t fast-charge. A 25W+ USB-C charger takes most phones from 0 to 50% in about 30 minutes. The Samsung 45W ($40) is worth mentioning for S26 buyers who want the fastest charge possible.',
      priceRange: '$15–$70',
      verifiedPrices: [
        { item: 'Samsung 25W Power Adapter', fullPrice: '$19.99' },
        { item: 'Samsung 45W Power Adapter', fullPrice: '$39.99' },
        { item: 'Samsung USB-C Cable 3A 1m', fullPrice: '$19.99' },
        { item: 'Samsung USB-C Cable 5A 1.8m', fullPrice: '$24.99' },
        { item: 'Samsung Ultimate Charging Bundle (25W wall + 40W car + cables)', fullPrice: '$69.99' },
      ],
      brands: ['Samsung', 'Belkin', 'mophie', 'GoTo'],
      bundleEligible: true,
    });

    // MagSafe / Wireless charging
    recs.push({
      name: 'MagSafe / Qi2 Wireless Charger',
      why: age === '55+'
        ? 'No fumbling with cables — just set the phone down and it charges. The magnets snap it into the right position every time. The mophie Wireless Charging Pad ($40) is the simplest option. NOTE: Samsung S26 does NOT support MagSafe/Qi2 — use their Magnetic Battery or standard Qi pad instead.'
        : 'Snap-on wireless charging at full speed — no plugging in. Works on nightstands, desks, and in MagSafe car mounts. iPhone 12+ and Pixel 10 support Qi2 natively. Samsung S26 does NOT support Qi2 — they have their own Magnetic Battery pack ($65) instead.',
      priceRange: '$40–$50',
      verifiedPrices: [
        { item: 'mophie 15W Wireless Charging Pad', fullPrice: '$39.99' },
        { item: 'Apple MagSafe Charger (2m)', fullPrice: '$49.99' },
      ],
      brands: ['Belkin', 'mophie', 'Apple'],
      bundleEligible: true,
    });

    // Audio — every age group gets thorough recs
    // NOTE: Neither Galaxy Buds4 NOR AirPods qualify for 25% bundle. No audio products do.
    if (age === '18-24') {
      recs.push({
        name: 'Wireless Earbuds',
        why: 'Earbuds are basically an extension of the phone for this age group — music, calls, podcasts, gaming audio. Galaxy Buds4 ($180) have great ANC and work seamlessly with Samsung. AirPods 4 ($130) or AirPods 4 w/ ANC ($180) for iPhone users. Neither qualifies for the 25% bundle, but they\'re a high-value add. JBL if they want bass on a budget.',
        priceRange: '$80–$250',
        verifiedPrices: [
          { item: 'Samsung Galaxy Buds4', fullPrice: '$179.99' },
          { item: 'Apple AirPods 4', fullPrice: '$129.99' },
          { item: 'Apple AirPods 4 w/ ANC', fullPrice: '$179.99' },
          { item: 'Apple AirPods Pro 3', fullPrice: '$249.99' },
        ],
        brands: ['Samsung Galaxy Buds4', 'Apple AirPods', 'Beats', 'JBL'],
        bundleEligible: false, // No audio products qualify for 25% bundle
      });
    } else if (age === '25-34') {
      recs.push({
        name: 'Premium Wireless Audio',
        why: 'This age group uses earbuds for everything — commutes, gym, WFH calls, flights. AirPods Pro 3 ($250) have the best ANC in the Apple ecosystem and now do hearing health features. Galaxy Buds4 ($180) pair instantly with Galaxy. AirPods Max ($550) for over-ear travel/studio quality. None qualify for the 25% bundle, but they\'re commission gold.',
        priceRange: '$130–$550',
        verifiedPrices: [
          { item: 'Samsung Galaxy Buds4', fullPrice: '$179.99' },
          { item: 'Apple AirPods Pro 3', fullPrice: '$249.99' },
          { item: 'Apple AirPods Max USB-C', fullPrice: '$549.99' },
        ],
        brands: ['Samsung Galaxy Buds4', 'Apple AirPods Pro 3', 'Sony', 'Bose'],
        bundleEligible: false,
      });
    } else if (age === '35-54') {
      recs.push({
        name: 'Wireless Earbuds',
        why: 'Hands-free calling while driving, working out, or managing kids. AirPods Pro 3 ($250) are the easiest sell for iPhone families — seamless pairing across all their Apple devices. Galaxy Buds4 ($180) for Samsung users. Bose QuietComfort Ultra ($300) if they travel for work. None qualify for the 25% bundle, but they\'re a strong standalone add.',
        priceRange: '$130–$300',
        verifiedPrices: [
          { item: 'Samsung Galaxy Buds4', fullPrice: '$179.99' },
          { item: 'Apple AirPods Pro 3', fullPrice: '$249.99' },
          { item: 'Apple AirPods 4 w/ ANC', fullPrice: '$179.99' },
        ],
        brands: ['Samsung Galaxy Buds4', 'Apple AirPods Pro 3', 'Bose', 'JBL'],
        bundleEligible: false,
      });
    } else if (age === '55+') {
      recs.push({
        name: 'Wireless Earbuds',
        why: 'Makes phone calls much clearer — especially in noisy environments. AirPods 4 ($130) are the simplest to set up with iPhone — open the case and they pair automatically. Galaxy Buds4 ($180) do the same with Samsung. AirPods Pro 3 ($250) add hearing aid features and conversation boost for mild hearing loss. None qualify for the 25% bundle.',
        priceRange: '$130–$250',
        verifiedPrices: [
          { item: 'Apple AirPods 4', fullPrice: '$129.99' },
          { item: 'Samsung Galaxy Buds4', fullPrice: '$179.99' },
          { item: 'Apple AirPods Pro 3', fullPrice: '$249.99' },
        ],
        brands: ['Apple AirPods', 'Samsung Galaxy Buds4'],
        bundleEligible: false,
      });
    } else {
      recs.push({
        name: 'Wireless Earbuds',
        why: 'One of the highest-value add-ons. AirPods 4 ($130) for basic, AirPods Pro 3 ($250) for ANC + hearing health. Galaxy Buds4 ($180) pair seamlessly with Samsung. No audio products qualify for the 25% bundle, but they\'re worth pitching standalone. Ask what they use earbuds for — calls, music, or workouts — and match from there.',
        priceRange: '$80–$550',
        verifiedPrices: [
          { item: 'Apple AirPods 4', fullPrice: '$129.99' },
          { item: 'Samsung Galaxy Buds4', fullPrice: '$179.99' },
          { item: 'Apple AirPods Pro 3', fullPrice: '$249.99' },
          { item: 'Apple AirPods Max USB-C', fullPrice: '$549.99' },
        ],
        brands: ['Apple AirPods', 'Samsung Galaxy Buds4', 'Beats', 'Sony', 'Bose'],
        bundleEligible: false,
      });
    }

    // Camera protector — S26 specific
    recs.push({
      name: 'Camera Lens Protector',
      why: 'The camera bump is the most exposed part of any phone. ZAGG Glass Elite Camera Protectors ($25–$30) cover the lenses without affecting photo quality. Especially important for S26 Ultra with that massive 200MP sensor — replacing that lens is expensive even with P360.',
      priceRange: '$25–$30',
      verifiedPrices: [
        { item: 'ZAGG Camera Protector (S26 Ultra)', fullPrice: '$24.99' },
        { item: 'ZAGG Camera Protector (S26+)', fullPrice: '$24.99' },
        { item: 'ZAGG Camera Lens (S25)', fullPrice: '$29.99' },
      ],
      brands: ['ZAGG'],
      bundleEligible: true,
    });

    // Car mount — commuters and families
    if (age === '25-34' || age === '35-54') {
      recs.push({
        name: 'Car Mount / Car Charger',
        why: age === '35-54'
          ? 'Parents are in the car constantly — school runs, errands, road trips. A MagSafe mount keeps GPS visible and hands free while charging. The iOttie Qi2 Mini ($55) charges wirelessly while mounted. Combo mounts that charge wirelessly are the best value since they replace both a mount and a car charger.'
          : 'If they commute, a mount that charges while navigating is a daily quality-of-life upgrade. MagSafe mounts snap on in one motion — no fumbling with clamps. The iOttie Qi2 Mini ($55) is the most popular. Belkin makes a clean vent mount option too.',
        priceRange: '$30–$55',
        verifiedPrices: [
          { item: 'iOttie Qi2 Mini Wireless Charging Car Vent Mount', fullPrice: '$54.95' },
        ],
        brands: ['iOttie', 'Belkin'],
        bundleEligible: true,
      });
    }

    // PopSocket / Grip
    if (age === '18-24' || age === '25-34') {
      recs.push({
        name: 'PopSocket / MagSafe Grip',
        why: 'Phones are big and slippery — a PopGrip makes one-handed use way easier. The MagSafe version snaps on and off, so it works with wireless chargers and car mounts without removing it. It also doubles as a kickstand for watching videos. One of the most-used accessories customers actually keep on their phone daily.',
        priceRange: '$30–$40',
        verifiedPrices: [
          { item: 'PopSockets PopGrip for MagSafe (standard)', fullPrice: '$29.99' },
          { item: 'PopSockets PopGrip for MagSafe (enamel)', fullPrice: '$34.99' },
          { item: 'PopSockets PopGrip for MagSafe (specialty)', fullPrice: '$39.99' },
        ],
        brands: ['PopSockets'],
        bundleEligible: true,
      });
    }

    // Samsung Magnetic Battery — Samsung-specific
    recs.push({
      name: 'Portable Battery Pack',
      why: 'For customers who are heavy users or travel — a snap-on battery pack adds hours of life without finding an outlet. Samsung\'s Magnetic Battery ($65) snaps onto S26 via magnets and charges wirelessly. For iPhone, mophie and Belkin make MagSafe battery packs ($40–$50). Good for anyone who complains their phone dies by evening.',
      priceRange: '$40–$65',
      verifiedPrices: [
        { item: 'Samsung Magnetic Battery', fullPrice: '$64.99' },
      ],
      brands: ['Samsung', 'mophie', 'Belkin'],
      bundleEligible: true,
    });

    // Gaming — Gen Z
    if (age === '18-24') {
      recs.push({
        name: 'Backbone Gaming Controller',
        why: 'Turns their phone into a handheld gaming console — works with Xbox Game Pass, PS Remote Play, Call of Duty Mobile, Fortnite, and hundreds of other games. Plugs in via USB-C so there\'s zero lag. If they game on their phone at all, this is a must-have. Good conversation topic too — ask what games they play.',
        priceRange: '$100',
        verifiedPrices: [
          { item: 'Backbone One Controller (USB-C, 2nd Gen)', fullPrice: '$99.99' },
        ],
        brands: ['Backbone'],
        bundleEligible: false,
      });
    }

    // Ray-Ban Meta Glasses — lifestyle/tech-forward
    if (age === '25-34' || age === '18-24') {
      recs.push({
        name: 'Ray-Ban Meta Smart Glasses',
        why: 'These are real Ray-Bans with built-in camera, speakers, and Meta AI. Take calls, listen to music, livestream to Instagram — all without pulling out the phone. Wayfarer style ($300+) with Transitions lenses available. Not for everyone, but if the customer is into tech or social media, these are a strong conversation piece.',
        priceRange: '$300–$380',
        verifiedPrices: [
          { item: 'Ray-Ban Meta Wayfarer (Transitions)', fullPrice: '$379.99' },
        ],
        brands: ['Meta / Ray-Ban'],
        bundleEligible: false,
      });
    }
  }

  // --- TABLET ACCESSORIES ---
  if (products.includes('BTS') || products.includes('No Specific Product')) {
    recs.push({
      name: 'Tablet Keyboard Case',
      why: 'A keyboard case turns a tablet into a laptop replacement for a fraction of the cost. Samsung\'s Book Cover Keyboard Slim w/ AI Key ($140) works with Galaxy Tab S10 FE and has a dedicated AI assistant button. Apple\'s Magic Keyboard ($300+) for iPad Pro/Air is premium but makes the tablet a real work tool. Logitech has budget options ($80–$100) that still type well.',
      priceRange: '$80–$300',
      verifiedPrices: [
        { item: 'Samsung Book Cover Keyboard Slim w/ AI Key (Tab S10 FE)', fullPrice: '$139.99' },
      ],
      brands: ['Samsung Book Cover', 'Apple Magic Keyboard', 'Logitech'],
      bundleEligible: false,
    });

    recs.push({
      name: 'Tablet Screen Protector',
      why: 'Tablet screens are bigger targets for scratches, especially if kids use them. Tempered glass protectors for tablets run $30–$50 and prevent the kind of damage that makes a $500 tablet look beat up in a month. ZAGG makes them for both iPad and Galaxy Tab.',
      priceRange: '$30–$50',
      brands: ['ZAGG', 'PureGear'],
      bundleEligible: true,
    });
  }

  // --- WATCH ACCESSORIES ---
  if (products.includes('BTS')) {
    recs.push({
      name: 'Watch Screen Protector',
      why: 'Watch screens are small but exposed — they hit doorframes, countertops, gym equipment. ZAGG Glass Elite 360 ($20–$40) wraps edge-to-edge and doesn\'t affect touch sensitivity. Currently on sale: ~~$39.99~~ $19.97 for Apple Watch Series 10.',
      priceRange: '$20–$40',
      verifiedPrices: [
        { item: 'ZAGG Glass Elite 360 (Apple Watch Series 10, 42mm)', fullPrice: '$39.99', salePrice: '$19.97' },
      ],
      brands: ['ZAGG'],
      bundleEligible: true,
    });
  }

  // --- PROTECTION 360 ---
  if (isSupport || products.includes('Phone') || products.includes('BTS')) {
    recs.push({
      name: 'Protection 360',
      why: isSupport
        ? 'Check if they already have it — many support callers don\'t. P360 covers unlimited accidental damage claims (drops, cracks, spills), $0 front screen repair, up to 5 loss/theft replacements per year, and includes AppleCare Services for iPhones (first 24 months). Also includes JUMP! upgrade eligibility after 50% paid off, McAfee Security with ID theft protection, and unlimited in-store screen protector replacements.'
        : age === '55+'
          ? 'One plan that covers everything — drops, theft, mechanical failure, even after the manufacturer warranty ends. $0 screen repair if it cracks. They also get unlimited free screen protector replacements at any T-Mobile store. For iPhone users, it includes AppleCare Services for 24 months — they don\'t need to buy AppleCare separately.'
          : 'Covers everything AppleCare+ does — accidental damage, mechanical failure — PLUS loss/theft protection, McAfee identity security, JUMP! upgrades, and unlimited screen protector replacements in-store. AppleCare+ alone is $10–$13/mo and doesn\'t cover loss/theft unless upgraded. P360 bundles it all. Compare side by side if they push back.',
      priceRange: '$7–$26/mo (by device tier)',
      brands: ['T-Mobile Protection 360'],
      bundleEligible: false,
    });
  }

  // --- SyncUP Tracker ---
  if (age === '35-54' || products.includes('IOT')) {
    recs.push({
      name: 'SyncUP Tracker',
      why: age === '35-54'
        ? 'Real GPS tracking on T-Mobile\'s cellular network — works everywhere there\'s coverage, not just near other phones like AirTag or Tile. Parents use them in kids\' backpacks, on pet collars, in cars, and in checked luggage. Set up geofence alerts so they get a notification when it arrives or leaves a location. Currently FREE with 24 bill credits when adding a tracker line.'
        : 'Unlike Bluetooth trackers (AirTag, Tile) that only work near other phones, SyncUP uses T-Mobile\'s cellular network for real-time GPS anywhere there\'s coverage. Built-in speaker to ring it when lost. Geofence alerts, location history, and sharing with family members. Currently FREE with 24 bill credits when adding a tracker line.',
      priceRange: '$54 + $1/mo line (w/ AutoPay)',
      verifiedPrices: [
        { item: 'TCL SyncUP TRACKER 2 (full price)', fullPrice: '$54.00' },
        { item: 'TCL SyncUP TRACKER 2 (w/ 24 bill credits)', fullPrice: '$54.00', salePrice: 'FREE' },
      ],
      brands: ['T-Mobile SyncUP'],
      bundleEligible: false,
    });
  }

  // --- SyncUP DRIVE for car-focused customers ---
  if (products.includes('IOT') || (age === '35-54' && products.includes('No Specific Product'))) {
    recs.push({
      name: 'SyncUP DRIVE',
      why: 'Plugs into the car\'s OBD-II port and turns it into a connected vehicle. Real-time GPS tracking, trip history, vehicle health diagnostics, and speed/boundary alerts for teen drivers. Parents love the speed alerts — they get a notification if the car goes over a set speed. Also provides in-car Wi-Fi hotspot for passengers. Currently FREE with 24 bill credits when adding a DRIVE line.',
      priceRange: '$108 + $10/mo line (w/ AutoPay)',
      verifiedPrices: [
        { item: 'T-Mobile SyncUP DRIVE (full price)', fullPrice: '$108.00' },
        { item: 'T-Mobile SyncUP DRIVE (w/ 24 bill credits)', fullPrice: '$108.00', salePrice: 'FREE' },
      ],
      brands: ['T-Mobile SyncUP DRIVE'],
      bundleEligible: false,
    });
  }

  return recs;
}
