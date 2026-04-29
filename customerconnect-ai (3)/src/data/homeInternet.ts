export interface HomeInternetPlan {
  name: string;
  standalonePrice: number;
  withVoiceLine: number;
  typicalDownload: string;
  typicalUpload: string;
  gateway: string;
  features: string[];
  includedPerks: string[];
  bestFor: string;
}

export const HOME_INTERNET_PLANS: HomeInternetPlan[] = [
  {
    name: 'Rely',
    standalonePrice: 50,
    withVoiceLine: 35,
    typicalDownload: '87-318 Mbps',
    typicalUpload: '14-56 Mbps',
    gateway: '4G LTE / 5G gateway',
    features: ['Unlimited data', 'No annual contract', '5-Year Price Guarantee', 'No data caps', 'No equipment fees'],
    includedPerks: [],
    bestFor: 'Basic browsing, email, streaming on 1-2 devices. Great entry point for price-sensitive customers or rural areas.',
  },
  {
    name: 'Amplified',
    standalonePrice: 60,
    withVoiceLine: 45,
    typicalDownload: '87-318 Mbps',
    typicalUpload: '14-56 Mbps',
    gateway: 'Wi-Fi 7 premium gateway',
    features: ['Unlimited data', 'No annual contract', '5-Year Price Guarantee', 'Wi-Fi 7 gateway', 'No data caps', 'No equipment fees'],
    includedPerks: [],
    bestFor: 'Families with multiple devices, gaming, 4K streaming. The sweet spot for most households.',
  },
  {
    name: 'All-In',
    standalonePrice: 70,
    withVoiceLine: 55,
    typicalDownload: '133-415 Mbps',
    typicalUpload: '12-56 Mbps',
    gateway: 'Wi-Fi 7 premium gateway',
    features: [
      'Unlimited data', 'No annual contract', '5-Year Price Guarantee',
      'Wi-Fi 7 gateway', 'Mesh Wi-Fi extender included',
      'Whole-home coverage', '24/7 expert tech support',
      'Gateway upgrade at year 3', 'No data caps', 'No equipment fees',
    ],
    includedPerks: ['Hulu (w/ ads) on Us', 'Paramount+ Essential on Us', 'T-Mobile Advanced Cyber Security'],
    bestFor: 'Customers who want the full package — streaming perks, mesh coverage, and premium support. Best value when you add up the included perks.',
  },
];

export const HOME_INTERNET_BUNDLE_DISCOUNT = '$15/month bundle discount when combined with any T-Mobile postpaid voice line. Current limited-time promo adds extra $5/month off (making it $20 total off). All-In streaming and security perks deliver over $480/year in added value.';

export const OTHER_HOME_PRODUCTS = {
  away: {
    name: 'T-Mobile Home Internet AWAY',
    price: 160,
    description: 'For RVs, campers, and mobile use — unlimited data, 50+ device connections, stays connected in motion, works on nationwide 5G/4G LTE',
  },
  backup: {
    name: 'Home Internet Backup',
    price: 10,
    description: 'Designed as ISP outage protection. Available for $10/month for Better Value customers. Battery pack (Nimble CHAMP) available for $50 with activation',
  },
  fiber: {
    description: 'T-Mobile Fiber available in select areas — 300 Mbps to 2 Gbps symmetrical, $10/month discount with voice line on 1 GIG+ tiers',
  },
  testDrive: {
    description: 'Cancel within 15 days of activation, submit redemption within 30 days of cancellation, receive full refund via bill credit (allow 2 billing cycles). Must return gateway in good condition. Maximum 1 per account.',
  },
};

// ---- COMPREHENSIVE LEARN TAB DATA ----

