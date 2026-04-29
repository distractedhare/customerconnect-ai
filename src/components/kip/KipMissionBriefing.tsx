import { Target } from 'lucide-react';
import type { KipMessage } from '../../types/kip';
import KipBadge from './KipBadge';

interface KipMissionBriefingProps {
  briefing: KipMessage;
  compact?: boolean;
}

export default function KipMissionBriefing({ briefing, compact = false }: KipMissionBriefingProps) {
  return (
    <aside className={`glass-reading rounded-[1.45rem] ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-start gap-3">
        <div className={compact ? 'hidden sm:block' : ''}>
          <KipBadge tone={briefing.tone} compact size={32} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 shrink-0 text-t-magenta" />
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">{briefing.headline}</p>
          </div>
          <p className="mt-2 text-[12px] font-semibold leading-relaxed text-t-dark-gray">{briefing.body}</p>
        </div>
      </div>
    </aside>
  );
}
