import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2, 
  Smartphone, 
  Wifi, 
  Watch, 
  Tablet, 
  ArrowLeft,
  Sparkles,
  ChevronRight,
  Search,
  ShoppingBag,
  ArrowUpCircle,
  Package,
  Wrench,
  UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SalesContext } from '../types';
import { getSupportOptionsForIntent } from '../constants/supportFocus';

interface GuidedContextFlowProps {
  context: SalesContext;
  setContext: (value: React.SetStateAction<SalesContext>) => void;
  onComplete: (finalContext?: SalesContext) => void;
  currentStep: GuidedFlowStep;
  onStepChange: (step: GuidedFlowStep) => void;
}

export type GuidedFlowStep = 'intent' | 'supportFocus' | 'hintCheck' | 'product' | 'currentDevice' | 'carrier' | 'lines' | 'platform' | 'brand' | 'plan' | 'age';

const STEPS: GuidedFlowStep[] = ['intent', 'supportFocus', 'hintCheck', 'product', 'currentDevice', 'carrier', 'lines', 'platform', 'brand', 'plan', 'age'];
const SUPPORT_INTENTS: SalesContext['purchaseIntent'][] = ['order support', 'tech support', 'account support'];

const STEP_LABELS: Record<GuidedFlowStep, string> = {
  intent: 'Purchase intent',
  supportFocus: 'Support focus',
  hintCheck: 'HINT eligibility',
  product: 'Product interest',
  currentDevice: 'Current device',
  carrier: 'Current carrier',
  lines: 'Number of lines',
  platform: 'Platform preference',
  brand: 'Brand preference',
  plan: 'Plan preference',
  age: 'Customer age',
};

