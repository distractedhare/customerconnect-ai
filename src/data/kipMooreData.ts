/**
 * Kip Moore brand ambassador profile.
 *
 * Injected verbatim into every Gemma system prompt as grounding context.
 * The AI must answer Kip Moore questions from this data, not from guesses.
 *
 * Update this file whenever the partnership details change — no other file
 * needs to change for the AI to pick up the new facts.
 */

export interface AmbassadorProfile {
  name: string;
  role: string;          // why this person is relevant to T-Mobile reps
  bio: string;           // 2-3 sentence factual background
  musicHighlights: string[];
  albums: { title: string; year: number; notableTrack: string }[];
  keyDemographic: string;
  repTalkingPoints: string[];  // ready-to-use lines for reps during small talk
  repAvoid: string[];          // things reps should NOT say or assume
}

export const KIP_MOORE: AmbassadorProfile = {
  name: 'Kip Moore',
  role: 'T-Mobile brand partner and country music artist',
  bio:
    'Kip Moore is an American country music singer-songwriter from Tifton, Georgia. ' +
    'He broke through in 2012 with the platinum-certified debut album Up All Night and the ' +
    'number-one single "Somethin\' \'Bout a Truck." Known for a hard-touring, blue-collar ' +
    'work ethic and a rock-influenced country sound, he has built one of the most loyal ' +
    'fanbases in country music through relentless road work rather than radio formulas.',
  musicHighlights: [
    '"Somethin\' \'Bout a Truck" — debut #1 single (2012)',
    '"Beer Money" — Top 5 hit (2012)',
    '"Hey Pretty Girl" — Top 5 hit (2013)',
    '"More Girls Like You" — #1 single (2018)',
    '"She\'s Mine" — fan favorite deep cut',
    'Known for marathon live sets; plays 100–150+ shows per year',
    'Rock-influenced sound — appeals to country AND rock audiences',
  ],
  albums: [
    { title: 'Up All Night', year: 2012, notableTrack: 'Somethin\' \'Bout a Truck' },
    { title: 'Wild Ones', year: 2015, notableTrack: 'Wild Ones' },
    { title: 'Slowheart', year: 2017, notableTrack: 'More Girls Like You' },
    { title: 'Wild World', year: 2020, notableTrack: 'She\'s Mine' },
  ],
  keyDemographic:
    'Adults 25–45, blue-collar and working-class skew, outdoor/adventure lifestyle, ' +
    'strong in the South, Midwest, and rural markets. High overlap with T-Mobile\'s ' +
    'Home Internet and switcher customer profiles.',
  repTalkingPoints: [
    'Kip Moore is a T-Mobile partner — great common ground with country music fans.',
    'If a customer mentions Kip Moore or country music, you can confirm T-Mobile works with him.',
    'His demographic overlaps heavily with Home Internet customers in rural and suburban markets.',
    'He tours constantly — a natural fit for T-Mobile\'s network coverage story.',
    'Lead with a genuine connection (music, touring, outdoor lifestyle) before pivoting to product.',
  ],
  repAvoid: [
    'Don\'t invent specific promotion details — only cite what\'s in the current weekly update.',
    'Don\'t confuse Kip Moore with other country artists.',
    'Don\'t overstate the partnership — use it as a conversation starter, not a hard sell.',
  ],
};

const KIP_MOORE_CONTEXT = ((): string => {
  const { name, role, bio, musicHighlights, albums, keyDemographic, repTalkingPoints, repAvoid } = KIP_MOORE;

  const albumLines = albums
    .map((a) => `  - ${a.title} (${a.year}) — "${a.notableTrack}"`)
    .join('\n');

  const highlights = musicHighlights.map((h) => `  - ${h}`).join('\n');
  const talkingPoints = repTalkingPoints.map((t) => `  - ${t}`).join('\n');
  const avoid = repAvoid.map((a) => `  - ${a}`).join('\n');

  return [
    `## Partner Profile: ${name}`,
    `Role: ${role}`,
    '',
    `Background: ${bio}`,
    '',
    'Music highlights:',
    highlights,
    '',
    'Discography:',
    albumLines,
    '',
    `Key demographic: ${keyDemographic}`,
    '',
    'Rep talking points:',
    talkingPoints,
    '',
    'Rep — avoid:',
    avoid,
  ].join('\n');
})();

/** Plain-text block suitable for injection into an AI system prompt. */
export function kipMooreContextBlock(): string {
  return KIP_MOORE_CONTEXT;
}
