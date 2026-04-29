export type QuizCategory = 'sales' | 'products' | 'tmobile' | 'competitors';

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 1 | 2 | 3;
}

const SALES_QUESTIONS: QuizQuestion[] = [
  {
    id: 'sq-1', category: 'sales', difficulty: 1,
    question: 'What\'s the strongest opener on an inbound sales call?',
    options: ['Jump straight to the promo', 'Ask what brought them in today', 'Start listing plan options', 'Tell them about the latest device'],
    correctIndex: 1,
    explanation: 'Discovery first. Understanding why they called shapes the entire pitch.',
  },
  {
    id: 'sq-2', category: 'sales', difficulty: 1,
    question: 'When should you check credit on a new customer?',
    options: ['After you close', 'Only if they ask', 'Early — before the offer takes shape', 'Never, it scares people off'],
    correctIndex: 2,
    explanation: 'Checking credit early lets you build an offer that actually works. No surprises at the finish.',
  },
  {
    id: 'sq-3', category: 'sales', difficulty: 2,
    question: 'A customer says "I need to think about it." Best response?',
    options: ['Give them your number and let them go', 'Push harder on urgency', 'Ask "What part are you still weighing?"', 'Offer a bigger discount'],
    correctIndex: 2,
    explanation: '"Think about it" usually hides a specific concern. One focused question can reopen the close.',
  },
  {
    id: 'sq-4', category: 'sales', difficulty: 2,
    question: 'Which close technique uses "Would you prefer the 128GB or 256GB?" instead of "Want to buy this?"',
    options: ['Assumptive close', 'Choice close', 'Urgency close', 'Summary close'],
    correctIndex: 1,
    explanation: 'A choice close removes the yes/no question entirely. Both answers move the sale forward.',
  },
  {
    id: 'sq-5', category: 'sales', difficulty: 1,
    question: 'The AutoPay discount should be mentioned:',
    options: ['Only if the customer asks', 'When quoting the monthly total', 'After they sign up', 'Never — it reduces revenue'],
    correctIndex: 1,
    explanation: 'AutoPay is part of the real monthly price. Include it from the start so the number is honest.',
  },
  {
    id: 'sq-6', category: 'sales', difficulty: 3,
    question: 'What\'s the "silence technique" in closing?',
    options: ['Muting your mic to hide background noise', 'Asking for the sale, then waiting without talking', 'Whispering the price so it sounds smaller', 'Not mentioning competitor names'],
    correctIndex: 1,
    explanation: 'After you ask for the order, silence puts the decision in their hands. Most reps fill the gap and lose the moment.',
  },
  {
    id: 'sq-7', category: 'sales', difficulty: 2,
    question: 'A customer is angry about their bill. What do you do first?',
    options: ['Immediately start pitching upgrades', 'Acknowledge the frustration and solve the billing issue', 'Transfer to billing', 'Offer a free month'],
    correctIndex: 1,
    explanation: 'Fix the fire first, earn trust, then you have permission to open a sales path.',
  },
  {
    id: 'sq-8', category: 'sales', difficulty: 1,
    question: 'Protection 360 should be positioned as:',
    options: ['An optional add-on if they want it', 'Part of the phone setup — essential from day one', 'Only for expensive phones', 'Something to add later'],
    correctIndex: 1,
    explanation: 'When P360 is framed as "part of the setup" rather than an upsell, attach rates go way up.',
  },
  {
    id: 'sq-9', category: 'sales', difficulty: 2,
    question: 'The 3+ accessory bundle works because:',
    options: ['Bigger basket size', 'Customers feel they get a deal', 'It solves the "what else do I need?" anxiety', 'All of the above'],
    correctIndex: 3,
    explanation: 'Bundling accessories into one recommendation removes decision fatigue and lifts the average order.',
  },
  {
    id: 'sq-10', category: 'sales', difficulty: 3,
    question: 'When a customer says "Verizon offered me a better deal," the best reframe is:',
    options: ['Say Verizon is more expensive overall', 'Match their offer dollar-for-dollar', 'Ask specifically what was offered and compare total value', 'Trash-talk the competitor'],
    correctIndex: 2,
    explanation: 'Get the details. Most "better deals" fall apart when you compare total monthly cost, perks, and trade-in value side by side.',
  },
  {
    id: 'sq-11', category: 'sales', difficulty: 3,
    question: 'A customer calls about a billing issue but mentions they also need a new phone. You should:',
    options: ['Handle the phone first — it\'s the bigger sale', 'Fix the billing issue completely, then transition naturally to the phone need', 'Transfer to billing and start fresh with the phone', 'Ignore the billing issue and pitch the phone'],
    correctIndex: 1,
    explanation: 'Trust first, sell second. Solving their real problem earns permission to recommend. "Now that\'s sorted — tell me about the phone situation."',
  },
  {
    id: 'sq-12', category: 'sales', difficulty: 3,
    question: 'A customer has pushed back on price, coverage, AND timing in the same call. After handling all three, the strongest close is:',
    options: ['Summarize all three solutions and ask "Does this cover everything?"', 'Give them a deadline', 'Lower the price', 'Ask if they have any more concerns'],
    correctIndex: 0,
    explanation: 'After handling multiple objections, a summary close ties everything together. "We addressed the pricing, confirmed your coverage, and locked the timing — ready to move forward?"',
  },
  {
    id: 'sq-13', category: 'sales', difficulty: 3,
    question: 'A customer on a $160/mo plan with 2 lines asks if they can save money without losing anything. The best approach is:',
    options: ['Tell them their plan is already good', 'Analyze their actual usage (data, hotspot, streaming) and match a right-sized tier', 'Suggest the cheapest plan available', 'Offer autopay and call it done'],
    correctIndex: 1,
    explanation: 'Right-sizing builds trust. If they are on Beyond but never use premium perks, moving to More saves money and earns loyalty. That loyalty turns into referrals and add-lines.',
  },
  {
    id: 'sq-14', category: 'sales', difficulty: 2,
    question: 'A warm transfer should include:',
    options: ['Just the customer\'s name', 'The customer\'s name, why they called, what you already covered, and what they need next', 'A request for the next rep to "help this customer"', 'Nothing — let the customer re-explain'],
    correctIndex: 1,
    explanation: 'A real warm transfer hands off context, not just a person. The customer should never have to repeat their story.',
  },
];

