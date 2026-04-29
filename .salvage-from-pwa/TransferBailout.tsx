import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhoneForwarded, ArrowRight, X } from 'lucide-react';
import { SalesContext } from '../types';

interface TransferBailoutProps {
  intent: SalesContext['purchaseIntent'];
  product: SalesContext['product'];
  onRelease: () => void;
}

interface Destination {
  label: string;
  queue: string;
  line: string;
}

function getDestination(
  intent: SalesContext['purchaseIntent'],
  product: SalesContext['product'],
): Destination {
  if (intent === 'account support') {
    return {
      label: 'Care / Account',
      queue: 'Customer Care',
      line: "I want to make sure you get to someone who lives in billing all day. One moment while I connect you.",
    };
  }
  if (intent === 'tech support') {
    return {
      label: 'Tier-2 Tech',
      queue: 'Technical Care',
      line: "Let me get you to the tech team who can run diagnostics on this. Hang tight for just a second.",
    };
  }
  if (intent === 'order support') {
    return {
      label: 'Order Ops',
      queue: 'Order Support',
      line: "I'm going to route you to our order team — they'll pull the shipment details directly. One moment.",
    };
  }
  if (product.includes('Home Internet')) {
    return {
      label: 'HINT Specialist',
      queue: 'Home Internet',
      line: "I want you talking to our HINT specialists — they'll get you the fastest answer. Hold one moment.",
    };
  }
  return {
    label: 'Appropriate Team',
    queue: 'Transfer',
    line: "Let me get you to the team who handles this best — one moment, please.",
  };
}

export default function TransferBailout({ intent, product, onRelease }: TransferBailoutProps) {
  const [open, setOpen] = useState(false);
  const dest = getDestination(intent, product);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-t-light-gray bg-white/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-t-dark-gray transition hover:border-t-magenta hover:text-t-magenta"
        aria-label="Transfer or release call"
      >
        <PhoneForwarded className="h-3.5 w-3.5" />
        Transfer / Release
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-t-light-gray/60 px-5 py-3">
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-t-magenta">
                  <PhoneForwarded className="h-3.5 w-3.5" />
                  Bailout
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1 text-t-muted hover:bg-t-light-gray/50 hover:text-t-dark-gray"
                  aria-label="Close bailout"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 px-5 py-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-t-muted">
                    Route to
                  </p>
                  <p className="mt-1 text-xl font-black uppercase tracking-tight text-t-dark-gray">
                    {dest.label}
                  </p>
                  <p className="text-xs font-medium text-t-muted">Queue: {dest.queue}</p>
                </div>

                <div className="rounded-2xl border-l-4 border-t-magenta bg-t-magenta/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-t-magenta">
                    Say this
                  </p>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-t-dark-gray">
                    {dest.line}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onRelease();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-t-magenta px-4 py-3 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-t-magenta/30 transition hover:brightness-110"
                >
                  Log release & end guided mode
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full text-center text-[10px] font-black uppercase tracking-[0.2em] text-t-muted hover:text-t-dark-gray"
                >
                  Never mind, keep going
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
