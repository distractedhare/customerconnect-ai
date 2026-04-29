import { CheckCircle2 } from 'lucide-react';
import type { KipMessage } from '../../types/kip';
import KipBadge from './KipBadge';

interface KipCoachNoteProps {
  note: KipMessage;
}

export default function KipCoachNote({ note }: KipCoachNoteProps) {
  return (
    <aside className="glass-reading rounded-[1.45rem] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <KipBadge tone={note.tone} compact size={32} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-t-magenta" />
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">{note.headline}</p>
          </div>
          <p className="mt-2 text-[12px] font-semibold leading-relaxed text-t-dark-gray">{note.body}</p>
        </div>
      </div>
    </aside>
  );
}
