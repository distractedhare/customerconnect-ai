import { LogIn, UserCircle } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';

interface AccountPillProps {
  onClick: () => void;
}

export default function AccountPill({ onClick }: AccountPillProps) {
  const profile = useProfile();

  if (!profile) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Sign in or create account"
        title="Sign in"
        className="focus-ring hidden min-[470px]:inline-flex items-center gap-1.5 rounded-full glass-control px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-t-dark-gray hover:text-t-magenta"
      >
        <LogIn className="h-3.5 w-3.5" />
        <span>Sign in</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Signed in as @${profile.handle}. Open account settings.`}
      title={`@${profile.handle} · ${profile.tabCode}`}
      className="focus-ring hidden min-[470px]:inline-flex items-center gap-1.5 rounded-full glass-control px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-t-dark-gray hover:text-t-magenta"
    >
      <UserCircle className="h-3.5 w-3.5" />
      <span className="max-w-[8ch] truncate">@{profile.handle}</span>
    </button>
  );
}
