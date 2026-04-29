import { SalesContext } from '../types';

// --- WELCOME MESSAGES BY PURCHASE INTENT ---
export const WELCOME_MESSAGES: Record<string, string[]> = {
  'exploring': [
    "Hey! No pressure at all — let's just figure out what's out there that might work for you.",
    "Welcome in! Totally cool to just look around. What caught your eye?",
    "What's up! Just exploring? That's the best way to start. Let me know if anything jumps out.",
  ],
  'ready to buy': [
    "Awesome, let's get you set up! I'll make sure you're getting the best deal we have right now.",
    "Love it — you came ready! Let me pull up what we've got and make this quick and easy.",
    "Perfect timing! We've got some solid deals running. Let's find the right fit.",
  ],
  'upgrade / add a line': [
    "Smart move comparing before you commit. Let me show you what we bring to the table.",
    "Love that you're doing your homework. Let me give you the real side-by-side — no fluff.",
    "Great to see you shopping around! I think you'll like what T-Mobile offers vs. what you're paying now.",
  ],
  'order support': [
    "I've got you — let's get that order sorted out real quick.",
    "No worries, let's take a look at what's going on with your order.",
    "I'm on it! Let me pull up your info and get this resolved.",
  ],
  'tech support': [
    "Let's figure this out together. What's going on with your device?",
    "I deal with this stuff all day — we'll get it sorted. What's happening?",
    "No stress, tech issues happen. Let me take a look.",
  ],
  'account support': [
    "I've got you! Let me pull up your account and see what we can do.",
    "No problem at all. What's going on with your account?",
    "Let's take a look together. What do you need help with?",
  ],
};

// --- ONE-LINERS / TALK TRACKS BY INTENT ---
export const ONE_LINERS: Record<string, string[]> = {
  'exploring': [
    "I'm here to help you navigate the noise — let's find the one thing that actually makes your life easier.",
    "Think of me as your T-Mobile concierge. No pressure, just the facts and the best deals.",
    "The best part about T-Mobile is that we don't hide the ball. Let's look at the real numbers together.",
  ],
  'ready to buy': [
    "You've done the hard part — let me handle the paperwork and get you the best credits available.",
    "I'll make sure every promo is stacked correctly so you're not leaving a dime on the table.",
    "Let's get you set up so you can start enjoying that new tech today.",
  ],
  'upgrade / add a line': [
    "Adding a line is the single best way to lower your cost-per-line. It's basically a volume discount.",
    "Your current plan is great, but let's see if a quick shift could unlock even more free streaming or data.",
    "Upgrading now locks in your trade-in value before the next model cycle drops it.",
  ],
  'order support': [
    "My goal is to get your order moving so you can stop worrying and start using your new gear.",
    "I'll track this down like it's my own order. Let's get you some answers.",
    "While we wait for the system, let's make sure your account is optimized for the best possible value.",
  ],
  'tech support': [
    "Tech should work for you, not the other way around. Let's get this fixed.",
    "I'll walk you through this step-by-step. We'll have you back up and running in no time.",
    "If we can't fix it, I'll make sure we find the fastest path to a replacement or upgrade.",
  ],
  'account support': [
    "Your account should be as simple as possible. Let's clean up any confusion.",
    "I'll do a full account audit while we're at it to make sure you're not paying for anything you don't need.",
    "Let's make sure you're taking full advantage of all the perks your plan already includes.",
  ],
};

