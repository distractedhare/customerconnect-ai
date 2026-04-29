import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Search, ShoppingBag, ArrowUpCircle, Package, Wrench, UserCircle,
  Smartphone, Wifi, Watch, Tablet, Zap, ChevronRight, CheckCircle2,
  MapPin, Sparkles, ArrowRight,
} from 'lucide-react';
import { SalesContext } from '../types';
import { WELCOME_MESSAGES, ONE_LINERS, DISCOVERY_QUESTIONS } from '../data/salesMethodology';
import OrderSupportSelector, { OrderSupportType } from './OrderSupportSelector';

interface GuidedCallModalProps {
  open: boolean;
  onClose: () => void;
  context: SalesContext;
  setContext: (value: React.SetStateAction<SalesContext>) => void;
}

type Step = 'intent' | 'orderSupport' | 'hint' | 'product' | 'age' | 'hero';

const INTENTS = [
  { id: 'exploring' as const,             label: 'Exploring',         icon: Search,        desc: 'Shopping around' },
  { id: 'ready to buy' as const,          label: 'Ready to Buy',      icon: ShoppingBag,   desc: 'Knows what they want' },
  { id: 'upgrade / add a line' as const,  label: 'Upgrade',           icon: ArrowUpCircle, desc: 'Existing customer' },
  { id: 'order support' as const,         label: 'Order Support',     icon: Package,       desc: 'Status, tracking, etc.' },
  { id: 'tech support' as const,          label: 'Tech Support',      icon: Wrench,        desc: 'Device or network issues' },
  { id: 'account support' as const,       label: 'Account',           icon: UserCircle,    desc: 'Billing, plans, etc.' },
];

const PRODUCTS = [
  { id: 'Phone' as const,               label: 'Phone',          icon: Smartphone },
  { id: 'Home Internet' as const,        label: 'Home Internet',  icon: Wifi },
  { id: 'BTS' as const,                  label: 'Watch / Tablet', icon: Watch },
  { id: 'IOT' as const,                  label: 'Connected',      icon: Tablet },
];

const SUPPORT_INTENTS = ['order support', 'tech support', 'account support'];
const SALES_INTENTS   = ['exploring', 'ready to buy', 'upgrade / add a line'];

function whisper(intent: SalesContext['purchaseIntent'], index = 0): string {
  return WELCOME_MESSAGES[intent]?.[index % 3] ?? WELCOME_MESSAGES['exploring'][0];
}

function oneLiner(intent: SalesContext['purchaseIntent'], index = 0): string {
  return ONE_LINERS[intent]?.[index % 3] ?? ONE_LINERS['exploring'][0];
}

function discoveryQ(product: string): string {
  return DISCOVERY_QUESTIONS[product]?.[0] ?? DISCOVERY_QUESTIONS['No Specific Product'][0];
}

const INTENT_META: Record<string, { label: string; eyebrow: string }> = {
  'exploring':           { label: 'Exploring', eyebrow: 'Discovery call' },
  'ready to buy':        { label: 'Ready to Buy', eyebrow: 'Close with confidence' },
  'upgrade / add a line':{ label: 'Upgrade / Add a Line', eyebrow: 'Stack value cleanly' },
  'order support':       { label: 'Order Support', eyebrow: 'Resolve, then pivot' },
  'tech support':        { label: 'Tech Support', eyebrow: 'Fix first, earn the pitch' },
  'account support':     { label: 'Account Support', eyebrow: 'Clarify, then guide' },
};

