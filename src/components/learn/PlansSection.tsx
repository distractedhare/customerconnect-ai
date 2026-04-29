import { useState } from 'react';
import { DollarSign, Zap, Crown, ChevronDown, ChevronRight, Star, Users, Briefcase, Shield, Smartphone, Watch, Tablet } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { POSTPAID_PLANS, SPECIALIZED_PLANS, RETIRED_PLANS } from '../../data/plans';
import LearnSectionHeader from './LearnSectionHeader';

type Section = 'phone' | 'connected' | 'specialized' | 'why-premium';

const PLAN_TIERS: Record<string, { tag: string; tagColor: string; bestFor: string; repInsight: string; image: string }> = {
  'Experience Beyond': {
    tag: 'BEST',
    tagColor: 'bg-t-magenta text-white',
    bestFor: 'Power users, streamers, travelers, families who want everything. Customers who hate limits.',
    repInsight: 'Highest margin, lowest churn. These customers stay because they never hit a wall — no throttling, no "you used too much." They get Netflix + Hulu + Apple TV+, 250GB hotspot, yearly upgrades, and satellite. When they call back, it\'s to ADD lines, not complain. This is the plan you want every customer on.',
    image: '/images/ui/plan-experience-beyond.png',
  },
  'Experience More': {
    tag: 'BETTER',
    tagColor: 'bg-t-berry text-white',
    bestFor: 'Most customers. Great balance of premium features and price. The sweet spot.',
    repInsight: 'Your bread and butter. Same unlimited premium data as Beyond, Netflix + Apple TV+ included, 60GB hotspot, in-flight Wi-Fi. Covers 90% of what customers actually need. When someone says "I don\'t need ALL that" about Beyond, this is where you land them. Still a premium plan, still great metrics for you.',
    image: '/images/ui/plan-experience-more.png',
  },
  'Better Value': {
    tag: 'BEST VALUE',
    tagColor: 'bg-success-accent text-white',
    bestFor: 'Families with 3+ lines who qualify — switchers or long-tenure customers.',
    repInsight: 'This is your secret weapon for switchers. Beyond-level features at $46.67/line for 3 lines. The catch: they need 3+ lines AND either 2 port-ins (new) or 5+ years tenure (existing). If they qualify, it\'s an easy close — show the math vs what they\'re paying at AT&T/Verizon.',
    image: '/images/ui/plan-better-value.png',
  },
  'Essentials': {
    tag: 'GOOD',
    tagColor: 'bg-t-dark-gray/60 text-white',
    bestFor: 'Price-sensitive customers, light users, seniors on a budget. Use as a last resort.',
    repInsight: 'Don\'t lead with this. It has deprioritized data (slow during congestion), 480p video, no hotspot worth using, and no in-flight Wi-Fi. If you put someone here who streams or hotspots, they\'ll call back frustrated. Only use when the customer truly can\'t afford More/Beyond and you\'d lose the sale entirely.',
    image: '/images/ui/plan-essentials.png',
  },
  'Essentials Saver': {
    tag: 'BUDGET',
    tagColor: 'bg-t-dark-gray/40 text-white',
    bestFor: 'Absolute bottom dollar. Not eligible for most promos.',
    repInsight: 'Last resort only. Most device promos don\'t apply, data is heavily deprioritized, no perks. If a customer is on this plan, you\'re leaving money on the table AND they\'ll have a worse experience. Always try to move them up to at least Essentials.',
    image: '/images/ui/plan-essentials-saver.png',
  },
};

const QUICK_FACTS = [
  'Experience Beyond & More both have UNLIMITED PREMIUM data — zero deprioritization, ever',
  'The streaming perks on Beyond alone are worth ~$20/mo (Netflix + Hulu + Apple TV+)',
  'Beyond has 250GB hotspot — most competitors cap at 15-50GB',
  'Essentials data gets deprioritized during congestion — customers WILL notice in busy areas',
  'In-flight Wi-Fi is included on More and Beyond — Essentials customers have to pay per flight',
  '5-Year Price Guarantee on ALL current plans — the price they sign up at is locked',
  'Connected device lines (tablets, watches) are only $5/mo on Beyond vs $10-20 on lower tiers',
  '3rd-line-free promo is active right now on Beyond and More — HUGE for families',
];