// --- DISCOVERY QUESTIONS BY PRODUCT CATEGORY ---
export const DISCOVERY_QUESTIONS: Record<string, string[]> = {
  'Phone': [
    "What phone are you using right now, and how's it treating you?",
    "What matters most to you in a phone — camera, battery life, screen size?",
    "Are you looking at iPhone, Samsung, or open to whatever's best?",
    "How many lines would be on your account?",
    "Do you travel internationally much? That's actually a big one for savings.",
    "What are you paying right now per month? (Just ballpark is fine)",
    "Are you into streaming — Netflix, Hulu, that kind of stuff?",
    "Would you be interested in trading in your current device? We take them in any condition.",
    "How often do you find yourself needing to charge your phone during the day?",
    "Do you use your phone for work, or is it mostly personal?",
    "Are you the type who likes to have the latest and greatest, or do you prefer something reliable that just works?",
  ],
  'Home Internet': [
    "What internet provider do you have now, and what are you paying?",
    "How many people in your household are usually online at once?",
    "Do you work from home or do a lot of video calls?",
    "Are you happy with your current speeds, or do things feel slow sometimes?",
    "Have you ever had T-Mobile Home Internet on your radar before?",
    "Is your current provider locked into a contract?",
    "Do you have any 'dead zones' in your house where the Wi-Fi just doesn't reach?",
    "Are you a gamer? Low latency is huge for that, and our 5G is crushing it lately.",
  ],
  'BTS': [
    "Do you have a tablet or watch on your account yet? A lot of people don't realize it's only $5/month to add one.",
    "Do you have kids? A watch with cellular is huge for safety — they can call you without needing a phone.",
    "Are you Apple or Samsung? I ask because we've got some wild watch deals right now depending on your ecosystem.",
    "Do you ever wish you could leave your phone behind at the gym or on a run but still get calls and texts?",
    "Would a tablet help with work or school? We've got iPads and Galaxy Tabs with cellular for basically nothing with a new line.",
    "Have you seen the Galaxy Watch8? It's FREE right now with a new wearable line — 36 monthly credits.",
    "The Apple Watch SE 3 is $200 off with a new line — great for fitness tracking and staying connected without your phone.",
    "Do you ever find yourself tethering your laptop to your phone? A dedicated tablet or hotspot line is way more reliable.",
  ],
  'IOT': [
    "Do you ever worry about your car when it's parked somewhere? SyncUP DRIVE gives you GPS tracking, trip history, and even vehicle diagnostics.",
    "Do you have pets? A lot of our customers use SyncUP Trackers on their dogs — real-time GPS on our nationwide network, not just Bluetooth range like AirTag.",
    "Got kids? SyncUP Trackers are great for backpacks — you can see exactly where they are on a map in real time.",
    "Do you travel a lot? A SyncUP Tracker on your luggage means you always know where your bags are — even if the airline doesn't.",
    "Have you used AirTag or Tile before? SyncUP is different — it uses cellular, so it works anywhere with T-Mobile coverage, not just near other people's phones.",
    "The TCL LINKPORT is under $50 right now — it's a USB-C 5G hotspot that works on any laptop. Great for people who work remotely.",
    "Do you have any high-value items like a bike or a camera bag that you'd want to keep an eye on?",
  ],
  'No Specific Product': [
    "What brings you in today? Just checking things out?",
    "Are you currently with T-Mobile or thinking about switching?",
    "Is there anything specific that's been bugging you about your current service?",
    "Have you seen any T-Mobile deals that caught your eye?",
    "What's most important to you in a wireless carrier?",
    "If you could change one thing about your current mobile experience, what would it be?",
  ],
};

// --- RAPPORT TIPS BY AGE BRACKET ---
export const RAPPORT_BY_AGE: Record<string, { tone: string; topics: string[]; avoid: string[] }> = {
  '18-24': {
    tone: 'Casual, energy-matching, tech-savvy. Use current language but don\'t force it.',
    topics: ['Social media/content creation', 'Streaming and gaming', 'Camera quality for photos/video', 'Affordable pricing', 'Latest device features'],
    avoid: ['Being overly formal', 'Assuming they don\'t know tech', 'Talking about "family plans" first — they may be on their own'],
  },
  '25-34': {
    tone: 'Friendly and direct. Value-focused — show the math on savings.',
    topics: ['Monthly cost vs current carrier', 'Streaming bundle value', 'Trade-in deals', 'International travel perks', 'Family plan pricing if applicable'],
    avoid: ['Being patronizing', 'Overselling — they\'ve already researched online', 'Ignoring their current carrier research'],
  },
  '35-54': {
    tone: 'Professional but warm. Reliability and value matter most.',
    topics: ['Network reliability', '5-Year Price Guarantee', 'Family/multi-line savings', 'Home Internet bundling', 'Protection plans for expensive devices'],
    avoid: ['Too much jargon', 'Rushing the conversation', 'Assuming they only care about price'],
  },
  '55+': {
    tone: 'Patient, clear, respectful. Don\'t rush. Explain without condescending.',
    topics: ['Simplicity and ease of use', 'Price guarantee and stability', 'In-store support availability', '55+ plan discounts', 'Scam Shield protection'],
    avoid: ['Speaking too fast', 'Assuming low tech knowledge', 'Skipping explanations', 'Using acronyms without defining them'],
  },
  'Not Specified': {
    tone: 'Friendly and adaptable. Read the room and adjust.',
    topics: ['What brings them in today', 'Current service satisfaction', 'What matters most to them'],
    avoid: ['Making assumptions about age, tech level, or budget'],
  },
};

