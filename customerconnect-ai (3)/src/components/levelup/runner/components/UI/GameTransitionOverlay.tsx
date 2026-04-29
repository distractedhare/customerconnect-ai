import { useEffect, useState } from 'react';

interface GameTransitionOverlayProps {
  isEnteringGame: boolean;
  onComplete: () => void;
}

export default function GameTransitionOverlay({ isEnteringGame, onComplete }: GameTransitionOverlayProps) {
  const [isVisible, setIsVisible] = useState(isEnteringGame);
  const [isOpaque, setIsOpaque] = useState(false);

  useEffect(() => {
    if (!isEnteringGame) {
      setIsOpaque(false);
      const hideTimer = window.setTimeout(() => setIsVisible(false), 300);
      return () => window.clearTimeout(hideTimer);
    }

    setIsVisible(true);
    const fadeTimer = window.setTimeout(() => setIsOpaque(true), 16);
    const completeTimer = window.setTimeout(() => {
      onComplete();
      setIsOpaque(false);
    }, 800);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(completeTimer);
    };
  }, [isEnteringGame, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0F0F14] transition-opacity duration-300"
      style={{ opacity: isOpaque ? 1 : 0 }}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="translate-y-0 animate-pulse text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.32em] text-[#FF0066] sm:text-xs">
          Connecting to Rival Network...
        </p>
      </div>
    </div>
  );
}