const PRODUCT_QUESTIONS: QuizQuestion[] = [
  {
    id: 'pq-1', category: 'products', difficulty: 1,
    question: 'What\'s the key selling point of Galaxy AI on the S25?',
    options: ['It makes the phone faster', 'It provides real-time shortcuts like live translate and photo cleanup', 'It replaces Google Assistant', 'It only works on Wi-Fi'],
    correctIndex: 1,
    explanation: 'Galaxy AI shines when positioned as everyday shortcuts — not tech jargon.',
  },
  {
    id: 'pq-2', category: 'products', difficulty: 1,
    question: 'Home Internet All-In pricing starts at:',
    options: ['$35/mo', '$45/mo', '$55/mo', '$65/mo'],
    correctIndex: 2,
    explanation: '$55/mo with bundled perks makes HINT competitive against most cable providers.',
  },
  {
    id: 'pq-3', category: 'products', difficulty: 2,
    question: 'The 15-day Home Internet test drive exists to:',
    options: ['Give customers free internet', 'Lower the risk so hesitant customers try it', 'Meet a regulatory requirement', 'Test the network in their area'],
    correctIndex: 1,
    explanation: 'The test drive removes commitment fear. It turns "maybe" into "let me try."',
  },
  {
    id: 'pq-4', category: 'products', difficulty: 1,
    question: 'Experience More vs. Beyond — the key difference is:',
    options: ['Speed', 'Premium perks and streaming bundles', 'Coverage area', 'Phone compatibility'],
    correctIndex: 1,
    explanation: 'Beyond adds premium streaming and perks. More is strong everyday value. Match to the customer.',
  },
  {
    id: 'pq-5', category: 'products', difficulty: 2,
    question: 'SyncUP Tracker is best positioned for:',
    options: ['Replacing a phone', 'Tracking pets, luggage, or kids\' backpacks', 'Improving internet speed', 'Backup storage'],
    correctIndex: 1,
    explanation: 'At $5/mo for peace of mind, the tracker sells itself when you match it to a real worry.',
  },
  {
    id: 'pq-6', category: 'products', difficulty: 2,
    question: 'When a customer is choosing between iPhone and Samsung, the best approach is:',
    options: ['Always recommend the more expensive one', 'Ask what apps and ecosystem they already use', 'Pick whichever has the best promo', 'Let them decide on their own'],
    correctIndex: 1,
    explanation: 'Ecosystem loyalty drives satisfaction. Find out if they\'re Apple, Google, or Samsung first.',
  },
  {
    id: 'pq-7', category: 'products', difficulty: 3,
    question: 'The mesh Wi-Fi extender for HINT is most valuable when:',
    options: ['The customer has a small apartment', 'The customer has dead zones in a larger home', 'The customer only uses one device', 'It\'s always included free'],
    correctIndex: 1,
    explanation: 'Dead zones kill the HINT experience. The extender is the objection-killer for big homes.',
  },
  {
    id: 'pq-8', category: 'products', difficulty: 1,
    question: 'What\'s the strongest Pixel camera selling point?',
    options: ['Megapixel count', 'Low-light photos and computational photography', 'It shoots video in 8K', 'Interchangeable lenses'],
    correctIndex: 1,
    explanation: 'Pixel wins on photo quality in real conditions — low light, moving subjects, natural colors.',
  },
  {
    id: 'pq-9', category: 'products', difficulty: 2,
    question: 'A kids\' watch line sells best when you position it as:',
    options: ['A cheaper alternative to a phone', 'GPS + messaging safety without giving a kid a full phone', 'A fitness tracker for children', 'A toy'],
    correctIndex: 1,
    explanation: 'Parents want to reach their kids safely. The watch solves that without the smartphone worry.',
  },
  {
    id: 'pq-10', category: 'products', difficulty: 1,
    question: 'Trade-in value should be brought up:',
    options: ['Only at the very end', 'When it helps soften the monthly device payment', 'Only for iPhones', 'Never — it complicates things'],
    correctIndex: 1,
    explanation: 'Trade-in can be the difference between "too expensive" and "actually, that works."',
  },
];