// --- OBJECTION RESPONSE TEMPLATES ---
export const OBJECTION_TEMPLATES: Record<string, { rebuttal: string; talkingPoints: string[] }> = {
  'Price is too high': {
    rebuttal: "I totally get that — let's look at the full picture though, not just the line item.",
    talkingPoints: [
      'Factor in streaming perks: Netflix + Hulu + Apple TV+ = ~$30/month you\'re NOT paying separately',
      'Compare total cost vs current carrier: include their hidden fees, activation charges, and the perks they charge extra for',
      'International savings: one trip abroad saves $672 vs AT&T/Verizon',
      '5-Year Price Guarantee means no surprise increases (AT&T has raised prices 4 times in 2 years)',
      'Better Value plan: 3 lines for $140/month with all the premium perks',
      'Ask: "What are you paying now with everything included?" — often T-Mobile is cheaper when you add it all up',
    ],
  },
  'Happy with current provider': {
    rebuttal: "That's fair! But let me ask — are you happy with the price too, or just the service?",
    talkingPoints: [
      'AT&T/Verizon have been raising prices repeatedly — are they still happy with the bill?',
      'Do they get free streaming perks? (AT&T: $0 perks, Verizon: $10/each add-on)',
      'How about international roaming? ($12/day with AT&T/Verizon vs free with T-Mobile)',
      'T-Mobile\'s 5G is now the fastest (309 Mbps) — things have changed',
      'No harm in seeing what we can offer. No contracts means they can always go back',
    ],
  },
  'Don\'t need a new phone/plan': {
    rebuttal: "Totally respect that. But sometimes the deals are so good it actually saves money to upgrade now.",
    talkingPoints: [
      'Trade-in values are at peak right now — up to $1,100 for flagship trade-ins',
      'We take devices in ANY condition for trade-in',
      'New devices often have better battery, camera, security updates',
      'iPhone 17e at $599 is FREE with trade-in on qualifying plan',
      'If their current phone works great, they can still save by switching their plan',
    ],
  },
  'Worried about coverage': {
    rebuttal: "That\'s the #1 thing I hear, and honestly T-Mobile has changed a LOT. Let me show you.",
    talkingPoints: [
      'T-Mobile now #1 in network quality by JD Power in 5 of 6 regions — first time ever',
      '5G covers 325+ million Americans across 1.9 million square miles',
      'Ookla certified: 309 Mbps median 5G — fastest in the country',
      'T-Satellite with Starlink covers 500,000+ square miles with ZERO cell towers',
      'Offer the 15-day Home Internet test drive if relevant',
      'Ask: "Where specifically are you worried about coverage?" — check the coverage map together',
    ],
  },
  'Too much hassle to switch': {
    rebuttal: "I hear you — but we actually make it really easy. Most of it we do right here.",
    talkingPoints: [
      'We handle number porting in-store — usually takes about 15 minutes',
      'Family Freedom: up to $800/line to pay off your current device balance',
      'No contracts with T-Mobile — if you don\'t love it, you can leave anytime',
      'We\'ll help transfer contacts, apps, and data right here',
      'Most people are surprised how quick and painless it actually is',
    ],
  },
  'Contract/ETF concerns': {
    rebuttal: "Good news — we can actually help with that.",
    talkingPoints: [
      'Family Freedom: up to $800/line via virtual prepaid Mastercard to cover remaining device balances',
      'T-Mobile has NO annual service contracts — ever',
      'Even if they have a balance, the math usually works out in their favor when you factor in the savings',
      'Help them calculate: remaining balance vs monthly savings over 12-24 months',
    ],
  },
  'Waiting for the new iPhone/Samsung': {
    rebuttal: "Smart thinking! But here\'s something to consider...",
    talkingPoints: [
      'Current promos are some of the best we\'ve had — they may not be available later',
      'With yearly upgrades on Experience Beyond, they can upgrade when the new one drops',
      'Trade-in values tend to DROP when new models release (everyone trades in at once)',
      'Get set up now, lock in the deal, and upgrade when they\'re ready',
    ],
  },
  'I need to talk to my spouse': {
    rebuttal: "Absolutely — that\'s a smart move. Let me set you up so the conversation is easy.",
    talkingPoints: [
      'Offer to send a comparison or summary they can share (print or email)',
      'Give them a card with the deal details and your name',
      'Mention the time-sensitive nature of current promos (gently, not pushy)',
      'Suggest: "Want to give them a quick call? We have great Wi-Fi in here."',
      'Set a follow-up: "When would be a good time for me to check back with you?"',
    ],
  },
  'Bad past experience with T-Mobile': {
    rebuttal: "I appreciate you being honest about that. A lot has changed — let me show you what\'s different now.",
    talkingPoints: [
      'T-Mobile is now #1 in customer satisfaction (JD Power 2025)',
      'Network has improved dramatically — 309 Mbps median 5G, most awarded network',
      '5-Year Price Guarantee means no more surprise price increases',
      'New leadership has focused heavily on customer experience',
      'Ask: "What specifically went wrong last time?" — and address it directly',
      'No contracts means if they\'re not happy, they can leave anytime',
    ],
  },
};

