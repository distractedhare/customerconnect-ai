import { Home, Tag, ChevronRight, Headphones, CreditCard, ChevronDown, Star, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EcosystemMatrix } from '../types/ecosystem';
import { getSupportAccessory } from '../services/ecosystemService';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { ESSENTIALS_TABLE, BIG_ADDS, getRecommendedCategories, Intent } from '../data/essentialAccessories';

type ProductType = 'Phone' | 'Home Internet' | 'BTS' | 'IOT' | 'No Specific Product';

interface InstantPlaysProps {
  intent: Intent;
  age?: string;
  product?: ProductType[];
  ecosystemMatrix?: EcosystemMatrix | null;
}

interface Play {
  title: string;
  description: string;
  talkTrack: string;
}

// Intent-specific play content
const INTENT_PLAYS: Record<Intent, { subtitle: string; plays: Play[] }> = {
  'exploring': {
    subtitle: 'Find the need. Don\'t pitch yet.',
    plays: [
      {
        title: 'The "What Brings You In" Open',
        description: 'Lower the pressure by acknowledging they might just be looking.',
        talkTrack: '"Hey! No pressure at all — are you just exploring what\'s out there today, or did something specific catch your eye?"'
      },
      {
        title: 'Identify the Friction',
        description: 'Find the one thing they hate about their current setup.',
        talkTrack: '"If you could change one thing about your current service or phone, what would it be? Is it the bill, the battery, or the coverage?"'
      },
      {
        title: 'The Home Internet Seed',
        description: 'Every customer is a potential HINT customer. Check availability early.',
        talkTrack: '"While we\'re looking at that, let me check your address for our Home Internet. Most people are saving $20-40/mo switching from cable."'
      },
    ],
  },
  'ready to buy': {
    subtitle: 'Confirm, stack value, close fast.',
    plays: [
      {
        title: 'The "Best Deal" Assurance',
        description: 'Confirm their choice and reassure them they are getting the peak promo.',
        talkTrack: '"Love that choice. You actually timed this perfectly — that\'s the best deal we have running right now. Let\'s get you set up."'
      },
      {
        title: 'The P360 Protection Wrap',
        description: 'Pitch protection as a logical part of the purchase, not an add-on.',
        talkTrack: '"Since we\'re getting you a brand new device, I\'m going to include P360. It covers theft, loss, and screen breaks for $0. It\'s the best way to protect your investment."'
      },
      {
        title: 'Day-One Essentials',
        description: 'Assume the sale: lock in protection and power before they leave.',
        talkTrack: '"Since you\'re getting the phone, I\'ll grab a case and a screen protector so you\'re protected from day one. We can add a charger and save on the whole setup."'
      },
    ],
  },
  'upgrade / add a line': {
    subtitle: 'Check trade-in. Review plan. Stack.',
    plays: [
      {
        title: 'The Trade-In Audit',
        description: 'Check values for all devices on the account, not just the one they asked about.',
        talkTrack: '"Let\'s see what your current phone is worth. We\'re taking devices in any condition right now, so even if it\'s cracked, it might be worth a lot."'
      },
      {
        title: 'The $5 Add-On Pivot',
        description: 'Pitch connected devices as a low-cost account enhancement.',
        talkTrack: '"Did you know on your plan it\'s only $5/mo to add a watch or tablet? We have some free device deals that make it a no-brainer."'
      },
      {
        title: 'The Plan Optimization',
        description: 'Show how a plan move can unlock better device credits.',
        talkTrack: '"If we move you to Experience Beyond, it actually unlocks an extra $400 in trade-in credit. The plan pays for the phone upgrade itself."'
      },
    ],
  },
  'order support': {
    subtitle: 'Fix it first. Then find the angle.',
    plays: [
      {
        title: 'The Resolution Earn',
        description: 'Earn the right to sell by being the hero on their order issue.',
        talkTrack: '"I\'ve got you. I\'m going to track this order down and get you a clear answer. I know how annoying it is to be in limbo."'
      },
      {
        title: 'The "While We Wait" HINT Check',
        description: 'Use the system loading time to check Home Internet availability.',
        talkTrack: '"While the system is pulling up your order details, let me check your address for Home Internet. It only takes a second and could save you a ton on your home bill."'
      },
      {
        title: 'The Tracker Seed',
        description: 'Pitch SyncUP Trackers for the new device they just ordered.',
        talkTrack: '"Since you have that new [Device] coming, have you thought about a SyncUP Tracker? It\'s great for keeping an eye on your gear when you travel."'
      },
    ],
  },
  'tech support': {
    subtitle: 'Fix the problem. Sell after, not during.',
    plays: [
      {
        title: 'The Empathy Fix',
        description: 'Acknowledge the frustration before jumping into troubleshooting.',
        talkTrack: '"I deal with this stuff all day — we\'ll get it sorted. I know it\'s frustrating when your tech isn\'t cooperating."'
      },
      {
        title: 'The P360 Safety Net',
        description: 'Use the current issue to highlight the value of protection.',
        talkTrack: '"Now that we fixed it, I noticed you don\'t have P360. If this had been a hardware failure or a break, you\'d be looking at a full-price replacement. Want to add that safety net?"'
      },
      {
        title: 'The Tablet Backup',
        description: 'Pitch a cellular tablet as a backup for when their phone has issues.',
        talkTrack: '"It\'s always good to have a backup. We have iPads for basically free right now — it\'s only $5/mo for the line. Great to have if your phone ever acts up again."'
      },
    ],
  },
  'account support': {
    subtitle: 'Clarify the bill. Find savings.',
    plays: [
      {
        title: 'The Bill Breakdown',
        description: 'Simplify the bill so they feel in control of their spending.',
        talkTrack: '"Let\'s look at this together. I\'ll break down exactly what you\'re paying for so there are no surprises. My goal is to make sure you\'re only paying for what you use."'
      },
      {
        title: 'The Plan Audit Pivot',
        description: 'Find a plan that includes the perks they are already paying for.',
        talkTrack: '"I see you\'re paying for Netflix and Hulu separately. If we move you to Experience Beyond, those are included. You\'d save about $30/mo right there."'
      },
      {
        title: 'The 5-Year Price Lock Assurance',
        description: 'Highlight the stability of T-Mobile pricing vs competitors.',
        talkTrack: '"The best part about your plan is the 5-Year Price Guarantee. While other carriers are raising rates, your price is locked in. That\'s peace of mind."'
      },
    ],
  },
};

