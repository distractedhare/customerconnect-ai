import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Copy,
  KeyRound,
  LogIn,
  LogOut,
  ShieldCheck,
  UserCircle,
  UserPlus,
} from 'lucide-react';
import { TABS } from '../../data/tabs';
import { useProfile } from '../../hooks/useProfile';
import {
  defaultSignUpHints,
  signIn,
  signOut,
  signUp,
  type SignUpInput,
} from '../../services/auth/profileService';
import { ACCESS_LEVEL_LABEL } from '../../services/auth/capabilities';
import { decodeRepToken } from '../../services/auth/repToken';
import { MASCOT_OPTIONS, getMascotEmoji, type MascotId } from '../../services/teamConfigService';

type Mode = 'signin' | 'signup' | 'recover';

const HANDLE_HINT = 'Lowercase letters, numbers, underscore. 3-20 chars.';
const PIN_HINT = '6 digits. Used to keep casual lookers out — not bank-grade security.';

export default function AccountSection() {
  const profile = useProfile();
  const [mode, setMode] = useState<Mode>('signin');
  const [dangerOpen, setDangerOpen] = useState(false);

  if (profile) {
    const tab = TABS.find((t) => t.code === profile.tabCode);
    const team = tab?.teams.find((tm) => tm.id === profile.teamId);

    return (
      <div className="space-y-6">
        <header className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-t-magenta/10">
            <UserCircle className="h-6 w-6 text-t-magenta" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">Account</h2>
            <p className="text-xs font-medium text-t-dark-gray">
              Signed in as <span className="font-black">@{profile.handle}</span>
            </p>
          </div>
        </header>

        <section className="rounded-2xl border border-t-light-gray bg-surface p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-t-muted">Identity</p>
              <p className="text-sm font-bold">@{profile.handle}</p>
              <p className="text-[11px] text-t-dark-gray">
                {tab?.displayName ?? profile.tabCode} · {team?.defaultName ?? profile.teamId}
                {' · '}
                <span className="text-t-magenta">{ACCESS_LEVEL_LABEL[profile.accessLevel]}</span>
              </p>
            </div>
            <span className="text-2xl" aria-hidden="true">{getMascotEmoji(profile.mascotId)}</span>
          </div>
        </section>

        <section className="rounded-2xl border border-t-light-gray bg-surface p-4 space-y-2">
          <div className="flex items-center gap-2 text-t-magenta">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Backups</span>
          </div>
          <p className="text-[11px] text-t-dark-gray leading-relaxed">
            Backups land in your Downloads or your own email — never on our servers.
            File downloads, mailto, and QR-code backups arrive in the next update.
          </p>
        </section>

        <section className="rounded-2xl border border-t-light-gray bg-surface p-4 space-y-3">
          <button
            type="button"
            onClick={() => setDangerOpen((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="flex items-center gap-2 text-warning-accent">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Danger zone</span>
            </span>
            {dangerOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {dangerOpen && (
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => signOut(false)}
                className="w-full rounded-xl border border-t-light-gray bg-surface-elevated py-2.5 text-[11px] font-black uppercase tracking-widest text-t-dark-gray hover:bg-t-light-gray/30"
              >
                <LogOut className="mr-1.5 inline h-3.5 w-3.5" />
                Sign out (keep data on this device)
              </button>
              <EraseButton />
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-t-magenta/10">
          <UserCircle className="h-6 w-6 text-t-magenta" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">Account</h2>
          <p className="text-xs font-medium text-t-dark-gray">
            Anonymous use is fine. Sign in only if you want progress to follow you across devices.
          </p>
        </div>
      </header>

      <nav className="flex gap-2" role="tablist" aria-label="Account action">
        <ModeTab active={mode === 'signin'} onClick={() => setMode('signin')} icon={LogIn} label="Sign in" />
        <ModeTab active={mode === 'signup'} onClick={() => setMode('signup')} icon={UserPlus} label="Create account" />
        <ModeTab active={mode === 'recover'} onClick={() => setMode('recover')} icon={KeyRound} label="Restore" />
      </nav>

      <div className="rounded-2xl border border-t-light-gray bg-surface p-4">
        {mode === 'signin' && <SignInForm />}
        {mode === 'signup' && <SignUpForm />}
        {mode === 'recover' && <RecoverForm />}
      </div>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof LogIn;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
        active ? 'bg-t-magenta text-white' : 'bg-surface-elevated text-t-dark-gray hover:bg-t-light-gray/30'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-xl border border-error-border bg-error-surface px-3 py-2 text-[11px] font-bold text-error-foreground">
      {message}
    </p>
  );
}

function FormHint({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-medium text-t-muted">{children}</p>;
}

function SignInForm() {
  const [handle, setHandle] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await signIn(handle, pin);
    setBusy(false);
    if (result.ok) return;
    if (result.error === 'no-profile') {
      setError('No account on this device yet. Create one or restore from a Rep Token.');
    } else {
      setError('Handle or PIN does not match.');
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-t-muted">Handle</label>
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          autoComplete="off"
          inputMode="text"
          className="w-full rounded-xl border border-t-light-gray bg-surface-elevated px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-t-magenta/40"
          placeholder="bsharp"
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-t-muted">PIN</label>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          autoComplete="off"
          inputMode="numeric"
          pattern="\d{6}"
          className="w-full rounded-xl border border-t-light-gray bg-surface-elevated px-3 py-2 text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-t-magenta/40"
          placeholder="······"
          required
        />
        <FormHint>{PIN_HINT}</FormHint>
      </div>
      <FormError message={error} />
      <button
        type="submit"
        disabled={busy}
        className="cta-primary w-full rounded-xl py-2.5 text-[11px] font-black uppercase tracking-widest text-white disabled:opacity-50"
      >
        {busy ? 'Checking…' : 'Sign in'}
      </button>
    </form>
  );
}

function SignUpForm() {
  const hints = useMemo(() => defaultSignUpHints(), []);
  const [handle, setHandle] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [tabCode, setTabCode] = useState(hints.tabCode);
  const [teamId, setTeamId] = useState(hints.teamId);
  const [mascotId, setMascotId] = useState<MascotId>('rocket');
  const [initials, setInitials] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const tab = TABS.find((t) => t.code === tabCode) ?? TABS[0];

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (pin !== pinConfirm) {
      setError('PINs do not match.');
      return;
    }
    setBusy(true);
    setError(null);
    const payload: SignUpInput = { handle, pin, tabCode, teamId, mascotId, initials };
    const result = await signUp(payload);
    setBusy(false);
    if (result.ok) return;
    switch (result.error) {
      case 'handle': setError('Handle must be 3-20 chars: lowercase letters, numbers, or underscore.'); break;
      case 'pin': setError('PIN must be exactly 6 digits.'); break;
      case 'tab': setError('Pick a TAB.'); break;
      case 'team': setError('Pick a team in that TAB.'); break;
      case 'crypto': setError('This browser does not support secure PINs. Try a different browser.'); break;
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-t-muted">Handle</label>
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          autoComplete="off"
          inputMode="text"
          className="w-full rounded-xl border border-t-light-gray bg-surface-elevated px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-t-magenta/40"
          placeholder="bsharp"
          required
        />
        <FormHint>{HANDLE_HINT}</FormHint>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-t-muted">PIN</label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            autoComplete="off"
            inputMode="numeric"
            pattern="\d{6}"
            className="w-full rounded-xl border border-t-light-gray bg-surface-elevated px-3 py-2 text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-t-magenta/40"
            placeholder="······"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-t-muted">Confirm PIN</label>
          <input
            type="password"
            value={pinConfirm}
            onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))}
            autoComplete="off"
            inputMode="numeric"
            pattern="\d{6}"
            className="w-full rounded-xl border border-t-light-gray bg-surface-elevated px-3 py-2 text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-t-magenta/40"
            placeholder="······"
            required
          />
        </div>
      </div>
      <FormHint>{PIN_HINT}</FormHint>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-t-muted">TAB</label>
          <select
            value={tabCode}
            onChange={(e) => {
              const next = e.target.value;
              setTabCode(next);
              const nextTab = TABS.find((t) => t.code === next);
              if (nextTab) setTeamId(nextTab.teams[0].id);
            }}
            className="w-full rounded-xl border border-t-light-gray bg-surface-elevated px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-t-magenta/40"
          >
            {TABS.map((t) => (
              <option key={t.code} value={t.code}>{t.displayName}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-t-muted">Team</label>
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="w-full rounded-xl border border-t-light-gray bg-surface-elevated px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-t-magenta/40"
          >
            {tab.teams.map((tm) => (
              <option key={tm.id} value={tm.id}>{tm.defaultName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-t-muted">Mascot</label>
          <select
            value={mascotId}
            onChange={(e) => setMascotId(e.target.value as MascotId)}
            className="w-full rounded-xl border border-t-light-gray bg-surface-elevated px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-t-magenta/40"
          >
            {MASCOT_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>{m.emoji} {m.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-t-muted">Initials</label>
          <input
            type="text"
            value={initials}
            onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 3))}
            autoComplete="off"
            inputMode="text"
            className="w-full rounded-xl border border-t-light-gray bg-surface-elevated px-3 py-2 text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-t-magenta/40"
            placeholder="BJS"
          />
          <FormHint>For leaderboard display only.</FormHint>
        </div>
      </div>

      <FormError message={error} />
      <button
        type="submit"
        disabled={busy}
        className="cta-primary w-full rounded-xl py-2.5 text-[11px] font-black uppercase tracking-widest text-white disabled:opacity-50"
      >
        {busy ? 'Creating…' : 'Create account'}
      </button>

      <p className="text-[10px] font-medium text-t-muted">
        No real names, no email, no EIDs. Identity stays on this device.
      </p>
    </form>
  );
}

function RecoverForm() {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const result = decodeRepToken(token);
    if (result.ok) {
      setSuccess(`Recognized @${result.snapshot.profile.handle}. Full restore lands in the next update.`);
      return;
    }
    switch (result.error) {
      case 'format': setError('That does not look like a Rep Token.'); break;
      case 'version': setError('Token is from an older or newer version of the app.'); break;
      case 'payload': setError('Token payload is malformed.'); break;
      case 'profile': setError('Token does not contain a usable profile.'); break;
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-t-muted">Paste a Rep Token</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-t-light-gray bg-surface-elevated px-3 py-2 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-t-magenta/40"
          placeholder="REP1-…"
        />
        <FormHint>Tokens start with REP1-. Restore-from-file and QR scanning ship in the next update.</FormHint>
      </div>
      <FormError message={error} />
      {success && (
        <p className="rounded-xl border border-success-accent/30 bg-success-surface px-3 py-2 text-[11px] font-bold text-success-accent">
          {success}
        </p>
      )}
      <button
        type="submit"
        className="cta-primary w-full rounded-xl py-2.5 text-[11px] font-black uppercase tracking-widest text-white"
      >
        Validate token
      </button>
    </form>
  );
}

function EraseButton() {
  const [stage, setStage] = useState<'idle' | 'confirm'>('idle');
  const [confirmText, setConfirmText] = useState('');
  const [armed, setArmed] = useState(false);

  if (stage === 'idle') {
    return (
      <button
        type="button"
        onClick={() => setStage('confirm')}
        className="w-full rounded-xl border border-error-border bg-error-surface py-2.5 text-[11px] font-black uppercase tracking-widest text-error-foreground hover:bg-error-surface/80"
      >
        <Copy className="mr-1.5 inline h-3.5 w-3.5" />
        Sign out and erase data on this device
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-error-border bg-error-surface/40 p-3">
      <p className="text-[11px] font-bold text-error-foreground">
        Type <span className="font-mono">DELETE MY PROGRESS</span> below to confirm. Allow ~2 seconds before tapping confirm.
      </p>
      <input
        type="text"
        value={confirmText}
        onChange={(e) => {
          setConfirmText(e.target.value);
          if (e.target.value === 'DELETE MY PROGRESS') {
            setTimeout(() => setArmed(true), 2000);
          } else {
            setArmed(false);
          }
        }}
        className="w-full rounded-lg border border-error-border bg-surface px-2 py-1.5 font-mono text-[11px]"
        placeholder="DELETE MY PROGRESS"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setStage('idle');
            setConfirmText('');
            setArmed(false);
          }}
          className="flex-1 rounded-lg border border-t-light-gray bg-surface px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-t-dark-gray"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!armed}
          onClick={() => signOut(true)}
          className="flex-1 rounded-lg bg-error-surface px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-error-foreground disabled:opacity-40"
        >
          Erase
        </button>
      </div>
    </div>
  );
}