const TMOBILE_QUESTIONS: QuizQuestion[] = [
  {
    id: 'tq-1', category: 'tmobile', difficulty: 2,
    question: 'What is T-Mobile\'s "Un-carrier" philosophy about?',
    options: ['Being the cheapest option', 'Eliminating industry pain points that frustrate customers', 'Only selling unlocked phones', 'No stores, online only'],
    correctIndex: 1,
    explanation: 'Un-carrier means leading by removing friction — no contracts, no overages, transparent pricing. Use this when customers assume all carriers are the same.',
  },
  {
    id: 'tq-2', category: 'tmobile', difficulty: 2,
    question: 'What does "Price Lock" guarantee mean?',
    options: ['Your phone price never changes', 'T-Mobile won\'t raise your plan price, or they\'ll pay your final bill', 'You\'re locked into a contract', 'Accessories are price-matched'],
    correctIndex: 1,
    explanation: 'Price Lock is a powerful trust-builder. If they raise the price, they pay your last month\'s bill to let you leave. Lead with this against "what if prices go up?" objections.',
  },
  {
    id: 'tq-3', category: 'tmobile', difficulty: 2,
    question: 'Which streaming perk comes bundled with select T-Mobile plans?',
    options: ['Disney+ Premium', 'Netflix Standard', 'Hulu No Ads', 'Apple TV+'],
    correctIndex: 3,
    explanation: 'Apple TV+ comes bundled with select plans. When a customer is weighing plan tiers, the streaming value tips the scale.',
  },
  {
    id: 'tq-4', category: 'tmobile', difficulty: 3,
    question: 'A customer says "I switched to T-Mobile last year and my bill is higher than promised." Your best move is:',
    options: ['Apologize and offer a credit', 'Pull up their account, verify the line items, and explain each charge clearly before discussing changes', 'Transfer to billing', 'Offer to switch their plan'],
    correctIndex: 1,
    explanation: 'Transparency first. Show them exactly what each line costs. Once they trust the numbers, you can optimize their plan and turn frustration into a save.',
  },
  {
    id: 'tq-5', category: 'tmobile', difficulty: 3,
    question: 'A family of 4 on Verizon pays $220/mo. They want equivalent coverage and are skeptical of T-Mobile. Your strongest opening move is:',
    options: ['Quote T-Mobile\'s cheapest plan', 'Run a side-by-side monthly comparison including all fees, AutoPay, and streaming perks', 'Promise better coverage', 'Offer a free phone to sweeten the deal'],
    correctIndex: 1,
    explanation: 'The side-by-side kills sticker shock. Include taxes, fees, AutoPay savings, and perk value. Let the math do the selling — never promise "better coverage" without proof.',
  },
  {
    id: 'tq-6', category: 'tmobile', difficulty: 3,
    question: 'T-Mobile Tuesdays gives free weekly perks. When is the best time to mention it in a sales call?',
    options: ['Right at the start as a hook', 'When justifying plan value against a competitor', 'Never — it\'s not a sales tool', 'Only when the customer asks about perks'],
    correctIndex: 1,
    explanation: 'T-Mobile Tuesdays adds unexpected value when a customer is comparing plans dollar-for-dollar. "Plus you get free stuff every week" can tip a close.',
  },
  {
    id: 'tq-7', category: 'tmobile', difficulty: 3,
    question: 'A customer has 3 lines, one is mid-device-payment on another carrier. What\'s your first move?',
    options: ['Tell them to come back when the device is paid off', 'Calculate the payoff vs. trade-in value and show if switching still saves money', 'Ignore the device payment', 'Offer to pay it off entirely'],
    correctIndex: 1,
    explanation: 'Do the math live. Often the trade-in value plus switching credits cover or exceed the remaining payments. Show the numbers, don\'t just promise.',
  },
  {
    id: 'tq-8', category: 'tmobile', difficulty: 2,
    question: 'The strongest way to use T-Mobile\'s 5G network advantage in a pitch is:',
    options: ['Say "we have the best 5G"', 'Explain mid-band coverage area is wider than Verizon\'s mmWave', 'Show a speed test', 'It\'s not relevant anymore'],
    correctIndex: 1,
    explanation: 'Specificity wins. "Our mid-band 5G covers more geography than Verizon\'s spotty mmWave" is provable and credible. Vague claims get dismissed.',
  },
  // --- NEW: T-Mobile plans ---
  {
    id: 'tq-9', category: 'tmobile', difficulty: 2,
    question: 'What is the key benefit of the Go5G Next plan for customers who love new phones?',
    options: ['It includes free international calls', 'Annual phone upgrade eligibility every 12 months', 'It\'s the cheapest unlimited plan', 'Free device insurance on all lines'],
    correctIndex: 1,
    explanation: 'Go5G Next lets eligible customers upgrade to the latest phone every 12 months. Lead with this for customers who always want the newest device.',
  },
  {
    id: 'tq-10', category: 'tmobile', difficulty: 2,
    question: 'A customer asks what\'s different between Go5G Plus and Go5G Next. The single biggest difference is:',
    options: ['Next is cheaper', 'Next includes annual upgrade eligibility; Plus does not', 'Plus has more hotspot data', 'They are the same plan'],
    correctIndex: 1,
    explanation: 'The upgrade cycle is the headline differentiator. If the customer loves getting new phones, Next pays for itself versus buying out a device separately.',
  },
  {
    id: 'tq-11', category: 'tmobile', difficulty: 1,
    question: 'How much does AutoPay save per line per month on most T-Mobile plans?',
    options: ['$3/line', '$5/line', '$7/line', '$10/line'],
    correctIndex: 1,
    explanation: '$5/line/month with AutoPay + eligible payment method. Always quote the post-AutoPay price — that\'s the real monthly cost.',
  },
  {
    id: 'tq-12', category: 'tmobile', difficulty: 1,
    question: 'T-Mobile\'s Essentials plan is best positioned for a customer who:',
    options: ['Travels internationally often', 'Wants streaming perks and hotspot', 'Needs affordable unlimited talk, text, and data with no frills', 'Wants the fastest possible speeds'],
    correctIndex: 2,
    explanation: 'Essentials is the entry-level unlimited offer. Great for budget-conscious customers who just need the basics — no need to oversell premium tiers here.',
  },
  {
    id: 'tq-13', category: 'tmobile', difficulty: 3,
    question: 'A customer on Essentials complains their video is blurry. What\'s the real reason and fix?',
    options: ['Their phone is broken', 'Essentials streams video at SD (480p); upgrading to Experience More or Beyond enables HD/4K', 'It\'s a network outage', 'Their data ran out'],
    correctIndex: 1,
    explanation: 'Essentials caps video at 480p. When video quality matters — Netflix, YouTube, gaming streams — Experience More or Beyond\'s HD/4K streaming is the upgrade story.',
  },
  {
    id: 'tq-14', category: 'tmobile', difficulty: 2,
    question: 'T-Mobile\'s international data roaming benefit on Go5G plans covers:',
    options: ['Only Mexico and Canada', 'Voice and text only in 215+ countries; data at 2G speeds', 'Full LTE speeds in 215+ countries at no extra charge', 'No international coverage at all'],
    correctIndex: 2,
    explanation: 'Go5G plans include unlimited full-speed data in 215+ countries. This is a huge differentiator against carriers who charge $10/day roaming. Lead with it for travelers.',
  },
  {
    id: 'tq-15', category: 'tmobile', difficulty: 2,
    question: 'The premium hotspot included in Go5G Beyond is:',
    options: ['5GB', '15GB', '50GB', '100GB'],
    correctIndex: 3,
    explanation: '100GB of premium hotspot data comes with Go5G Beyond — enough for a remote worker\'s laptop. This feature alone can justify the plan upgrade.',
  },
  // --- NEW: T-Mobile devices ---
  {
    id: 'tq-16', category: 'tmobile', difficulty: 1,
    question: 'What is the marquee camera feature that differentiates iPhone Pro models from standard iPhone?',
    options: ['A bigger battery', 'A Pro camera system with larger sensors, 5x telephoto, and ProRAW support', 'A faster chip', 'A ceramic back'],
    correctIndex: 1,
    explanation: 'The Pro camera system is the headline iPhone upgrade. When a photo-focused customer hesitates on price, show them the 5x zoom and computational photography — let the camera close the deal.',
  },
  {
    id: 'tq-17', category: 'tmobile', difficulty: 2,
    question: 'What makes the Samsung Galaxy S25 Ultra stand out among Android flagships?',
    options: ['It\'s the most affordable Galaxy', 'Built-in S Pen, Galaxy AI features, and a 200MP main camera', 'It\'s waterproof up to 100 meters', 'It uses a custom Google chip'],
    correctIndex: 1,
    explanation: 'S Pen + 200MP + Galaxy AI makes the Ultra uniquely productive. Pitch it to creatives and power users who want a phone that doubles as a note-taking and editing studio.',
  },
  {
    id: 'tq-18', category: 'tmobile', difficulty: 2,
    question: 'A customer is interested in a foldable phone. Which Samsung model folds in half like a compact mirror?',
    options: ['Galaxy Z Fold', 'Galaxy Z Flip', 'Galaxy S25 Edge', 'Galaxy Tab Fold'],
    correctIndex: 1,
    explanation: 'Galaxy Z Flip folds vertically — compact and stylish. Galaxy Z Fold opens to a tablet-sized display. Match the form factor to what they value: pocketability (Flip) vs productivity (Fold).',
  },
  {
    id: 'tq-19', category: 'tmobile', difficulty: 1,
    question: 'Google Pixel\'s biggest sales differentiator over other Android phones is:',
    options: ['The fastest processor', 'Pure Android experience + best-in-class computational photography', 'Comes with a free accessory', 'Foldable screen'],
    correctIndex: 1,
    explanation: 'Pixel owns the camera story in the Android world. Fast updates, natural colors, and features like Magic Eraser make it the go-to for customers leaving iPhone who love taking photos.',
  },
  {
    id: 'tq-20', category: 'tmobile', difficulty: 2,
    question: 'Apple Watch\'s strongest selling point for a fitness-focused customer is:',
    options: ['It can make calls without a phone nearby', 'Advanced health sensors: ECG, blood oxygen, crash detection, and fall detection', 'It runs Android apps', 'It has a 7-day battery'],
    correctIndex: 1,
    explanation: 'Health monitoring is the Apple Watch closer — ECG, blood oxygen, crash detection. Ask "do you exercise or have family who should wear one?" and the watch sells itself.',
  },
  {
    id: 'tq-21', category: 'tmobile', difficulty: 1,
    question: 'Samsung Galaxy Watch is positioned as the better choice for customers who own a:',
    options: ['iPhone', 'Android phone (especially Samsung)', 'Laptop', 'Smart TV'],
    correctIndex: 1,
    explanation: 'Galaxy Watch integrates deeply with Android and especially Samsung devices — sleep tracking syncs with Samsung Health, calls work seamlessly. For Samsung owners, it\'s the natural pairing.',
  },
  {
    id: 'tq-22', category: 'tmobile', difficulty: 2,
    question: 'When a customer asks "Why should I buy a tablet vs. just using my phone?" the best answer is:',
    options: ['You shouldn\'t — phones can do everything', 'Larger screen for video, reading, gaming, and video calls — plus a hotspot line adds family productivity without another full phone bill', 'Tablets are cheaper than phones', 'It works as a backup phone'],
    correctIndex: 1,
    explanation: 'Position tablets as the screen upgrade, not a phone replacement. Video streaming, remote learning, kid entertainment — a tablet on a $10-15/mo data line is easy math.',
  },
  // --- NEW: Objection handling ---
  {
    id: 'tq-23', category: 'tmobile', difficulty: 2,
    question: 'A customer says "T-Mobile doesn\'t have good coverage in my area." The best response is:',
    options: ['Agree and suggest they look at Verizon', 'Acknowledge the concern and offer the 15-day test drive — let them verify coverage where they live and work', 'Show them a national coverage map', 'Promise it has improved recently'],
    correctIndex: 1,
    explanation: 'Never argue coverage — prove it. The 15-day test drive removes all risk. "Try it where you actually live. If it doesn\'t work, you walk away free." That beats any map.',
  },
  {
    id: 'tq-24', category: 'tmobile', difficulty: 2,
    question: 'A customer says "I\'m not ready to pay $1,200 for a new phone." The best pivot is:',
    options: ['Tell them to save up', 'Break it down to the monthly device payment and show how trade-in and promotions reduce it', 'Offer an older, cheaper model instead', 'Say the phone is worth it'],
    correctIndex: 1,
    explanation: 'Monthly math wins. "$50/mo with your trade-in and current promo" lands better than "$1,200 retail." Always anchor to what they\'ll actually pay, not MSRP.',
  },
  {
    id: 'tq-25', category: 'tmobile', difficulty: 3,
    question: 'A customer says "I don\'t want to be in a contract." The correct T-Mobile response is:',
    options: ['We do have contracts, but they\'re flexible', 'T-Mobile has no annual service contracts — you\'re free to leave anytime; device payment plans are separate from service', 'You\'re right, let\'s look at prepaid instead', 'Contracts protect you from price increases'],
    correctIndex: 1,
    explanation: 'T-Mobile\'s service has no annual contract. Device payment plans aren\'t contracts — they\'re financing. Clarifying this removes one of the biggest switching fears.',
  },
  {
    id: 'tq-26', category: 'tmobile', difficulty: 2,
    question: 'A customer says "My bill keeps creeping up every year." Which T-Mobile commitment directly addresses this?',
    options: ['Un-carrier promise', 'Price Lock guarantee', 'Network Guarantee', 'AutoPay discount'],
    correctIndex: 1,
    explanation: 'Price Lock is the direct answer. T-Mobile guarantees your rate-plan price won\'t increase — and if it does, they\'ll pay your last bill to leave. That\'s the only carrier promise of its kind.',
  },
  {
    id: 'tq-27', category: 'tmobile', difficulty: 3,
    question: 'A business customer says "We have 20 lines at AT&T and are worried about switching disruption." Your strongest angle is:',
    options: ['Offer a 10% discount', 'Walk through T-Mobile\'s business switching support, number porting process, and dedicated business rep', 'Say it\'s easy and fast', 'Tell them to try a few lines first'],
    correctIndex: 1,
    explanation: '"Worried about disruption" means they need a process, not a price. Lead with T-Mobile for Business\'s dedicated support, porting guarantee, and step-by-step migration — then close on savings.',
  },
  // --- NEW: Network facts ---
  {
    id: 'tq-28', category: 'tmobile', difficulty: 1,
    question: 'T-Mobile\'s 5G network is described as the largest in the US because it covers:',
    options: ['The most downtown city blocks', 'More square miles of geography than any other US carrier', 'The most stadiums', 'Every building indoors'],
    correctIndex: 1,
    explanation: 'T-Mobile\'s mid-band 5G covers more land area than competitors. This is the geographic breadth argument — important for rural and suburban customers who feel left out of 5G.',
  },
  {
    id: 'tq-29', category: 'tmobile', difficulty: 2,
    question: 'Why does T-Mobile\'s mid-band 5G (2.5 GHz) outperform Verizon\'s mmWave in most real-world scenarios?',
    options: ['Mid-band is faster in every scenario', 'Mid-band travels farther and penetrates buildings better; mmWave is fast but only works in dense, short-range spots', 'mmWave is illegal in most states', 'T-Mobile simply has more towers'],
    correctIndex: 1,
    explanation: 'mmWave tops out on speed but can\'t penetrate walls or travel more than a block. Mid-band balances speed + coverage. That\'s why T-Mobile\'s 5G works inside buildings and in suburbs.',
  },
  {
    id: 'tq-30', category: 'tmobile', difficulty: 1,
    question: 'T-Mobile\'s Extended Range 5G (600 MHz band) is especially valuable for:',
    options: ['Downtown skyscrapers', 'Rural areas and large buildings where signals need to travel far', 'Gaming latency', 'International roaming'],
    correctIndex: 1,
    explanation: 'Low-band 600 MHz travels long distances and penetrates walls — perfect for rural coverage and large venues. When a rural customer doubts T-Mobile\'s signal, this is your answer.',
  },
];

