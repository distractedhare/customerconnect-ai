import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, ArrowUpRight, Headphones, Sparkles, CheckCircle2 } from 'lucide-react';
import OrderSupportSelector, { OrderSupportType } from './OrderSupportSelector';
import { SalesContext, SupportFocus } from '../types';
import { getOrderSupportTypeForFocus } from '../constants/supportFocus';

interface OrderSupportPanelProps {
  context: SalesContext;
  setContext: (value: React.SetStateAction<SalesContext>) => void;
}

type OrderPlay = {
  acknowledge: string;
  quickAction: string;
  salesPivot: string;
  transferHint?: string;
};

// Stub content — just enough to let a sales rep triage and pivot back to selling.
// Expand/refine later with real resolution steps and scripted escalations.
const PLAYS: Record<OrderSupportType, OrderPlay> = {
  track_status: {
    acknowledge: '"Totally get it — not knowing when it\'ll land is the worst part. Let me pull up the tracking."',
    quickAction: 'Open the order in Watchtower / Samson → share carrier + tracking # + ETA. If delayed, set expectations and offer a follow-up.',
    salesPivot: 'While the tracking loads, run a HINT check and ask about accessories for the incoming device.',
    transferHint: 'Stuck on a shipping exception > 72h? Warm transfer to Care (OFM).',
  },
  modify_order: {
    acknowledge: '"Let\'s see what we can still change — the earlier we catch it, the easier it is."',
    quickAction: 'Check order status. If not shipped: attempt edit. If shipped: route to Buyer\'s Remorse / exchange path after delivery.',
    salesPivot: 'A modification is a reopen — stack missing accessories, protection, or a line add while the order is already in flux.',
    transferHint: 'Already shipped? Frame as a return/exchange conversation instead of a modification.',
  },
  return_exchange: {
    acknowledge: '"I\'ll walk you through exactly what to expect on the return so there are no surprises."',
    quickAction: 'Confirm the 14/15-day Buyer\'s Remorse window + restocking fee. Start the RA / label flow.',
    salesPivot: 'Exchange > return. Ask what about the device didn\'t work — that\'s the discovery question for a better fit + fresh promo eligibility.',
  },
  cancel_order: {
    acknowledge: '"We can look at canceling — quick question first so I can keep your options open."',
    quickAction: 'Before canceling, find the friction: price, timing, or model? A cancel + reorder later loses the current promo.',
    salesPivot: 'Save-the-sale first: shift to a different device, change install/ship timing, or split the order. Only cancel after save attempts fail.',
  },
  payment_issue: {
    acknowledge: '"Let\'s get the payment sorted — that\'s the fastest blocker to fix."',
    quickAction: 'Confirm payment method on file, CVV match, billing ZIP, deposit/signature requirement. If declined: suggest alternate card or split pay.',
    salesPivot: 'Deposit surfacing? That\'s a signal for protection add-ons and a plan review for savings that offset the deposit.',
    transferHint: 'Fraud hold / AVS mismatch that won\'t clear? Warm transfer to Account Services.',
  },
  missing_damaged: {
    acknowledge: '"That\'s frustrating — I\'m sorry. Let\'s get this replaced and logged properly."',
    quickAction: 'Document: photos if damaged, delivery claim if missing. Initiate replacement order / lost-in-transit claim. Set ETA for replacement.',
    salesPivot: 'Replacement is a great moment to add P360 / a case so this doesn\'t happen again.',
    transferHint: 'Carrier lost-in-transit claim over 48h? Escalate to Care.',
  },
};

const ORDER_TYPE_TO_FOCUS: Record<OrderSupportType, SupportFocus> = {
  track_status: 'order_tracking',
  modify_order: 'order_activation_issue',
  return_exchange: 'order_missing_item',
  cancel_order: 'order_delayed_shipment',
  payment_issue: 'order_activation_issue',
  missing_damaged: 'order_missing_item',
};

export default function OrderSupportPanel({ context, setContext }: OrderSupportPanelProps) {
  const resolvedInitialType = context.orderSupportType ?? getOrderSupportTypeForFocus(context.supportFocus) ?? null;
  const [selected, setSelected] = useState<OrderSupportType | null>(resolvedInitialType);

  useEffect(() => {
    setSelected(context.orderSupportType ?? getOrderSupportTypeForFocus(context.supportFocus) ?? null);
  }, [context.orderSupportType, context.supportFocus]);

  const handleSelect = (type: OrderSupportType) => {
    setSelected(type);
    setContext(prev => ({ ...prev, orderSupportType: type, supportFocus: ORDER_TYPE_TO_FOCUS[type] }));
  };

  const play = selected ? PLAYS[selected] : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-stage rounded-3xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-t-magenta/10">
            <Package className="h-5 w-5 text-t-magenta" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Order Support</h2>
            <p className="mt-1 text-[13px] font-medium leading-relaxed text-t-dark-gray">
              Triage the order issue, resolve what you can, then pivot back to the sale. We're sales — fix it enough to earn the right angle.
            </p>
          </div>
        </div>
      </div>

      {/* Sub-type selector */}
      <div className="glass-stage-quiet rounded-3xl p-4 shadow-sm">
        <OrderSupportSelector value={selected ?? undefined} onChange={handleSelect} />
      </div>

      {/* Playbook card for selected sub-type */}
      <AnimatePresence mode="wait">
        {play && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-3"
          >
            {/* Acknowledge */}
            <div className="glass-reading rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <Headphones className="w-3.5 h-3.5 text-t-magenta" />
                <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Say this first</p>
              </div>
              <p className="text-[13px] font-semibold text-t-dark-gray leading-snug italic">{play.acknowledge}</p>
            </div>

            {/* Quick action */}
            <div className="glass-reading rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-t-magenta" />
                <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Quick action</p>
              </div>
              <p className="text-[13px] font-medium text-t-dark-gray leading-snug">{play.quickAction}</p>
            </div>

            {/* Sales pivot */}
            <div className="glass-feature rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-t-magenta" />
                <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Pivot back to sales</p>
              </div>
              <p className="text-[13px] font-bold text-t-dark-gray leading-snug">{play.salesPivot}</p>
            </div>

            {/* Transfer hint */}
            {play.transferHint && (
              <div className="glass-reading rounded-2xl p-3 shadow-sm">
                <div className="flex items-start gap-2">
                  <ArrowUpRight className="w-3.5 h-3.5 text-t-magenta mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">When to transfer</p>
                    <p className="mt-1 text-[12px] font-medium text-t-dark-gray leading-snug">{play.transferHint}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!play && (
        <div className="glass-stage-quiet rounded-2xl p-4 text-center">
          <p className="text-[11px] font-black uppercase tracking-widest text-t-muted">
            Pick the order issue above
          </p>
          <p className="mt-1 text-[11px] font-medium text-t-dark-gray">
            Each option gives you a quick acknowledge + action + sales pivot.
          </p>
        </div>
      )}
    </div>
  );
}
