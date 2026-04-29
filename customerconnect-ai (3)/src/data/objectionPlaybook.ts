/**
 * objectionPlaybook.ts
 *
 * Pre-baked objection handling playbook for T-Mobile virtual retail sales reps.
 * Covers both classic sales objections AND operational friction points
 * (account access, app resistance, wrong department, HINT unavailable, past-due).
 *
 * Design: Three layers of depth
 *   Layer 1 — Categories (tap to browse)
 *   Layer 2 — Specific scenarios with instant pre-baked quick responses
 *   Layer 3 — "Flip the Script" deep dive (powered by recommendation rules + AI later)
 *
 * When Gemma is integrated, it takes the pre-baked quickResponse text and
 * slightly rewords it each time to keep it fresh. The base content stays the same.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ObjectionScenario {
  id: string;
  /** Short label the rep sees in the list */
  label: string;
  /** Longer description for new reps who need context */
  description: string;
  /** Instant one-liner the rep can use RIGHT NOW — no loading, no API */
  quickResponse: string;
  /** Coaching tip — the "why this works" for newer reps */
  tip: string;
  /** Optional: for multi-step flows like pin reset, ordered steps */
  steps?: ObjectionStep[];
  /** Keys that link to recommendation rules for Layer 3 deep dive */
  deepDiveKeys?: string[];
}

export interface ObjectionStep {
  /** What's happening at this step */
  gate: string;
  /** What to say to keep the customer moving forward */
  script: string;
}

export interface ObjectionCategory {
  id: string;
  label: string;
  /** Brief description of when this category applies */
  description: string;
  icon: string; // lucide icon name
  scenarios: ObjectionScenario[];
}

// ---------------------------------------------------------------------------
// The Playbook
// ---------------------------------------------------------------------------