const isSalesIntent = (intent: Intent) => ['exploring', 'ready to buy', 'upgrade / add a line'].includes(intent);

// Product-specific context cards that overlay on top of intent plays
const PRODUCT_CONTEXT: Record<string, { label: string; color: string; tips: Record<string, Play[]> }> = {
  'Home Internet': {
    label: 'Home Internet',
    color: 'from-t-magenta to-t-berry',
    tips: {
      'exploring': [
        {
          title: 'The Address Check',
          description: 'Availability is the first hurdle. Check it immediately.',
          talkTrack: '"Let me check your address real quick. If you\'re in a good spot, we can get you off that cable bill today."'
        },
        {
          title: 'The Cable Comparison',
          description: 'Ask what they pay for cable internet to show the gap.',
          talkTrack: '"What are you paying [Provider] right now? Most people are shocked when they see our $30-50 All-In price."'
        },
      ],
      'ready to buy': [
        {
          title: 'The All-In Move',
          description: 'The $55 All-In tier is the best value with streaming perks.',
          talkTrack: '"Since you\'re ready, I highly recommend the All-In tier. It includes Hulu and Paramount+, so it basically pays for itself."'
        },
        {
          title: 'The 15-Day Test Drive',
          description: 'Lower the risk of switching with the trial period.',
          talkTrack: '"Remember, you have 15 days to try it out. If it\'s not the best internet you\'ve had, bring it back for a full refund. Zero risk."'
        },
      ],
      'upgrade / add a line': [
        {
          title: 'The Voice Line Discount',
          description: 'Highlight the $20/mo savings for existing voice customers.',
          talkTrack: '"Since you already have a phone line with us, you get Home Internet for just $30-50/mo. It\'s the best deal in the house."'
        },
      ],
      'order support': [
        {
          title: 'The Gateway ETA',
          description: 'Give a clear expectation of when they will be online.',
          talkTrack: '"Your gateway is on its way. You should have it by [Date]. Once it arrives, setup takes about 15 minutes through the app."'
        },
      ],
      'tech support': [
        {
          title: 'The Window Placement',
          description: 'Placement is 90% of HINT performance.',
          talkTrack: '"The best spot is usually near a window, ideally on a higher floor. Let\'s try moving it and see if those speeds jump up."'
        },
      ],
      'account support': [
        {
          title: 'The Price Lock Reminder',
          description: 'Reassure them their rate won\'t go up like cable does.',
          talkTrack: '"Unlike cable companies that hike your rate after 12 months, your T-Mobile price is locked for 5 years. No surprises."'
        },
      ],
    },
  },
  'BTS': {
    label: 'Behind the Screen (Tablets, Watches)',
    color: 'from-black to-t-berry',
    tips: {
      'exploring': [
        {
          title: 'The $5 Line Hook',
          description: 'The low monthly cost of adding a connected device.',
          talkTrack: '"Most people don\'t realize it\'s only $5/mo to add a watch or tablet to your account. It\'s the cheapest way to stay connected."'
        },
      ],
      'ready to buy': [
        {
          title: 'The SyncUP KIDS Safety',
          description: 'Pitch the kids watch as a safety tool for parents.',
          talkTrack: '"For the kids, this watch is a game-changer. You can see where they are and call them, but they don\'t have the distractions of a full phone."'
        },
      ],
      'upgrade / add a line': [
        {
          title: 'The Watch Trade-In',
          description: 'Check values for old watches to lower the cost of the new one.',
          talkTrack: '"Let\'s see what your old watch is worth. We can usually stack that trade-in on top of the current promos."'
        },
      ],
      'order support': [
        {
          title: 'The Activation Walkthrough',
          description: 'Help them understand the eSIM process for watches.',
          talkTrack: '"Once the watch arrives, we\'ll use the T-Mobile app to pair it. It uses an eSIM, so there\'s no physical card to worry about."'
        },
      ],
      'tech support': [
        {
          title: 'The Proximity Check',
          description: 'Basic troubleshooting for watch connectivity.',
          talkTrack: '"Is your phone nearby? Most watch issues are just a Bluetooth sync hiccup. Let\'s try a quick toggle and see if it reconnects."'
        },
      ],
      'account support': [
        {
          title: 'The Unused Line Audit',
          description: 'Check for old tablet/watch lines that can be repurposed.',
          talkTrack: '"I see an old tablet line here that isn\'t being used. We could actually move that to a new iPad for basically nothing today."'
        },
      ],
    },
  },
  'IOT': {
    label: 'IoT (SyncUP, Trackers)',
    color: 'from-t-berry to-t-magenta',
    tips: {
      'exploring': [
        {
          title: 'The Pet/Luggage Peace of Mind',
          description: 'Pitch the tracker for high-stress scenarios.',
          talkTrack: '"If you travel or have pets, this tracker is a lifesaver. It uses our cellular network, so it works everywhere, not just near other phones."'
        },
      ],
      'ready to buy': [
        {
          title: 'The SyncUP DRIVE Diagnostics',
          description: 'Pitch the car tracker as a vehicle health tool.',
          talkTrack: '"SyncUP DRIVE doesn\'t just track your car; it tells you why the check engine light is on. It\'s like having a mechanic in your pocket."'
        },
      ],
      'order support': [
        {
          title: 'The App Setup Prep',
          description: 'Get them ready to use the SyncUP app.',
          talkTrack: '"While your tracker is shipping, go ahead and download the SyncUP app. You can set up your profile and be ready to go the second it arrives."'
        },
      ],
      'tech support': [
        {
          title: 'The Geofence Fix',
          description: 'Troubleshoot alert issues in the SyncUP app.',
          talkTrack: '"If you aren\'t getting alerts, let\'s check your geofence settings in the app. Sometimes a small adjustment to the radius fixes everything."'
        },
      ],
      'account support': [
        {
          title: 'The $5 Tracker Value',
          description: 'Remind them how cheap it is to keep their valuables safe.',
          talkTrack: '"For $5/mo, you have real-time GPS on your most important gear. It\'s the cheapest insurance you can buy."'
        },
      ],
    },
  },
};