// --- PURCHASE STEP TEMPLATES BY PRODUCT ---
export const PURCHASE_STEPS: Record<string, string[]> = {
  'Phone': [
    'Check trade-in value for their current device (any condition!)',
    'Select the right plan (Experience Beyond for max perks, Better Value for max savings)',
    'Apply eligible promotions and bill credits (verify stacking rules)',
    'Set up Protection 360 (explain AppleCare Services + JUMP! benefits)',
    'Port their number from current carrier (need Account # and Transfer PIN)',
    'Transfer contacts, apps, and data in-store (use T-Mobile Content Transfer app)',
    'Set up T-Life app and show them the T-Mobile Tuesdays perks',
    'Walk through their first bill expectations (proration + activation fees)',
  ],
  'Home Internet': [
    'Check address for T-Mobile Home Internet availability (verify signal strength)',
    'Select tier: Rely ($35-50), Amplified ($45-60), or All-In ($55-70)',
    'Apply bundle discount if they have a T-Mobile voice line ($15/month off)',
    'Schedule gateway delivery or in-store pickup (show them the device)',
    'Remind them about the 15-day test drive — full refund if not satisfied',
    'Explain the 5-Year Price Guarantee — their rate won\'t change',
    'Help them download the T-Mobile Internet app for setup',
  ],
  'BTS': [
    'Determine device type: tablet, watch, or laptop',
    'Add connected device line ($5/month on Experience Beyond/Better Value)',
    'Select device and apply promotions (Galaxy Watch8 is FREE right now)',
    'Set up cellular activation on the device (DIGITS for watches)',
    'Consider Protection 360 for the new device (theft/loss is huge for portables)',
    'Show them how to use the device without their phone nearby',
  ],
  'IOT': [
    'Identify tracking needs: vehicle, pet, child, luggage',
    'Select SyncUP device (SyncUP Tracker or SyncUP DRIVE)',
    'Add data plan and activate in-store ($5/month for most)',
    'Download SyncUP app and configure tracking (set up geofences)',
    'Show them the real-time map and history features',
    'Explain the difference between cellular GPS and Bluetooth (AirTag)',
  ],
  'No Specific Product': [
    'Understand their needs through discovery questions',
    'Recommend the right product and plan combination',
    'Walk through pricing and available promotions',
    'Process any trade-ins if applicable',
    'Set up their account and devices',
    'Explain the Un-carrier difference (Price Lock, No Contracts, Perks)',
  ],
};