export const OBJECTION_PLAYBOOK: ObjectionCategory[] = [

  // =========================================================================
  // 1. ACCOUNT ACCESS
  // =========================================================================
  {
    id: 'account-access',
    label: 'Getting Into the Account',
    description: 'Customer can\'t verify identity — pin reset, T-Mobile ID issues, or app walkthrough.',
    icon: 'KeyRound',
    scenarios: [
      {
        id: 'no-passcode',
        label: 'Customer doesn\'t know their passcode',
        description: 'The 6-15 digit PIN that only the billing responsible party or authorized user should know. Without it, we can\'t access the account.',
        quickResponse: "No worries at all — it happens more than you'd think. I can walk you through resetting it right in the T-Life app. Takes about two minutes and then we're good to go.",
        tip: 'Keep it casual. Say "happens all the time" or "honestly I\'d forget mine too." The customer is embarrassed — if you sound like it\'s routine, they relax and cooperate. Never say "you NEED to know this" or make it sound like a security lecture.',
        steps: [
          { gate: 'Customer knows T-Mobile ID', script: "Perfect — go ahead and open the T-Life app and sign in. I'll walk you through the pin reset from there." },
          { gate: 'Customer does NOT know T-Mobile ID', script: "That's okay — let's get that password reset first. Tap 'Forgot Password' on the T-Life login screen and we'll get you a reset link to your email." },
          { gate: 'T-Mobile ID password reset sent', script: "Once you're logged in, head to your account settings — we'll find the PIN reset option right in there. I'll stay on the line." },
          { gate: 'PIN successfully reset', script: "You're all set. Now let me pull up your account so we can take care of what you called in for — and honestly, while I've got you, let me make sure you're getting the best value on your plan." },
        ],
        deepDiveKeys: ['account_access', 'tlife_app_guidance'],
      },
      {
        id: 'no-tmobile-id',
        label: 'Customer doesn\'t know their T-Mobile ID',
        description: 'They can\'t log into the app at all. Need to reset T-Mobile ID password before they can do anything.',
        quickResponse: "Easy fix — let's knock this out real quick. Open the T-Life app, tap 'Sign In,' then 'Forgot Password.' It'll shoot a reset link to whatever email's on file. I'm not going anywhere.",
        tip: 'This is the longest path — password reset → PIN reset → verify. Keep energy up by narrating progress: "OK awesome, one down — now let\'s get that PIN." Each step they finish, tell them they\'re almost there.',
      },
      {
        id: 'screen-share-resistance',
        label: 'Customer resists screen share',
        description: 'We need to screen share to process orders through T-Life. Customer is hesitant or doesn\'t want to bother.',
        quickResponse: "I totally get it — here's the thing though, when we do this through the app together, I can make sure you're getting every discount and promo available. It literally saves you money. Want me to send you the link?",
        tip: 'Frame it as a benefit to THEM, not a requirement for YOU. The commission angle is real but the customer doesn\'t care about that — they care about getting the best deal.',
        deepDiveKeys: ['tlife_app_guidance', 'screen_share'],
      },
    ],
  },

  // =========================================================================
  // 2. APP & PROCESS RESISTANCE
  // =========================================================================
  {
    id: 'app-process',
    label: 'App & Process Resistance',
    description: 'Customer pushes back on using the app, credit check, or digital process.',
    icon: 'Smartphone',
    scenarios: [
      {
        id: 'no-app-credit-check',
        label: 'Doesn\'t want to do credit check via app',
        description: 'Customer wants to do everything over the phone. We use the app unless they\'re Metro, prepaid, US Cellular, or home internet only.',
        quickResponse: "I hear you. For most accounts we do run it through the app because it's actually faster and more secure — your info goes straight through without me having to handle it. But let me check your situation real quick.",
        tip: 'Exceptions: Metro, prepaid, US Cellular, and home-internet-only accounts can be done over the phone. Know your exceptions so you sound confident, not like you\'re making them jump through hoops.',
      },
      {
        id: 'app-not-working',
        label: 'App isn\'t working for them',
        description: 'Technical issues with T-Life — won\'t load, crashing, login errors.',
        quickResponse: "Let's try a quick fix — close the app completely, then reopen it. If that doesn't work, we can absolutely handle this over the phone instead. I don't want you fighting with technology when I'm right here to help.",
        tip: 'Don\'t die on the app hill. If it\'s genuinely broken, pivot to phone. The goal is to help the customer, not force a process. You can still add value over the phone.',
      },
      {
        id: 'super-against-app',
        label: 'Customer is completely against using any app',
        description: 'Some customers flat-out refuse digital anything. Not tech-savvy, don\'t trust it, or just stubborn.',
        quickResponse: "No problem at all — let me handle everything right here on the phone. You're still gonna get the same deals, same promos, all of it.",
        tip: 'Two pushes max on the app. If they say no twice, drop it. Fighting them wastes 3-5 minutes of call time and kills any trust you built. Say "no problem" and move straight to selling.',
        deepDiveKeys: ['simplification_rebuttal'],
      },
    ],
  },

  // =========================================================================
  // 3. WRONG DOOR — QUICK WIN
  // =========================================================================
  {
    id: 'wrong-door',
    label: 'Wrong Door, Quick Win',
    description: 'Customer called for billing, tech support, or account issues and landed in sales. Quick triage, then pivot.',
    icon: 'ArrowRightLeft',
    scenarios: [
      {
        id: 'billing-complaint',
        label: 'Upset about a billing issue',
        description: 'Customer is heated about charges. We\'re NOT account care, but if it\'s a quick fix we can handle it and then pivot to an upsell.',
        quickResponse: "I can hear this is frustrating — let me take a quick look at what's going on. Sometimes these are simple fixes I can take care of right here, and then I'll make sure you're connected to the right team if you need anything else.",
        tip: 'Listen first, fix what you can. Even resetting an expectation ("that charge is normal, here\'s why") builds trust. Then: "While I\'ve got you, let me make sure your plan is actually the best fit." Quick fix → upsell.',
        deepDiveKeys: ['wrong_department_pivot'],
      },
      {
        id: 'account-support-request',
        label: 'Needs account changes (not sales)',
        description: 'Wants to change address, update payment method, remove a line — stuff that\'s not our department.',
        quickResponse: "I can definitely point you in the right direction for that. Before I transfer you though — are you happy with your current plan? I ask because I see a lot of people in your situation leaving money on the table. Takes 30 seconds to check.",
        tip: 'The 30-second check is your opening. Even if they say no, you planted the seed. If they say yes, you\'ve got a chance to add value. Never just blind-transfer without at least asking.',
      },
      {
        id: 'tech-support-request',
        label: 'Calling for tech support',
        description: 'Phone not working, service issues, device problems. We can do basic troubleshooting before transferring.',
        quickResponse: "Let me see if we can get this sorted right now. Can you try powering your phone completely off, wait about 10 seconds, and turn it back on? That fixes it more often than you'd think.",
        tip: 'Run through this in order: (1) power cycle, (2) check for outages in their area, (3) verify account is active/not suspended. If none of that works, transfer to tech. But before you transfer, say: "While they pull up your case, quick question — are you happy with your plan?" That one sentence opens the door.',
        steps: [
          { gate: 'Power cycle', script: "Go ahead and hold the power button, slide to power off, wait 10 seconds, then turn it back on." },
          { gate: 'Check account status', script: "Let me check your account real quick to make sure everything's active on our end." },
          { gate: 'Basic issue resolved', script: "Looks like that did the trick! Hey, while I've got you — when's the last time you looked at your plan? A lot has changed and I want to make sure you're getting the most out of it." },
          { gate: 'Issue needs real tech support', script: "This one's going to need our tech specialists — they're the best at this. Let me get you over to them. It was great talking with you though, and if you ever want to check on plan upgrades, we're always here." },
        ],
      },
      {
        id: 'wants-to-cancel',
        label: 'Customer wants to cancel service',
        description: 'We\'re NOT loyalty/retention. But don\'t just immediately transfer if there\'s a quick fix that solves their underlying issue.',
        quickResponse: "Hey, hold on one sec before I get you over there — what's going on? Sometimes the thing that's bugging you is something I can actually fix right now, and then you don't even have to wait on hold again.",
        tip: 'Find the root cause with one question. Price → run a plan optimization ("let me see if we can get this lower"). Service quality → check coverage, suggest HINT. Bad experience → empathize, offer the 15-day trial. Only transfer to retention after you\'ve made one genuine attempt.',
        deepDiveKeys: ['retention_pivot'],
      },
    ],
  },

  // =========================================================================
  // 4. HINT UNAVAILABLE
  // =========================================================================
  {
    id: 'hint-unavailable',
    label: 'Home Internet Not Available',
    description: 'Customer wants 5G Home Internet but it\'s not available in their area or slots are full. The mailer disappointment pivot.',
    icon: 'Wifi',
    scenarios: [
      {
        id: 'hint-mailer-disappointment',
        label: 'Got a mailer but HINT isn\'t available',
        description: 'Customer received a T-Mobile mailer saying home internet was available, got excited, called in, and now we have to tell them spots are taken.',
        quickResponse: "I totally understand the frustration — you got that mailer and you're ready to go. Here's what happened: those spots fill up fast in your area. The good news is we're constantly expanding, and I can make a note to reach out when it opens up. In the meantime, have you looked at how much data your current phone plan gives you? A lot of our customers are surprised how much they can do with the hotspot alone.",
        tip: 'Acknowledge the bait-and-switch feeling. They\'re right to be annoyed. Don\'t minimize it. Then pivot to what you CAN do. The hotspot angle or plan upgrade is your best bet here.',
        deepDiveKeys: ['hint_pivot', 'hotspot_upsell'],
      },
      {
        id: 'hint-not-in-area',
        label: 'Home internet just isn\'t in their area yet',
        description: 'No mailer, they just heard about it and want it. Not available.',
        quickResponse: "We're rolling it out as fast as we can, but your area isn't quite there yet. I know that's not what you wanted to hear. Here's what I can tell you though — our phone plans have seriously upgraded hotspot data. Depending on what you're using home internet for, we might be able to get you covered right now.",
        tip: 'Don\'t trash-talk their current ISP — they might be happy with it. Focus on what T-Mobile CAN offer now (hotspot, plan value) and frame HINT as a future bonus.',
      },
      {
        id: 'hint-pivot-to-cellular',
        label: 'Trying to convince them to try cellular instead',
        description: 'The hard pivot — they wanted home internet and now you\'re trying to sell them phone service. Tough sell because they\'re already disappointed.',
        quickResponse: "Look, I know this isn't why you called. But since I've got you — are you happy with your cell phone service? Because a lot of people who come to us for home internet end up switching their phones too once they see the value. And honestly, if you switch now, you'll be first in line when home internet opens up in your area.",
        tip: 'The "first in line" framing gives them a reason to engage even though they\'re disappointed. It\'s not a lie — existing customers DO get priority for HINT expansion. Make the cellular pitch about overall value, not just the phone.',
        deepDiveKeys: ['hint_pivot', 'switch_pitch'],
      },
    ],
  },

  // =========================================================================
  // 5. PAST-DUE ACCOUNTS
  // =========================================================================
  {
    id: 'past-due',
    label: 'Past-Due Account',
    description: 'Customer\'s bill is behind. Financing tools are locked. Can\'t see what they\'d qualify for until they pay.',
    icon: 'CircleDollarSign',
    scenarios: [
      {
        id: 'past-due-wants-new-device',
        label: 'Wants a new phone but bill is behind',
        description: 'Financing tools are literally locked while the account is past due. We can\'t even see what they\'d qualify for.',
        quickResponse: "I want to get you into that new phone — here's where we're at though. Because there's a balance on the account, our system won't let me see the financing options yet. If you're able to bring that current, I can immediately check what deals you qualify for. And I'm not going anywhere — I'll stay on the line.",
        tip: 'Be honest but not judgmental. You literally CANNOT see the financing screen. Frame paying the bill as the unlock, not as a punishment. And do NOT promise zero down or any specific deal — you genuinely don\'t know until the tools unlock.',
      },
      {
        id: 'past-due-hint-play',
        label: 'Past-due but HINT is available — no activation fee',
        description: 'HINT has no activation fee, so it\'s the lifeline offer for past-due customers who want something new.',
        quickResponse: "Here's something that might work really well for you — our Home Internet has no activation fee at all. So even while we're getting your account squared away, this could be something we set up today. Want me to check if it's available at your address?",
        tip: 'HINT with no activation fee is your ace card for past-due accounts. It gives them something new without requiring the financing tools to be unlocked. Always check availability first though.',
        deepDiveKeys: ['hint_no_activation', 'past_due_pivot'],
      },
      {
        id: 'past-due-slow-down',
        label: 'Customer rushing — wants to skip straight to ordering',
        description: 'They know their bill is behind but don\'t want to deal with it. Trying to bulldoze past it.',
        quickResponse: "I'm with you — let's figure this out. The thing is, our system requires the account to be current before I can pull up any device offers. I know it's one more step, but once that's done, I can see exactly what promos are running for you. Sometimes people are surprised at how good the deals are once the account is clear.",
        tip: 'Don\'t be a pushover but don\'t be a wall either. The system literally won\'t let you — that\'s your shield. You\'re not the bad guy, the system is. But dangle the carrot: "the deals might surprise you." Curiosity keeps them engaged.',
      },
    ],
  },

  // =========================================================================
  // 6. BASIC TROUBLESHOOTING
  // =========================================================================
  {
    id: 'basic-troubleshooting',
    label: 'Quick Troubleshooting',
    description: 'Simple fixes you can try before deciding to transfer to tech support.',
    icon: 'Wrench',
    scenarios: [
      {
        id: 'device-not-working',
        label: 'Phone not working / no service',
        description: 'Basic device or service issues. Try quick fixes before transferring.',
        quickResponse: "Let's try the quickest fix first — can you power your phone completely off, wait about 10 seconds, then turn it back on? I'll wait right here.",
        tip: 'Power cycle solves way more problems than people think. If that doesn\'t work, check: Is the account active? Any recent SIM changes? Any outages in their area? If none of that works, transfer to tech.',
        steps: [
          { gate: 'Power cycle the device', script: "Hold the power button, slide to turn off, wait 10 seconds, then power back on." },
          { gate: 'Check account status', script: "Let me verify your account is fully active and there aren't any holds." },
          { gate: 'Check for area outages', script: "I'm checking to see if there are any network issues in your area right now." },
          { gate: 'Still not working', script: "I want to get you to our tech specialists — they have deeper tools to diagnose this. Let me transfer you over." },
        ],
      },
      {
        id: 'slow-data',
        label: 'Slow data / internet issues',
        description: 'Customer complaining about slow speeds. Could be deprioritization, plan limits, or network congestion.',
        quickResponse: "That's frustrating. Let me check a couple things — first, what plan are you on? Sometimes slow data is actually a plan feature we can fix with an upgrade. Also, have you tried toggling airplane mode on and off real quick?",
        tip: 'Check their plan first. If they\'re on Essentials or Saver, deprioritization is almost certainly the cause. Say: "So your plan has a data cap where speeds can slow down — the good news is I can bump you to a plan where that doesn\'t happen, and the price difference is usually less than people expect." That\'s the upsell to Experience More or Beyond.',
        deepDiveKeys: ['plan_upgrade_pitch', 'technical_support_pivot'],
      },
      {
        id: 'cant-make-calls',
        label: 'Can\'t make or receive calls',
        description: 'Voice service issues — could be account, device, or network.',
        quickResponse: "Let's figure this out. First thing — try turning airplane mode on, wait 5 seconds, then turn it off. That forces your phone to reconnect to the network fresh.",
        tip: 'Airplane mode toggle is the voice equivalent of a power cycle. If that fails, check if they have Wi-Fi calling enabled as a backup. Then check account status. Transfer to tech if basic steps fail.',
      },
    ],
  },

  // =========================================================================
  // 7. CLASSIC SALES OBJECTIONS
  // =========================================================================
  {
    id: 'classic-sales',
    label: 'Sales Objections',
    description: 'Standard pushback on price, coverage, switching, timing — the classic sales floor stuff.',
    icon: 'MessageSquareWarning',
    scenarios: [
      {
        id: 'price-too-high',
        label: 'Price is too high',
        description: 'Customer feels the monthly cost or device price is more than they want to pay.',
        quickResponse: "I get it — nobody wants to overpay. But let me ask you this: what are you paying right now with your current carrier? Because when we break it down line by line — especially with the perks you're getting like Netflix, hotspot data, and international roaming — most people are actually paying less with us for way more.",
        tip: 'Always compare total value, not just the monthly number. Include perks they\'d pay for separately (Netflix, AAA, hotspot). The "what are you paying now" question shifts them from sticker shock to comparison mode.',
        deepDiveKeys: ['price_objections', 'value_comparison'],
      },
      {
        id: 'happy-with-current',
        label: 'Happy with current provider',
        description: 'Customer sees no reason to switch. Their current service works fine.',
        quickResponse: "That's fair — if it's working, it's working. Out of curiosity though, when's the last time you actually compared what you're getting? Carriers change their plans pretty often, and a lot of people don't realize they're paying for less than what's available now.",
        tip: 'Never trash their carrier — it makes them defensive. The "when did you last compare" question plants doubt without attacking. If they say "a while ago," follow with: "A lot has changed — mind if I just pull up a quick side-by-side? Takes 30 seconds." That gets you into the comparison.',
        deepDiveKeys: ['reliability_objections', 'proof_and_risk_reversal'],
      },
      {
        id: 'coverage-concerns',
        label: 'Worried about T-Mobile coverage',
        description: 'Customer has heard bad things about the network or had issues in their area before.',
        quickResponse: "That's a smart thing to check. Our network has changed massively in the last couple years — we're actually the largest 5G network in the country now. And here's the thing: we have a 15-day worry-free trial. You can test it yourself without canceling your current provider first. Zero risk.",
        tip: 'The 15-day trial is your best weapon here. It removes all risk from the customer. They don\'t have to take your word for it. Also: T-Satellite with Starlink covers dead zones now — mention it if they travel or live rural.',
        deepDiveKeys: ['coverage_proof', 'proof_and_risk_reversal'],
      },
      {
        id: 'too-much-hassle',
        label: 'Too much hassle to switch',
        description: 'Customer dreads porting numbers, transferring data, setting up new accounts.',
        quickResponse: "I hear that a lot — and honestly, it used to be a bigger deal. But now we handle the number transfer automatically, your contacts and photos stay on your phone, and we walk you through the whole thing. Most people are surprised it takes less than 30 minutes.",
        tip: 'Make it sound easy because it IS easy (usually). The "we handle the number transfer automatically" line removes their biggest fear. If they have multiple lines, acknowledge it\'s a bit more but still manageable.',
        deepDiveKeys: ['simplification_rebuttal', 'switching_ease'],
      },
      {
        id: 'contract-etf',
        label: 'Locked into a contract / owes on devices',
        description: 'Customer is still under contract or has device payments left with their current carrier.',
        quickResponse: "We actually have programs to help with that. Depending on your situation, we can help cover what you owe when you switch — whether that's an early termination fee or remaining device payments. Want me to check what you'd qualify for?",
        tip: 'Don\'t over-promise. Say "help cover" not "pay off completely." The specifics depend on current promos and their situation. The key is removing the mental barrier — they need to know switching isn\'t financially trapped.',
        deepDiveKeys: ['contract_fear_objections', 'freedom_focus'],
      },
      {
        id: 'need-to-talk-to-spouse',
        label: 'Need to talk to my spouse / family',
        description: 'Not the sole decision maker. Wants to discuss before committing.',
        quickResponse: "Yeah, definitely talk to them — I'd do the same thing. Tell you what though, let me put the whole thing together for you right now — pricing, phones, everything — so when you sit down with them tonight you've got all the numbers. Way easier than trying to remember everything I said.",
        tip: 'This is a soft no about 70% of the time. But whether it\'s real or not, your move is the same: build the quote, send the summary, and schedule a callback. Say "when should I check back in with you — tomorrow afternoon work?" That gives you a concrete next step instead of hoping they call back.',
      },
      {
        id: 'waiting-for-new-phone',
        label: 'Waiting for the next phone launch',
        description: 'Customer wants to delay until a newer device drops.',
        quickResponse: "Smart thinking. Here's something to consider though — when those new phones drop, the best trade-in deals are usually right at launch. If you get set up now, you'll be in the best position to upgrade the second it comes out. And with our upgrade program, you're not locked in.",
        tip: 'The play: "Start now so you\'re first in line for the deal when it drops." On Experience Beyond, they can upgrade after 6 months + 50% paid. On Experience More, it\'s every 2 years (New in Two). Either way, starting today puts them ahead — say: "If you wait, you\'re also waiting on the trade-in value of your current phone going down."',
        deepDiveKeys: ['upgrade_programs', 'timing_objection'],
      },
      {
        id: 'bad-past-experience',
        label: 'Bad past experience with T-Mobile',
        description: 'They or someone they know had a negative experience previously.',
        quickResponse: "I appreciate you being upfront about that. Can I ask what happened? I'm not going to make excuses — if we messed up, we messed up. But a lot has changed, and I'd rather know what went wrong so I can make sure it doesn't happen again if you give us another shot.",
        tip: 'Acknowledge, don\'t defend. Asking what happened shows you care and gives you intel. If it was a coverage issue → network has improved. If it was customer service → empathize. If it was billing → show transparency of new plans. The 15-day trial removes risk here too.',
        deepDiveKeys: ['guarantee_logic', 'proof_and_risk_reversal'],
      },
      {
        id: 'rate-hike-fear',
        label: 'Afraid of rate hikes / bait-and-switch',
        description: 'Customer has been burned by carriers raising prices. Doesn\'t trust the quoted price will stick.',
        quickResponse: "That's a legit concern — other carriers have absolutely done that. Here's what makes us different: we have a 5-Year Price Guarantee. The price I quote you today for talk, text, and data is locked for five years. It's in writing.",
        tip: 'The 5-Year Price Guarantee is a powerful differentiator. Lean into it hard. It directly addresses the fear because it\'s not a promise — it\'s a policy.',
        deepDiveKeys: ['guarantee_logic', 'price_lock'],
      },
      {
        id: 'promo-credit-confusion',
        label: 'Confused about promotional credits / financing',
        description: 'Customer doesn\'t understand how bill credits work, thinks it\'s a scam, or is worried about losing credits if they pay off early.',
        quickResponse: "Great question — let me break it down simply. The phone has a retail price that gets split into monthly payments. The promo discount comes as a matching credit each month, so it cancels out. You're only paying the difference. And with the new 2026 trade-in policy, if you pay it off early, the remaining credits convert — so you don't lose them.",
        tip: 'The 100% RDC trade-in rule is new for 2026 and simplifies this conversation. Frame it as "billing simplification" not "complicated credit structure." If they\'re still confused, use dollar amounts: "So instead of $30/month, you\'re paying $5/month after the credit."',
        deepDiveKeys: ['promo_credit_explanation', 'rdc_simplification'],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper: Flat list of all scenarios (for search)
// ---------------------------------------------------------------------------
export function getAllScenarios(): (ObjectionScenario & { categoryId: string; categoryLabel: string })[] {
  return OBJECTION_PLAYBOOK.flatMap(cat =>
    cat.scenarios.map(s => ({ ...s, categoryId: cat.id, categoryLabel: cat.label }))
  );
}

// ---------------------------------------------------------------------------
// Helper: Find scenario by ID
// ---------------------------------------------------------------------------
export function findScenario(scenarioId: string): { category: ObjectionCategory; scenario: ObjectionScenario } | null {
  for (const cat of OBJECTION_PLAYBOOK) {
    const scenario = cat.scenarios.find(s => s.id === scenarioId);
    if (scenario) return { category: cat, scenario };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Helper: Get scenarios relevant to a customer context
// ---------------------------------------------------------------------------
export function getSuggestedCategories(intent: string): string[] {
  const suggestions: Record<string, string[]> = {
    'exploring':         ['classic-sales', 'app-process'],
    'ready to buy':      ['app-process', 'account-access', 'classic-sales'],
    'upgrade / add a line': ['account-access', 'app-process', 'classic-sales'],
    'order support':     ['account-access', 'app-process'],
    'tech support':      ['basic-troubleshooting', 'wrong-door'],
    'account support':   ['wrong-door', 'account-access'],
  };
  return suggestions[intent] || ['classic-sales'];
}