export default function GuidedContextFlow({ context, setContext, onComplete, currentStep, onStepChange }: GuidedContextFlowProps) {
  const [direction, setDirection] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flippedPlans, setFlippedPlans] = useState<Record<string, boolean>>({});
  const selectionTimerRef = useRef<number | null>(null);

  const clearSelectionTimer = () => {
    if (selectionTimerRef.current === null) return;
    window.clearTimeout(selectionTimerRef.current);
    selectionTimerRef.current = null;
  };

  useEffect(() => () => clearSelectionTimer(), []);

  const togglePlanFlip = (id: string) => {
    setFlippedPlans(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const goToStep = (step: GuidedFlowStep) => {
    const currentIndex = STEPS.indexOf(currentStep);
    const nextIndex = STEPS.indexOf(step);
    setDirection(nextIndex > currentIndex ? 1 : -1);
    onStepChange(step);
  };

  const handleOptionSelect = (id: string, update: Partial<SalesContext>, nextStep: GuidedFlowStep | 'complete') => {
    clearSelectionTimer();
    setSelectedId(id);
    const nextContext = { ...context, ...update };
    setContext(prev => ({ ...prev, ...update }));
    
    // Conditional logic
    let finalNextStep = nextStep;
    
    // If we just picked product, decide where to go next
    if (currentStep === 'product') {
      if (context.purchaseIntent === 'upgrade / add a line') {
        finalNextStep = 'currentDevice';
      } else {
        finalNextStep = 'carrier';
      }
    }
    
    // If we just picked currentDevice, go to lines
    if (currentStep === 'currentDevice') {
      finalNextStep = 'lines';
    }

    // Delay to allow the user to read the card's advice before transitioning
    selectionTimerRef.current = window.setTimeout(() => {
      if (finalNextStep === 'complete') {
        onComplete(nextContext);
      } else {
        goToStep(finalNextStep);
      }
      setSelectedId(null);
      selectionTimerRef.current = null;
    }, 1000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, rotateX: -15, perspective: 1000 },
    show: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20
      }
    },
    selected: {
      scale: 1.02,
      transition: { 
        duration: 0.2,
        ease: "easeOut" as const
      }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  const renderIntent = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-t-magenta">What brings them in?</h2>
        <p className="text-sm font-medium text-t-dark-gray">Select the customer's primary reason for the call.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { id: 'exploring', label: 'Exploring', icon: Search, desc: 'What is the customer wanting to get?' },
          { id: 'ready to buy', label: 'Ready to Buy', icon: ShoppingBag, desc: 'Knows what they want' },
          { id: 'upgrade / add a line', label: 'Upgrade', icon: ArrowUpCircle, desc: 'Existing customer' },
          { id: 'order support', label: 'Order Support', icon: Package, desc: 'Status, tracking, etc.' },
          { id: 'tech support', label: 'Tech Support', icon: Wrench, desc: 'Device or network issues' },
          { id: 'account support', label: 'Account', icon: UserCircle, desc: 'Billing, plans, etc.' },
        ].map((opt) => (
          <motion.button
            key={opt.id}
            variants={cardVariants}
            animate={selectedId === opt.id ? "selected" : "show"}
            whileHover={selectedId ? {} : { scale: 1.02, y: -4, rotateX: 5 }}
            whileTap={selectedId ? {} : "tap"}
            onClick={() => {
                const isSupportIntent = SUPPORT_INTENTS.includes(opt.id as SalesContext['purchaseIntent']);
                const next: GuidedFlowStep = isSupportIntent
                  ? 'supportFocus'
                  : opt.id === 'upgrade / add a line'
                  ? 'product'
                  : 'hintCheck';
                handleOptionSelect(opt.id, {
                  purchaseIntent: opt.id as SalesContext['purchaseIntent'],
                  supportFocus: undefined,
                  orderSupportType: undefined,
                }, next);
              }}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center group shadow-sm hover:shadow-md relative overflow-hidden ${
              selectedId === opt.id 
                ? 'border-t-magenta bg-t-magenta/10' 
                : 'border-t-light-gray bg-surface hover:border-t-magenta/50 hover:bg-t-magenta/5'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="w-12 h-12 rounded-xl bg-t-magenta/10 flex items-center justify-center group-hover:bg-t-magenta group-hover:text-white transition-colors">
              <opt.icon className="w-6 h-6 text-t-magenta group-hover:text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-tight text-t-dark-gray leading-tight">{opt.label}</p>
              <p className="text-[8px] font-medium text-t-muted mt-1 leading-tight">{opt.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
      <button 
        onClick={() => goToStep('hintCheck')}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-magenta transition-colors"
      >
        Skip / Not Sure
      </button>
    </motion.div>
  );

  const renderSupportFocus = () => {
    const options = getSupportOptionsForIntent(context.purchaseIntent);
    const title = context.purchaseIntent === 'tech support'
      ? 'What needs fixing?'
      : context.purchaseIntent === 'account support'
        ? 'What account lane?'
        : 'What order issue?';
    const helper = context.purchaseIntent === 'tech support'
      ? 'Pick the immediate problem so the plan starts with the right fix.'
      : context.purchaseIntent === 'account support'
        ? 'Choose the narrow topic before the rep sees a talk track.'
        : 'Narrow the order issue before moving to the resolution path.';

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-5"
      >
        <div className="text-center space-y-2">
          <p className="type-micro text-t-magenta">Stage 2</p>
          <h2 className="text-2xl font-black uppercase tracking-tight text-t-dark-gray">{title}</h2>
          <p className="text-sm font-medium text-t-muted">{helper}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((option) => (
            <motion.button
              key={option.id}
              variants={cardVariants}
              animate={selectedId === option.id ? "selected" : "show"}
              whileHover={selectedId ? {} : { scale: 1.015, y: -3 }}
              whileTap={selectedId ? {} : "tap"}
              onClick={() => {
                handleOptionSelect(
                  option.id,
                  {
                    ...option.contextPatch,
                    supportFocus: option.id,
                  },
                  'complete',
                );
              }}
              className={`min-h-[116px] rounded-2xl border-2 p-4 text-left transition-all shadow-sm ${
                selectedId === option.id
                  ? 'border-t-magenta bg-t-magenta/10'
                  : 'border-t-light-gray bg-surface hover:border-t-magenta/50 hover:bg-t-magenta/5'
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-tight text-t-dark-gray">{option.label}</p>
                  <p className="mt-2 text-[11px] font-medium leading-relaxed text-t-muted">{option.hint}</p>
                </div>
                {selectedId === option.id ? <CheckCircle2 className="h-4 w-4 shrink-0 text-t-magenta" /> : <ChevronRight className="h-4 w-4 shrink-0 text-t-muted" />}
              </div>
            </motion.button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onComplete(context)}
          className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted transition-colors hover:text-t-magenta"
        >
          Skip focus and build plan
        </button>
      </motion.div>
    );
  };

  const renderHintCheck = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="inline-block bg-t-magenta text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-2 shadow-lg shadow-t-magenta/30">
          Required Step
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-t-dark-gray">Verify HINT Eligibility</h2>
        <p className="text-sm font-medium text-t-muted">Enter their address in the HINT tool before continuing.</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {[
          { id: 'Yes', label: 'Yes, they qualify!', availability: true as boolean | undefined, color: 'bg-success-surface border-success-border text-success-foreground hover:bg-success-surface/80' },
          { id: 'No', label: 'No, not available.', availability: false as boolean | undefined, color: 'bg-error-surface border-error-border text-error-foreground hover:bg-error-surface/80' },
          { id: 'Wait', label: 'Checking it right now...', availability: undefined as boolean | undefined, color: 'bg-surface border-t-light-gray text-t-dark-gray hover:border-t-magenta/50 hover:bg-t-magenta/5' },
        ].map((opt) => (
          <motion.button
            key={opt.id}
            variants={cardVariants}
            animate={selectedId === opt.id ? "selected" : "show"}
            whileHover={selectedId ? {} : { scale: 1.02, y: -2 }}
            whileTap={selectedId ? {} : "tap"}
            onClick={() => handleOptionSelect(opt.id, { hintQualified: opt.id as any, hintAvailable: opt.availability }, 'product')}
            className={`p-4 rounded-2xl border-2 transition-all text-center font-black uppercase tracking-widest text-[11px] shadow-sm ${
              selectedId === opt.id ? 'ring-2 ring-offset-2 ring-t-magenta/50 scale-[1.02]' : ''
            } ${opt.color}`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>
      <button 
        onClick={() => goToStep('product')}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-magenta transition-colors"
      >
        Skip
      </button>
    </motion.div>
  );

  const renderProduct = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-t-magenta">What's the target?</h2>
        <p className="text-sm font-medium text-t-dark-gray">What products are we discussing today?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { id: 'Phone', label: 'Phone', icon: Smartphone },
          { id: 'Home Internet', label: 'HINT', icon: Wifi },
          { id: 'BTS', label: 'Tablet/Watch', icon: Tablet },
          { id: 'IOT', label: 'SyncUp/IOT', icon: Watch },
        ].map((opt) => (
          <motion.button
            key={opt.id}
            variants={cardVariants}
            animate={selectedId === opt.id ? "selected" : "show"}
            whileHover={selectedId ? {} : { scale: 1.02, y: -4, rotateX: 5 }}
            whileTap={selectedId ? {} : "tap"}
            onClick={() => handleOptionSelect(opt.id, { product: [opt.id as any] }, 'carrier')}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all group shadow-sm hover:shadow-md ${
              selectedId === opt.id 
                ? 'border-t-magenta bg-t-magenta/10' 
                : 'border-t-light-gray bg-surface hover:border-t-magenta/50 hover:bg-t-magenta/5'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="w-14 h-14 rounded-full bg-t-magenta/10 flex items-center justify-center group-hover:bg-t-magenta group-hover:text-white transition-colors">
              <opt.icon className="w-7 h-7 text-t-magenta group-hover:text-white" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-t-dark-gray">{opt.label}</p>
          </motion.button>
        ))}
      </div>
      <button 
        onClick={() => {
          if (context.purchaseIntent === 'upgrade / add a line') {
            goToStep('currentDevice');
          } else {
            goToStep('carrier');
          }
        }}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-magenta transition-colors"
      >
        Skip Product Selection
      </button>
    </motion.div>
  );

  const renderCurrentDevice = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-t-magenta">Current Device</h2>
        <p className="text-sm font-medium text-t-dark-gray">What are they using right now?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { id: 'iPhone', label: 'iPhone', icon: Smartphone },
          { id: 'Samsung', label: 'Samsung', icon: Smartphone },
          { id: 'Pixel', label: 'Pixel', icon: Smartphone },
          { id: 'Other', label: 'Other', icon: Smartphone },
        ].map((opt) => (
          <motion.button
            key={opt.id}
            variants={cardVariants}
            animate={selectedId === opt.id ? "selected" : "show"}
            whileHover={selectedId ? {} : { scale: 1.02, y: -4, rotateX: 5 }}
            whileTap={selectedId ? {} : "tap"}
            onClick={() => handleOptionSelect(opt.id, { currentDeviceBrand: opt.id, currentPlatform: (opt.id === 'iPhone' ? 'iOS' : 'Android') as any }, 'lines')}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all group shadow-sm hover:shadow-md ${
              selectedId === opt.id 
                ? 'border-t-magenta bg-t-magenta/10' 
                : 'border-t-light-gray bg-surface hover:border-t-magenta/50 hover:bg-t-magenta/5'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="w-14 h-14 rounded-full bg-t-magenta/10 flex items-center justify-center group-hover:bg-t-magenta group-hover:text-white transition-colors">
              <opt.icon className="w-7 h-7 text-t-magenta group-hover:text-white" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-t-dark-gray">{opt.label}</p>
          </motion.button>
        ))}
      </div>
      <button 
        onClick={() => goToStep('lines')}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-magenta transition-colors"
      >
        Skip / Not Sure
      </button>
    </motion.div>
  );

  const renderCarrier = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-t-magenta">Who's the rival?</h2>
        <p className="text-sm font-medium text-t-dark-gray">Which carrier are they currently with?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {['AT&T', 'Verizon', 'Spectrum', 'Xfinity', 'US Cellular', 'Prepaid', 'Other', 'Not Specified'].map((c) => (
          <motion.button
            key={c}
            variants={cardVariants}
            animate={selectedId === c ? "selected" : "show"}
            whileHover={selectedId ? {} : { scale: 1.02, y: -2, rotateX: 5 }}
            whileTap={selectedId ? {} : "tap"}
            onClick={() => handleOptionSelect(c, { currentCarrier: (c === 'Prepaid' ? 'Prepaid (Mint, Boost, etc.)' : c) as any }, 'lines')}
            className={`p-4 rounded-xl border-2 transition-all text-xs font-black uppercase tracking-tight text-t-dark-gray shadow-sm hover:shadow-md ${
              selectedId === c 
                ? 'border-t-magenta bg-t-magenta/10' 
                : 'border-t-light-gray bg-surface hover:border-t-magenta/50 hover:bg-t-magenta/5'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {c}
          </motion.button>
        ))}
      </div>
      <button 
        onClick={() => goToStep('lines')}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-magenta transition-colors"
      >
        Skip / Not Sure
      </button>
    </motion.div>
  );

  const renderLines = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-t-magenta">How big is the squad?</h2>
        <p className="text-sm font-medium text-t-dark-gray">How many lines are we looking at?</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, '6+'].map((n) => (
          <motion.button
            key={n}
            variants={cardVariants}
            animate={selectedId === String(n) ? "selected" : "show"}
            whileHover={selectedId ? {} : { scale: 1.05, y: -4, rotateX: 5 }}
            whileTap={selectedId ? {} : "tap"}
            onClick={() => handleOptionSelect(String(n), { totalLines: typeof n === 'number' ? n : 6 }, 'platform')}
            className={`aspect-square flex flex-col items-center justify-center rounded-2xl border-2 transition-all group shadow-sm hover:shadow-md ${
              selectedId === String(n) 
                ? 'border-t-magenta bg-t-magenta/10' 
                : 'border-t-light-gray bg-surface hover:border-t-magenta/50 hover:bg-t-magenta/5'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <span className="text-2xl font-black text-t-magenta group-hover:scale-110 transition-transform">{n}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-t-muted">Lines</span>
          </motion.button>
        ))}
      </div>
      <button 
        onClick={() => goToStep('platform')}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-magenta transition-colors"
      >
        Not sure yet
      </button>
    </motion.div>
  );

  const renderPlatform = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-t-magenta">Ecosystem Choice</h2>
        <p className="text-sm font-medium text-t-dark-gray">What platform do they prefer?</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {[
          { id: 'iOS', label: 'Apple iOS', desc: 'iPhone, iMessage, iCloud', color: 'bg-zinc-900' },
          { id: 'Android', label: 'Android', desc: 'Samsung, Pixel, Moto, etc.', color: 'bg-green-600' },
          { id: 'Other', label: 'Mixed', desc: 'Using multiple platforms', color: 'bg-t-magenta' },
        ].map((p) => (
          <motion.button
            key={p.id}
            variants={cardVariants}
            animate={selectedId === p.id ? "selected" : "show"}
            whileHover={selectedId ? {} : { scale: 1.02, y: -4, rotateX: 5 }}
            whileTap={selectedId ? {} : "tap"}
            onClick={() => {
                const isUpgrade = context.purchaseIntent === 'upgrade / add a line';
                const next: GuidedFlowStep = isUpgrade ? 'age' : p.id === 'iOS' ? 'plan' : 'brand';
                handleOptionSelect(p.id, { desiredPlatform: p.id as any }, next);
              }}
            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left group shadow-sm hover:shadow-md ${
              selectedId === p.id 
                ? 'border-t-magenta bg-t-magenta/10' 
                : 'border-t-light-gray bg-surface hover:border-t-magenta/50 hover:bg-t-magenta/5'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className={`w-12 h-12 rounded-xl ${p.color} flex items-center justify-center text-white`}>
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black uppercase tracking-tight text-t-dark-gray">{p.label}</p>
              <p className="text-xs font-medium text-t-muted">{p.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
      <button 
        onClick={() => goToStep('age')}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-magenta transition-colors"
      >
        Skip / Not Sure
      </button>
    </motion.div>
  );

  const renderBrand = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-t-magenta">Which Brand?</h2>
        <p className="text-sm font-medium text-t-dark-gray">Select the preferred Android brand.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { id: 'Samsung', label: 'Samsung', icon: Smartphone },
          { id: 'Pixel', label: 'Google Pixel', icon: Smartphone },
          { id: 'Motorola', label: 'Motorola', icon: Smartphone },
          { id: 'Other', label: 'Other', icon: Smartphone },
        ].map((b) => (
          <motion.button
            key={b.id}
            variants={cardVariants}
            animate={selectedId === b.id ? "selected" : "show"}
            whileHover={selectedId ? {} : { scale: 1.02, y: -4, rotateX: 5 }}
            whileTap={selectedId ? {} : "tap"}
            onClick={() => handleOptionSelect(b.id, {}, 'plan')}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all group shadow-sm hover:shadow-md ${
              selectedId === b.id 
                ? 'border-t-magenta bg-t-magenta/10' 
                : 'border-t-light-gray bg-surface hover:border-t-magenta/50 hover:bg-t-magenta/5'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="w-14 h-14 rounded-full bg-t-magenta/10 flex items-center justify-center group-hover:bg-t-magenta group-hover:text-white transition-colors">
              <b.icon className="w-7 h-7 text-t-magenta group-hover:text-white" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-t-dark-gray">{b.label}</p>
          </motion.button>
        ))}
      </div>
      <button 
        onClick={() => goToStep('age')}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-magenta transition-colors"
      >
        Skip / Not Sure
      </button>
    </motion.div>
  );

  const renderPlan = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-t-magenta">Compare Plans</h2>
        <p className="text-sm font-medium text-t-dark-gray">Tap a card to flip and see details.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { 
            id: 'Go5G Next', 
            name: 'Go5G Next', 
            price: '$100/mo', 
            feature: 'Upgrade Every Year',
            points: ['Yearly upgrades', 'Apple TV+ included', 'Hulu included'],
            math: '$100 (1 line) with AutoPay'
          },
          { 
            id: 'Go5G Plus', 
            name: 'Go5G Plus', 
            price: '$90/mo', 
            feature: 'New in Two',
            points: ['Upgrade every 2 yrs', 'Apple TV+ included', 'Netflix included'],
            math: '$90 (1 line) with AutoPay'
          },
          { 
            id: 'Essentials', 
            name: 'Essentials', 
            price: '$60/mo', 
            feature: 'Best Value',
            points: ['5G access', 'Unlimited talk & text', 'T-Mobile Tuesdays'],
            math: '$60 (1 line) with AutoPay + Taxes'
          },
        ].map((plan) => {
          const isFlipped = flippedPlans[plan.id];
          return (
            <div key={plan.id} className="relative h-56 w-full cursor-pointer group" style={{ perspective: 1000 }} onClick={() => togglePlanFlip(plan.id)}>
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-full h-full relative"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front Face */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-2xl border-2 border-t-light-gray bg-surface p-5 flex flex-col justify-between shadow-sm group-hover:border-t-magenta/50 transition-colors"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-t-dark-gray">{plan.name}</h3>
                    <p className="text-2xl font-black text-t-magenta mt-2">{plan.price}</p>
                  </div>
                  <div className="flex items-center gap-2 text-t-muted">
                    <Sparkles className="w-4 h-4 text-t-magenta" />
                    <p className="text-xs font-bold uppercase tracking-widest">{plan.feature}</p>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-t-muted text-center mt-2 opacity-50">Tap to flip</p>
                </div>

                {/* Back Face */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-2xl bg-t-magenta text-white p-5 flex flex-col justify-between shadow-md"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight mb-3">{plan.name} Details</h3>
                    <ul className="space-y-2">
                      {plan.points.map((pt, i) => (
                        <li key={i} className="text-[11px] font-medium flex items-start gap-2 leading-tight">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-80" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold opacity-80 mb-3">{plan.math}</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptionSelect(plan.id, { plan: plan.id }, 'age');
                      }}
                      className="w-full py-2 bg-white text-t-magenta text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white/90 transition-colors"
                    >
                      Select Plan
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
      <button 
        onClick={() => goToStep('age')}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-magenta transition-colors"
      >
        Skip / Not Sure
      </button>
    </motion.div>
  );

  const renderAge = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-t-magenta">Demographics</h2>
        <p className="text-sm font-medium text-t-dark-gray">Select the customer's age range for tailored talk tracks.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {['18-24', '25-34', '35-54', '55+', 'Not Specified'].map((a) => (
          <motion.button
            key={a}
            variants={cardVariants}
            animate={selectedId === a ? "selected" : "show"}
            whileHover={selectedId ? {} : { scale: 1.02, y: -2, rotateX: 5 }}
            whileTap={selectedId ? {} : "tap"}
            onClick={() => handleOptionSelect(a, { age: a as any }, 'complete')}
            className={`p-4 rounded-xl border-2 transition-all text-xs font-black uppercase tracking-tight text-t-dark-gray shadow-sm hover:shadow-md ${
              selectedId === a 
                ? 'border-t-magenta bg-t-magenta/10' 
                : 'border-t-light-gray bg-surface hover:border-t-magenta/50 hover:bg-t-magenta/5'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {a}
          </motion.button>
        ))}
      </div>
      <button 
        onClick={() => onComplete(context)}
        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-magenta transition-colors"
      >
        Skip / Not Sure
      </button>
    </motion.div>
  );

  const variants = {
    enter: (direction: number) => ({
      rotateY: direction > 0 ? -180 : 180,
      opacity: 0,
      zIndex: 0
    }),
    center: {
      zIndex: 1,
      rotateY: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      rotateY: direction > 0 ? 180 : -180,
      opacity: 0
    })
  };

  return (
    <div className="max-w-md mx-auto flex flex-col">
      {/* Progress Bar */}
      <div className="flex gap-1.5 mb-8 px-2">
        {STEPS.map((step, i) => {
          const currentIndex = STEPS.indexOf(currentStep);
          const isSupport = SUPPORT_INTENTS.includes(context.purchaseIntent);
          const isUpgrade = context.purchaseIntent === 'upgrade / add a line';

          // Support: intent + focused issue only.
          if (isSupport && !['intent', 'supportFocus'].includes(step)) return null;
          if (!isSupport && step === 'supportFocus') return null;
          // Upgrade: skip hintCheck, carrier, brand, plan; keep currentDevice
          if (isUpgrade && ['hintCheck', 'carrier', 'brand', 'plan'].includes(step)) return null;
          // Standard: hide currentDevice
          if (!isSupport && !isUpgrade && step === 'currentDevice') return null;

          const isActive = i <= currentIndex;
          return (
            <div
              key={step}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                isActive ? 'bg-t-magenta' : 'bg-t-light-gray'
              }`}
            />
          );
        })}
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {`Step ${STEPS.indexOf(currentStep) + 1} of ${STEPS.length}: ${STEP_LABELS[currentStep]}`}
      </div>

      <div className="relative" style={{ perspective: 1200 }}>
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              rotateY: { type: "spring", stiffness: 260, damping: 25 },
              opacity: { duration: 0.2 }
            }}
            className="w-full"
            style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
          >
            {currentStep === 'intent' && renderIntent()}
            {currentStep === 'supportFocus' && renderSupportFocus()}
            {currentStep === 'hintCheck' && renderHintCheck()}
            {currentStep === 'product' && renderProduct()}
            {currentStep === 'currentDevice' && renderCurrentDevice()}
            {currentStep === 'carrier' && renderCarrier()}
            {currentStep === 'lines' && renderLines()}
            {currentStep === 'platform' && renderPlatform()}
            {currentStep === 'brand' && renderBrand()}
            {currentStep === 'plan' && renderPlan()}
            {currentStep === 'age' && renderAge()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Back Button */}
      {currentStep !== 'intent' && (
        <button
          onClick={() => {
            const isSupport = SUPPORT_INTENTS.includes(context.purchaseIntent);
            const isUpgrade = context.purchaseIntent === 'upgrade / add a line';

            let prevStep: GuidedFlowStep;
            if (isSupport) {
              prevStep = 'intent';
            } else if (isUpgrade) {
              const upgradeMap: Partial<Record<GuidedFlowStep, GuidedFlowStep>> = {
                product: 'intent',
                currentDevice: 'product',
                lines: 'currentDevice',
                platform: 'lines',
                age: 'platform',
              };
              prevStep = upgradeMap[currentStep] ?? 'intent';
            } else {
              const standardMap: Partial<Record<GuidedFlowStep, GuidedFlowStep>> = {
                hintCheck: 'intent',
                product: 'hintCheck',
                carrier: 'product',
                lines: 'carrier',
                platform: 'lines',
                brand: 'platform',
                plan: context.desiredPlatform === 'iOS' ? 'platform' : 'brand',
                age: 'plan',
              };
              prevStep = standardMap[currentStep] ?? 'intent';
            }
            goToStep(prevStep);
          }}
          className="mt-8 flex items-center gap-2 text-t-muted hover:text-t-magenta transition-colors text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </button>
      )}
    </div>
  );
}
