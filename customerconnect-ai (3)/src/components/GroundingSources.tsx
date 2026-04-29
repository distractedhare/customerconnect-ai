import { Globe, ExternalLink } from 'lucide-react';
import { GroundingSource } from '../types';

export default function GroundingSources({ sources }: { sources?: GroundingSource[] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t border-t-light-gray">
      <h4 className="text-[9px] font-black text-t-dark-gray uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
        <Globe className="w-3 h-3" /> Where This Came From
      </h4>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, i) => (
          <a
            key={i}
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-t-light-gray/30 hover:bg-t-magenta/10 text-[10px] font-bold text-t-dark-gray hover:text-t-magenta rounded-lg border border-t-light-gray transition-all"
          >
            <span className="truncate max-w-[150px]">{source.title}</span>
            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