// --- CLOSING TECHNIQUES BY INTENT ---
export const CLOSING_TECHNIQUES: Record<string, string[]> = {
  'exploring': [
    '"No pressure at all — but let me save this quote for you so you have the numbers when you\'re ready."',
    '"Here\'s my card. When you\'re ready, ask for me and I\'ll get you set up fast."',
    '"These promos are running for a limited time — just want you to have the info."',
  ],
  'ready to buy': [
    '"Let\'s do it! I can get you out of here in about 20 minutes with everything set up."',
    '"I\'ll get this rolling — do you want to start with the trade-in or the new device?"',
  ],
  'upgrade / add a line': [
    '"Let me show you the side-by-side. Once you see what you\'re actually getting vs paying, the decision usually makes itself."',
    '"Want me to pull up your current carrier\'s plan next to ours? I think you\'ll be surprised."',
    '"The 5-Year Price Guarantee is a big one — no other carrier offers that."',
  ],
  'order support': [
    '"Let me get this resolved for you real quick. While I\'m pulling this up — do you have a watch or tablet on your account yet?"',
    '"Got it taken care of! Hey, quick question before I let you go — do you have anything protecting your car or tracking your luggage when you travel?"',
    '"All set! By the way, the Galaxy Watch8 is free right now with a wearable line — $5/month. Want me to show you?"',
  ],
  'tech support': [
    '"Glad we got that fixed! While I have you — are you using any kind of smartwatch or tracker? We have some solid deals right now."',
    '"All good now! Quick thought — if you\'re having device issues, P360 protection would cover stuff like this going forward. Plus it comes with JUMP! upgrades."',
    '"That should do it! Hey, have you thought about a tablet? iPads are basically free with a new line right now, and it\'s only $5/month for the line."',
  ],
  'account support': [
    '"Got that taken care of! While you\'re here — I noticed you don\'t have any connected devices. A watch line is only $5/month and the Galaxy Watch8 is free right now."',
    '"All set on the account! Quick question — do you have kids? The SyncUP Tracker is great for peace of mind, and it\'s way more reliable than AirTag."',
    '"You\'re all good! Before I let you go — have you looked at Home Internet? With your voice line you\'d get it for $30/month, no contract."',
  ],
};

// --- CPNI COMPLIANCE REMINDERS ---
export const CPNI_REMINDERS = [
  'Never access, share, or reference any customer\'s specific account information (CPNI) without proper authentication',
  'Do NOT mention specific data usage, call records, or billing details in sales conversations',
  'Sales scripts should use generic context only — no real customer names, numbers, or account details',
  'When discussing competitor comparisons, use publicly available plan information only',
  'Promos involving bill credits should clearly state "with qualifying plan and trade-in" — don\'t guarantee specific credit amounts without verifying eligibility',
  'All Experience plan prices are BEFORE taxes and fees — communicate this clearly to avoid billing surprises',
];

// --- TRANSITION PHRASES ---
export const TRANSITIONS = {
  discoveryToValue: [
    '"Based on what you\'re telling me, I think I know exactly what would work..."',
    '"So here\'s what I\'m thinking — and tell me if I\'m off base..."',
    '"That actually lines up perfectly with what we\'ve got right now..."',
  ],
  valueToClose: [
    '"So what do you think — does that sound like something that would work for you?"',
    '"Want me to pull up the numbers and show you what it would look like?"',
    '"I can get this set up for you right now if you\'re feeling good about it."',
  ],
  objectionToPivot: [
    '"I totally understand that concern. Let me address that..."',
    '"That\'s actually a really common question. Here\'s the deal..."',
    '"Fair point — and here\'s why a lot of people who felt the same way ended up switching..."',
  ],
};

// --- SERVICE-TO-SALES PIVOTS ---
// When the customer calls for support, these are natural pivots to BTS/IOT add-ons
// which are the highest-commission items you can add to an existing account.
export const SERVICE_TO_SALES: Record<string, { timing: string; pivots: string[] }> = {
  'order support': {
    timing: 'AFTER resolving their issue. They came for help — earn trust first, then transition naturally.',
    pivots: [
      '"By the way, while I have you — do you have a watch or tablet on your account? It\'s only $5/month to add one, and we\'ve got some free device deals running."',
      '"Quick question before you go — do you have kids or pets? Our SyncUP Trackers use real GPS on our network. Way better than Bluetooth trackers."',
      '"I see you\'ve got [X] lines — have you thought about Home Internet? With your account it\'d be $30/month, no contract, and you can test drive it free for 15 days."',
      '"The Galaxy Watch8 is FREE right now with a new wearable line. You\'d never miss a call or text even when your phone\'s in the other room."',
    ],
  },
  'tech support': {
    timing: 'AFTER fixing their issue. They\'re grateful — this is your best window for a natural pivot.',
    pivots: [
      '"Now that we\'ve got that sorted — have you thought about Protection 360? It covers everything: drops, theft, screen repairs at $0. Would\'ve covered this too."',
      '"Glad that\'s working! Hey, do you have a smartwatch? If your phone ever acts up again, a watch with cellular means you\'re still connected."',
      '"All fixed! While I have you — we\'ve got iPads basically free with a new tablet line. It\'s $5/month for the line. Great backup if your phone ever goes down again."',
      '"If you travel at all, the SyncUP Tracker on your luggage is a game-changer. Real-time GPS, not just Bluetooth. Uses our network nationwide."',
    ],
  },
  'account support': {
    timing: 'AFTER handling their account question. Review their account for add-on opportunities while you\'re in there.',
    pivots: [
      '"I see you\'ve got [X] phone lines but no connected devices. Did you know you can add a watch line for just $5/month? The Galaxy Watch8 is free right now."',
      '"Looking at your account — you\'re on Experience Beyond, which means you get connected device lines at $5/month. That\'s the cheapest way to add a tablet or watch."',
      '"Have you looked at SyncUP DRIVE? It plugs into your car\'s OBD port and gives you GPS tracking, trip history, and vehicle diagnostics. Great for families with teen drivers."',
      '"I notice you don\'t have Home Internet. With your voice line it\'s $35/month for Rely — no contract, 5-Year Price Guarantee. What are you paying your ISP right now?"',
    ],
  },
};