const PRODUCT_QUESTIONS_EXTENDED: QuizQuestion[] = [
  {
    id: 'pq-11', category: 'products', difficulty: 2,
    question: 'Protection 360 includes which benefit that standard insurance plans don\'t cover?',
    options: ['Next-day replacement', 'McAfee Security and AppleCare services on eligible devices', 'International device replacement', 'Free screen protector every year'],
    correctIndex: 1,
    explanation: 'P360 bundles device protection + McAfee Security + AppleCare services on eligible Apple devices. Frame it as all-in-one peace of mind, not just "insurance."',
  },
  {
    id: 'pq-12', category: 'products', difficulty: 1,
    question: 'T-Mobile Home Internet (HINT) is best described as:',
    options: ['A Wi-Fi extender for existing broadband', 'A 4G/5G home gateway that replaces cable or DSL internet with no cable tech visits needed', 'Satellite internet', 'A mobile hotspot you carry with you'],
    correctIndex: 1,
    explanation: 'HINT delivers 4G/5G internet via a gateway plug-in device — no cable installation, no annual contracts. The plug-and-play setup is itself a selling point versus cable companies.',
  },
  {
    id: 'pq-13', category: 'products', difficulty: 2,
    question: 'When selling HINT to a customer switching from cable, the most powerful comparison point is:',
    options: ['Speed (HINT is always faster)', 'No annual contracts, no rental fees, and often lower monthly cost', 'It uses the same cable wiring', 'HINT includes live TV'],
    correctIndex: 1,
    explanation: 'Cable wins on legacy speed claims, but HINT wins on price and flexibility. No $10/mo modem rental, no 2-year lock-in, and often $20-40/mo cheaper. Run that math live.',
  },
  {
    id: 'pq-14', category: 'products', difficulty: 2,
    question: 'A customer buying a new iPhone should be offered a MagSafe charger because:',
    options: ['It\'s required for iOS updates', 'It snaps magnetically for fast, aligned wireless charging and works with the MagSafe accessory ecosystem', 'Lightning cables no longer work', 'It charges 5x faster than wired'],
    correctIndex: 1,
    explanation: 'MagSafe is an ecosystem play — once a customer has the charger, they want the wallet, the case, the car mount. It\'s a natural add-on that grows the basket.',
  },
  {
    id: 'pq-15', category: 'products', difficulty: 1,
    question: 'The best opening question when selling a wireless earbuds add-on is:',
    options: ['"Do you want earbuds?"', '"What do you listen to — music, podcasts, calls?"', '"These are on sale today."', '"Do you have a budget?"'],
    correctIndex: 1,
    explanation: 'Anchor to use case. Music fans want audio quality, gym-goers want fit and sweat resistance, remote workers want mic clarity. One discovery question positions the right buds.',
  },
];

