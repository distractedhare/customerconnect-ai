/**
 * Regional talking points, competitive landscape, and network data.
 * Used for real-time recommendations as reps tap through the map.
 */

export type RegionKey =
  | 'New England' | 'Mid-Atlantic' | 'South Atlantic' | 'Southeast'
  | 'Deep South' | 'Mid-South' | 'Great Lakes' | 'Upper Midwest'
  | 'Great Plains' | 'Texas & Oklahoma' | 'Desert Southwest'
  | 'Rocky Mountains' | 'Pacific Northwest' | 'California'
  | 'Alaska' | 'Hawaii';

export interface RegionalTalkingPoints {
  /** One-liner network edge for the region */
  networkEdge: string;
  /** Top competitive threats in this region */
  competitorThreats: { carrier: string; threat: string; counter: string }[];
  /** Region-specific promos or angles */
  localAngles: string[];
  /** Home Internet availability note */
  homeInternetNote: string;
  /** Quick stat to drop in conversation */
  quickStat: string;
}

export const REGIONAL_DATA: Record<RegionKey, RegionalTalkingPoints> = {
  'New England': {
    networkEdge: 'T-Mobile 5G covers 97% of the I-95 corridor from Boston to Hartford — Verizon still has gaps in rural VT and ME.',
    competitorThreats: [
      { carrier: 'Xfinity', threat: 'Bundling mobile with Comcast internet at $30/line', counter: 'No contract lock-in with T-Mobile, and our 5G Home Internet replaces their cable at $50/mo.' },
      { carrier: 'Verizon', threat: 'Strong brand loyalty in CT and MA suburbs', counter: 'Show the price comparison — Verizon\'s Unlimited Ultimate is $90/line vs Go5G Plus at $55/line with 3+ lines.' },
    ],
    localAngles: [
      'College towns (Boston, New Haven, Providence) — student plans and family add-a-line deals crush it here.',
      'Harsh winters = high device damage. Push P360 hard — "New England weather eats phones."',
    ],
    homeInternetNote: 'Strong HINT availability across metro Boston, Providence, and Hartford. Rural VT/NH expanding.',
    quickStat: '#1 in 5G speed across MA and CT metro areas — 2x faster than AT&T.',
  },
  'Mid-Atlantic': {
    networkEdge: 'NYC, Philly, and NJ have ultra-capacity 5G (mmWave + mid-band). T-Mobile is the #1 network in the NYC metro.',
    competitorThreats: [
      { carrier: 'Verizon', threat: 'Legacy stronghold — "everyone has Verizon" mentality in NJ', counter: 'Price-match the plan and show the 5G speed test. T-Mobile is faster AND cheaper in every NJ county.' },
      { carrier: 'Spectrum', threat: 'Aggressive $29.99/line mobile bundling with cable', counter: 'Spectrum runs on Verizon\'s network with data caps. T-Mobile is the actual network, not a reseller.' },
    ],
    localAngles: [
      'Commuter corridor (NJ Transit, LIRR, Metro-North) — "Your phone works underground now" with 5G in Penn Station and Grand Central.',
      'High cost of living = price sensitivity. Lead with the 5-Year Price Guarantee.',
    ],
    homeInternetNote: 'HINT is a cable-killer here. Most customers pay $80+/mo for Optimum or Xfinity — HINT at $50 is an easy win.',
    quickStat: 'T-Mobile serves more customers in the NYC metro than any other carrier.',
  },
  'South Atlantic': {
    networkEdge: 'Massive 5G buildout across DC, Virginia, and MD. T-Mobile covers 98% of the DC metro with mid-band 5G.',
    competitorThreats: [
      { carrier: 'Verizon', threat: 'Government/military workers often get corporate discounts', counter: 'T-Mobile has government employee discounts too — plus our plans are still cheaper after their discount.' },
      { carrier: 'AT&T', threat: 'FirstNet presence near military bases', counter: 'FirstNet is for first responders only. Regular AT&T plans are overpriced — show the comparison.' },
    ],
    localAngles: [
      'Heavy government workforce in DC/MD/VA — lean into reliability and security messaging.',
      'College market in WV and DE — affordable multi-line plans for families.',
    ],
    homeInternetNote: 'HINT expanding rapidly in suburban MD and VA. Great alternative to Cox and Xfinity.',
    quickStat: '#1 in 5G coverage across the DC-Baltimore corridor.',
  },
  'Southeast': {
    networkEdge: 'T-Mobile dominates 5G in Atlanta, Charlotte, Raleigh, and the Florida coast. Extended range 5G reaches rural areas competitors skip.',
    competitorThreats: [
      { carrier: 'AT&T', threat: 'Deep roots in the Southeast — "always had AT&T" families', counter: 'AT&T just raised prices again. Show the 5-Year Price Guarantee — their loyalty costs them money.' },
      { carrier: 'Spectrum', threat: 'Expanding mobile aggressively in FL and NC with cable bundles', counter: 'Spectrum Mobile deprioritizes data after 20GB. T-Mobile Go5G Plus is truly unlimited.' },
    ],
    localAngles: [
      'Retiree migration to FL — senior-friendly plans and easy device setup are key.',
      'Hurricane season resilience — T-Mobile activated emergency service in every FL hurricane since 2017.',
    ],
    homeInternetNote: 'Florida is a top HINT market. Many customers switching from overpriced Spectrum and AT&T Fiber.',
    quickStat: 'Fastest 5G in Atlanta — 4x the median speed of AT&T.',
  },
  'Deep South': {
    networkEdge: 'Extended Range 5G covers areas where AT&T and Verizon only have 4G. Strong rural coverage across AL, MS, LA.',
    competitorThreats: [
      { carrier: 'AT&T', threat: 'Dominant legacy carrier — many multi-generational AT&T families', counter: 'AT&T doesn\'t lock your price. T-Mobile does — 5-Year Price Guarantee means what they pay today is what they pay in 2031.' },
      { carrier: 'US Cellular', threat: 'Competes in rural areas with localized plans', counter: 'US Cellular roams on T-Mobile anyway. Why not just get the real thing at a better price?' },
    ],
    localAngles: [
      'Rural coverage matters here — show the coverage map and let them see T-Mobile reaches their town.',
      'Cost-conscious market — lead with value and multi-line savings.',
    ],
    homeInternetNote: 'HINT is a lifeline in rural areas with no cable option. Check every address.',
    quickStat: 'T-Mobile covers 95% of AL, MS, and LA with 5G — up from 70% just two years ago.',
  },
  'Mid-South': {
    networkEdge: 'Strong mid-band 5G in Nashville, Memphis, and Louisville. Expanding coverage in rural TN, KY, and AR.',
    competitorThreats: [
      { carrier: 'AT&T', threat: 'AT&T is headquartered culture here — strong brand presence', counter: 'AT&T charges $10/mo more per line on average. Show the side-by-side.' },
      { carrier: 'Verizon', threat: 'Business accounts in Nashville tech corridor', counter: 'T-Mobile for Business has better pricing and the same reliability. Network is #1 in Nashville.' },
    ],
    localAngles: [
      'Nashville boom — tons of transplants switching carriers. Perfect time to capture new customers.',
      'Music and entertainment angle — T-Mobile Tuesday perks and streaming bundles resonate here.',
    ],
    homeInternetNote: 'Strong HINT availability in Nashville and Memphis metros. Rural AR and KY expanding.',
    quickStat: 'Nashville is a top-10 T-Mobile 5G city — 400+ Mbps median speeds.',
  },
  'Great Lakes': {
    networkEdge: 'Ultra-capacity 5G across Chicago, Detroit, Cleveland, Milwaukee, and Indianapolis. Best indoor coverage in the Midwest.',
    competitorThreats: [
      { carrier: 'Verizon', threat: 'Strong enterprise presence in auto industry (Detroit)', counter: 'T-Mobile for Business is growing fastest in MI. Better coverage on factory floors with mid-band 5G.' },
      { carrier: 'AT&T', threat: 'Cricket is aggressive in price-sensitive neighborhoods', counter: 'Essentials plan at $26.25/line (4 lines) beats Cricket and you get T-Mobile\'s full network, not a subset.' },
    ],
    localAngles: [
      'Sports obsessed — lean into streaming perks (Netflix, Apple TV+) for cord-cutting fans.',
      'Weather extremes = high device damage. P360 is a must-pitch in Great Lakes states.',
    ],
    homeInternetNote: 'Chicago, Detroit, and Milwaukee are top HINT markets. Big savings vs Comcast and AT&T Fiber.',
    quickStat: '#1 5G network in Chicago — faster than both Verizon and AT&T combined.',
  },
  'Upper Midwest': {
    networkEdge: 'Sprint merger spectrum deployment transformed coverage in MN, IA, and MO. 5G now reaches smaller cities and towns.',
    competitorThreats: [
      { carrier: 'US Cellular', threat: 'Strong rural presence, especially in IA', counter: 'T-Mobile now covers 96% of Iowa with 5G. US Cellular can\'t match our speeds or device selection.' },
      { carrier: 'Verizon', threat: 'Corporate accounts in Minneapolis tech scene', counter: 'T-Mobile has more 5G coverage in the Twin Cities metro than Verizon — and it\'s faster.' },
    ],
    localAngles: [
      'Farm country — SyncUP DRIVE and IoT trackers are a natural fit for rural customers.',
      'Value-driven market — lead with multi-line family savings and no surprise fees.',
    ],
    homeInternetNote: 'HINT is huge in areas with limited ISP options. Many rural MN/IA/MO homes have only one cable option.',
    quickStat: 'T-Mobile 5G covers 96% of Minnesota — fastest network in the Twin Cities.',
  },
  'Great Plains': {
    networkEdge: 'Extended Range 5G blankets ND, SD, NE, and KS. Coverage improvements from Sprint merger are massive here.',
    competitorThreats: [
      { carrier: 'Verizon', threat: 'Perceived as "the reliable one" in rural areas', counter: 'Pull up the coverage map — T-Mobile 5G reaches areas Verizon still only has 3G. Times have changed.' },
      { carrier: 'US Cellular', threat: 'Local brand loyalty', counter: 'US Cellular roams on T-Mobile for most of their coverage. Cut out the middleman.' },
    ],
    localAngles: [
      'Agriculture is king — IoT, SyncUP Trackers for equipment, and mobile hotspots for field work.',
      'Long driving distances — emphasize highway coverage and in-car connectivity.',
    ],
    homeInternetNote: 'HINT may be the ONLY broadband option in many rural areas. Check every single address.',
    quickStat: 'T-Mobile added 15,000+ sq miles of new coverage across KS and NE in the last year.',
  },
  'Texas & Oklahoma': {
    networkEdge: 'Texas is T-Mobile\'s fastest-growing market. Ultra-capacity 5G in DFW, Houston, Austin, San Antonio, and OKC.',
    competitorThreats: [
      { carrier: 'AT&T', threat: 'Headquartered in Dallas — deep corporate and consumer loyalty', counter: 'AT&T\'s unlimited plans cost $15-20/mo more per line. Texas-sized savings with T-Mobile.' },
      { carrier: 'Spectrum', threat: 'Pushing mobile in TX cable markets', counter: 'Spectrum deprioritizes at 20GB and has no 5G. T-Mobile is the real network.' },
    ],
    localAngles: [
      'Massive growth market — transplants from CA and other states are already T-Mobile customers. Help them add lines.',
      'Hispanic market is huge — mention bilingual support and family plan value.',
    ],
    homeInternetNote: 'TX is a top-3 HINT state. Huge demand in suburbs where cable is expensive.',
    quickStat: 'Fastest 5G in Austin and Houston — T-Mobile leads in 4 of the 5 biggest TX metros.',
  },
  'Desert Southwest': {
    networkEdge: 'Strong 5G in Phoenix, Las Vegas, and Albuquerque. Extended Range covers Arizona and Nevada highways.',
    competitorThreats: [
      { carrier: 'Cox', threat: 'Bundling mobile with cable in AZ', counter: 'Cox Mobile runs on AT&T with 20GB deprioritization. T-Mobile is unlimited, full-speed, no games.' },
      { carrier: 'Verizon', threat: 'Retail presence in Phoenix suburbs', counter: 'Verizon\'s coverage drops off fast outside Phoenix. T-Mobile 5G covers the drive to Tucson, Flagstaff, and Sedona.' },
    ],
    localAngles: [
      'Snowbird season (Oct-Apr) — temporary residents from the Midwest need a reliable network without contracts.',
      'Extreme heat = device damage. P360 covers heat-related battery issues too.',
    ],
    homeInternetNote: 'HINT is strong in Phoenix and Las Vegas metros — cheaper than Cox and CenturyLink.',
    quickStat: '#1 5G network in Phoenix — T-Mobile covers 99% of Maricopa County.',
  },
  'Rocky Mountains': {
    networkEdge: 'Massive post-Sprint coverage expansion. 5G now reaches ski towns, national parks, and mountain passes.',
    competitorThreats: [
      { carrier: 'Verizon', threat: 'Perceived best for mountain/outdoor coverage', counter: 'T-Mobile now covers Yellowstone, Grand Teton, and most ski resorts. Check the map — the gap is gone.' },
      { carrier: 'AT&T', threat: 'FirstNet deployment in wildfire-prone areas', counter: 'T-Mobile deploys COWs (Cells on Wheels) for every major natural disaster. We show up.' },
    ],
    localAngles: [
      'Outdoor lifestyle — wearables (Apple Watch Ultra, Galaxy Watch) with cellular for hiking and skiing.',
      'Remote work is massive here — HINT lets people work from mountain towns without fiber.',
    ],
    homeInternetNote: 'HINT is critical for remote workers in CO, UT, MT, ID, WY. Often the best broadband available.',
    quickStat: 'T-Mobile 5G now covers 90% of Colorado — including Aspen, Vail, and Steamboat Springs.',
  },
  'Pacific Northwest': {
    networkEdge: 'T-Mobile HQ market — Seattle and Portland have the densest 5G coverage in the country.',
    competitorThreats: [
      { carrier: 'Xfinity', threat: 'Comcast is the dominant ISP and bundles aggressively', counter: 'HINT at $50/mo is half the price of most Xfinity plans. And no data caps, no contracts.' },
      { carrier: 'Verizon', threat: 'Competes on business accounts in Seattle tech sector', counter: 'T-Mobile was born here. Our network investment in WA and OR is unmatched — we live here.' },
    ],
    localAngles: [
      'Tech-savvy customers — lead with features, not just price. UC 5G speeds and device ecosystem.',
      'Rain and outdoor conditions year-round — P360 and rugged accessories are natural fits.',
    ],
    homeInternetNote: 'Seattle and Portland are flagship HINT cities. Fastest HINT speeds in the country.',
    quickStat: 'T-Mobile HQ is in Bellevue, WA — the PNW is our home turf and it shows.',
  },
  'California': {
    networkEdge: 'Largest state by customers. Ultra-capacity 5G covers LA, SF, San Diego, and the Bay Area. Extended Range reaches the Central Valley.',
    competitorThreats: [
      { carrier: 'AT&T', threat: 'Heavy in SoCal — entertainment industry ties', counter: 'T-Mobile is #1 in LA county by subscriber count. Better speeds, better price, better perks.' },
      { carrier: 'Verizon', threat: 'Strong in Bay Area tech companies', counter: 'Show the 5G speed test in SF — T-Mobile is 3x faster on mid-band. Tech workers appreciate data.' },
    ],
    localAngles: [
      'Diverse market — bilingual support and inclusive messaging resonate across CA demographics.',
      'Wildfire season — T-Mobile emergency response and network resilience are real talking points.',
    ],
    homeInternetNote: 'CA is the #1 HINT market. Huge savings vs Spectrum, AT&T, and Comcast — many pay $100+/mo for cable.',
    quickStat: 'T-Mobile is the #1 carrier in California by subscriber count — 15M+ customers.',
  },
  'Alaska': {
    networkEdge: 'Partnership with GCI provides extended coverage. T-Mobile 5G covers Anchorage, Fairbanks, and Juneau.',
    competitorThreats: [
      { carrier: 'GCI', threat: 'Dominant local carrier with bundled services', counter: 'GCI plans are expensive — T-Mobile offers more data at a lower price with nationwide roaming included.' },
      { carrier: 'AT&T', threat: 'Strong FirstNet presence for state agencies', counter: 'Regular AT&T plans in Alaska are $20+/mo more expensive than T-Mobile. FirstNet is first-responder only.' },
    ],
    localAngles: [
      'Extreme remoteness — HINT can be the only broadband option in many areas. Always check the address.',
      'Seasonal workers and military — flexible no-contract plans are a big draw.',
    ],
    homeInternetNote: 'Limited but growing HINT availability in Anchorage metro. Check every address.',
    quickStat: 'T-Mobile 5G covers 85% of Alaska\'s population — up from 50% two years ago.',
  },
  'Hawaii': {
    networkEdge: 'T-Mobile has the best 5G coverage across all major islands — Oahu, Maui, Big Island, and Kauai.',
    competitorThreats: [
      { carrier: 'AT&T', threat: 'Strong presence with military families at Pearl Harbor and Schofield', counter: 'T-Mobile\'s military discount plus 5G coverage across all islands beats AT&T on both price and coverage.' },
      { carrier: 'Spectrum', threat: 'Expanding mobile in HI with cable bundles', counter: 'Spectrum has no 5G and deprioritizes at 20GB. T-Mobile gives you the full network, full speed.' },
    ],
    localAngles: [
      'Tourism-heavy — mention free international roaming and Wi-Fi calling for visitors adding lines.',
      'Island life = salt air and water damage. P360 is essential — "The ocean eats phones."',
    ],
    homeInternetNote: 'HINT available across Oahu and expanding to neighbor islands. Cheaper than Hawaiian Telcom.',
    quickStat: 'T-Mobile is the only carrier with 5G on all four major Hawaiian islands.',
  },
};

