import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X, ChevronRight } from 'lucide-react';
import type { RunnerCharacter } from '../../content';
import { RunnerPicture } from './RunnerPicture';

interface Props {
  character: RunnerCharacter;
  isActive: boolean;
}

export const CharacterCard: React.FC<Props> = ({ character, isActive }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Use cutout for the floating pop-out.
  // Kip: 678×836 RGBA transparent hero ✅
  // Nokia: 194×390 portrait ✅
  // Factions (/assets/factions/*/cutout_transparent.png): 606×820 RGB ✅
  const popoutSrc = character.assets.cutout;
  const isSvgAbility = (path: string) => path.endsWith('.svg');

  return (
    <>
      <div
        className={`relative w-[85vw] max-w-sm shrink-0 transition-all duration-500 snap-center
          ${isActive ? 'opacity-100 scale-100' : 'opacity-60 scale-95'}`}
      >
        {/* Floating pop-out character art */}
        <button
          type="button"
          aria-label={`View ${character.name} full card`}
          onClick={() => character.fullCard && setIsExpanded(true)}
          className={[
            'absolute -top-24 left-1/2 -translate-x-1/2 z-20',
            // Size: give enough room for tall portrait art
            'w-44 h-56',
            // Kip hero has real alpha — let it breathe without a card frame
            character.id === 'kip'
              ? 'bg-transparent'
              : 'rounded-2xl overflow-hidden border-2 shadow-[0_20px_50px_rgba(0,0,0,0.7)]',
            'transition-transform duration-200 hover:scale-105 active:scale-95',
            character.fullCard ? 'cursor-pointer' : 'pointer-events-none',
          ].join(' ')}
          style={character.id !== 'kip' ? { borderColor: character.color } : undefined}
        >
          <RunnerPicture
            src={popoutSrc}
            alt={character.name}
            pictureClassName="block h-full w-full"
            className={
              character.id === 'kip'
                // Kip transparent PNG — contain so the character shows fully
                ? 'w-full h-full object-contain object-bottom drop-shadow-[0_24px_32px_rgba(226,0,116,0.55)]'
                : 'w-full h-full object-cover object-top'
            }
            loading="lazy"
          />
          {character.fullCard && (
            <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-t from-black/70 to-transparent">
              <span className="text-[8px] font-black uppercase tracking-[0.18em] text-white">View Card</span>
            </div>
          )}
        </button>

        {/* Stat card body */}
        <div
          className="relative mt-32 bg-[#0D0D14] border-2 rounded-3xl p-6 pt-6 shadow-2xl"
          style={{ borderColor: character.color }}
        >
          {/* Glow behind the card top */}
          <div
            className="absolute -top-px inset-x-0 h-px rounded-t-3xl"
            style={{ background: `linear-gradient(90deg, transparent, ${character.color}88, transparent)` }}
          />

          <div className="mb-4">
            <h3 className="text-white text-2xl font-black uppercase italic leading-none tracking-tight">
              {character.name}
            </h3>
            <p className="text-xs uppercase font-bold mt-1" style={{ color: character.color }}>
              {character.role}
            </p>
            <p className="text-gray-500 text-[10px] mt-1.5 uppercase tracking-wide leading-tight">
              {character.trait}
            </p>
          </div>

          {/* Stat bars */}
          <div className="space-y-2.5 mb-6">
            {Object.entries(character.stats).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-[9px] uppercase font-bold text-gray-500 w-14">{key}</span>
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${((value as number) / 10) * 100}%`,
                      background: `linear-gradient(90deg, ${character.color}cc, ${character.color})`,
                    }}
                  />
                </div>
                <span className="text-[9px] font-black text-white w-4 text-right">{value}</span>
              </div>
            ))}
          </div>

          {/* Ability grid */}
          <div className="grid grid-cols-3 gap-2 mb-1">
            {character.abilities.map((ability) => (
              <div
                key={ability.slot}
                className="relative flex flex-col items-center gap-1.5 cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTooltip(activeTooltip === ability.label ? null : ability.label);
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center border transition-colors group-hover:border-white/40"
                  style={{ background: `${character.color}18`, borderColor: `${character.color}44` }}
                >
                  {isSvgAbility(ability.path) ? (
                    <img
                      src={ability.path}
                      alt={ability.label}
                      className="w-8 h-8 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <RunnerPicture
                      src={ability.path}
                      alt={ability.label}
                      pictureClassName="block h-8 w-8"
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  )}
                </div>
                <span className="text-[8px] text-gray-400 uppercase font-bold text-center leading-none px-0.5">
                  {ability.label}
                </span>

                {/* Tooltip */}
                {activeTooltip === ability.label && (
                  <div className="absolute bottom-full mb-2 w-32 bg-white text-black p-2 rounded-xl text-[9px] font-bold z-50 shadow-xl text-center">
                    {ability.description}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* View full card CTA */}
          {character.fullCard && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="mt-4 flex w-full items-center justify-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: character.color }}
            >
              View Full Card
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Full card overlay portal */}
      {character.fullCard &&
        createPortal(
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                key="fullcard-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={() => setIsExpanded(false)}
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
              >
                <motion.div
                  key="fullcard-card"
                  initial={{ scale: 0.82, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.88, opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative max-h-[88vh] max-w-[88vw]"
                >
                  <img
                    src={character.fullCard}
                    alt={`${character.name} collectable card`}
                    className="h-full max-h-[88vh] w-auto object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.7)]"
                    style={{ filter: `drop-shadow(0 0 24px ${character.color}55)` }}
                  />
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    aria-label="Close full card"
                    className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/90 text-white shadow-xl hover:bg-black transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};

export default CharacterCard;
