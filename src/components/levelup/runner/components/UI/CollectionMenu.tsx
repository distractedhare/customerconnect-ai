import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { PLAYABLE_RUNNERS, type RunnerCharacter } from '../../content';
import { useStore } from '../../store';
import type { CharacterId } from '../../types';
import CharacterCard from './CharacterCard';
import { KipAvatar } from '../../../../kip';

const KIP_CHARACTER: RunnerCharacter = {
  id: 'kip' as CharacterId,
  name: 'Kip',
  role: 'AI Operator',
  trait: 'Signal Support',
  color: '#E20074',
  assets: {
    cutout: '/kip/hero.png',
    hud: '/kip/mobile.png',
    avatar: '/kip/avatar.png',
  },
  stats: {
    power: 5,
    speed: 5,
    defense: 5,
    utility: 10,
  },
  abilities: [
    { slot: 1, label: 'Signal Check', description: 'Scans safe lanes.', path: '/kip/abilities/smash.png' },
    { slot: 2, label: 'Bonus Round', description: 'Triggers bonuses.', path: '/kip/abilities/blast.png' },
    { slot: 3, label: 'KIP Challenge', description: 'Risk/reward play.', path: '/kip/abilities/core.png' },
  ],
};

interface CollectionMenuProps {
  characters?: RunnerCharacter[];
  selectedRunnerId?: CharacterId | null;
  onDeploy?: (id: CharacterId) => void;
  onBack?: () => void;
}

const toCharacterId = (id: string): CharacterId => id as CharacterId;

export function CollectionMenu({
  characters = [KIP_CHARACTER, ...PLAYABLE_RUNNERS],
  selectedRunnerId,
  onDeploy,
  onBack,
}: CollectionMenuProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<string, HTMLDivElement>());
  const initialId = characters.find((character) => character.id === selectedRunnerId)?.id ?? characters[0]?.id ?? 'tcl';
  const [activeCardId, setActiveCardId] = useState<CharacterId>(toCharacterId(initialId));

  const activeIndex = useMemo(
    () => Math.max(0, characters.findIndex((character) => character.id === activeCardId)),
    [activeCardId, characters],
  );

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || cardRefs.current.size === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const rootRect = root.getBoundingClientRect();
        const viewportCenter = rootRect.left + rootRect.width / 2;
        const centered = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => {
            const cardId = entry.target.getAttribute('data-card-id');
            const rect = entry.boundingClientRect;
            const cardCenter = rect.left + rect.width / 2;
            return {
              cardId,
              distance: Math.abs(cardCenter - viewportCenter),
              ratio: entry.intersectionRatio,
            };
          })
          .filter((entry): entry is { cardId: string; distance: number; ratio: number } => Boolean(entry.cardId))
          .sort((a, b) => a.distance - b.distance || b.ratio - a.ratio)[0];

        if (centered?.cardId) setActiveCardId(toCharacterId(centered.cardId));
      },
      {
        root,
        rootMargin: '0px -35% 0px -35%',
        threshold: [0.25, 0.5, 0.75, 0.95],
      },
    );

    cardRefs.current.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [characters]);

  useEffect(() => {
    if (!selectedRunnerId) return;
    if (characters.some((character) => character.id === selectedRunnerId)) {
      setActiveCardId(selectedRunnerId);
      window.requestAnimationFrame(() => {
        cardRefs.current.get(selectedRunnerId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      });
    }
  }, [characters, selectedRunnerId]);

  const moveBy = (direction: -1 | 1) => {
    const nextIndex = Math.min(characters.length - 1, Math.max(0, activeIndex + direction));
    const nextCharacter = characters[nextIndex];
    if (!nextCharacter) return;
    setActiveCardId(toCharacterId(nextCharacter.id));
    cardRefs.current.get(nextCharacter.id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  };

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-[#0F0F14] py-6 text-white sm:rounded-[1.85rem] sm:border sm:border-white/10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(226,0,116,0.18),transparent_42%)]" />
      <div className="relative z-10 mx-auto flex max-w-5xl items-start justify-between gap-4 px-5 sm:px-8">
        <div className="min-w-0 text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#ff8cc6]">Runner collection</p>
          <div className="flex items-center gap-3">
            <h2 className="mt-2 text-3xl font-black uppercase leading-none tracking-wide text-white sm:text-4xl">Choose your signal</h2>
            <div className="mt-1">
              <KipAvatar size="small" state="idle" showGlow />
            </div>
          </div>
        </div>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to runner landing"
            className="focus-ring inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white transition-colors hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="relative z-10 mt-8">
        <button
          type="button"
          onClick={() => moveBy(-1)}
          aria-label="Previous runner"
          className="focus-ring absolute left-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/62 text-white shadow-[0_18px_42px_rgba(0,0,0,0.42)] backdrop-blur-md transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-30 [@media(pointer:fine)]:flex"
          disabled={activeIndex <= 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => moveBy(1)}
          aria-label="Next runner"
          className="focus-ring absolute right-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/62 text-white shadow-[0_18px_42px_rgba(0,0,0,0.42)] backdrop-blur-md transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-30 [@media(pointer:fine)]:flex"
          disabled={activeIndex >= characters.length - 1}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-8 pb-36 pt-28 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollPaddingInline: '2rem' }}
        >
          {characters.map((character) => (
            <div
              key={character.id}
              ref={(node) => {
                if (node) cardRefs.current.set(character.id, node);
                else cardRefs.current.delete(character.id);
              }}
              data-card-id={character.id}
            >
              <CharacterCard
                character={character}
                isActive={activeCardId === character.id}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[130] border-t border-white/10 bg-[#0F0F14]/94 px-4 py-4 shadow-[0_-20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <button
          onClick={() => {
            useStore.getState().setRunner(activeCardId);
            onDeploy?.(activeCardId);
          }}
          className="mx-auto flex min-h-[56px] w-full max-w-xl items-center justify-center rounded-2xl bg-[#E20074] px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_20px_45px_rgba(226,0,116,0.35)] transition-transform hover:scale-[1.01] active:scale-95"
        >
          LOCK IN & DEPLOY
        </button>
      </div>
    </section>
  );
}

export default CollectionMenu;
