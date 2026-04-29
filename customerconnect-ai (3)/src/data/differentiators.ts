export interface Differentiator {
  category: string;
  headline: string;
  details: string[];
  competitorComparison?: string;
}

export const DIFFERENTIATORS: Differentiator[] = [
  {
    category: 'Network',
    headline: "America's fastest and largest 5G — 309 Mbps median",
    details: [
      'Ookla Speedtest Awards H2 2025: Best Mobile Network, Best 5G Network, Fastest Network, Most Consistent Quality Network',
      'Median 5G download: 309.41 Mbps — first U.S. carrier to break 300 Mbps. Roughly 2x faster than AT&T (158 Mbps), ahead of Verizon (~214 Mbps)',
      'Opensignal: 12 of 16 categories including reliability, consistent quality, and 5G coverage',
      'JD Power: #1 in customer satisfaction (631/1000) and #1 in network quality in 5 of 6 U.S. regions for first time ever',
      '5G covers 325+ million Americans across 1.9 million square miles — more 5G land area than AT&T and Verizon COMBINED (T-Mobile ~54% of U.S. land vs AT&T 43% and Verizon 13%)',
      'Extended Range 5G (600MHz low-band) for broad nationwide coverage + Ultra Capacity 5G (2.5GHz mid-band) for fastest speeds to 305+ million people',
    ],
  },
  {
    category: 'T-Satellite',
    headline: 'T-Satellite with Starlink — connectivity where no cell tower reaches',
    details: [
      'Commercially launched July 23, 2025 after 1.8 million user beta',
      '650+ Starlink Direct-to-Cell satellites in low Earth orbit covering 500,000+ square miles with zero cell tower coverage',
      'Currently supports: text messaging, location sharing, picture messaging (select Android), satellite-ready apps (WhatsApp voice/video, AllTrails, weather, maps, social media)',
      'Works on 60+ existing phone models (iPhone 13+, Samsung Galaxy S21+, Google Pixel 9+) with no special equipment',
      'Free 911 texting available to anyone regardless of carrier',
      'Pricing: FREE on Experience Beyond. $10/month add-on for other T-Mobile plans. $20/month for non-T-Mobile customers',
      'Mid-2027: Starlink V2 satellites via SpaceX Starship will deliver "5G speeds from space" with 100x data density — full voice, streaming, browsing',
    ],
    competitorComparison: 'Verizon has AST SpaceMobile + Skylo (text only, slower to launch). AT&T has AST SpaceMobile partnership (limited scale). T-Mobile was FIRST to market.',
  },
  {
    category: 'Price Guarantee',
    headline: '5-Year Price Guarantee — longest in wireless',
    details: [
      'Locks in regular monthly rate plan price for talk, text, and 5G data for 5 years from account activation',
      'Applies to all Experience plans, Home Internet plans, and qualifying prepaid plans',
      'Clock does NOT restart when adding lines or switching between Experience plans',
    ],
    competitorComparison: 'AT&T has NO price guarantee and has raised legacy plan prices 4+ times in 2 years ($10-20/month increases). Verizon offers only a 3-year price lock on myPlan.',
  },
  {
    category: 'International',
    headline: 'Free international roaming in 215+ countries — the $672 savings talking point',
    details: [
      'Experience Beyond: 15GB high-speed international data + 30GB in Mexico/Canada',
      'Experience More: 5GB international + 15GB Mexico/Canada',
      'After high-speed data: unlimited data continues at 256 Kbps',
      'Voice calls: $0.25/minute; Wi-Fi calls to US/Mexico/Canada are free',
      'THE COMPARISON: Family of 4 on a 2-week European vacation: $0 with T-Mobile vs $672 with AT&T or Verizon ($12/day TravelPass/International Day Pass)',
    ],
  },
  {
    category: 'Streaming',
    headline: 'Streaming perks worth ~$30/month included',
    details: [
      'Experience Beyond: Netflix Standard with Ads ($7.99), Hulu with Ads ($9.99), Apple TV+ at $3/mo (T-Mobile covers $9.99 of $12.99)',
      'Experience More: Netflix + Apple TV+ discount (no Hulu)',
      'Additional: MLB.TV free annual subscription, 4 months free Pandora Premium, 6 months free SiriusXM for new customers',
    ],
    competitorComparison: 'AT&T includes ZERO streaming perks on any plan (March 2026). Verizon charges $10/month per perk as add-ons. T-Mobile is the only major carrier including premium streaming at no extra cost.',
  },
  {
    category: 'In-Flight Wi-Fi',
    headline: 'Free in-flight Wi-Fi on major airlines',
    details: [
      'Delta Air Lines (Delta Sync Wi-Fi for SkyMiles members)',
      'Southwest Airlines (Rapid Rewards members, 800+ aircraft — largest domestic carrier with free Wi-Fi on every flight)',
      'Alaska Airlines (Atmos Rewards members, Starlink-powered ultra-fast speeds rolling out fleetwide 2026)',
      'Hawaiian Airlines (Atmos Rewards)',
      'United Airlines (select flights for eligible T-Mobile customers)',
      'Full streaming capability — browse, stream, work, message. No other carrier sponsors free Wi-Fi at this scale.',
    ],
  },
  {
    category: 'Perks',
    headline: 'T-Mobile Tuesdays, AAA, Scam Shield, and more',
    details: [
      'T-Mobile Tuesdays: Weekly freebies via T-Life app — free food/drinks, $5 movie tickets, 33% off Adidas, Shell gas 10¢/gallon off Tuesdays / 5¢ off other days, 10% restaurant cash back. Est. weekly value: $20-50/month',
      'AAA membership: 1 year of AAA Basic/Classic free (up to $96/year value) — 24/7 roadside assistance, towing, lockout service',
      'Scam Shield: Free for all customers — Scam ID, Scam Block, full Caller ID, AI-powered, updated every 6 minutes',
      'Magenta Status from Day 1: hotel/rental car discounts, 15% off Hilton stays, concert/event access. No earning required',
      'No annual service contracts: leave anytime with no ETF. "You stay because you want to, not because you\'re locked in"',
      'Trade-in program: Accepts devices in ANY condition. Flagship trade-ins yield up to $800-1,100+ per device in bill credits',
      'Family Freedom: up to $800/line via virtual prepaid Mastercard to cover remaining device balances when switching from AT&T/Verizon',
      '$35 device connection charge applies on all phone purchases',
    ],
  },
];
