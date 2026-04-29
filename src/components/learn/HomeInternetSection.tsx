import { useState } from 'react';
import { Home, ChevronRight, Zap, Shield, MessageSquareQuote, AlertTriangle, DollarSign, Cable, Globe, Router, Users, Briefcase, Heart } from 'lucide-react';
import { HOME_INTERNET_PLANS, HINT_SELLING_FRAMEWORK, FIBER_INFO, OTHER_HOME_PRODUCTS } from '../../data/homeInternet';
import LearnSectionHeader from './LearnSectionHeader';

type Section = 'plans' | 'selling' | 'objections' | 'competitors' | 'fiber';
const PLAN_IMAGES: Record<string, string> = {
  Rely: '/images/ui/hint-rely.png',
  Amplified: '/images/ui/hint-amplified.png',
  'All-In': '/images/ui/hint-all-in.png',
};

const PRODUCT_IMAGE_FALLBACK = '/images/ui/product-card-fallback.svg';
const HOME_INTERNET_HERO_IMAGE = '/images/home-internet/hint-hero-gateway.png';

export default function HomeInternetSection() {
  const [activeSection, setActiveSection] = useState<Section>('plans');

  return (
    <div className="space-y-5">
      <LearnSectionHeader
        eyebrow="Biggest Push Right Now"
        title="T-Mobile Home Internet"
        description="Check the address first, lead with simplicity and savings, and only open the objection or competitor lane when the caller gives you a real blocker."
        icon={<Home className="h-4 w-4" />}
        chips={['From $35/mo', '15-day test drive', 'Self-install']}
        variant="compact"
      />

      <div className="overflow-hidden rounded-[1.8rem] border border-t-magenta/20 glass-billboard text-white shadow-xl">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-5 sm:p-6">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/75">
              <Router className="h-3.5 w-3.5 text-white" /> Home Wi-Fi story
            </p>
            <h3 className="max-w-xl text-2xl font-black uppercase tracking-tight sm:text-3xl">
              Make HINT feel simple before you talk specs.
            </h3>
            <p className="mt-3 max-w-xl text-sm font-semibold leading-relaxed text-white/78">
              Lead with the customer outcome: fewer cable headaches, easy gateway setup, and whole-home coverage after the address qualifies.
            </p>
          </div>
          <div className="relative min-h-[13rem] overflow-hidden lg:min-h-full">
            <img
              src={HOME_INTERNET_HERO_IMAGE}
              alt="T-Mobile Home Internet gateway with magenta signal coverage in a home"
              className="h-full min-h-[13rem] w-full object-cover"
              width={768}
              height={432}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent lg:bg-gradient-to-r lg:from-black/28 lg:to-transparent" />
          </div>
        </div>
      </div>

      <div className="rounded-[1.8rem] glass-reading-strong p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-t-magenta">
              <Zap className="w-3 h-3" /> Address-check lane
            </p>
            <p className="text-[12px] font-semibold leading-relaxed text-foreground">
              Check the address first, hook with the savings second, then only open plans, objections, or competition after you know the home qualifies.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[32rem]">
            {[
              'Check the address before you pitch.',
              'Lead with easy setup and lower bill.',
              'Use objections only when they surface a blocker.',
            ].map((step, index) => (
              <div key={step} className="rounded-[1.1rem] bg-info-surface/75 px-3 py-2">
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-info-foreground">Step {index + 1}</p>
                <p className="mt-1 text-[11px] font-medium leading-snug text-info-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section nav */}
      <div className="flex flex-wrap rounded-[1.5rem] p-1 gap-1 glass-stage-quiet">
        {[
          { id: 'plans' as Section, icon: DollarSign, label: 'Plans' },
          { id: 'selling' as Section, icon: MessageSquareQuote, label: 'How to Sell' },
          { id: 'objections' as Section, icon: Shield, label: 'Objections' },
          { id: 'competitors' as Section, icon: Globe, label: 'vs Competition' },
          { id: 'fiber' as Section, icon: Cable, label: 'Fiber' },
        ].map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(s.id)}
            className={`focus-ring flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap md:text-[11px] ${
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

      {/* Plans */}
      {activeSection === 'plans' && (
        <div className="space-y-4">
          {HOME_INTERNET_PLANS.map((plan, idx) => {
            const tierConfig = [
              { tag: 'GOOD', tagColor: 'bg-info-accent', customerTypes: ['Budget-conscious', 'Light browsing'], icon: Users },
              { tag: 'BETTER', tagColor: 'bg-warning-accent', customerTypes: ['Streamers', 'Work from home'], icon: Briefcase },
              { tag: 'BEST', tagColor: 'bg-success-accent', customerTypes: ['Non-techie households', 'Families', 'Gamers'], icon: Heart },
            ][idx] || { tag: 'GOOD', tagColor: 'bg-info-accent', customerTypes: [], icon: Users };

            return (
              <div
                key={plan.name}
                className={`rounded-3xl border-2 overflow-hidden transition-all hover:shadow-lg ${
                  idx === 2 ? 'border-t-magenta bg-t-magenta/5' : 'glass-card'
                }`}
              >
                {/* Plan Image */}
                <div className="relative aspect-video overflow-hidden md:h-44 md:aspect-auto">
                  <img
                    src={PLAN_IMAGES[plan.name] ?? PRODUCT_IMAGE_FALLBACK}
                    alt={plan.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    width={1200}
                    height={675}
                    loading="lazy"
                    onError={(event) => {
                      const image = event.currentTarget;
                      if (image.dataset.fallback === 'true') return;
                      image.dataset.fallback = 'true';
                      image.src = PRODUCT_IMAGE_FALLBACK;
                    }}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-xl font-black text-white uppercase tracking-tight">{plan.name}</h4>
                      <span className={`${tierConfig.tagColor} rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white`}>{tierConfig.tag}</span>
                      {idx === 2 && <span className="rounded-full bg-t-magenta px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">Push This</span>}
                    </div>
                    <p className="text-[11px] text-white/90 font-medium">{plan.bestFor}</p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {tierConfig.customerTypes.map((ct) => (
                        <span key={ct} className="rounded-full bg-t-light-gray/40 px-2 py-0.5 text-[10px] font-bold text-t-muted">{ct}</span>
                      ))}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-t-magenta leading-none">${plan.withVoiceLine}<span className="text-sm">/mo</span></p>
                      <p className="text-[10px] text-t-muted font-bold mt-1">w/ voice line</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-t-light-gray/30 rounded-xl p-3">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-t-muted">Download</p>
                      <p className="text-sm font-black text-t-dark-gray">{plan.typicalDownload}</p>
                    </div>
                    <div className="bg-t-light-gray/30 rounded-xl p-3">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-t-muted">Upload</p>
                      <p className="text-sm font-black text-t-dark-gray">{plan.typicalUpload}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-success-accent shrink-0" />
                        <p className="text-[11px] text-t-dark-gray font-medium">{f}</p>
                      </div>
                    ))}
                  </div>

                  {plan.includedPerks.length > 0 && (
                    <div className="bg-success-surface rounded-xl border border-success-border p-3">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-success-foreground">Included Perks</p>
                      {plan.includedPerks.map((perk, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Zap className="w-3 h-3 text-success-accent shrink-0" />
                          <p className="text-[11px] text-success-foreground font-bold">{perk}</p>
                        </div>
                      ))}
                      <p className="mt-2 text-[10px] font-medium text-success-foreground/70">Over $480/year in streaming & security value</p>
                    </div>
                  )}

                  {/* Mesh Router callout for All-In */}
                  {idx === 2 && (
                    <div className="bg-gradient-to-r from-t-magenta/10 to-t-berry/10 rounded-xl border-2 border-t-magenta/30 p-4 mt-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-t-magenta/20 flex items-center justify-center shrink-0">
                          <Router className="w-5 h-5 text-t-magenta" />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight text-t-magenta mb-1">The #1 Reason to Push All-In</p>
                          <p className="text-[11px] font-bold text-t-dark-gray leading-relaxed">
                            The included mesh router is the game-changer. Most customers don't know they have interference — thick walls, microwaves, the router in a bad spot. The mesh router lets them put nodes where they need them for full coverage throughout the house.
                          </p>
                          <p className="text-[11px] text-t-dark-gray font-medium mt-2 leading-relaxed">
                            For non-techie customers especially, this is the pitch: "You don't have to figure out the best spot — the mesh system handles it. Put one near where you stream, one in the home office, and you're covered everywhere."
                          </p>
                          <div className="mt-3 bg-t-dark-gray rounded-lg p-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-t-magenta mb-1">Say This</p>
                            <p className="text-sm font-bold leading-relaxed text-white">
                              "The All-In comes with a mesh router — so instead of hoping your Wi-Fi reaches the back bedroom, you just place a second node there. No dead zones, no guessing. It basically sets itself up."
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Other products */}
          <div className="rounded-2xl border-2 glass-card p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mb-3">Other Home Products</p>
            <div className="space-y-3">
              <div className="bg-t-light-gray/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-black text-t-dark-gray">{OTHER_HOME_PRODUCTS.away.name}</p>
                  <p className="text-sm font-black text-t-magenta">${OTHER_HOME_PRODUCTS.away.price}/mo</p>
                </div>
                <p className="text-[11px] text-t-dark-gray font-medium">{OTHER_HOME_PRODUCTS.away.description}</p>
              </div>
              <div className="bg-t-light-gray/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-black text-t-dark-gray">{OTHER_HOME_PRODUCTS.backup.name}</p>
                  <p className="text-sm font-black text-t-magenta">${OTHER_HOME_PRODUCTS.backup.price}/mo</p>
                </div>
                <p className="text-[11px] text-t-dark-gray font-medium">{OTHER_HOME_PRODUCTS.backup.description}</p>
              </div>
            </div>
          </div>

          {/* Current promos */}
          <div className="bg-success-surface rounded-2xl border-2 border-success-border p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-success-foreground mb-3 flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> Active Promos
            </p>
            <div className="space-y-2">
              {Object.values(HINT_SELLING_FRAMEWORK.currentPromos).map((promo, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-success-accent mt-0.5 shrink-0" />
                  <p className="text-[11px] text-success-foreground font-bold">{promo}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* How to Sell */}
      {activeSection === 'selling' && (
        <div className="space-y-4">
          {/* Opening lines */}
          <div className="rounded-2xl border-2 glass-card p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-3 flex items-center gap-1.5">
              <MessageSquareQuote className="w-3 h-3" /> Opening Lines — Pick One
            </p>
            <div className="space-y-3">
              {HINT_SELLING_FRAMEWORK.openingLines.map((line, i) => (
                <div key={i} className="bg-t-dark-gray rounded-xl p-4 text-white">
                  <p className="text-sm font-bold leading-relaxed">{line}</p>
                </div>
              ))}
            </div>
          </div>

          {/* The pitch flow */}
          <div className="rounded-2xl border-2 glass-card p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mb-3">The 30-second pitch</p>
            <div className="space-y-3">
              {[
                { step: '1', title: 'Check the Address', desc: '"Let me see if Home Internet is available at your address — takes two seconds."' },
                { step: '2', title: 'If Available — Hook Them', desc: '"Great news — it\'s available! Starts at $30/month with your phone line. No contract, no data caps, no equipment fees."' },
                { step: '3', title: 'Ask About Current ISP', desc: '"Who do you use now? What are you paying?" (They\'re almost always paying more.)' },
                { step: '4', title: 'Stack the Value', desc: '"So you\'d save $[X]/month, and with All-In you also get Hulu and Paramount+ included — that\'s another $20+ in value."' },
                { step: '5', title: 'Close with Test Drive', desc: '"And the best part — there\'s a 15-day test drive. Try it risk-free. If it doesn\'t work for your home, full refund. No commitment."' },
              ].map((step) => (
                <div key={step.step} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-t-magenta flex items-center justify-center shrink-0">
                    <span className="text-sm font-black text-white">{step.step}</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-t-dark-gray">{step.title}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-t-dark-gray">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reminder */}
          <div className="bg-warning-surface rounded-2xl border-2 border-warning-border p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-warning-foreground mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" /> Don't forget
            </p>
            <p className="text-sm text-warning-foreground font-bold">{HINT_SELLING_FRAMEWORK.everyCallReminder}</p>
          </div>
        </div>
      )}

      {/* Objection Handling */}
      {activeSection === 'objections' && (
        <div className="space-y-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-muted">When They Push Back</p>
          {HINT_SELLING_FRAMEWORK.objectionHandlers.map((obj, i) => (
            <div key={i} className="rounded-2xl border-2 glass-card p-4">
              <p className="text-sm font-black text-t-dark-gray mb-3">{obj.objection}</p>
              <div className="bg-t-dark-gray rounded-xl p-4 text-white">
                <p className="text-sm font-bold leading-relaxed">{obj.response}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* vs Competition */}
      {activeSection === 'competitors' && (
        <div className="space-y-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-muted">Why T-Mobile Wins</p>
          {HINT_SELLING_FRAMEWORK.vsCompetitors.map((comp, i) => (
            <div key={i} className="rounded-2xl border-2 glass-card p-4">
              <p className="text-sm font-black text-t-dark-gray mb-3">vs {comp.competitor}</p>
              <div className="space-y-2">
                {comp.tmobileAdvantages.map((adv, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success-accent mt-1.5 shrink-0" />
                    <p className="text-[11px] text-t-dark-gray font-medium">{adv}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fiber */}
      {activeSection === 'fiber' && (
        <div className="space-y-4">
          <div className="bg-warning-surface rounded-2xl border-2 border-warning-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <Cable className="w-4 h-4 text-warning-accent" />
              <span className="bg-warning-accent/20 text-warning-foreground text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Coming Soon</span>
            </div>
            <p className="text-sm text-warning-foreground font-bold mb-2">{FIBER_INFO.overview}</p>
          </div>

          {/* Fiber plans */}
          <div className="rounded-2xl border-2 glass-card p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mb-3">Fiber Plans (Preview)</p>
            <div className="space-y-3">
              {FIBER_INFO.plans.map((plan, i) => (
                <div key={i} className="bg-t-light-gray/30 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-black text-t-dark-gray">{plan.name}</p>
                    <p className="text-sm font-bold text-t-muted">{plan.price}</p>
                  </div>
                  <p className="text-[11px] text-t-dark-gray font-medium">{plan.speeds}</p>
                  <p className="text-[10px] text-t-muted font-medium mt-1">{plan.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fiber vs Wireless differences */}
          <div className="rounded-2xl border-2 glass-card p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mb-3">Fiber vs Wireless — Key Differences</p>
            <div className="space-y-2">
              {FIBER_INFO.keyDifferences.map((diff, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-t-magenta mt-1.5 shrink-0" />
                  <p className="text-[11px] text-t-dark-gray font-medium">{diff}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What to say */}
          <div className="bg-t-dark-gray rounded-2xl p-5 text-white">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-2 flex items-center gap-1.5">
              <MessageSquareQuote className="w-3 h-3" /> What To Tell Customers
            </p>
            <p className="text-sm font-bold leading-relaxed">{FIBER_INFO.whatToTellCustomers}</p>
          </div>
        </div>
      )}
    </div>
  );
}
