export type BingoCategory = 'sales' | 'skill' | 'vibe';

export interface BingoCell {
  id: string;
  label: string;
  category: BingoCategory;
  description: string;
  countsWhen: string;
  example: string;
}

export interface BingoBoardDefinition {
  id: string;
  name: string;
  subtitle: string;
  miniLesson: string;
  cells: BingoCell[];
}

function makeCell(
  id: string,
  label: string,
  category: BingoCategory,
  description: string,
  countsWhen: string,
  example: string,
): BingoCell {
  return { id, label, category, description, countsWhen, example };
}

export const FREE_SPACE: BingoCell = makeCell(
  'free-space',
  'FREE',
  'vibe',
  'You showed up ready to work.',
  'This square is always counted at the center of the board.',
  'Example: you clocked in, opened the app, and got after the day.',
);

const SALES_FUNDAMENTALS_CELLS: BingoCell[] = [
  makeCell('sf-open-question', 'Open Q', 'skill', 'Started with a real discovery question.', 'Count it when you lead with curiosity instead of a product pitch.', 'Example: "What are you hoping the next phone or plan fixes for you?"'),
  makeCell('sf-confirm-reason', 'Why Now', 'skill', 'Confirmed what brought them in today.', 'Count it when the customer clearly says why this call matters right now.', 'Example: you uncover that a cracked phone, bill pain, or move is driving the call.'),
  makeCell('sf-check-credit', 'Credit First', 'sales', 'Checked credit early enough to shape the path.', 'Count it when you verify credit before the close gets messy.', 'Example: you check credit up front so the trade-in and line-add path stays clean.'),
  makeCell('sf-quote-total', 'Quote Total', 'sales', 'Quoted the monthly total in plain language.', 'Count it when you clearly say what the customer will pay per month.', 'Example: you roll plan, device, and protection into one simple monthly number.'),
  makeCell('sf-check-carrier', 'Carrier', 'skill', 'Confirmed who they have now and what is frustrating them.', 'Count it when the current carrier becomes part of the story.', 'Example: you learn they are with Verizon and tired of price creep.'),
  makeCell('sf-hint-check', 'HINT Check', 'sales', 'Checked Home Internet availability.', 'Count it when you run the address or clearly ask for it.', 'Example: every phone-plan call still gets a quick Home Internet check.'),
  makeCell('sf-fit-tier', 'Plan Fit', 'skill', 'Matched the recommendation to the right plan tier.', 'Count it when you position the plan around needs instead of naming every option.', 'Example: you move a value-focused customer to Experience More instead of overselling Beyond.'),
  makeCell('sf-experience-story', 'Exp Story', 'skill', 'Explained the Experience lineup cleanly.', 'Count it when a customer can tell the difference between More and Beyond after you explain it.', 'Example: you anchor Beyond on premium perks and More on strong everyday value.'),
  makeCell('sf-p360', 'P360 Ask', 'sales', 'Asked for Protection 360 directly.', 'Count it when you confidently ask for P360 instead of hoping they request it.', 'Example: you frame P360 as part of the setup, not a side note.'),
  makeCell('sf-bundle', '3+ Bundle', 'sales', 'Positioned the 3+ accessory bundle.', 'Count it when you package the essentials instead of pitching one item at a time.', 'Example: case, glass, and charger land as the easy first-day bundle.'),
  makeCell('sf-ask-sale', 'Ask Sale', 'skill', 'Made a direct close attempt.', 'Count it when you clearly ask for the order.', 'Example: "Want me to lock that in for you today?"'),
  makeCell('sf-recap', 'Recap Next', 'skill', 'Recapped the next steps before ending the call.', 'Count it when the customer leaves knowing exactly what happens next.', 'Example: you confirm shipping, order timing, and any follow-up steps.'),
  makeCell('sf-tradein', 'Trade-In', 'sales', 'Brought trade-in value into the conversation.', 'Count it when the trade-in meaningfully helps the close.', 'Example: you use the old phone value to soften a premium-device payment.'),
  makeCell('sf-govt-paid', 'Govt to Paid', 'sales', 'Converted a Govt/Lifeline account to a standard paid line.', 'Count it when you successfully transition a customer from a subsidized plan to a standard paid line.', 'Example: you show the value of unlimited data and device promos on a paid plan.'),
  makeCell('sf-name', 'Mirror Words', 'vibe', "Used the customer's own words back to them.", 'Count it when you repeat a phrase the customer said to show you were listening.', 'Example: they say "I just need something reliable" and you say "Let me find you the most reliable setup."'),
  makeCell('sf-reset-objection', 'Reset Calm', 'skill', 'Stayed calm and reset after pushback.', 'Count it when you slow the call down instead of sounding defensive.', 'Example: you acknowledge the concern, then guide the customer back to one clear option.'),
  makeCell('sf-upgrade-path', 'Upgrade Path', 'sales', 'Mapped the cleanest upgrade path.', 'Count it when you explain the best route without overcomplicating the account.', 'Example: you show whether upgrade, add-a-line, or switcher math lands best.'),
  makeCell('sf-add-line', 'Add Line', 'sales', 'Opened a real add-a-line angle.', 'Count it when you plant or close a connected voice-line opportunity.', 'Example: a family plan conversation turns into a kid-line discussion.'),
  makeCell('sf-accessory', 'Attach Gear', 'sales', 'Positioned at least one accessory with purpose.', 'Count it when the add-on solves a real daily friction point.', 'Example: you recommend a car mount because they mention maps and commuting.'),
  makeCell('sf-bill-fix', 'Bill First', 'skill', 'Solved the billing question before selling.', 'Count it when you earn trust by handling the real issue first.', 'Example: you explain the charge clearly, then transition into savings.'),
  makeCell('sf-simple-language', 'Keep Simple', 'skill', 'Kept the language clean and non-jargony.', 'Count it when the explanation feels fast and customer-facing.', 'Example: you skip the internal lingo and use one clear monthly comparison.'),
  makeCell('sf-second-question', '2nd Q', 'skill', 'Asked one more discovery question than expected.', 'Count it when the extra question uncovers the real need.', 'Example: the second question reveals the customer really cares about hotspot and travel.'),
  makeCell('sf-fulfillment', 'Pickup/Ship', 'sales', 'Confirmed fulfillment cleanly.', 'Count it when shipping, pickup, or delivery is handled without confusion.', 'Example: you clarify whether the device arrives or is ready in-store.'),
  makeCell('sf-close-clean', 'Callback Hook', 'vibe', 'Gave one specific reason the customer would call back.', 'Count it when you leave the customer with a reason to return even if they do not buy today.', 'Example: "That trade-in value is locked for 14 days — call me back anytime before then."'),
];

export const SINGLE_BINGO_BOARD_ID = 'sales-fundamentals';

export const BINGO_BOARDS: BingoBoardDefinition[] = [
  {
    id: SINGLE_BINGO_BOARD_ID,
    name: 'Call Flow Bingo',
    subtitle: 'Win the clean, repeatable habits that make live calls feel easy.',
    miniLesson: 'Stop leaving money on the table. Control the call from "hello", dig into their real pain points, and quote the full stack. This board is about owning the interaction, not just taking orders.',
    cells: SALES_FUNDAMENTALS_CELLS,
  },
];

export function getBoardById(boardId: string): BingoBoardDefinition {
  return BINGO_BOARDS.find((board) => board.id === boardId) ?? BINGO_BOARDS[0];
}

export function getBoardLayout(boardId: string): BingoCell[] {
  const board = getBoardById(boardId);
  return [...board.cells.slice(0, 12), FREE_SPACE, ...board.cells.slice(12)];
}

export function getFeaturedBoardId(): string {
  return SINGLE_BINGO_BOARD_ID;
}
