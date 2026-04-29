import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  Layers3,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  UserCircle,
  Wrench,
  X,
} from 'lucide-react';
import { SalesContext } from '../types';
import CustomerContextForm from './CustomerContextForm';
import { getSupportOptionsForIntent } from '../constants/supportFocus';

interface LiveRefinePanelProps {
  open: boolean;
  context: SalesContext;
  onClose: () => void;
  onApply: (nextContext: SalesContext) => void;
}

const INTENT_OPTIONS: Array<{
  id: SalesContext['purchaseIntent'];
  label: string;
  icon: typeof Search;
}> = [
  { id: 'exploring', label: 'Exploring', icon: Search },
  { id: 'ready to buy', label: 'Ready to Buy', icon: ShoppingBag },
  { id: 'upgrade / add a line', label: 'Upgrade', icon: ArrowRight },
  { id: 'order support', label: 'Order Support', icon: Package },
  { id: 'tech support', label: 'Tech Support', icon: Wrench },
  { id: 'account support', label: 'Account', icon: UserCircle },
];

const PRODUCT_OPTIONS: Array<{
  id: SalesContext['product'][number];
  label: string;
  helper: string;
}> = [
  { id: 'Phone', label: 'Phone', helper: 'Devices and voice lines' },
  { id: 'Home Internet', label: 'HINT', helper: 'Check address before pitching' },
  { id: 'BTS', label: 'BTS', helper: 'Watches and tablets' },
  { id: 'IOT', label: 'IOT', helper: 'SyncUP and connected devices' },
  { id: 'No Specific Product', label: 'General', helper: 'No clear product yet' },
];

export default function LiveRefinePanel({ open, context, onClose, onApply }: LiveRefinePanelProps) {
  const [draft, setDraft] = useState<SalesContext>(context);

  useEffect(() => {
    if (open) {
      setDraft(context);
    }
  }, [context, open]);

  const setDraftContext: Dispatch<SetStateAction<SalesContext>> = (value) => {
    setDraft(prev => (typeof value === 'function' ? value(prev) : value));
  };

  const updateIntent = (intent: SalesContext['purchaseIntent']) => {
    setDraft(prev => ({
      ...prev,
      purchaseIntent: intent,
      supportFocus: undefined,
      orderSupportType: undefined,
    }));
  };

  const toggleProduct = (product: SalesContext['product'][number]) => {
    setDraft(prev => {
      if (product === 'No Specific Product') {
        return { ...prev, product: ['No Specific Product'] };
      }

      let nextProducts = prev.product.filter(item => item !== 'No Specific Product');
      nextProducts = nextProducts.includes(product)
        ? nextProducts.filter(item => item !== product)
        : [...nextProducts, product];

      return {
        ...prev,
        product: nextProducts.length > 0 ? nextProducts : ['No Specific Product'],
      };
    });
  };

  const supportOptions = getSupportOptionsForIntent(draft.purchaseIntent);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm md:items-stretch md:justify-end md:p-4">
          <motion.div
            initial={{ opacity: 0, y: 28, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 18, x: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="glass-modal flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-[2rem] md:h-[calc(100dvh-2rem)] md:max-h-none md:max-w-[34rem] md:rounded-[2rem]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div>
                <p className="type-micro text-t-magenta">Refine Plan</p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-foreground">Tune the live context</h2>
                <p className="mt-1 text-xs font-medium leading-relaxed text-t-dark-gray">
                  Keep the call surface clean. Add details here, then apply once.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Refine Plan"
                className="focus-ring glass-control rounded-full p-2 text-t-dark-gray transition-colors hover:text-t-magenta"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-t-magenta" />
                  <p className="type-kicker text-t-dark-gray">Call lane</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {INTENT_OPTIONS.map(option => {
                    const active = draft.purchaseIntent === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updateIntent(option.id)}
                        aria-pressed={active}
                        className={`focus-ring flex min-h-[46px] items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-black tracking-tight transition-all ${
                          active ? 'glass-control-active text-white' : 'glass-control text-t-dark-gray hover:text-foreground'
                        }`}
                      >
                        <option.icon className="h-3.5 w-3.5 shrink-0" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              {supportOptions.length > 0 ? (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers3 className="h-4 w-4 text-t-magenta" />
                    <p className="type-kicker text-t-dark-gray">Support focus</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {supportOptions.map(option => {
                      const active = draft.supportFocus === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setDraft(prev => ({
                            ...prev,
                            ...option.contextPatch,
                            supportFocus: option.id,
                          }))}
                          aria-pressed={active}
                          className={`focus-ring min-h-[72px] rounded-xl px-3 py-2 text-left transition-all ${
                            active ? 'glass-control-active text-white' : 'glass-control text-t-dark-gray hover:text-foreground'
                          }`}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-black uppercase tracking-tight">{option.label}</span>
                            {active ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : null}
                          </span>
                          <span className={`mt-1 block text-[10px] font-medium leading-snug ${active ? 'text-white/80' : 'text-t-muted'}`}>
                            {option.hint}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              <section className="space-y-3">
                <p className="type-kicker text-t-dark-gray">Product focus</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRODUCT_OPTIONS.map(option => {
                    const active = draft.product.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleProduct(option.id)}
                        aria-pressed={active}
                        className={`focus-ring min-h-[58px] rounded-xl px-3 py-2 text-left transition-all ${
                          active ? 'glass-control-active text-white' : 'glass-control text-t-dark-gray hover:text-foreground'
                        } ${option.id === 'No Specific Product' ? 'col-span-2' : ''}`}
                      >
                        <span className="flex items-center justify-between gap-2 text-[11px] font-black uppercase tracking-tight">
                          {option.label}
                          {active ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : null}
                        </span>
                        <span className={`mt-1 block text-[10px] font-medium leading-snug ${active ? 'text-white/80' : 'text-t-muted'}`}>
                          {option.helper}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="glass-stage-quiet rounded-[1.5rem] p-4">
                <CustomerContextForm
                  context={draft}
                  setContext={setDraftContext}
                  inline
                  defaultLocationOpen={false}
                  locationLabel="Region + ZIP"
                  locationHint="Add location only when it helps HINT, coverage, or regional context."
                  locationPanelId="refine-plan-location-panel"
                />
              </section>
            </div>

            <div
              className="flex flex-col gap-2 border-t border-white/10 px-5 pt-4 sm:flex-row"
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1rem)' }}
            >
              <button
                type="button"
                onClick={() => onApply(draft)}
                className="focus-ring cta-primary min-h-[48px] flex-1 rounded-xl text-sm font-black tracking-tight text-white"
              >
                Apply and Rebuild
              </button>
              <button
                type="button"
                onClick={onClose}
                className="focus-ring glass-control min-h-[48px] rounded-xl px-5 text-sm font-black tracking-tight text-t-dark-gray transition-colors hover:text-foreground"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