const CONNECTED_PLANS = [
  {
    type: 'Tablet Line',
    icon: Tablet,
    pricing: [
      { plan: 'Experience Beyond', price: '$5/mo', note: 'Shares plan features' },
      { plan: 'Experience More', price: '$10/mo', note: 'Shares plan features' },
      { plan: 'Essentials', price: '$20/mo', note: 'Standalone pricing' },
    ],
    tip: 'On Beyond, a tablet line is only $5/mo — that\'s cheaper than a Netflix subscription. Lead with that.',
  },
  {
    type: 'Watch Line',
    icon: Watch,
    pricing: [
      { plan: 'Experience Beyond', price: '$5/mo', note: 'Shares plan features' },
      { plan: 'Experience More', price: '$10/mo', note: 'Shares plan features' },
      { plan: 'Essentials', price: '$10-15/mo', note: 'Basic connectivity' },
    ],
    tip: 'Watch lines on premium plans share the phone\'s features. On Essentials, it\'s basic only.',
  },
  {
    type: 'SyncUP / IoT',
    icon: Smartphone,
    pricing: [
      { plan: 'SyncUP Tracker', price: '$5/mo', note: 'GPS tracking line' },
      { plan: 'SyncUP DRIVE', price: '$10-20/mo', note: 'Connected car (Magenta Drive plan)' },
    ],
    tip: 'Tracker lines are $5/mo regardless of phone plan. DRIVE needs its own data plan.',
  },
];

