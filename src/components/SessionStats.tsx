import { SessionStats as SessionStatsType } from '../services/sessionTracker';

interface SessionStatsProps {
  stats: SessionStatsType;
}

function formatIntentLabel(intent: string | null): string {
  if (!intent) return 'None Yet';

  return intent
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getTopIntent(intentsUsed: Record<string, number>): string | null {
  let topIntent: string | null = null;
  let topCount = -1;

  for (const [intent, count] of Object.entries(intentsUsed)) {
    if (count > topCount) {
      topIntent = intent;
      topCount = count;
    }
  }

  return topIntent;
}

export default function SessionStats({ stats }: SessionStatsProps) {
  // Don't show zero states
  if (stats.plansGenerated === 0 && stats.objectionsAnalyzed === 0) return null;

  const parts: string[] = [];
  if (stats.plansGenerated > 0) parts.push(`${stats.plansGenerated} plan${stats.plansGenerated !== 1 ? 's' : ''} saved`);
  if (stats.objectionsAnalyzed > 0) parts.push(`${stats.objectionsAnalyzed} objection${stats.objectionsAnalyzed !== 1 ? 's' : ''}`);
  const topIntent = getTopIntent(stats.intentsUsed);
  if (topIntent) parts.push(`top: ${formatIntentLabel(topIntent)}`);

  return (
    <p className="px-2 text-center text-[11px] font-medium text-t-muted break-words leading-relaxed">
      {parts.join(' \u00b7 ')}
    </p>
  );
}
