import type { OrderSupportType } from '../components/OrderSupportSelector';
import type { SalesContext, SupportFocus } from '../types';

export type SupportIntent = Extract<
  SalesContext['purchaseIntent'],
  'order support' | 'tech support' | 'account support'
>;

export interface SupportFocusOption {
  id: SupportFocus;
  intent: SupportIntent;
  label: string;
  shortLabel: string;
  hint: string;
  planCue: {
    opener: string;
    discovery: string;
    value: string;
    step: string;
    coach: string;
  };
  contextPatch?: Partial<SalesContext>;
}

export const SUPPORT_FOCUS_OPTIONS: SupportFocusOption[] = [
  {
    id: 'tech_device_issue',
    intent: 'tech support',
    label: 'Device issue',
    shortLabel: 'Device',
    hint: 'Phone acting up, battery, setup, or basic function issue.',
    planCue: {
      opener: 'Let me fix the device issue first, then I can show you the cleanest way to prevent this from becoming a repeat call.',
      discovery: 'Is this mostly happening on the device itself, or only when it is on the network?',
      value: 'P360 and guided setup are the natural pivot after a device problem because they reduce the next failure point.',
      step: 'Confirm the device behavior, try the fast fix, then pivot to protection or setup help only after the customer feels heard.',
      coach: 'Device issue focus: solve first, then make the sales move feel like prevention instead of a pitch.',
    },
    contextPatch: { product: ['Phone'] },
  },
  {
    id: 'tech_signal_issue',
    intent: 'tech support',
    label: 'Signal issue',
    shortLabel: 'Signal',
    hint: 'Coverage, dropped calls, slow data, or location-specific signal.',
    planCue: {
      opener: 'Let us pin down where the signal issue happens so I can separate device, tower, and location before we talk options.',
      discovery: 'Does it happen everywhere, or mainly at home, work, or one specific route?',
      value: 'Use coverage proof, T-Satellite context, and a low-risk plan/device path instead of arguing about the network.',
      step: 'Capture location pattern, check basic network settings, then use coverage proof before making any offer.',
      coach: 'Signal issue focus: do not defend the network. Diagnose the pattern and prove the next step.',
    },
    contextPatch: { product: ['Phone'] },
  },
  {
    id: 'tech_internet_issue',
    intent: 'tech support',
    label: 'Internet issue',
    shortLabel: 'Internet',
    hint: 'Home Internet setup, speed, gateway, or availability concern.',
    planCue: {
      opener: 'Let me stabilize the internet question first: gateway, placement, availability, then the right next move.',
      discovery: 'Are they calling about setup, speed, or whether Home Internet is available at the address?',
      value: 'HINT needs an address check before any promise; if spots are full, priority list and voice-line value become the pivot.',
      step: 'Check address or gateway basics first, then decide whether this is HINT, priority list, or a mobile-network pivot.',
      coach: 'Internet issue focus: verify availability before pitching. Trust breaks fast if HINT is guessed.',
    },
    contextPatch: { product: ['Home Internet'] },
  },
  {
    id: 'tech_frustrated_urgent',
    intent: 'tech support',
    label: 'Frustrated / urgent',
    shortLabel: 'Urgent',
    hint: 'Customer is upset, time-sensitive, or already escalated emotionally.',
    planCue: {
      opener: 'I hear the urgency. Let me slow this down, get the immediate issue handled, and keep you from having to repeat yourself.',
      discovery: 'What is the one thing that has to be fixed before we talk about anything else?',
      value: 'The right sales move is a relief move: simplify, protect, or prevent the next call after the urgent issue is contained.',
      step: 'Acknowledge, isolate the immediate blocker, set expectations, then only pivot if the customer calms down.',
      coach: 'Urgent support focus: empathy buys permission. Skip the pitch until the customer has oxygen.',
    },
  },
  {
    id: 'account_billing',
    intent: 'account support',
    label: 'Billing',
    shortLabel: 'Billing',
    hint: 'Charges, proration, autopay, taxes, credits, or bill confusion.',
    planCue: {
      opener: 'Let us walk through the bill in plain English so the numbers stop feeling like a surprise.',
      discovery: 'Is the concern the total monthly amount, a one-time charge, or a credit that did not look right?',
      value: 'A bill walkthrough naturally opens a plan audit: perks, line count, and price guarantee can simplify the monthly story.',
      step: 'Clarify the charge type, explain what sales can answer, then pivot to plan audit if the math supports it.',
      coach: 'Billing focus: transparency first. Never guess credits or account-specific billing outcomes.',
    },
  },
  {
    id: 'account_plan_question',
    intent: 'account support',
    label: 'Plan question',
    shortLabel: 'Plan',
    hint: 'Plan change, features, perks, hotspot, or included benefits.',
    planCue: {
      opener: 'We can compare the plan in a clean way: what they have now, what they actually use, and what would change.',
      discovery: 'Which plan feature matters most: price, hotspot, streaming perks, upgrade value, or international?',
      value: 'Plan questions are the cleanest bridge to Experience More or Beyond when perks and device credits make the full value clearer.',
      step: 'Confirm current line count and must-have perks, then show one plan move instead of a menu of options.',
      coach: 'Plan question focus: avoid plan soup. Pick the one upgrade path that solves the stated reason.',
    },
  },
  {
    id: 'account_login_access',
    intent: 'account support',
    label: 'Login / access',
    shortLabel: 'Access',
    hint: 'T-Mobile ID, password reset, PIN, app login, or authorized user access.',
    planCue: {
      opener: 'Security first. Let us get access handled the right way, then I can help with what they were trying to do.',
      discovery: 'What were they trying to accomplish once they got into the account?',
      value: 'Access issues are not a hard sales moment; the pivot comes after access is restored and the original task is clear.',
      step: 'Route the access fix safely, avoid CPNI shortcuts, then ask what they needed inside the account.',
      coach: 'Access focus: protect trust. Do not turn security frustration into a pitch.',
    },
  },
  {
    id: 'account_line_change',
    intent: 'account support',
    label: 'Line / account change',
    shortLabel: 'Line change',
    hint: 'Add/remove line, transfer responsibility, account change, or family setup.',
    planCue: {
      opener: 'Let us clarify the account change first so the right line, owner, and plan path stay clean.',
      discovery: 'Are they adding someone, removing someone, or changing who controls the line?',
      value: 'Line changes are a natural moment to check family plan fit, BTS add-ons, and whether a device promo changes the math.',
      step: 'Clarify the line action, confirm who needs what, then show the cleanest plan or device path.',
      coach: 'Line-change focus: keep ownership and CPNI clean before any sales recommendation.',
    },
  },
  {
    id: 'order_tracking',
    intent: 'order support',
    label: 'Tracking',
    shortLabel: 'Tracking',
    hint: 'Status, tracking number, ETA, or delivery confirmation.',
    planCue: {
      opener: 'I will get the order status clear first so we know what is happening and when it should land.',
      discovery: 'Are they missing the tracking number, worried about the ETA, or seeing a status that does not make sense?',
      value: 'Tracking time is a safe moment to prep accessories, protection, or activation expectations for the incoming device.',
      step: 'Find order status, share ETA plainly, then offer one useful next step for when the device arrives.',
      coach: 'Tracking focus: reduce anxiety first. Use the waiting time to prepare the next successful setup.',
    },
    contextPatch: { orderSupportType: 'track_status' },
  },
  {
    id: 'order_activation_issue',
    intent: 'order support',
    label: 'Activation issue',
    shortLabel: 'Activation',
    hint: 'SIM/eSIM, port, activation failure, or setup blocker.',
    planCue: {
      opener: 'Let us get activation unstuck first so the device works before we talk about anything extra.',
      discovery: 'Is the blocker the SIM/eSIM, number transfer, account verification, or the device setup step?',
      value: 'Activation friction is a setup-confidence moment: guided setup, P360, and accessories become useful only after service works.',
      step: 'Identify the activation blocker, route the fix, then offer a guided setup path to prevent another callback.',
      coach: 'Activation focus: service working is the close. Everything else waits until the phone is alive.',
    },
    contextPatch: { orderSupportType: 'modify_order' },
  },
  {
    id: 'order_delayed_shipment',
    intent: 'order support',
    label: 'Delayed shipment',
    shortLabel: 'Delayed',
    hint: 'Late delivery, backorder, carrier exception, or no movement.',
    planCue: {
      opener: 'I know waiting with no movement is frustrating. Let me check whether this is a delay, backorder, or carrier handoff.',
      discovery: 'Is the status delayed, stuck with the shipper, or still waiting to leave the warehouse?',
      value: 'A delay is a save-the-sale moment: protect the promo, set expectations, and prevent cancellation unless there is no good path.',
      step: 'Confirm delay type, set the next check-in expectation, then preserve the order or find the closest alternate path.',
      coach: 'Delayed shipment focus: do not overpromise delivery. Preserve confidence and the promo window.',
    },
    contextPatch: { orderSupportType: 'track_status' },
  },
  {
    id: 'order_missing_item',
    intent: 'order support',
    label: 'Missing item',
    shortLabel: 'Missing',
    hint: 'Missing package, damaged item, wrong item, or incomplete delivery.',
    planCue: {
      opener: 'That is frustrating. Let us document what arrived, what is missing, and the fastest replacement path.',
      discovery: 'Was the package marked delivered, damaged on arrival, or missing one item from the order?',
      value: 'Replacement moments should include protection and accessory fit only after the customer knows the fix path.',
      step: 'Document the issue, start the missing/damaged path, then prevent the repeat with protection or setup help.',
      coach: 'Missing item focus: apologize, document, replace. Pitch prevention only after the fix is clear.',
    },
    contextPatch: { orderSupportType: 'missing_damaged' },
  },
];

export const SUPPORT_FOCUS_LABELS: Record<SupportFocus, string> = SUPPORT_FOCUS_OPTIONS.reduce(
  (labels, option) => ({ ...labels, [option.id]: option.shortLabel }),
  {} as Record<SupportFocus, string>,
);

export function getSupportFocusLabel(focus?: SupportFocus): string | null {
  return focus ? SUPPORT_FOCUS_LABELS[focus] ?? null : null;
}

export function getSupportFocusOption(focus?: SupportFocus): SupportFocusOption | null {
  return focus ? SUPPORT_FOCUS_OPTIONS.find(option => option.id === focus) ?? null : null;
}

export function getSupportOptionsForIntent(intent: SalesContext['purchaseIntent']): SupportFocusOption[] {
  return SUPPORT_FOCUS_OPTIONS.filter(option => option.intent === intent);
}

export function getOrderSupportTypeForFocus(focus?: SupportFocus): OrderSupportType | undefined {
  return getSupportFocusOption(focus)?.contextPatch?.orderSupportType;
}