export const HINT_SELLING_FRAMEWORK = {
  everyCallReminder: 'Check the address for Home Internet availability on EVERY call. It takes 10 seconds and it\'s one of the highest-value adds in your toolkit.',

  openingLines: [
    '"Before we wrap up — let me check your address real quick. A lot of people don\'t realize T-Mobile has home internet now."',
    '"Have you heard about T-Mobile Home Internet? Let me see if it\'s available at your address — it takes two seconds."',
    '"While I\'ve got your account up — are you happy with your current internet provider? We might be able to save you money."',
    '"Quick question before I let you go — who do you use for internet at home? We\'ve been rolling out home internet and it\'s been a game-changer for a lot of customers."',
  ],

  objectionHandlers: [
    {
      objection: '"I already have internet"',
      response: 'That\'s perfect — most people do. But are you paying $60, $70, $80 a month? Our All-In plan is $50 with your phone line and includes Hulu and Paramount+. Plus no contract, no data caps, no equipment fees. Most people save $20-40/month switching.',
    },
    {
      objection: '"Is it fast enough?"',
      response: 'Great question. Our typical speeds are 100-405 Mbps on Amplified and All-In. That handles 4K streaming, gaming, video calls, and a full house of devices. And there\'s no data cap — stream all you want. Plus we have a 15-day test drive — try it risk-free.',
    },
    {
      objection: '"I need it for gaming"',
      response: 'Totally get it. Our Wi-Fi 7 gateway on Amplified and All-In has the latest tech for low-latency connections. Speeds typically hit 100-405 Mbps. Not gonna lie — if you need sub-10ms latency for competitive esports, fiber is better. But for 95% of gamers, this works great and costs way less.',
    },
    {
      objection: '"What about the 15-day test drive?"',
      response: 'Love that you know about it. Yeah — set it up, use it for 15 days, and if it doesn\'t work for your home, cancel and get a full refund. No risk. You just return the gateway in good condition. Most people who try it keep it.',
    },
    {
      objection: '"I\'m in a contract with my ISP"',
      response: 'No worries — check when it ends and set a reminder. Or some people run both for the overlap month, then cancel the old one. We also have the $300 virtual prepaid card rebate right now which can help cover any early termination fees.',
    },
    {
      objection: '"It\'s not available at my address"',
      response: 'Coverage is expanding area by area — your address hasn\'t been opened up yet. But I can note your account so when it does open, you\'ll be first to know. In the meantime, if you\'re on a premium phone plan, remember your phone data is unlimited premium — you can hotspot or cast to your TV.',
    },
  ],

  vsCompetitors: [
    {
      competitor: 'Comcast / Xfinity',
      tmobileAdvantages: [
        'No annual contract (Xfinity typically requires 1-2 year agreement)',
        'No data caps (Xfinity caps at 1.2TB unless you pay $30/mo extra for unlimited)',
        'No equipment rental fees (Xfinity charges $14/mo for gateway)',
        '5-Year Price Guarantee (Xfinity promos expire and rates jump)',
        'No hidden fees — the price you see is the price you pay',
      ],
    },
    {
      competitor: 'AT&T Internet',
      tmobileAdvantages: [
        'No annual contract',
        'No equipment fees (AT&T charges $10/mo for gateway rental)',
        'Simpler plans — 3 tiers vs AT&T\'s confusing bundle requirements',
        '5-Year Price Guarantee vs AT&T promo pricing that expires',
        'No technician visit required — self-install in minutes',
      ],
    },
    {
      competitor: 'Spectrum',
      tmobileAdvantages: [
        'Cheaper at every tier ($30-50 with voice line vs Spectrum\'s $50-90)',
        'No contract (same as Spectrum, but we price-lock for 5 years)',
        'Streaming perks included on All-In (Hulu + Paramount+ vs nothing)',
        'No equipment fees (Spectrum charges $5/mo for Wi-Fi)',
        'Mesh Wi-Fi extender included on All-In (Spectrum charges extra)',
      ],
    },
    {
      competitor: 'Verizon 5G Home',
      tmobileAdvantages: [
        'Broader 5G coverage area — T-Mobile\'s 5G reaches more addresses',
        'All-In includes streaming perks and mesh extender',
        '5-Year Price Guarantee (Verizon can change prices anytime)',
        'No phone plan required for standalone pricing (Verizon pushes bundles)',
        'Test drive with full refund option',
      ],
    },
  ],

  currentPromos: {
    rebate: 'Up to $300 virtual prepaid card rebate for new customers',
    monthOnUs: '"Month On Us" promo — first month free',
    freeGateway: 'Gateway included at no extra cost on all plans',
    testDrive: '15-day risk-free test drive — full refund if not satisfied',
  },
};

export const FIBER_INFO = {
  status: 'Coming Soon to Sales',
  overview: 'T-Mobile Fiber is available in select metro areas. We cannot sell it yet on our channel, but it\'s good to know about so you can set expectations with customers.',
  plans: [
    { name: '300 Mbps', price: 'TBD', speeds: '300 Mbps symmetrical (same upload and download)', notes: 'Entry-level fiber. Great for most households.' },
    { name: '500 Mbps', price: 'TBD', speeds: '500 Mbps symmetrical', notes: 'Power users and work-from-home.' },
    { name: '1 GIG', price: 'TBD', speeds: '1 Gbps symmetrical', notes: '$10/mo discount with voice line. Heavy gaming, streaming, smart home.' },
    { name: '2 GIG', price: 'TBD', speeds: '2 Gbps symmetrical', notes: '$10/mo discount with voice line. Maximum performance.' },
  ],
  keyDifferences: [
    'Fiber = wired connection, so latency is much lower (great for competitive gaming)',
    'Symmetrical speeds — upload = download (huge for content creators, video calls, cloud backups)',
    'More consistent speeds — not affected by congestion like wireless',
    'Requires professional installation (unlike wireless self-install)',
    'Only available in select metro areas currently',
  ],
  whatToTellCustomers: 'If a customer asks about fiber: "T-Mobile Fiber is rolling out in select areas. I can\'t set it up for you today, but I can check if wireless Home Internet is available at your address — most people can\'t tell the difference for everyday use, and it\'s available right now."',
};

export const HINT_QUICK_FACTS = [
  'T-Mobile Home Internet is the fastest-growing segment of the business — leadership is watching these numbers closely',
  'No data caps on any tier — stream, game, and work from home without worrying about overages',
  'Self-install takes under 15 minutes — no technician visit, no appointment scheduling',
  'The gateway plugs in and connects to T-Mobile\'s 5G/4G network — no cables, no drilling holes',
  '5-Year Price Guarantee means the price won\'t go up. Most ISPs raise rates after the promo period ends',
  'With a voice line discount, All-In is $55/mo and includes $480+/year in streaming perks',
  'The 15-day test drive means zero risk for the customer — if it doesn\'t work, full refund',
  'Average customer saves $20-40/month compared to cable internet',
  'Wi-Fi 7 gateway on Amplified and All-In is cutting-edge — customers probably don\'t have Wi-Fi 7 on their current router',
  'Home Internet AWAY ($160) is a separate product for RVs and travel — don\'t confuse with regular HINT',
];