export default function GuidedCallModal({ open, onClose, context, setContext }: GuidedCallModalProps) {
  const [step, setStep]               = useState<Step>('intent');
  const [whisperText, setWhisperText] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    context.product.filter(p => p !== 'No Specific Product')
  );

  const isSupport = SUPPORT_INTENTS.includes(context.purchaseIntent);
  const isSales   = SALES_INTENTS.includes(context.purchaseIntent);

  // ── Step navigation ────────────────────────────────────────────────────────
  const advance = useCallback((nextStep: Step) => {
    setTimeout(() => {
      setWhisperText(null);
      setStep(nextStep);
    }, 520);
  }, []);

  const selectIntent = (id: SalesContext['purchaseIntent']) => {
    setContext(prev => ({ ...prev, purchaseIntent: id }));
    setWhisperText(whisper(id));
    if (id === 'order support') {
      advance('orderSupport');
    } else if (SUPPORT_INTENTS.includes(id)) {
      advance('hint');
    } else {
      advance('hint');
    }
  };

  const selectHint = (available: boolean) => {
    setContext(prev => ({ ...prev, hintAvailable: available }));
    setWhisperText(available
      ? 'Address check — do it now before the conversation goes anywhere else.'
      : 'No HINT available. Park it and focus on voice line value.'
    );
    if (isSales || SALES_INTENTS.includes(context.purchaseIntent)) {
      advance('product');
    } else {
      advance('hero');
    }
  };

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const confirmProducts = () => {
    const prods = selectedProducts.length
      ? selectedProducts as SalesContext['product']
      : ['Phone' as const];
    setContext(prev => ({ ...prev, product: prods }));
    advance('age');
  };

  const selectAge = (age: SalesContext['age']) => {
    setContext(prev => ({ ...prev, age }));
    advance('hero');
  };

  // ── Render helpers ─────────────────────────────────────────────────────────
  const Whisper = ({ text }: { text: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-feature mt-4 rounded-xl px-4 py-3"
    >
      <p className="text-[10px] font-black uppercase tracking-widest text-t-magenta mb-1">Say this</p>
      <p className="text-[12px] font-semibold text-t-dark-gray leading-snug italic">"{text}"</p>
    </motion.div>
  );

  // ── Steps ──────────────────────────────────────────────────────────────────
  const renderIntent = () => (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mb-1">Step 1</p>
        <h2 className="text-xl font-black text-t-dark-gray">Why are they calling?</h2>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {INTENTS.map(opt => (
          <motion.button
            key={opt.id}
            type="button"
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
            onClick={() => selectIntent(opt.id)}
            className="glass-reading flex flex-col items-center gap-2 rounded-2xl p-4 text-center group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-t-light-gray/30 flex items-center justify-center group-hover:bg-t-magenta group-hover:text-white transition-colors">
              <opt.icon className="w-5 h-5 text-t-dark-gray group-hover:text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-tight text-t-dark-gray">{opt.label}</p>
              <p className="text-[8px] text-t-muted mt-0.5">{opt.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
      {whisperText && <Whisper text={whisperText} />}
    </div>
  );

  const renderOrderSupport = () => (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mb-1">Step 2</p>
        <h2 className="text-xl font-black text-t-dark-gray">What kind of order issue?</h2>
      </div>
      <OrderSupportSelector
        value={context.orderSupportType ?? null}
        onChange={(type: OrderSupportType) => {
          setContext(prev => ({ ...prev, orderSupportType: type }));
          setWhisperText(ONE_LINERS['order support'][0]);
          advance('hint');
        }}
      />
      {whisperText && <Whisper text={whisperText} />}
      <button onClick={() => { setStep('hint'); }} className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-t-muted hover:text-t-magenta transition-colors">
        Skip
      </button>
    </div>
  );

  const renderHint = () => {
    const stepNum = context.purchaseIntent === 'order support' ? 3 : 2;
    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mb-1">Step {stepNum}</p>
          <h2 className="text-xl font-black text-t-dark-gray">HINT available?</h2>
          <p className="text-xs text-t-muted mt-1">Home Internet eligibility at their address</p>
        </div>
        <div className="flex gap-3">
          {[
            { label: 'Yes — available', value: true,  color: 'glass-control-active text-white' },
            { label: 'No — not available', value: false, color: 'glass-control text-t-dark-gray hover:text-foreground' },
          ].map(opt => (
            <motion.button
              key={String(opt.value)}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => selectHint(opt.value)}
              className={`flex-1 rounded-2xl py-4 font-black text-sm transition-all ${opt.color}`}
            >
              <MapPin className="w-5 h-5 mx-auto mb-1" />
              {opt.label}
            </motion.button>
          ))}
        </div>
        {whisperText && <Whisper text={whisperText} />}
        <button onClick={() => { SALES_INTENTS.includes(context.purchaseIntent) ? setStep('product') : setStep('hero'); }} className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-t-muted hover:text-t-magenta transition-colors">
          Skip
        </button>
      </div>
    );
  };

  const renderProduct = () => (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mb-1">Step 3</p>
        <h2 className="text-xl font-black text-t-dark-gray">What are they interested in?</h2>
        <p className="text-xs text-t-muted mt-1">Tap all that apply</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {PRODUCTS.map(opt => {
          const active = selectedProducts.includes(opt.id);
          return (
            <motion.button
              key={opt.id}
              type="button"
              whileTap={{ scale: 0.96 }}
              whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
              onClick={() => toggleProduct(opt.id)}
              className={`relative flex flex-col items-center gap-2 rounded-2xl p-4 transition-all
                ${active
                  ? 'glass-control-active'
                  : 'glass-reading'
                }`}
            >
              <opt.icon className={`w-6 h-6 ${active ? 'text-white' : 'text-t-dark-gray'}`} />
              <p className={`text-[10px] font-black uppercase tracking-tight ${active ? 'text-white' : 'text-t-dark-gray'}`}>{opt.label}</p>
              {active && <CheckCircle2 className="absolute top-2 right-2 w-3.5 h-3.5 text-white" />}
            </motion.button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={confirmProducts}
        disabled={selectedProducts.length === 0}
        className="cta-primary w-full rounded-2xl py-3.5 text-sm font-black uppercase tracking-widest text-white disabled:opacity-40 transition-opacity"
      >
        {selectedProducts.length === 0 ? 'Select at least one' : `Continue →`}
      </button>
    </div>
  );

  const renderAge = () => (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mb-1">Step 4 (optional)</p>
        <h2 className="text-xl font-black text-t-dark-gray">Caller's age range?</h2>
        <p className="text-xs text-t-muted mt-1">Unlocks tone-matched talk tracks</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(['18-24', '25-34', '35-54', '55+'] as const).map(age => (
          <motion.button
            key={age}
            type="button"
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
            onClick={() => selectAge(age)}
            className="glass-reading rounded-xl py-3.5 text-sm font-black text-t-dark-gray transition-all"
          >
            {age}
          </motion.button>
        ))}
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => selectAge('Not Specified')}
          className="glass-control col-span-3 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest text-t-muted transition-all hover:text-foreground"
        >
          Skip / Not sure
        </motion.button>
      </div>
    </div>
  );

  const renderHero = () => {
    const intent = context.purchaseIntent;
    const meta = INTENT_META[intent] ?? INTENT_META['exploring'];
    const opener = whisper(intent, 0);
    const liner  = oneLiner(intent, 1);
    const primaryProduct = context.product.find(p => p !== 'No Specific Product') ?? 'Phone';
    const dq = discoveryQ(primaryProduct);

    return (
      <div className="space-y-4">
        <div className="glass-billboard rounded-3xl p-5 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/70">{meta.eyebrow}</p>
              <h2 className="text-2xl font-black mt-0.5">{meta.label}</h2>
            </div>
            <div className="glass-utility flex h-12 w-12 items-center justify-center rounded-2xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Context chips */}
          <div className="flex flex-wrap gap-1.5">
            {context.hintAvailable !== undefined && (
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${context.hintAvailable ? 'bg-white/20 text-white' : 'bg-white/12 text-white/72'}`}>
                {context.hintAvailable ? 'HINT ✓' : 'No HINT'}
              </span>
            )}
            {context.product.filter(p => p !== 'No Specific Product').map(p => (
              <span key={p} className="px-2.5 py-1 rounded-full bg-white/20 text-[9px] font-black uppercase tracking-widest text-white">
                {p}
              </span>
            ))}
            {context.age !== 'Not Specified' && (
              <span className="px-2.5 py-1 rounded-full bg-white/15 text-[9px] font-black uppercase tracking-widest text-white/80">
                {context.age}
              </span>
            )}
            {context.orderSupportType && (
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-[9px] font-black uppercase tracking-widest text-white">
                {context.orderSupportType.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Opener */}
        <div className="glass-reading rounded-2xl p-4 space-y-1.5 shadow-md">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-t-magenta" />
            <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Open with</p>
          </div>
          <p className="text-[13px] font-semibold text-t-dark-gray leading-snug italic">"{opener}"</p>
        </div>

        {/* Ask first */}
        <div className="glass-reading rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-1.5 mb-2">
            <ChevronRight className="w-3.5 h-3.5 text-info-foreground" />
            <p className="text-[9px] font-black uppercase tracking-widest text-info-foreground">Ask first</p>
          </div>
          <p className="text-[13px] font-semibold text-t-dark-gray leading-snug">"{dq}"</p>
        </div>

        {/* One-liner */}
        <div className="glass-feature rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3.5 h-3.5 text-t-magenta" />
            <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Talk track</p>
          </div>
          <p className="text-[13px] font-bold text-t-dark-gray leading-snug italic">"{liner}"</p>
        </div>

        {/* CTA */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="cta-primary flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg"
        >
          Start Call <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    );
  };

  // ── Progress dots ──────────────────────────────────────────────────────────
  const steps: Step[] = context.purchaseIntent === 'order support'
    ? ['intent', 'orderSupport', 'hint', 'hero']
    : SALES_INTENTS.includes(context.purchaseIntent)
      ? ['intent', 'hint', 'product', 'age', 'hero']
      : ['intent', 'hint', 'hero'];

  const stepIndex = steps.indexOf(step);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Card — slides up from bottom */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg"
          >
            <div className="glass-modal rounded-t-3xl shadow-2xl">
              {/* Handle + close */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <div className="flex gap-1.5">
                  {steps.map((s, i) => (
                    <div
                      key={s}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i <= stepIndex ? 'bg-t-magenta w-5' : 'bg-t-light-gray w-2.5'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-t-light-gray/40 transition-colors text-t-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step content */}
              <div className="px-5 pb-8 overflow-y-auto max-h-[85svh]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.18 }}
                  >
                    {step === 'intent'        && renderIntent()}
                    {step === 'orderSupport'  && renderOrderSupport()}
                    {step === 'hint'          && renderHint()}
                    {step === 'product'       && renderProduct()}
                    {step === 'age'           && renderAge()}
                    {step === 'hero'          && renderHero()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
