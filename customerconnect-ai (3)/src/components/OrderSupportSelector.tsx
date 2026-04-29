import { useEffect, useState } from 'react';
import { Package, RefreshCcw, AlertTriangle, CreditCard, XCircle, Truck, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export type OrderSupportType =
  | 'track_status'
  | 'modify_order'
  | 'return_exchange'
  | 'cancel_order'
  | 'payment_issue'
  | 'missing_damaged';

const OPTIONS = [
  {
    id: 'track_status' as OrderSupportType,
    label: 'Track Order Status',
    icon: Truck,
    description: 'Shipping updates, tracking numbers, delivery ETAs.',
  },
  {
    id: 'modify_order' as OrderSupportType,
    label: 'Modify an Order',
    icon: Package,
    description: 'Change address, swap device color/storage, or edit accessories.',
  },
  {
    id: 'return_exchange' as OrderSupportType,
    label: 'Return or Exchange',
    icon: RefreshCcw,
    description: "Buyer's Remorse return or exchange a recently delivered device.",
  },
  {
    id: 'cancel_order' as OrderSupportType,
    label: 'Cancel Order',
    icon: XCircle,
    description: 'Cancel an order not yet shipped or on backorder.',
  },
  {
    id: 'payment_issue' as OrderSupportType,
    label: 'Payment & Billing',
    icon: CreditCard,
    description: 'Failed payments, deposit questions, signature requirements.',
  },
  {
    id: 'missing_damaged' as OrderSupportType,
    label: 'Missing or Damaged',
    icon: AlertTriangle,
    description: 'Arrived damaged or marked delivered but not received.',
  },
];

interface OrderSupportSelectorProps {
  value?: OrderSupportType | null;
  onChange: (type: OrderSupportType) => void;
  compact?: boolean;
}

export default function OrderSupportSelector({ value, onChange, compact = false }: OrderSupportSelectorProps) {
  const [selected, setSelected] = useState<OrderSupportType | null>(value ?? null);

  useEffect(() => {
    setSelected(value ?? null);
  }, [value]);

  const handle = (id: OrderSupportType) => {
    setSelected(id);
    onChange(id);
  };

  return (
    <div className="w-full space-y-3">
      {!compact && (
        <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray">
          What kind of order issue?
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((opt) => {
          const isActive = selected === opt.id;
          return (
            <motion.button
              key={opt.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => handle(opt.id)}
              className={`relative flex flex-col gap-2 rounded-xl border-2 p-3 text-left transition-all duration-150
                ${isActive
                  ? 'border-t-magenta bg-t-magenta/8 shadow-sm shadow-t-magenta/20'
                  : 'border-t-light-gray bg-surface hover:border-t-magenta/40 hover:bg-t-magenta/5'
                }`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-t-magenta text-white' : 'bg-t-light-gray/40 text-t-dark-gray'}`}>
                  <opt.icon className="w-3.5 h-3.5" />
                </div>
                <p className={`text-[10px] font-black uppercase tracking-tight leading-tight ${isActive ? 'text-t-magenta' : 'text-t-dark-gray'}`}>
                  {opt.label}
                </p>
              </div>
              <p className="text-[9px] font-medium text-t-muted leading-snug">
                {opt.description}
              </p>
              {isActive && (
                <div className="absolute top-2.5 right-2.5 text-t-magenta">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
