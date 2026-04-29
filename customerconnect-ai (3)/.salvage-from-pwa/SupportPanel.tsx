import type { ComponentType } from 'react';
import { ArrowRight, ClipboardList, CreditCard, Package, Search, ShieldCheck, UserCircle } from 'lucide-react';
import { SalesContext } from '../types';
import OrderSupportSelector, { OrderSupportType } from './OrderSupportSelector';
import TroubleshootingPivot from './TroubleshootingPivot';

interface SupportPanelProps {
  context: SalesContext;
  onOrderSupportTypeChange?: (type: OrderSupportType) => void;
  onPivotToSales?: () => void;
}

type OrderSupportContent = {
  title: string;
  summary: string;
  steps: string[];
  handoff: string;
};

const ORDER_SUPPORT_CONTENT: Record<OrderSupportType, OrderSupportContent> = {
  track_status: {
    title: 'Track the shipment',
    summary: 'Give the caller the cleanest timeline you can and confirm whether the device is still moving, delayed, or already at the handoff stage.',
    steps: [
      'Confirm the order number, phone number, or email tied to the order.',
      'Check the latest carrier scan and call out the most recent movement in plain language.',
      'Set the next checkpoint clearly so the customer knows when to expect another update.',
    ],
    handoff: 'I checked the latest shipment scan and the next meaningful update should hit once the carrier processes the next leg.',
  },
  modify_order: {
    title: 'Triage the edit request',
    summary: 'Figure out whether the order is still editable before promising a change to address, color, capacity, or accessory bundle.',
    steps: [
      'Confirm exactly what needs to change and whether the customer is okay with a possible delay.',
      'Check whether the order has already reached fulfillment or shipment lock.',
      'If locked, explain the fastest workaround instead of overpromising an edit.',
    ],
    handoff: 'I want to check whether the order is still editable before I promise a change, because fulfillment timing matters here.',
  },
  return_exchange: {
    title: 'Set up the return or exchange path',
    summary: 'Use the buyer’s-remorse window and device condition to decide whether this stays simple or needs specialized handling.',
    steps: [
      'Confirm delivery date and whether the packaging and accessories are still available.',
      'Clarify whether they want a straight return, a swap, or a different model.',
      'Explain any restock, shipping, or inspection expectations up front.',
    ],
    handoff: 'I can get you into the return or exchange path, and I want to make sure you know the timing and condition rules before we submit anything.',
  },
  cancel_order: {
    title: 'Check cancellation eligibility',
    summary: 'The key decision is whether the order is still pre-shipment. If it is not, move quickly to the next best option instead of treating it like a live cancel.',
    steps: [
      'Confirm whether the order is still pending, backordered, or already shipped.',
      'If it has not shipped, explain the cancellation request clearly and set expectations on timing.',
      'If it has shipped, pivot to refusal, return, or exchange options without making the customer restart the story.',
    ],
    handoff: 'I need to verify whether the order is still in a cancellable state, because once it ships the process changes.',
  },
  payment_issue: {
    title: 'Clear the payment blocker',
    summary: 'Keep this lane focused on deposit, authorization, card failure, or signature issues rather than general billing questions.',
    steps: [
      'Confirm whether the issue is a failed payment, deposit question, or verification hold.',
      'Check whether the payment method needs to be retried or replaced.',
      'Explain the next approval or retry step in one sentence before moving them on.',
    ],
    handoff: 'This looks like an order-payment blocker, so I want to solve the authorization piece before we touch the rest of the order.',
  },
  missing_damaged: {
    title: 'Document the exception fast',
    summary: 'Treat missing or damaged deliveries like an exception workflow, not a general tracking question.',
    steps: [
      'Confirm whether the package is marked delivered, missing in transit, or arrived damaged.',
      'Document what was received and what condition it arrived in.',
      'Move quickly into claim, replacement, or escalation ownership so the customer knows who owns the next action.',
    ],
    handoff: 'I want to document this as a missing or damaged delivery so the next team owns the exception immediately.',
  },
};