/** Get talking points for a specific state within a region */
export function getStateTalkingPoints(region: RegionKey, state: string): string | null {
  const stateSpecific: Record<string, string> = {
    // Major states with notable specifics
    'California': 'CA is our #1 state by subscriber count. Lead with network leadership.',
    'Texas': 'Fastest-growing T-Mobile market. Huge transplant population already on T-Mobile.',
    'Florida': 'Retiree + hurricane angle. P360 and HINT are easy wins.',
    'New York': 'NYC metro is our densest 5G market. Underground coverage is a differentiator.',
    'Illinois': 'Chicago is a top-5 5G city. #1 in speed vs Verizon and AT&T.',
    'Washington': 'T-Mobile HQ state. We have more towers per capita here than anywhere.',
    'Georgia': 'Atlanta is a T-Mobile stronghold — fastest 5G in the Southeast.',
    'Ohio': 'Cleveland, Columbus, Cincinnati all have UC 5G. Strong HINT potential.',
    'Michigan': 'Detroit auto industry going cellular for IoT — business opportunity.',
    'Pennsylvania': 'Philadelphia UC 5G is transforming the market. Pittsburgh expanding fast.',
    'Arizona': 'Phoenix is a top-5 HINT city. Snowbird season doubles the opportunity.',
    'Colorado': 'Denver + mountain towns. Remote worker HINT demand is massive.',
    'Nevada': 'Las Vegas is a top 5G tourism market. Coverage on the Strip is unmatched.',
    'Oregon': 'Portland has flagship 5G coverage. Tech-savvy early adopters.',
    'Tennessee': 'Nashville boom market — transplants switching carriers daily.',
    'North Carolina': 'Research Triangle is a tech growth market. Charlotte is expanding fast.',
    'Virginia': 'DC suburbs and military bases — government employee discounts.',
    'Minnesota': 'Twin Cities is a top 5G market. Strong HINT in suburban areas.',
    'Missouri': 'KC and STL both have UC 5G. Sprint customers are now fully on T-Mobile network.',
    'Indiana': 'Indianapolis UC 5G deployment complete. Racing community loves connected devices.',
    'Massachusetts': 'Boston is a top college market. Student plans drive volume.',
    'Hawaii': 'Only carrier with 5G on all major islands. Military and tourism angles.',
    'Alaska': 'Anchorage and Fairbanks covered. HINT is a lifeline in remote areas.',
  };
  return stateSpecific[state] || null;
}
