import { useCallback, useState } from 'react';
import { Check, Copy, RefreshCw, Ticket, Users } from 'lucide-react';
import {
  getTeamConfig,
  saveTeamConfig,
  getMascotEmoji,
  MASCOT_OPTIONS,
  MascotId,
  TeamConfig as TeamConfigType,
  encodeArcadeToken,
} from '../../services/teamConfigService';

const FOCUS_OPTIONS = [
  'Sales Fundamentals',
  'Product Knowledge',
  'Closing Techniques',
  'Objection Handling',
  'Home Internet',
  'Accessories & Bundles',
  'Customer Experience',
  'Switcher Conversions',
];

export default function TeamConfig() {
  const [config, setConfig] = useState<TeamConfigType>(getTeamConfig);
  const [saved, setSaved] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const updateField = useCallback(<K extends keyof TeamConfigType>(key: K, value: TeamConfigType[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setToken(null);
  }, []);

  const handleSave = () => {
    saveTeamConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleGenerateToken = () => {
    setTokenError(null);
    setCopied(false);
    try {
      setToken(encodeArcadeToken(config));
    } catch (err) {
      setTokenError(err instanceof Error ? err.message : 'Could not generate token.');
    }
  };

  const handleCopyToken = async () => {
    if (!token) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(token);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = token;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setTokenError('Copy failed. Tap the token and copy manually.');
    }
  };

  const hasTeam = config.teamName.trim().length > 0;

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-t-magenta/10">
          <Users className="h-7 w-7 text-t-magenta" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Team Setup</h3>
        <p className="mt-1 text-sm font-medium text-t-dark-gray">
          Customize your squad. Import a config file or set it up here.
        </p>
      </div>

      {/* Team header preview */}
      {hasTeam && (
        <div className="glass-elevated rounded-2xl p-4 text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-t-magenta/10 text-3xl">
            {config.customLogoUrl ? (
              <img src={config.customLogoUrl} alt="Team logo" className="h-12 w-12 rounded-xl object-cover" />
            ) : (
              getMascotEmoji(config.mascotId)
            )}
          </div>
          <p className="text-lg font-black uppercase tracking-tight text-foreground">{config.teamName}</p>
          {config.goalText && (
            <p className="mt-1 text-xs font-medium text-t-dark-gray">"{config.goalText}"</p>
          )}
          {config.managerName && (
            <p className="mt-1 text-[10px] text-t-muted">Led by {config.managerName}</p>
          )}
        </div>
      )}

      {/* Form */}
      <div className="space-y-4">
        {/* Team Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
            Team Name
          </label>
          <input
            type="text"
            value={config.teamName}
            onChange={(e) => updateField('teamName', e.target.value)}
            placeholder="e.g. The Closers, Squad Magenta, Team Phoenix"
            className="focus-ring w-full rounded-xl border border-t-light-gray bg-surface px-4 py-3 text-sm font-medium text-foreground placeholder:text-t-dark-gray/30"
          />
        </div>

        {/* Manager Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
            Manager / Lead Name
          </label>
          <input
            type="text"
            value={config.managerName}
            onChange={(e) => updateField('managerName', e.target.value)}
            placeholder="e.g. Sarah K."
            className="focus-ring w-full rounded-xl border border-t-light-gray bg-surface px-4 py-3 text-sm font-medium text-foreground placeholder:text-t-dark-gray/30"
          />
        </div>

        {/* Mascot */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
            Team Mascot
          </label>
          <div className="flex flex-wrap gap-2">
            {MASCOT_OPTIONS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => updateField('mascotId', m.id as MascotId)}
                className={`focus-ring flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition-all ${
                  config.mascotId === m.id
                    ? 'border-t-magenta bg-t-magenta/10 shadow-sm'
                    : 'border-t-light-gray hover:border-t-magenta/30'
                }`}
                title={m.label}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Logo URL */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
            Custom Logo URL (optional — overrides mascot)
          </label>
          <input
            type="url"
            value={config.customLogoUrl ?? ''}
            onChange={(e) => updateField('customLogoUrl', e.target.value || null)}
            placeholder="https://example.com/logo.png"
            className="focus-ring w-full rounded-xl border border-t-light-gray bg-surface px-4 py-3 text-sm font-medium text-foreground placeholder:text-t-dark-gray/30"
          />
        </div>

        {/* Weekly Focus */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
            Weekly Focus
          </label>
          <div className="flex flex-wrap gap-2">
            {FOCUS_OPTIONS.map((focus) => (
              <button
                key={focus}
                type="button"
                onClick={() => updateField('weeklyFocus', focus)}
                className={`focus-ring rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  config.weeklyFocus === focus
                    ? 'border-t-magenta bg-t-magenta text-white'
                    : 'glass-button text-t-dark-gray hover:border-t-magenta/30'
                }`}
              >
                {focus}
              </button>
            ))}
          </div>
        </div>

        {/* Goal Text */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
            Team Goal / Motto
          </label>
          <input
            type="text"
            value={config.goalText}
            onChange={(e) => updateField('goalText', e.target.value)}
            placeholder="e.g. Every call counts. Close with confidence."
            className="focus-ring w-full rounded-xl border border-t-light-gray bg-surface px-4 py-3 text-sm font-medium text-foreground placeholder:text-t-dark-gray/30"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className={`focus-ring flex-1 rounded-xl py-3 text-sm font-black uppercase tracking-wider text-white transition-all ${
            saved ? 'bg-success-accent' : 'bg-t-magenta shadow-md'
          }`}
        >
          {saved ? (
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4" /> Saved
            </span>
          ) : (
            'Save Config'
          )}
        </button>
      </div>

      {/* Arcade Token */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Ticket className="h-3.5 w-3.5 text-t-magenta" />
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-muted">
            Arcade Token
          </p>
        </div>
        <p className="text-[11px] font-medium text-t-dark-gray">
          Share this token with your squad — they'll paste it under "Join Squad" on their device. No files, no network.
        </p>

        <button
          type="button"
          onClick={handleGenerateToken}
          disabled={!hasTeam}
          className="focus-ring w-full inline-flex items-center justify-center gap-2 rounded-lg bg-t-magenta px-3 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-sm transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {token ? (
            <>
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate Arcade Token
            </>
          ) : (
            <>
              <Ticket className="h-3.5 w-3.5" /> Generate Arcade Token
            </>
          )}
        </button>

        {tokenError && (
          <p className="text-[10px] font-bold text-error-accent">{tokenError}</p>
        )}

        {token && (
          <div className="space-y-2">
            <textarea
              readOnly
              value={token}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full min-h-[88px] resize-none rounded-lg border border-t-magenta/40 bg-background px-3 py-2 font-mono text-[11px] text-t-dark-gray shadow-inner focus:outline-none focus:ring-2 focus:ring-t-magenta/30"
              aria-label="Arcade Token"
            />
            <button
              type="button"
              onClick={handleCopyToken}
              className={`focus-ring w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                copied
                  ? 'bg-success-accent text-white'
                  : 'border border-t-light-gray text-t-dark-gray hover:border-t-magenta/30'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Copy to Clipboard
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
