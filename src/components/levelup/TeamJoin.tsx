import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Ticket, Check, AlertCircle } from 'lucide-react';
import {
  decodeArcadeToken,
  getMascotEmoji,
  saveTeamConfig,
  TeamConfig,
} from '../../services/teamConfigService';
import { celebrate } from './celebrate';

const ERROR_COPY: Record<'format' | 'version' | 'payload' | 'name', string> = {
  format: 'That token format looks off. Check for missing characters or whitespace.',
  version: 'This token is from a different app version. Ask your manager for a fresh one.',
  payload: 'That token is corrupted and could not be read.',
  name: 'Token is missing a team name. Ask your manager to regenerate it.',
};

interface TeamJoinProps {
  onJoined?: (config: TeamConfig) => void;
}

export default function TeamJoin({ onJoined }: TeamJoinProps) {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [joinedConfig, setJoinedConfig] = useState<TeamConfig | null>(null);

  const handleJoin = () => {
    setError(null);
    const result = decodeArcadeToken(token);
    if (result.ok === true) {
      saveTeamConfig(result.config);
      setJoinedConfig(result.config);
      celebrate({ intensity: 'heavy' });
      onJoined?.(result.config);
      return;
    }
    setError(ERROR_COPY[result.error]);
  };

  if (joinedConfig) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl border-2 border-t-magenta bg-surface p-8 text-center shadow-[0_0_48px_rgba(226,0,116,0.35)]"
      >
        <div className="text-6xl mb-4">{getMascotEmoji(joinedConfig.mascotId)}</div>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-t-magenta mb-2">Coin Accepted</p>
        <h3 className="text-3xl font-black text-t-dark-gray mb-2 break-words">
          Welcome to {joinedConfig.teamName}
        </h3>
        {joinedConfig.weeklyFocus && (
          <p className="text-sm font-bold text-t-muted">This week's focus: {joinedConfig.weeklyFocus}</p>
        )}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-t-magenta/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-t-magenta">
          <Check className="w-3 h-3" /> Squad Linked
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border-2 border-t-magenta/60 bg-surface p-8 shadow-[0_0_32px_rgba(226,0,116,0.35)]"
    >
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-t-magenta/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-t-magenta/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-t-magenta text-white shadow-lg shadow-t-magenta/40 mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <motion.h2
            className="text-4xl sm:text-5xl font-black tracking-tight text-t-magenta"
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            INSERT COIN
          </motion.h2>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-t-dark-gray">
            Paste your Arcade Token to join the squad
          </p>
        </div>

        <div>
          <label htmlFor="arcade-token-input" className="sr-only">Arcade Token</label>
          <textarea
            id="arcade-token-input"
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              if (error) setError(null);
            }}
            placeholder="ARC1-..."
            spellCheck={false}
            className="w-full min-h-[128px] resize-none rounded-2xl border-2 border-t-magenta/40 bg-background px-4 py-3 font-mono text-sm text-t-dark-gray placeholder:text-t-muted/60 focus:border-t-magenta focus:outline-none focus:ring-2 focus:ring-t-magenta/30 shadow-inner"
          />
          {error && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-bold text-red-700"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <button
          type="button"
          onClick={handleJoin}
          disabled={!token.trim()}
          className="w-full bg-[#E20074] text-white font-black text-lg py-4 rounded-xl shadow-lg hover:bg-pink-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Join Squad
        </button>

        <p className="text-[10px] font-bold uppercase tracking-widest text-t-muted text-center">
          No file uploads. No network. Just a token.
        </p>
      </div>
    </motion.div>
  );
}