// --- BTS/IOT VALUE PROPOSITIONS (for injection into any support or sales flow) ---
export const BTS_IOT_VALUE_PROPS = {
  watches: {
    headline: 'Smartwatches — $5/mo line on Experience Beyond/Better Value ($10–$15/mo on other plans), FREE devices',
    props: [
      'Galaxy Watch8 (40mm): FREE via 36 monthly bill credits with new wearable line',
      'Apple Watch SE 3: $200 off with new line — Always-On display, great for fitness',
      'Apple Watch Series 11: BOGO $300 off second watch — great for couples/families',
      'Leave your phone behind: cellular watch handles calls, texts, music, payments',
      'Kids safety: Galaxy Watch for Kids lets them call/text without needing a phone',
      'Health tracking: heart rate, sleep, exercise, fall detection (Series 11/Ultra 3)',
    ],
  },
  tablets: {
    headline: 'Tablets — $5/month line, massive device deals',
    props: [
      'iPad (A16): up to $400 off with new tablet line',
      'Galaxy Tab A11+ 5G: FREE with any S26 purchase + tablet line',
      'Galaxy Tab S10 FE 5G: $275-300 off with new line',
      'Cellular tablets work anywhere — no Wi-Fi hunting at coffee shops, airports, or in the car',
      '30GB high-speed data per month on Experience Beyond connected lines',
      'Perfect for kids in the car, remote work, school, or as a second screen',
    ],
  },
  trackers: {
    headline: 'SyncUP Trackers — real GPS, not Bluetooth',
    props: [
      'SyncUP Tracker: real-time GPS on T-Mobile\'s nationwide network — works EVERYWHERE, not just near other phones like AirTag',
      'SyncUP DRIVE: plugs into car OBD port — GPS tracking, trip history, vehicle health, speed alerts for teen drivers',
      'Track kids (backpack), pets (collar), luggage (suitcase), cars (glove box), valuables',
      'T-Mobile network coverage means it works in rural areas where Bluetooth trackers don\'t',
      'App-based: real-time map, history, geofence alerts when something leaves an area',
    ],
  },
  hotspot: {
    headline: 'TCL LINKPORT — 5G hotspot for under $50',
    props: [
      'First commercial 5G RedCap device — USB-C, works with any laptop/tablet',
      'Promo price under $50 (retail $96)',
      'Data plan: $5/month on Experience Beyond',
      'Perfect for remote workers, students, or anyone who needs reliable internet on the go',
      'Works on Windows, macOS, iPadOS, Android, Linux',
    ],
  },
  commissionTip: 'BTS/IOT add-ons are your best commission items on support calls. The customer is already on the line, already trusts you because you helped them. One connected device line = recurring revenue at minimal effort. Target: pitch at least ONE add-on per support call.',
};

// --- HELPER: GET RAPPORT TIPS ---
export function getRapportTips(age: SalesContext['age']) {
  return RAPPORT_BY_AGE[age] || RAPPORT_BY_AGE['Not Specified'];
}

// --- HELPER: GET SERVICE-TO-SALES PIVOTS ---
export function getServiceToSalesPivots(intent: SalesContext['purchaseIntent']) {
  return SERVICE_TO_SALES[intent] || null;
}
