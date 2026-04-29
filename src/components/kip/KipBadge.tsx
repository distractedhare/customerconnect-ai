import {
  Radio,
} from 'lucide-react';
import type { KipTone } from '../../types/kip';
import KipAvatar from './KipAvatar';
import type { KipAvatarSize, KipAvatarState } from './kip-types';

interface KipBadgeProps {
  tone?: KipTone;
  label?: string;
  compact?: boolean;
  size?: 16 | 32 | 64 | 128;
  state?: KipAvatarState;
}

const TONE_LABELS: Record<KipTone, string> = {
  operator: 'Operator',
  coach: 'Coach',
  mission: 'Mission',
  tip: 'Tip',
  pivot: 'Pivot',
  celebrate: 'Hype',
  recover: 'Reset',
  hype: 'Game on',
  tease: 'Heads up',
};

const TONE_TAGLINE: Record<KipTone, string> = {
  operator: 'Operator-sidekick guidance',
  coach: 'Quick coach beat',
  mission: 'Mission briefing',
  tip: 'One useful nudge',
  pivot: 'Mid-call redirect',
  celebrate: 'You earned that',
  recover: 'We catch the next one',
  hype: 'Pre-game read',
  tease: 'Friendly reminder',
};

const STATE_BY_TONE: Record<KipTone, KipAvatarState> = {
  operator: 'idle',
  coach: 'speaking',
  mission: 'listening',
  tip: 'tip',
  pivot: 'alert',
  celebrate: 'success',
  recover: 'alert',
  hype: 'success',
  tease: 'tip',
};

const SIZE_TO_AVATAR_SIZE: Record<16 | 32 | 64 | 128, KipAvatarSize> = {
  16: 'tiny',
  32: 'small',
  64: 'medium',
  128: 'large',
};

export default function KipBadge({
  tone = 'operator',
  label = 'Kip',
  compact = false,
  size,
  state,
}: KipBadgeProps) {
  const resolvedSize = size ?? (compact ? 32 : 64);
  const avatarSize = SIZE_TO_AVATAR_SIZE[resolvedSize];
  const resolvedState = state ?? STATE_BY_TONE[tone];
  const showText = resolvedSize > 16;

  return (
    <div className="inline-flex min-w-0 items-center gap-2">
      <KipAvatar
        size={avatarSize}
        state={resolvedState}
        showGlow={!compact}
        showOnlineStatus={tone === 'operator'}
        alt=""
      />
      {showText ? <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-t-magenta">
          <Radio className="h-3 w-3" />
          {compact ? label : `${label} · ${TONE_LABELS[tone]}`}
        </p>
        {!compact ? (
          <p className="truncate text-[11px] font-bold text-foreground">{TONE_TAGLINE[tone]}</p>
        ) : null}
      </div> : null}
    </div>
  );
}