function Hero({
  icon,
  title,
  body,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  const Icon = icon;
  return (
    <div className="rounded-3xl glass-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-t-magenta/10">
          <Icon className="h-5 w-5 text-t-magenta" />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-foreground">{title}</h2>
          <p className="mt-1 text-xs font-medium leading-relaxed text-t-dark-gray">{body}</p>
        </div>
      </div>
    </div>
  );
}

function PivotCard({ onPivotToSales }: { onPivotToSales?: () => void }) {
  return (
    <section className="rounded-2xl border border-t-magenta/20 bg-t-magenta/5 p-4 shadow-sm">
      <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">If the door opens</p>
      <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">
        Fix or route the support issue first. If they lean in afterward, pivot them back into a fresh sales conversation instead of forcing a sell mid-problem.
      </p>
      {onPivotToSales ? (
        <button
          type="button"
          onClick={onPivotToSales}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-t-magenta px-4 py-3 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-t-magenta/30 transition hover:brightness-110"
        >
          Pivot to sales
          <ArrowRight className="h-4 w-4" />
        </button>
      ) : null}
    </section>
  );
}

function OrderSupportBody({
  context,
  onOrderSupportTypeChange,
  onPivotToSales,
}: SupportPanelProps) {
  const content = context.orderSupportType ? ORDER_SUPPORT_CONTENT[context.orderSupportType] : null;

  return (
    <div className="space-y-4">
      <Hero
        icon={Package}
        title="Order Support Desk"
        body="Keep order issues in the order lane. This panel is for tracking, edits, cancellations, returns, payment holds, and missing or damaged shipments."
      />

      <section className="rounded-2xl border border-t-light-gray bg-surface p-4 shadow-sm glass-card">
        <div className="mb-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Pick the lane</p>
          <p className="mt-1 text-[11px] font-medium text-t-dark-gray">
            Choose the order issue first so the rep sees the right workflow instead of a generic repair script.
          </p>
        </div>
        <OrderSupportSelector
          value={context.orderSupportType ?? null}
          onChange={(type) => onOrderSupportTypeChange?.(type)}
        />
      </section>

      {content ? (
        <>
          <section className="rounded-2xl border border-info-border bg-info-surface p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-info-foreground">{content.title}</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-info-foreground">{content.summary}</p>
          </section>

          <section className="rounded-2xl border border-t-light-gray bg-surface p-4 shadow-sm glass-card">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-t-magenta/10">
                <ClipboardList className="h-4 w-4 text-t-magenta" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold tracking-tight">Next best moves</h3>
                <p className="text-[10px] font-medium text-t-dark-gray">Stay procedural so the customer feels progress immediately.</p>
              </div>
            </div>
            <div className="space-y-2">
              {content.steps.map((step, index) => (
                <div key={step} className="rounded-xl border border-t-light-gray bg-t-light-gray/10 p-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Step {index + 1}</p>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-foreground">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-t-magenta/20 bg-surface p-4 shadow-sm glass-card">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-t-magenta" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Say this</p>
                <p className="mt-1 text-sm font-medium leading-relaxed text-foreground">{content.handoff}</p>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-2xl border border-t-light-gray bg-surface p-4 shadow-sm glass-card">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Start here</p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">
            Order support is selected, but the subtype is still open. Pick the exact order issue above and this panel will lock onto the right script.
          </p>
        </section>
      )}

      <PivotCard onPivotToSales={onPivotToSales} />
    </div>
  );
}

function AccountSupportBody({ onPivotToSales }: SupportPanelProps) {
  const cards = [
    {
      icon: CreditCard,
      title: 'Billing or payment',
      body: 'Use this lane for due dates, autopay, payment failures, or balance confusion. Keep it out of device repair unless a hardware issue caused the charge dispute.',
    },
    {
      icon: UserCircle,
      title: 'Access or ownership',
      body: 'PIN resets, verification blocks, account ownership, and line access should route to care or self-serve identity flows first.',
    },
    {
      icon: Search,
      title: 'Plan or feature cleanup',
      body: 'If they are confused about features or plan changes, clarify the account issue first and only pivot to a new sale after the current account friction is resolved.',
    },
  ];

  return (
    <div className="space-y-4">
      <Hero
        icon={UserCircle}
        title="Account Support Lane"
        body="Account support should feel like ownership and triage, not like device troubleshooting. Keep the rep focused on billing, access, and plan cleanup."
      />

      <section className="grid gap-3 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-2xl border border-t-light-gray bg-surface p-4 shadow-sm glass-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-t-magenta/10">
                <Icon className="h-5 w-5 text-t-magenta" />
              </div>
              <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-foreground">{card.title}</p>
              <p className="mt-2 text-[11px] font-medium leading-relaxed text-t-dark-gray">{card.body}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-info-border bg-info-surface p-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-info-foreground">Best next move</p>
        <p className="mt-2 text-sm font-medium leading-relaxed text-info-foreground">
          Send them down the shortest account-owned path first: T-Life or Care for billing and access, then come back to sales only if the issue is resolved and the customer opens the door.
        </p>
      </section>

      <section className="rounded-2xl border border-t-light-gray bg-surface p-4 shadow-sm glass-card">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-t-light-gray bg-t-light-gray/10 p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Say this</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">
              Let me keep this clean for you. This sounds like an account-care issue, so I want to get you into the fastest billing and access path instead of guessing from the sales side.
            </p>
          </div>
          <div className="rounded-2xl border border-t-light-gray bg-t-light-gray/10 p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Do not pivot yet</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">
              Do not turn this into a plan pitch while the customer is still blocked on billing, access, or ownership. Clear the blocker first.
            </p>
          </div>
        </div>
      </section>

      <PivotCard onPivotToSales={onPivotToSales} />
    </div>
  );
}

export default function SupportPanel(props: SupportPanelProps) {
  if (props.context.purchaseIntent === 'tech support') {
    return <TroubleshootingPivot initialCategory={props.context.product[0]} />;
  }

  if (props.context.purchaseIntent === 'order support') {
    return <OrderSupportBody {...props} />;
  }

  return <AccountSupportBody {...props} />;
}