export default function PlansSection() {
  const [activeSection, setActiveSection] = useState<Section>('why-premium');

  return (
    <div className="space-y-5">
      <LearnSectionHeader
        eyebrow="Plan Positioning"
        title="Plans Breakdown"
        description="Lead with fit, use one proof point, and only fall to Essentials when budget is the real blocker. The premium story should feel obvious, not rehearsed."
        icon={<Crown className="h-4 w-4" />}
        chips={['5 phone plans', 'Connected lines', '3rd line free']}
        variant="compact"
      />

      <div className="rounded-[1.8rem] glass-reading-strong p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-1 flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> Premium value rail
            </p>
            <p className="text-[12px] font-semibold leading-relaxed text-foreground">
              Lead with Beyond or More first. Use one value proof, show the per-line math, and only fall to Essentials when budget is the real blocker.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:max-w-2xl">
            {QUICK_FACTS.slice(0, 4).map((fact, i) => (
              <div key={i} className="rounded-[1.1rem] bg-info-surface/75 px-3 py-2">
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-info-foreground">Proof point</p>
                <p className="mt-1 text-[11px] font-medium leading-snug text-info-foreground">{fact}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section nav */}
      <div className="flex flex-wrap gap-1 rounded-[1.5rem] p-1 glass-stage-quiet md:flex-nowrap md:gap-2">
        {[
          { id: 'why-premium' as Section, icon: Star, label: 'Why Premium' },
          { id: 'phone' as Section, icon: DollarSign, label: 'Phone Plans' },
          { id: 'connected' as Section, icon: Watch, label: 'Connected' },
          { id: 'specialized' as Section, icon: Users, label: 'Specialized' },
        ].map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(s.id)}
            className={`focus-ring flex min-h-[44px] flex-1 items-center justify-center gap-1 px-2 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all md:text-[11px] whitespace-nowrap ${
              activeSection === s.id
                ? 'glass-control-active text-white'
                : 'glass-control text-t-muted hover:text-t-dark-gray'
            }`}
          >
            <s.icon className="w-3 h-3" />
            {s.label}
          </button>
        ))}
      </div>

      {/* WHY PREMIUM */}
      {activeSection === 'why-premium' && (
        <div className="space-y-4">
          <div className="rounded-2xl glass-reading-strong p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-t-magenta mb-2">Real Talk</p>
            <h4 className="text-lg font-black mb-3 text-foreground">Why You Should Push for Experience More or Beyond</h4>
            <div className="space-y-3">
              {[
                { title: 'For the customer', points: [
                  'No throttling. Ever. Their data is premium — they\'ll never get slowed down at a concert, sporting event, or busy area.',
                  'Streaming perks pay for themselves. Netflix + Hulu + Apple TV+ = ~$20/mo in value. That\'s basically the price difference from Essentials.',
                  'They can actually USE their hotspot. 60-250GB vs basically nothing on Essentials.',
                  'In-flight Wi-Fi included. No more paying $8 per flight.',
                  'Satellite connectivity (Beyond) — texts go through even with zero bars in remote areas.',
                ]},
                { title: 'For you', points: [
                  'Higher margin plans = better commission and metrics.',
                  'Lower churn — premium customers don\'t leave. They\'re getting too much value.',
                  'Fewer callbacks. Essentials customers call back to complain about slow data. Premium customers don\'t.',
                  'Upgrade eligibility. Beyond customers can upgrade yearly (6 months + 50% paid) — that\'s a future sale.',
                  'Connected device attach rate goes up. $5/line for tablets/watches on Beyond vs $20 on Essentials — easier sell.',
                ]},
              ].map((block) => (
                <div key={block.title}>
                  <p className="text-[10px] font-black uppercase tracking-wider text-t-muted mb-1.5">{block.title}</p>
                  {block.points.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1.5">
                      <ChevronRight className="w-3 h-3 text-t-magenta/70 mt-0.5 shrink-0" />
                      <p className="text-[11px] font-medium text-t-dark-gray leading-snug">{point}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-warning-border bg-warning-surface p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-warning-foreground mb-3">What customers miss on Essentials</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Data gets throttled during congestion',
                'Video capped at 480p (DVD quality)',
                'No usable hotspot (600 Kbps = unusable)',
                'No in-flight Wi-Fi',
                'No Netflix/Hulu/Apple TV+',
                'No satellite connectivity',
                'No yearly upgrade option',
                'Connected devices cost 2-4x more per line',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-warning-accent font-black text-xs mt-0.5">✕</span>
                  <p className="text-[11px] text-warning-foreground font-medium leading-snug">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* The script */}
          <div className="rounded-2xl glass-reading-strong p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mb-3">How to say it on a live call</p>
            <div className="space-y-3">
              {[
                '"I want to make sure you\'re getting the most out of T-Mobile. The plan you\'re on — your data can get slowed down when the network\'s busy. On Experience More, that never happens."',
                '"The streaming alone is worth the upgrade — Netflix and Apple TV+ are included. That\'s $18/month you\'re already paying separately."',
                '"With your phone plan, you\'d also get in-flight Wi-Fi included. No more paying $8 per flight."',
                '"Let me show you the per-line math. With the 3rd-line-free promo right now, Experience More is actually only about $47/line for 3 lines."',
              ].map((script, i) => (
                <div key={i} className="border-l-3 border-t-magenta pl-3 py-1" style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--color-t-magenta)' }}>
                  <p className="text-[11px] font-medium leading-snug" style={{ color: 'var(--text-pitch, #C70066)' }}>{script}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PHONE PLANS */}
      {activeSection === 'phone' && (
        <div className="space-y-4">
          {POSTPAID_PLANS.map((plan) => {
            const tier = PLAN_TIERS[plan.name];
            if (!tier) return null;
            return <PlanCard key={plan.name} plan={plan} tier={tier} />;
          })}

          {/* Retired plans note */}
          <div className="rounded-2xl border border-t-light-gray/50 p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mb-2">Retired Plans</p>
            <div className="space-y-1">
              {RETIRED_PLANS.map((p) => (
                <p key={p.name} className="text-[11px] text-t-muted font-medium">
                  <span className="font-bold">{p.name}</span> — {p.note}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONNECTED DEVICES */}
      {activeSection === 'connected' && (
        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-t-magenta/20 bg-t-magenta/5 p-4">
            <p className="text-[10px] font-black text-t-magenta uppercase tracking-wider mb-1">Key insight</p>
            <p className="text-[12px] font-medium text-t-dark-gray leading-snug">
              Connected device lines are dramatically cheaper on premium plans. A tablet on Beyond is $5/mo — on Essentials it's $20/mo.
              That's your pitch: "Upgrading your phone plan actually makes your tablet cheaper too."
            </p>
          </div>

          {CONNECTED_PLANS.map((cp) => (
            <div key={cp.type} className="rounded-2xl border-2 border-t-light-gray bg-surface-elevated p-5">
              <div className="flex items-center gap-2 mb-3">
                <cp.icon className="w-4 h-4 text-t-magenta" />
                <h4 className="text-sm font-black uppercase tracking-tight">{cp.type}</h4>
              </div>
              <div className="space-y-2 mb-3">
                {cp.pricing.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] py-1.5 border-b border-t-light-gray/50 last:border-0">
                    <span className="font-bold text-t-dark-gray">{p.plan}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-t-magenta">{p.price}</span>
                      <span className="text-t-muted font-medium text-[10px]">{p.note}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-t-magenta/5 rounded-xl px-3 py-2 border border-t-magenta/10">
                <p className="text-[10px] font-bold text-t-magenta">{cp.tip}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SPECIALIZED */}
      {activeSection === 'specialized' && (
        <div className="space-y-4">
          {[
            { title: '55+ Plans', icon: Users, content: SPECIALIZED_PLANS.senior.description },
            { title: 'Military & First Responder', icon: Shield, content: SPECIALIZED_PLANS.military.description },
            { title: 'Business Plans', icon: Briefcase, content: SPECIALIZED_PLANS.business.description },
          ].map((sp) => (
            <div key={sp.title} className="rounded-2xl border-2 border-t-light-gray bg-surface-elevated p-5">
              <div className="flex items-center gap-2 mb-2">
                <sp.icon className="w-4 h-4 text-t-berry" />
                <h4 className="text-sm font-black uppercase tracking-tight">{sp.title}</h4>
              </div>
              <p className="text-[12px] text-t-dark-gray font-medium leading-relaxed">{sp.content}</p>
            </div>
          ))}

          {/* Prepaid */}
          <div className="rounded-2xl border-2 border-t-light-gray bg-surface-elevated p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-t-berry" />
              <h4 className="text-sm font-black uppercase tracking-tight">Prepaid Plans</h4>
            </div>
            <div className="space-y-1.5">
              {SPECIALIZED_PLANS.prepaid.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-[11px] py-1.5 border-b border-t-light-gray/50 last:border-0">
                  <div>
                    <span className="font-bold text-t-dark-gray">{p.name}</span>
                    <span className="text-t-muted ml-2 font-medium">{p.data}</span>
                  </div>
                  <span className="font-black text-t-magenta">${p.price}/mo</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan, tier }: { plan: typeof POSTPAID_PLANS[0]; tier: typeof PLAN_TIERS[string] }) {
  const [expanded, setExpanded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imageSource = hasError ? '/images/ui/product-card-fallback.svg' : tier.image;
  const isBest = tier.tag === 'BEST';
  const isBetter = tier.tag === 'BETTER' || tier.tag === 'BEST VALUE';
  const imageLabel = `${plan.name} plan image`;

  return (
    <div className={`rounded-3xl border-2 overflow-hidden transition-all hover:shadow-lg ${isBest ? 'border-t-magenta bg-t-magenta/5' : isBetter ? 'border-t-berry/30 bg-surface-elevated' : 'border-t-light-gray bg-surface-elevated'}`}>
      {/* Plan Image */}
      <div className="relative aspect-video overflow-hidden md:h-40 md:aspect-auto">
        <img
          src={imageSource}
          alt={imageLabel}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          width={1200}
          height={675}
          loading="lazy"
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-5">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-xl font-black uppercase tracking-tight text-white">{plan.name}</h4>
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${tier.tagColor}`}>
              {tier.tag}
            </span>
          </div>
          <p className="text-[11px] text-white/90 font-medium">{tier.bestFor}</p>
        </div>
      </div>

      <div className="p-5">
        {/* Pricing grid */}
        <div className="rounded-xl border border-t-light-gray overflow-hidden mb-3">
          <div className="grid grid-cols-3 bg-t-light-gray/30 px-2.5 py-2 text-[10px] font-black uppercase tracking-wider text-t-muted">
            <span>Lines</span>
            <span className="text-right">Total</span>
            <span className="text-right">/line</span>
          </div>
          {plan.pricing.map((p) => (
            <div key={p.lines} className="grid grid-cols-3 text-[11px] px-3 py-2 border-t border-t-light-gray/50">
              <span className="font-bold text-t-dark-gray">{p.lines} line{p.lines > 1 ? 's' : ''}</span>
              <span className="text-right font-bold text-t-dark-gray">${p.monthlyTotal}/mo</span>
              <span className="text-right font-black text-t-magenta">${p.perLine.toFixed(2)}/line</span>
            </div>
          ))}
          {plan.pricing.some(p => p.promoNote) && (
            <div className="px-3 py-1.5 bg-success-surface border-t border-success-border">
              <p className="text-[9px] font-bold text-success-foreground">
                {plan.pricing.find(p => p.promoNote)?.promoNote}
              </p>
            </div>
          )}
        </div>

        {/* Rep insight */}
        <div className="bg-t-magenta/5 rounded-xl px-3 py-2.5 border border-t-magenta/10 mb-3">
          <p className="text-[9px] font-black uppercase tracking-wider text-t-magenta mb-1">Rep Insight</p>
          <p className="text-[11px] font-medium leading-snug" style={{ color: 'var(--text-pitch, #C70066)' }}>{tier.repInsight}</p>
        </div>

        {/* Expandable features */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="focus-ring w-full flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-t-muted hover:text-t-dark-gray transition-colors"
        >
          <span>{expanded ? 'Hide features' : `View all ${plan.features.length} features`}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-1.5">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 text-t-magenta mt-0.5 shrink-0" />
                    <p className="text-[11px] text-t-dark-gray font-medium leading-snug">{f}</p>
                  </div>
                ))}
                {plan.limitations && plan.limitations.length > 0 && (
                  <>
                    <p className="text-[9px] font-black uppercase tracking-widest text-warning-foreground mt-3 mb-1">Limitations</p>
                    {plan.limitations.map((l, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-warning-accent font-black text-xs mt-0.5">!</span>
                        <p className="text-[11px] text-warning-foreground font-medium leading-snug">{l}</p>
                      </div>
                    ))}
                  </>
                )}
                {plan.eligibility && plan.eligibility.length > 0 && (
                  <>
                    <p className="text-[9px] font-black uppercase tracking-widest text-info-foreground mt-3 mb-1">Eligibility</p>
                    {plan.eligibility.map((e, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-info-accent mt-1.5 shrink-0" />
                        <p className="text-[11px] text-info-foreground font-medium leading-snug">{e}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
