export interface CompetitorPlan {
  name: string;
  singleLine: string;
  fourLinePer?: string;
  priorityData: string;
  hotspot: string;
  streamingPerks: string;
  notes?: string;
}

export interface Competitor {
  name: string;
  plans: CompetitorPlan[];
  vulnerabilities: string[];
  counterPoints: string[];
  fees?: string[];
  salesPositioning?: string;
}

export const COMPETITORS: Record<string, Competitor> = {
  'AT&T': {
    name: 'AT&T',
    plans: [
      { name: 'Value 2.0', singleLine: '$50', fourLinePer: '~$30', priorityData: '5GB', hotspot: '3GB', streamingPerks: 'None' },
      { name: 'Extra 2.0', singleLine: '$70', fourLinePer: '~$40', priorityData: '100GB', hotspot: '50GB', streamingPerks: 'None' },
      { name: 'Premium 2.0', singleLine: '$90', fourLinePer: '~$55', priorityData: 'Unlimited', hotspot: '100GB', streamingPerks: 'None' },
    ],
    vulnerabilities: [
      'Repeated price increases on existing customers — raising legacy plan prices AGAIN in April 2026 ($10-20/month increases). At least the 4th increase in ~2 years. Postpaid churn hit 0.98% in Q4 2025, up 13 basis points YoY',
      'Zero streaming perks on ANY plan as of March 2026. No Netflix, no Max/HBO, no Apple TV+, no Disney+. T-Mobile includes ~$30/month in streaming value',
      '$12/day international roaming (International Day Pass). $20/day on cruise ships. Family of 4 on a 2-week European trip pays $672 extra. T-Mobile: $0',
      'No price guarantee — no equivalent to T-Mobile\'s 5-Year Price Guarantee',
      'Lowest customer satisfaction: ACSI score 74/100 (vs T-Mobile 76). JD Power Customer Care: 806 (lowest of Big Three; T-Mobile #1 at 837)',
      'Slower 5G: Ookla median 5G download 158.56 Mbps vs T-Mobile\'s 309 Mbps',
      '$35 activation/upgrade fee + $3.99/line/month Administrative & Regulatory Cost Recovery Fee',
    ],
    counterPoints: [
      'AT&T claims "largest wireless network" covering 300,000 more square miles than T-Mobile',
      'RootMetrics H1 2025 awarded AT&T Best Overall Performance',
      'Strong rural LTE footprint',
    ],
    fees: ['$35 activation/upgrade fee', '$3.99/line/month Administrative & Regulatory Cost Recovery Fee'],
  },

  'Verizon': {
    name: 'Verizon',
    plans: [
      { name: 'Unlimited Welcome', singleLine: '~$65', fourLinePer: '~$25-30', priorityData: 'None (always deprioritized)', hotspot: 'None', streamingPerks: 'None included', notes: 'No 5G UWB access' },
      { name: 'Unlimited Plus', singleLine: '~$80', fourLinePer: '~$45', priorityData: 'Unlimited', hotspot: '30GB', streamingPerks: '$10/mo per perk add-on', notes: '5G UWB access' },
      { name: 'Unlimited Ultimate', singleLine: '~$90', fourLinePer: '~$55', priorityData: 'Unlimited', hotspot: '200GB', streamingPerks: '$10/mo per perk add-on', notes: '5G UWB access' },
    ],
    vulnerabilities: [
      'Typically the most expensive carrier — single-line Ultimate at ~$90 + ~$15 in fees = ~$105/month actual cost',
      'Streaming perks are PAID, not included: Netflix & Max ($10/mo), Disney Bundle ($10/mo), Apple One ($15/mo), YouTube Premium ($10/mo). Customer wanting Netflix + Disney pays $20/month extra on top of plan price. T-Mobile includes ~$30/month streaming free',
      'Welcome plan is severely limited: no premium data (always deprioritized), no hotspot, no 5G Ultra Wideband, SD video only — at $65/month',
      '$12/day TravelPass international roaming. Only Ultimate includes international data. Family of 4 on 2-week trip: $672 extra. T-Mobile: $0',
      'mmWave 5G strategy limitations: 5G Ultra Wideband covers only ~150 metro area pockets. T-Mobile\'s mid-band 5G covers 2x more square miles than any competitor',
      'Hidden fee controversy: $3.78/line/month Administrative & Telco Recovery Charge grew 8x from original $0.40. Led to $100 million class action settlement',
      '3-year price lock only (vs T-Mobile\'s 5-year)',
    ],
    counterPoints: [
      'RootMetrics H2 2025: Best Overall Performance, Reliability, and Best 5G Experience',
      'Traditionally strong rural 4G coverage (Ookla: 29.9% best coverage score vs T-Mobile 22.9%)',
      'New CEO Dan Schulman pledged to focus more on value',
    ],
    fees: ['$35 activation/upgrade fee', '$3.78/line/month Administrative & Telco Recovery Charge'],
  },

  'Xfinity': {
    name: 'Xfinity Mobile',
    plans: [
      { name: 'By the Gig (1GB)', singleLine: '$20', priorityData: 'N/A', hotspot: 'N/A', streamingPerks: 'None' },
      { name: 'Unlimited', singleLine: '$40', fourLinePer: '$20', priorityData: '30GB', hotspot: 'N/A', streamingPerks: 'None' },
      { name: 'Unlimited Plus', singleLine: '$50', fourLinePer: '$30', priorityData: '50GB', hotspot: '15GB', streamingPerks: 'None' },
    ],
    vulnerabilities: [
      'HARD REQUIREMENT: Must have active Xfinity Internet subscription — cannot sign up without one',
      'Uses Verizon network as MVNO — all data deprioritized behind Verizon direct customers',
      'Only available in Comcast service areas',
      '$25 activation fee per new line. Taxes & fees extra',
    ],
    counterPoints: ['Cheap multi-line pricing if you already have Xfinity Internet'],
    salesPositioning: 'T-Mobile wins: No ISP bundling requirement, available nationwide, priority data on own network, better perks (Netflix, Apple TV+), nationwide retail stores, better international roaming, better 5G.',
  },

  'US Cellular': {
    name: 'US Cellular',
    plans: [
      { name: 'Everyday', singleLine: '~$50', fourLinePer: '~$30-35', priorityData: 'Varies', hotspot: 'Limited', streamingPerks: 'None' },
      { name: 'Even Better', singleLine: '~$70', fourLinePer: '~$45', priorityData: 'Higher-tier priority', hotspot: '15GB+', streamingPerks: 'None' },
    ],
    vulnerabilities: [
      'Migration pressure is the biggest opening right now — customers being moved over are in a rare window where they can still grab aggressive new-customer style deals instead of waiting to be repriced later',
      'No meaningful streaming bundle value compared with T-Mobile\'s included Netflix, Hulu, and Apple TV+ savings',
      'Smaller device lineup and ecosystem depth than T-Mobile, especially for watches, tablets, and connected add-ons',
      'Network scale and nationwide 5G story do not match T-Mobile\'s footprint, especially once customers travel outside legacy US Cellular markets',
    ],
    counterPoints: [
      'Long-time local-store relationships still matter to some rural customers',
      'Some customers associate the brand with dependable regional coverage in legacy markets',
    ],
    salesPositioning: 'T-Mobile wins: migration deals, broader 5G footprint, richer streaming perks, stronger device promos, and deeper ecosystem add-ons. Position the move as upgrading the whole experience, not just changing the logo on the bill.',
  },

  'Spectrum': {
    name: 'Spectrum Mobile',
    plans: [
      { name: 'Unlimited', singleLine: '$30/line', priorityData: '30GB', hotspot: 'N/A', streamingPerks: 'None', notes: 'Hard throttle to 1 Mbps after threshold' },
      { name: 'Unlimited Plus', singleLine: '$40/line', priorityData: '50GB', hotspot: 'N/A', streamingPerks: 'None', notes: 'Hard throttle to 1 Mbps after threshold' },
    ],
    vulnerabilities: [
      'Requires Spectrum Internet + AutoPay',
      'Uses Verizon network as MVNO',
      'Only available in Charter/Spectrum service areas',
      'Hard throttle to 1 Mbps after data threshold (not just deprioritization)',
      '$20 activation fee',
    ],
    counterPoints: ['Taxes & fees are included in plan price'],
    salesPositioning: 'T-Mobile wins: No ISP requirement, available nationwide, no hard throttle to 1 Mbps, priority data on own network, better perks, better international, more device choices.',
  },

  'Prepaid (Mint, Boost, etc.)': {
    name: 'Prepaid Carriers',
    plans: [],
    vulnerabilities: [],
    counterPoints: [],
    salesPositioning: 'See individual carrier entries below for Mint, Boost, Visible, Cricket, and Metro.',
  },

  'Cricket': {
    name: 'Cricket Wireless (AT&T subsidiary)',
    plans: [
      { name: 'Sensible 10GB', singleLine: '$30', priorityData: '10GB', hotspot: 'None', streamingPerks: 'None' },
      { name: 'Select Unlimited', singleLine: '$35', priorityData: 'Unlimited (deprioritized)', hotspot: 'None', streamingPerks: 'None' },
      { name: 'Smart Unlimited', singleLine: '$45', priorityData: 'Unlimited', hotspot: 'None', streamingPerks: 'None' },
      { name: 'Supreme Unlimited', singleLine: '$55', priorityData: 'Unlimited', hotspot: '50GB', streamingPerks: 'None' },
    ],
    vulnerabilities: [
      'Uses AT&T network but ALL data deprioritized behind AT&T postpaid',
      '6-month device lock after activation',
      'SD video default',
    ],
    counterPoints: ['Select Unlimited 4 lines for $100/month ($25/line)', 'Taxes & fees included'],
    salesPositioning: 'T-Mobile wins: Priority data on own network, better 5G speeds, HD/4K video, better hotspot, superior international roaming, better device deals and financing, no device lock period.',
  },

  'Metro': {
    name: 'Metro by T-Mobile',
    plans: [
      { name: '$25 BYOD', singleLine: '$25', priorityData: '35GB', hotspot: 'None', streamingPerks: 'None' },
      { name: 'Starter Plus', singleLine: '$40', fourLinePer: '$25', priorityData: '35GB', hotspot: 'None', streamingPerks: 'None' },
      { name: 'Flex Unlimited', singleLine: '$50', fourLinePer: '$30', priorityData: '50GB', hotspot: '15GB', streamingPerks: 'None' },
      { name: 'Flex Unlimited Plus', singleLine: '$60', fourLinePer: '$40', priorityData: '70GB', hotspot: '25GB', streamingPerks: '$60 plan includes Amazon Prime and Google One 100GB' },
    ],
    vulnerabilities: [
      'Same T-Mobile network but at LOWER priority — speeds explicitly reduced versus T-Mobile postpaid during congestion',
      'No equipment installment plans (must buy phone outright)',
      'Limited flagship device selection',
    ],
    counterPoints: ['Taxes & fees included', 'Budget-friendly for price-sensitive customers'],
    salesPositioning: '"Metro is great value if budget is the absolute #1 priority. But for the full T-Mobile experience — priority speeds, Netflix and streaming bundles, the best device deals with $0 down financing, international roaming in 215+ countries, and full in-store support — postpaid is the way to go."',
  },

  'Visible': {
    name: 'Visible (Verizon digital brand)',
    plans: [
      { name: 'Visible', singleLine: '$25', priorityData: 'None (all deprioritized)', hotspot: '5 Mbps cap', streamingPerks: 'None' },
      { name: 'Visible+', singleLine: '$35', priorityData: '50GB', hotspot: '10 Mbps cap', streamingPerks: 'None' },
      { name: 'Visible+ Pro', singleLine: '$45', priorityData: 'Unlimited', hotspot: '15 Mbps cap', streamingPerks: 'None' },
    ],
    vulnerabilities: [
      'Single-line accounts only — no true family plans',
      'Digital-only (no stores, chat-only support)',
      'Video capped at 480p SD on base plan',
      'Hotspot hard-capped at 5-15 Mbps (vs T-Mobile 50GB+ at full speed)',
    ],
    counterPoints: ['Very cheap single-line pricing', 'Annual payment discounts available'],
    salesPositioning: 'T-Mobile wins: In-store support, family plan savings, priority data on own network, better device deals with EIP financing, no video caps on premium plans, better hotspot speeds, better international, streaming perks.',
  },

  'Boost': {
    name: 'Boost Mobile (EchoStar/DISH)',
    plans: [
      { name: 'Unlimited', singleLine: '$25', priorityData: '30GB', hotspot: 'N/A', streamingPerks: 'None', notes: 'Hard throttle to 512 Kbps' },
      { name: 'Unlimited+', singleLine: '$50', priorityData: '40GB', hotspot: 'N/A', streamingPerks: 'None', notes: 'Hard throttle to 512 Kbps' },
      { name: 'Unlimited Premium', singleLine: '$60', priorityData: '50GB', hotspot: 'N/A', streamingPerks: 'None', notes: 'Hard throttle to 512 Kbps' },
    ],
    vulnerabilities: [
      'Network in transition: EchoStar shut down its own network Nov 2025, sold spectrum to AT&T for ~$23B. Now operates as "hybrid MNO" on AT&T\'s network with T-Mobile as secondary. Long-term reliability uncertain',
      'Hard throttle to 512 Kbps after data threshold (not just deprioritization)',
      'Taxes/fees not included on $25 and $50 plans',
    ],
    counterPoints: ['Very cheap base plan at $25/month'],
    salesPositioning: 'T-Mobile wins: Established, stable #1 network vs uncertain transitional carrier. No hard throttle. Better device deals and financing. Superior 5G coverage. Better perks and international roaming.',
  },

  'Mint': {
    name: 'Mint Mobile (T-Mobile subsidiary)',
    plans: [
      { name: '5GB', singleLine: '$15/mo ($180 upfront)', priorityData: '5GB', hotspot: 'Included', streamingPerks: 'None' },
      { name: '15GB', singleLine: '$20/mo ($240 upfront)', priorityData: '15GB', hotspot: 'Included', streamingPerks: 'None' },
      { name: '20GB', singleLine: '$25/mo ($300 upfront)', priorityData: '20GB', hotspot: 'Included', streamingPerks: 'None' },
      { name: 'Unlimited', singleLine: '$30/mo ($360 upfront)', priorityData: 'Unlimited', hotspot: '10GB', streamingPerks: 'None' },
    ],
    vulnerabilities: [
      'Must prepay 3-12 months upfront (no monthly billing)',
      'Uses T-Mobile network but deprioritized behind postpaid',
      'Digital-only (no stores, online chat 5am-7pm PT)',
      'No device financing',
      'No streaming perks',
    ],
    counterPoints: ['Very cheap per-month pricing', 'Uses same T-Mobile network coverage', 'Current promo: first 3 months of any plan for $15/month'],
    salesPositioning: '"Mint uses our network, so the coverage is the same. But with T-Mobile postpaid, you get priority speeds, in-store support, Netflix and streaming bundles worth $30+ a month, flagship phones on Us with trade-in, 215+ country international roaming, and no upfront payment commitment. When you add up what you don\'t get with Mint, T-Mobile postpaid delivers far more value per dollar."',
  },
};