const COMPETITOR_QUESTIONS: QuizQuestion[] = [
  {
    id: 'cq-1', category: 'competitors', difficulty: 2,
    question: 'Verizon\'s biggest weakness that T-Mobile can exploit is:',
    options: ['Coverage', 'Price — Verizon is consistently more expensive for comparable plans', 'Phone selection', 'Store locations'],
    correctIndex: 1,
    explanation: 'Verizon charges more for similar service. When you compare total monthly cost, T-Mobile wins.',
  },
  {
    id: 'cq-2', category: 'competitors', difficulty: 2,
    question: 'AT&T\'s "unlimited" plans often:',
    options: ['Have no restrictions at all', 'Include hidden throttling and deprioritization at lower tiers', 'Are cheaper than T-Mobile', 'Include international roaming free'],
    correctIndex: 1,
    explanation: 'AT&T\'s lower tiers throttle video and deprioritize data. Always compare at the plan level.',
  },
  {
    id: 'cq-3', category: 'competitors', difficulty: 1,
    question: 'When a customer says "I\'ve been with [carrier] for 15 years," you should:',
    options: ['Tell them loyalty doesn\'t matter', 'Acknowledge the loyalty, then show how switching actually rewards them more', 'Offer a bigger discount', 'Give up — they\'re not switching'],
    correctIndex: 1,
    explanation: 'Respect the loyalty, then reframe: "15 years of loyalty and they never lowered your bill?"',
  },
  {
    id: 'cq-4', category: 'competitors', difficulty: 3,
    question: 'Cable companies selling wireless (Xfinity Mobile, Spectrum) rely on:',
    options: ['Their own cell towers', 'Borrowing network access from major carriers, primarily Verizon', 'Satellite connections', 'Only Wi-Fi'],
    correctIndex: 1,
    explanation: 'MVNOs like Xfinity Mobile ride on Verizon\'s network but with lower priority. T-Mobile owns its network.',
  },
  {
    id: 'cq-5', category: 'competitors', difficulty: 2,
    question: 'The best way to handle "AT&T gave me a BOGO deal" is:',
    options: ['Match it immediately', 'Explain T-Mobile likely has a comparable or better offer, then verify in PromoHub', 'Ignore it', 'Say BOGO deals are scams'],
    correctIndex: 1,
    explanation: 'Never dismiss their offer. Compare it apples-to-apples — often T-Mobile\'s total value wins.',
  },
  {
    id: 'cq-6', category: 'competitors', difficulty: 2,
    question: 'T-Mobile\'s 5G advantage over Verizon is primarily:',
    options: ['Faster speeds everywhere', 'Much broader coverage area using mid-band spectrum', 'Better phones', 'More stores'],
    correctIndex: 1,
    explanation: 'T-Mobile\'s mid-band 5G covers far more geography than Verizon\'s spotty mmWave deployment.',
  },
  {
    id: 'cq-7', category: 'competitors', difficulty: 3,
    question: 'A customer says "My friend switched to T-Mobile and gets dropped calls all the time." Your best response:',
    options: ['Say their friend probably has a bad phone', 'Acknowledge the concern, ask for the friend\'s location, and offer the 15-day test drive to prove it in their area', 'Promise it won\'t happen to them', 'Blame it on Wi-Fi calling'],
    correctIndex: 1,
    explanation: 'Don\'t argue anecdotes. Make it personal and provable: "Let\'s test it where you actually live and work. If it doesn\'t work, you can walk away."',
  },
  {
    id: 'cq-8', category: 'competitors', difficulty: 3,
    question: 'A customer is comparing T-Mobile vs. a cable company bundle (internet + mobile). The strongest angle is:',
    options: ['Ignore the internet and focus on mobile', 'Show that T-Mobile Home Internet + mobile together often beats the cable bundle price with better flexibility and no contracts', 'Say cable internet is bad', 'Only compete on mobile pricing'],
    correctIndex: 1,
    explanation: 'Fight bundle with bundle. HINT + mobile often matches or beats cable combo pricing, and there is no annual contract trapping them.',
  },
  {
    id: 'cq-9', category: 'competitors', difficulty: 3,
    question: 'A customer says "I\'m staying with AT&T because I get a military discount." What should you do?',
    options: ['Move on — can\'t beat military discounts', 'Ask what discount they actually receive, then compare against T-Mobile\'s military/veteran plan which may offer more value', 'Offer a bigger discount', 'Say T-Mobile respects the military more'],
    correctIndex: 1,
    explanation: 'Many customers don\'t know the exact discount amount. T-Mobile\'s military plans are often more competitive. Always compare real numbers, not brand perception.',
  },
];

export const ALL_QUIZ_QUESTIONS: QuizQuestion[] = [
  ...SALES_QUESTIONS,
  ...PRODUCT_QUESTIONS,
  ...PRODUCT_QUESTIONS_EXTENDED,
  ...TMOBILE_QUESTIONS,
  ...COMPETITOR_QUESTIONS,
];

export function getRandomQuestions(count: number, categories?: QuizCategory[]): QuizQuestion[] {
  let pool = ALL_QUIZ_QUESTIONS;
  if (categories && categories.length > 0) {
    pool = pool.filter((q) => categories.includes(q.category));
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export const CATEGORY_META: Record<QuizCategory, { label: string; color: string }> = {
  sales: { label: 'Sales', color: '#E20074' },
  products: { label: 'Products', color: '#861B54' },
  tmobile: { label: 'T-Mobile', color: '#E20074' },
  competitors: { label: 'Competitors', color: '#333333' },
};
