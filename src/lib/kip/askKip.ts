export type KipVoice = 'tip' | 'celebrate' | 'flag' | 'reset';
export type KipSource = 'canon' | 'gemma';

export interface KipReply {
  text: string;
  voice?: KipVoice;
  source?: KipSource;
}

const CANON_RESPONSES: Record<string, string[]> = {
  default: [
    "Ready up. Let's stack a shift.",
    "Target acquired. We're going for the magenta win today.",
    "Checking the metrics... looking solid. What's next?",
    "I'm here to guide. Just ask.",
  ],
  greeting: [
    "Good to see you back on the floor.",
    "Shift started. Momentum is high.",
  ],
  tip: [
    "Heads up: customers are looking for more than just devices—they want the full T-Mobile experience.",
    "Pro-tip: Always check for accessory compatibility before the pitch.",
  ],
};

/**
 * Global function to query Kip.
 * This is the architectural scaffold for future Gemma integration.
 */
export async function askKip(prompt: string): Promise<KipReply> {
  // Simulate network delay for the AI feel
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

  const lower = prompt.toLowerCase();
  let text = "";

  if (lower.includes('hello') || lower.includes('hi')) {
    text = CANON_RESPONSES.greeting[Math.floor(Math.random() * CANON_RESPONSES.greeting.length)];
  } else if (lower.includes('tip') || lower.includes('help')) {
    text = CANON_RESPONSES.tip[Math.floor(Math.random() * CANON_RESPONSES.tip.length)];
  } else {
    text = CANON_RESPONSES.default[Math.floor(Math.random() * CANON_RESPONSES.default.length)];
  }

  return {
    text,
    source: 'canon', // TODO: switch to 'gemma' once live model is wired
    voice: 'tip',
  };
}
