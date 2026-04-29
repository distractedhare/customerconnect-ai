export const learnCopy = {
  onClockPanel: {
    title: 'On-the-clock only',
    description:
      'Use Learn mode for shift-start prep, between-call coaching, and live-call support while you are working.',
  },
  hero: {
    badge: 'Knowledge Center',
    title: 'Know Your Stuff',
    subtitle:
      'On-the-clock coaching for live calls, quick resets, and the T-Mobile story without the data dump. Stay sharp, stay fast, and keep every conversation easy to follow.',
    cards: [
      { title: 'Daily Briefing', subtitle: "Today's Promos" },
      { title: 'Device Lab', subtitle: 'Compare & Pitch' },
      { title: 'Plan Master', subtitle: 'Value Stacking' },
    ],
  },
  devices: {
    sectionTitle: 'Fast Call Rule',
    fastCallRules: [
      'Open with one angle, not three.',
      'Back it up with one proof point.',
      'Only open the backup angle if the caller needs a different reason to say yes.',
    ],
    fallbackHeading: {
      phones: 'The Lineup',
      tablets: 'Tablets',
      wearables: 'Watches + IoT',
      default: 'Devices',
    },
    fallbackCopy: {
      phones: 'Pick devices to compare specs, selling points, and accessory plays.',
      tablets: 'Choose tablet options to compare performance, price, and how they fit customer lifestyles.',
      wearables: 'Choose watch and connected-device options to compare value, use case, and attach potential.',
      default: 'Pick devices to compare specs and selling points.',
    },
    starterPrompts: {
      phones: 'Try "Flagship Showdown" or "Budget Conscious" to get started',
      tablets: 'Try "Flagship Showdown" or "Budget Battle" to get started',
      wearables: 'Try "Flagship Showdown" or filter to Connected',
      default: 'Pick from a quick preset and compare right away',
    },
  },
  accessoryQuickReference: {
    title: 'Accessories Quick Reference',
    helper: 'Fast lookup for phone reps. Find the outcome, use one line, and keep it moving.',
    searchLabel: 'Search by accessory…',
    clearLabel: 'Clear search',
    filtersLabel: 'Filter by outcome',
  },
} as const;