export default function InstantPlays({ intent, age, product, ecosystemMatrix }: InstantPlaysProps) {
  const plays = INTENT_PLAYS[intent];
  const showAccessories = isSalesIntent(intent);
  const isSupportCall = !showAccessories;
  const [accOpen, setAccOpen] = useState(false);

  // Get product-specific tips
  const activeProducts = product?.filter(p => p !== 'No Specific Product' && p !== 'Phone') ?? [];

  // Get a premium accessory recommendation for support intents
  const supportAccessory = useMemo(() => {
    if (!isSupportCall || !ecosystemMatrix) return null;
    return getSupportAccessory(ecosystemMatrix, age ?? 'Not Specified');
  }, [isSupportCall, ecosystemMatrix, age, intent]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      {/* Home Internet — compact reminder banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-feature flex items-center gap-3 rounded-xl px-4 py-3"
      >
        <Home className="w-5 h-5 text-white shrink-0" />
        <p className="text-xs font-bold text-white">Check the address for Home Internet first. Rebate and Month On Us value land best after availability is confirmed.</p>
      </motion.div>

      {/* Product-specific context cards */}
      {activeProducts.map((prod) => {
        const ctx = PRODUCT_CONTEXT[prod];
        if (!ctx) return null;
        const tips = ctx.tips[intent] || [];
        if (tips.length === 0) return null;
        return (
          <motion.div
            key={prod}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-billboard rounded-2xl p-4 text-white shadow-md"
          >
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70 mb-2">
              {ctx.label} — {intent}
            </p>
            <div className="space-y-4">
              {tips.map((tip, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-white/70 shrink-0" />
                    <p className="text-[11px] font-black uppercase tracking-wider text-white">{tip.title}</p>
                  </div>
                  <p className="text-[10px] text-white/80 leading-snug ml-5">{tip.description}</p>
                  <div className="glass-reading ml-5 rounded-lg p-2">
                    <p className="text-[10px] font-bold text-white leading-snug break-words">{tip.talkTrack}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Intent header */}
      <div className="glass-stage-quiet rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-tight text-t-dark-gray mb-1">{intent}</h3>
        <p className="text-xs font-medium text-t-dark-gray">{plays.subtitle}</p>
      </div>

      {/* Plays */}
      <div className="glass-stage-quiet rounded-2xl p-5 shadow-sm space-y-3">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray mb-2">Quick plays</p>
        <div className="space-y-3">
          {plays.plays.map((play, i) => (
            <div key={i} className="glass-reading space-y-2 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-t-magenta/10 flex items-center justify-center shrink-0">
                  <Zap className="w-3 h-3 text-t-magenta" />
                </div>
                <p className="text-xs font-black text-t-dark-gray uppercase tracking-tight">{play.title}</p>
              </div>
              <p className="text-[11px] text-t-dark-gray font-medium leading-snug ml-8">{play.description}</p>
              <div className="glass-feature relative ml-8 rounded-xl p-3">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-4 bg-t-magenta rounded-full opacity-50" />
                <p className="text-xs font-bold text-t-magenta leading-relaxed break-words">
                  {play.talkTrack}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Accessories section for sales intents — collapsible */}
      {showAccessories && (
        <div>
          <button
            type="button"
            onClick={() => setAccOpen(!accOpen)}
            className="focus-ring glass-control w-full rounded-xl p-3 text-[9px] font-black uppercase tracking-widest text-t-dark-gray"
          >
            <span className="flex items-center gap-2"><Tag className="w-3 h-3 text-t-magenta" /> Accessories play</span>
            <ChevronDown className={`w-3.5 h-3.5 text-t-muted transition-transform ${accOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {accOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-3">
                  <div className="glass-feature rounded-2xl p-4 space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Fast accessory flow</p>
                    <p className="text-[10px] font-medium leading-snug text-t-dark-gray">
                      Protect the purchase first, solve one daily friction point second, then save the fun add-on for callers who want the upgrade to feel exciting.
                    </p>
                    <div className="space-y-1.5 text-[10px] font-medium text-t-dark-gray">
                      <p><span className="font-black">1.</span> Case or screen: protect the device they just spent money on.</p>
                      <p><span className="font-black">2.</span> Charger, cable, or mount: remove an everyday annoyance.</p>
                      <p><span className="font-black">3.</span> Audio or premium extra: only when the caller wants more than the basics.</p>
                    </div>
                  </div>

                  {/* Essentials — collapsible categories */}
                  <EssentialsAccordion intent={intent} age={age} />

                  {/* Big adds */}
                  <BigAddsSection age={age} />

                  <div className="glass-reading rounded-xl px-3 py-2">
                    <p className="text-[10px] text-t-magenta font-bold">
                      <strong>P360 isn't an accessory — it's a given.</strong> Pitch it like it's part of the phone purchase, not an add-on. $7–$26/mo depending on the device.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Support intent: premium accessory awareness card */}
      {isSupportCall && supportAccessory && (
        <div className="glass-stage-quiet rounded-2xl p-4 space-y-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta flex items-center gap-1.5">
            <Headphones className="w-3 h-3" />
            After you've helped them:
          </p>
          <div className="glass-reading rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <p className="text-xs font-black text-t-dark-gray">{supportAccessory.item.product}</p>
                <p className="text-[11px] text-t-dark-gray font-medium leading-snug">{supportAccessory.pitch}</p>
              </div>
	              <div className="text-right shrink-0">
	                <p className="text-sm font-black text-t-dark-gray">{supportAccessory.item.price}</p>
	                <p className="text-[9px] font-bold text-t-magenta">{supportAccessory.item.commission}</p>
	              </div>
            </div>
            <div className="glass-reading mt-3 flex items-center gap-1.5 rounded-xl px-3 py-2">
              <CreditCard className="w-3 h-3 text-t-magenta shrink-0" />
              <p className="text-[9px] text-t-dark-gray font-medium">They can finance it on their T-Mobile bill — most customers don't know this.</p>
            </div>
          </div>
	          <p className="text-[9px] font-medium text-t-dark-gray">{supportAccessory.item.naturalTransition}</p>
        </div>
      )}


    </motion.div>
  );
}

// --- Collapsible Essentials Accordion ---

function EssentialsAccordion({ intent, age }: { intent: Intent; age?: string }) {
  const recommended = useMemo(() => getRecommendedCategories(intent, age), [intent, age]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(recommended));

  // Re-open recommended categories when intent/age changes
  useEffect(() => {
    setExpanded(new Set(recommended));
  }, [recommended]);

  const toggle = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Pre-generate: show only top 2 recommended categories to keep focus narrow
  const visibleCategories = useMemo(() => {
    const recSet = new Set(recommended);
    const recCats = ESSENTIALS_TABLE.filter(c => recSet.has(c.id));
    const rest = ESSENTIALS_TABLE.filter(c => !recSet.has(c.id));
    return [...recCats, ...rest].slice(0, 2);
  }, [recommended]);

  return (
    <div className="glass-stage-quiet overflow-hidden rounded-2xl shadow-sm">
      <div className="px-4 pt-4 pb-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray">
          Top Essentials — qualifying items (save more w/ 3+)
        </p>
      </div>
      <div className="divide-y divide-t-light-gray/50">
        {visibleCategories.map((cat) => {
          const isOpen = expanded.has(cat.id);
          const isRec = recommended.includes(cat.id);
          return (
            <div key={cat.id}>
              <button
                type="button"
                onClick={() => toggle(cat.id)}
                aria-expanded={isOpen}
                className="focus-ring w-full flex items-center justify-between px-4 py-2.5 hover:bg-t-light-gray/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <p className={`text-[9px] font-black uppercase tracking-wider ${isRec ? 'text-t-magenta' : 'text-t-dark-gray'}`}>
                    {cat.category}
                  </p>
                  {isRec && (
                    <span className="text-[7px] font-black uppercase tracking-wider bg-t-magenta/10 text-t-magenta px-1.5 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                  <span className="text-[8px] text-t-muted font-medium">{cat.items.length} items</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-t-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 space-y-1.5">
                      {cat.items.slice(0, 2).map((item, i) => (
                        <div key={i} className="glass-reading rounded-xl p-2.5 transition-colors hover:border-t-magenta/30">
                          <div className="flex items-center justify-between gap-2 text-[10px]">
                            <span className="font-bold text-t-dark-gray min-w-0 break-words">{item.name}</span>
                            <div className="flex items-center gap-3 shrink-0">
                              {'originalPrice' in item && item.originalPrice ? (
                                <>
                                  <span className="line-through text-t-muted">{item.originalPrice}</span>
                                  <span className="font-bold text-t-magenta">{item.price}</span>
                                </>
                              ) : item.bundle ? (
                                <span className="text-t-muted line-through">{item.price}</span>
                              ) : (
                                <span className="font-bold text-t-dark-gray">{item.price}</span>
                              )}
                              {item.bundle && (
                                <>
                                  <span className="font-bold text-t-magenta">{item.bundle}</span>
                                  <span className="text-[10px] font-semibold text-t-dark-gray">w/ setup</span>
                                </>
                              )}
                            </div>
                          </div>
                          {item.worksWith && (
                            <div className="flex gap-1 mt-1">
                              {item.worksWith.map((eco) => (
                                <span key={eco} className="text-[7px] font-black uppercase tracking-wider bg-t-light-gray/30 text-t-dark-gray px-1 py-0.5 rounded">{eco}</span>
                              ))}
                            </div>
                          )}
                          <p className="text-[9px] text-t-dark-gray font-medium leading-snug mt-1.5">{item.why}</p>
                          <p className="mt-1 text-[10px] font-bold text-t-magenta">{item.pitch}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Big Adds with age-based highlighting ---

function BigAddsSection({ age }: { age?: string }) {
  const ageKey = age && age !== 'Not Specified' ? age : null;

  // Pre-generate: show only top 2, prioritizing age-matched items
  const visibleAdds = useMemo(() => {
    const sorted = [...BIG_ADDS].sort((a, b) => {
      const aMatch = ageKey && a.bestFor?.includes(ageKey) ? 1 : 0;
      const bMatch = ageKey && b.bestFor?.includes(ageKey) ? 1 : 0;
      return bMatch - aMatch;
    });
    return sorted.slice(0, 2);
  }, [ageKey]);

  return (
    <div className="glass-stage-quiet rounded-2xl p-4 shadow-sm">
      <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray mb-2">Top big swings</p>
        <div className="space-y-2">
          {visibleAdds.map((item, i) => {
            const highlighted = ageKey && item.bestFor?.includes(ageKey);
            return (
            <div key={i} className={`rounded-xl p-3 text-[10px] ${highlighted ? 'glass-feature' : 'glass-reading'} transition-colors`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-black text-t-dark-gray min-w-0 break-words">{item.name}</span>
                  <span className="text-t-muted shrink-0">{item.note}</span>
                  {highlighted && (
                    <Star className="w-2.5 h-2.5 text-t-magenta fill-t-magenta shrink-0" />
                  )}
                </div>
                <span className="font-black text-t-dark-gray shrink-0">{item.price}</span>
              </div>
              <p className="text-[9px] text-t-dark-gray font-medium leading-snug mt-1.5">{item.why}</p>
              <p className="mt-1 text-[10px] font-bold text-t-magenta">{item.pitch}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
