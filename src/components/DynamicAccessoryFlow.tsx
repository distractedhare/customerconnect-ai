import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, X,
  CheckCircle2, Plus, MessageSquare,
} from 'lucide-react';
import {
  AccessoryRecommendation, SalesContext, CatalogItem,
  PivotReason, OfferSessionState, OfferCardModel,
} from '../types';
import { buildOfferCards, EMPTY_SESSION } from '../services/offerEngine';
import { applyPivot } from '../services/pivotEngine';
import { PIVOT_CHIP_LABELS, getQualifyingLabel } from '../services/copyEngine';
import { countQualifyingItems } from '../services/promoEngine';
import { CATALOG } from '../data/accessoryCatalog';

interface DynamicAccessoryFlowProps {
  context?: SalesContext;
  recommendations?: AccessoryRecommendation[];
}

export default function DynamicAccessoryFlow({
  context,
  recommendations = [],
}: DynamicAccessoryFlowProps) {
  const [session, setSession] = useState<OfferSessionState>(EMPTY_SESSION);
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const offerCards = useMemo(() => {
    if (!context) return null;
    return buildOfferCards(context, session);
  }, [context, session]);

  const selectedItems = useMemo(
    () => CATALOG.filter(c => selectedIds.includes(c.id)),
    [selectedIds],
  );

  const qualifyingLabel = getQualifyingLabel(countQualifyingItems(selectedItems));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const handlePivot = (cardId: string, item: CatalogItem, reason: PivotReason) => {
    setSession(prev => applyPivot(prev, cardId, item.id, reason, item.replacementGroup));
    setFlippedId(null);
  };

  // ── New engine mode ──────────────────────────────────────────────────────────
  if (context && offerCards) {
    if (offerCards.length === 0) {
      return (
        <div className="py-8 text-center text-sm text-t-muted">
          No recommendations for this context.
        </div>
      );
    }

    const contextChips = offerCards[0]?.contextTags ?? [];

    return (
      <div className="space-y-4">
        {/* Context chips */}
        {contextChips.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1">
            {contextChips.map(chip => (
              <span
                key={chip}
                className="text-[9px] font-black uppercase tracking-widest text-t-magenta bg-t-magenta/10 px-2.5 py-1 rounded-full border border-t-magenta/20"
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        {/* All screen sizes — single col in portrait, 2-col grid in landscape/desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {offerCards.map(card => (
            <div key={card.id} className="space-y-3">
              <OfferFlipCard
                card={card}
                flippedId={flippedId}
                selectedIds={selectedIds}
                onFlip={setFlippedId}
                onSelect={toggleSelect}
              />
              <PivotChipsRow card={card} onPivot={handlePivot} />
            </div>
          ))}
        </div>

        {/* Selected Setup sticky bar */}
        <AnimatePresence>
          {selectedItems.length > 0 && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="sticky bottom-4 z-10"
            >
              <div className="bg-t-dark-gray text-white rounded-3xl p-4 shadow-2xl border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-t-magenta flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-t-magenta">
                        Selected Setup
                      </p>
                      <p className="text-[10px] font-medium text-white/60">
                        {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {qualifyingLabel && (
                    <span className="text-[9px] font-black text-success-accent uppercase tracking-widest text-right max-w-[140px]">
                      {qualifyingLabel}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg"
                    >
                      <span className="text-[10px] font-bold text-white/80">{item.name}</span>
                      <button
                        onClick={() => toggleSelect(item.id)}
                        className="text-white/40 hover:text-t-magenta transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 rounded-xl bg-t-magenta text-[11px] font-black uppercase tracking-widest hover:bg-t-magenta/90 transition-colors">
                    Add to Quote
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-[11px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          .perspective-1000 { perspective: 1000px; }
          .backface-hidden { backface-visibility: hidden; }
        `}</style>
      </div>
    );
  }

  // ── Legacy mode (AccessoryRecommendation[]) ──────────────────────────────────
  return <LegacyAccessoryFlow recommendations={recommendations} />;
}

// ── OfferFlipCard ────────────────────────────────────────────────────────────

interface OfferFlipCardProps {
  card: OfferCardModel;
  flippedId: string | null;
  selectedIds: string[];
  onFlip: (id: string | null) => void;
  onSelect: (id: string) => void;
}

function OfferFlipCard({
  card, flippedId, selectedIds, onFlip, onSelect,
}: OfferFlipCardProps) {
  const isFlipped = flippedId === card.id;
  const primaryItem = card.frontItems[0] as CatalogItem | undefined;
  const backupItem = card.backItems[0] as CatalogItem | undefined;

  return (
    <div className="relative h-[260px] perspective-1000">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 22 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full h-full cursor-pointer"
        onClick={() => onFlip(isFlipped ? null : card.id)}
      >
        {/* FRONT — Best move */}
        <div className="absolute inset-0 backface-hidden rounded-2xl glass-card p-4 flex flex-col border border-t-light-gray">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-t-magenta bg-t-magenta/10 px-2 py-0.5 rounded-full">
              {card.frontTitle}
            </span>
            {primaryItem && selectedIds.includes(primaryItem.id) && (
              <CheckCircle2 className="w-4 h-4 text-t-magenta" />
            )}
          </div>

          <div className="flex-1 min-h-0">
            {primaryItem && (
              <>
                <h4 className="text-sm font-black text-t-dark-gray leading-tight mb-0.5">
                  {primaryItem.name}
                </h4>
                {primaryItem.priceLabel && (
                  <p className="text-[10px] font-medium text-t-dark-gray/50 mb-2">
                    {primaryItem.priceLabel}
                  </p>
                )}
                <p className="text-[11px] font-medium text-t-dark-gray/70 leading-relaxed line-clamp-3">
                  {card.frontPitch}
                </p>
              </>
            )}
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-t-light-gray/50">
            {primaryItem && (
              <button
                onClick={e => { e.stopPropagation(); onSelect(primaryItem.id); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedIds.includes(primaryItem.id)
                    ? 'bg-t-magenta text-white'
                    : 'bg-t-light-gray/20 text-t-dark-gray hover:bg-t-magenta/10'
                }`}
              >
                {selectedIds.includes(primaryItem.id)
                  ? <><CheckCircle2 className="w-3 h-3" /> Added</>
                  : <><Plus className="w-3 h-3" /> Add</>
                }
              </button>
            )}
            <span className="text-[9px] font-medium text-t-dark-gray/40 ml-auto">
              Tap to flip →
            </span>
          </div>
        </div>

        {/* BACK — Backup option */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl bg-t-dark-gray p-4 flex flex-col border border-t-magenta/30"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-t-magenta bg-t-magenta/20 px-2 py-0.5 rounded-full">
              {card.backTitle}
            </span>
            {backupItem && selectedIds.includes(backupItem.id) && (
              <CheckCircle2 className="w-4 h-4 text-t-magenta" />
            )}
          </div>

          <div className="flex-1 min-h-0">
            {backupItem && (
              <>
                <h4 className="text-sm font-black text-white leading-tight mb-0.5">
                  {backupItem.name}
                </h4>
                {backupItem.priceLabel && (
                  <p className="text-[10px] font-medium text-white/40 mb-2">
                    {backupItem.priceLabel}
                  </p>
                )}
              </>
            )}
            <p className="text-[11px] font-medium text-white/80 leading-relaxed line-clamp-3">
              {card.backPitch}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
            {backupItem && (
              <button
                onClick={e => { e.stopPropagation(); onSelect(backupItem.id); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedIds.includes(backupItem.id)
                    ? 'bg-t-magenta text-white'
                    : 'bg-white/10 text-white/70 hover:bg-t-magenta/30'
                }`}
              >
                {selectedIds.includes(backupItem.id)
                  ? <><CheckCircle2 className="w-3 h-3" /> Added</>
                  : <><Plus className="w-3 h-3" /> Add</>
                }
              </button>
            )}
            <span className="text-[9px] font-medium text-white/30 ml-auto">← Tap to return</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── PivotChipsRow ────────────────────────────────────────────────────────────

interface PivotChipsRowProps {
  card: OfferCardModel;
  onPivot: (cardId: string, item: CatalogItem, reason: PivotReason) => void;
}

function PivotChipsRow({ card, onPivot }: PivotChipsRowProps) {
  const primaryItem = card.frontItems[0] as CatalogItem | undefined;
  if (!primaryItem || card.quickPivots.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-1">
      {card.quickPivots.map(reason => (
        <button
          key={reason}
          onClick={() => onPivot(card.id, primaryItem, reason)}
          className="text-[10px] font-bold text-t-dark-gray/70 bg-t-light-gray/20 border border-t-light-gray px-2.5 py-1 rounded-full hover:border-t-magenta/40 hover:text-t-magenta hover:bg-t-magenta/5 transition-all active:scale-95"
        >
          {PIVOT_CHIP_LABELS[reason]}
        </button>
      ))}
    </div>
  );
}

// ── LegacyAccessoryFlow ──────────────────────────────────────────────────────

function LegacyAccessoryFlow({ recommendations }: { recommendations: AccessoryRecommendation[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [flippedId, setFlippedId] = useState<string | null>(null);

  const toggleSelect = (name: string) => {
    setSelectedIds(prev =>
      prev.includes(name) ? prev.filter(id => id !== name) : [...prev, name],
    );
  };

  const cartItems = recommendations.filter(r => selectedIds.includes(r.name));
  const qualifyingCount = cartItems.filter(item => item.bundleEligible).length;

  const promoLabel =
    qualifyingCount >= 3 ? 'Qualifying deal — 25% off' :
    qualifyingCount === 2 ? '15% off — add 1 more qualifying item' :
    qualifyingCount === 1 ? 'Add 2 more qualifying items' :
    'Add 3 qualifying items to save';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-lg font-black tracking-tight text-t-dark-gray flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-t-magenta" />
            Accessory Playbook
          </h3>
          <p className="text-[10px] font-medium text-t-dark-gray/60 uppercase tracking-widest">
            Tap to flip for the pitch
          </p>
        </div>
        {qualifyingCount > 0 && (
          <div className="flex items-center gap-2 bg-t-magenta/10 px-3 py-1.5 rounded-full">
            <span className="text-[10px] font-black text-t-magenta uppercase tracking-widest">
              {promoLabel}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recommendations.map(rec => (
          <LegacyFlipCard
            key={rec.name}
            rec={rec}
            isFlipped={flippedId === rec.name}
            isSelected={selectedIds.includes(rec.name)}
            onFlip={() => setFlippedId(flippedId === rec.name ? null : rec.name)}
            onSelect={() => toggleSelect(rec.name)}
          />
        ))}
      </div>

      <AnimatePresence>
        {cartItems.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="sticky bottom-4 z-10"
          >
            <div className="bg-t-dark-gray text-white rounded-3xl p-5 shadow-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-t-magenta flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-t-magenta">
                      Selected Setup
                    </p>
                    <p className="text-[10px] font-medium text-white/60">
                      {cartItems.length} items
                    </p>
                  </div>
                </div>
                <p className="text-xs font-black text-success-accent uppercase tracking-widest">
                  {qualifyingCount >= 3 ? '25% Off' : qualifyingCount >= 2 ? '15% Off' : ''}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {cartItems.map(item => (
                  <div
                    key={item.name}
                    className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg"
                  >
                    <span className="text-[10px] font-bold text-white/80">{item.name}</span>
                    <button
                      onClick={() => toggleSelect(item.name)}
                      className="text-white/40 hover:text-t-magenta transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-3 rounded-xl bg-t-magenta text-xs font-black uppercase tracking-widest hover:bg-t-magenta/90 transition-colors">
                  Add to Quote
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-4 py-3 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </div>
  );
}

// ── LegacyFlipCard ───────────────────────────────────────────────────────────

function LegacyFlipCard({
  rec, isFlipped, isSelected, onFlip, onSelect,
}: {
  rec: AccessoryRecommendation;
  isFlipped: boolean;
  isSelected: boolean;
  onFlip: () => void;
  onSelect: () => void;
}) {
  return (
    <div className="relative h-[180px] perspective-1000">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full h-full cursor-pointer"
        onClick={onFlip}
      >
        {/* FRONT */}
        <div
          className={`absolute inset-0 backface-hidden rounded-2xl glass-card p-4 flex flex-col justify-between border-2 transition-colors ${
            isSelected ? 'border-t-magenta bg-t-magenta/5' : 'border-transparent'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-t-muted uppercase tracking-widest">
                {rec.bundleEligible ? 'Qualifying item' : 'Add-on'}
              </span>
              {isSelected && <CheckCircle2 className="w-4 h-4 text-t-magenta" />}
            </div>
            <h4 className="text-sm font-black text-t-dark-gray leading-tight">{rec.name}</h4>
            <p className="text-[10px] font-medium text-t-dark-gray/60 mt-1">{rec.priceRange}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {rec.brands.slice(0, 3).map(b => (
                <div
                  key={b}
                  className="w-6 h-6 rounded-full bg-white border border-t-light-gray flex items-center justify-center text-[8px] font-black text-t-dark-gray shadow-sm"
                >
                  {b[0]}
                </div>
              ))}
            </div>
            <button
              onClick={e => { e.stopPropagation(); onSelect(); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-t-magenta text-white'
                  : 'bg-t-light-gray/50 text-t-dark-gray hover:bg-t-magenta/20'
              }`}
            >
              {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl bg-t-dark-gray p-4 flex flex-col justify-between border-2 border-t-magenta/30"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div>
            <p className="text-[9px] font-black text-t-magenta uppercase mb-2 tracking-widest flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3" /> The Pitch
            </p>
            <p className="text-[11px] font-medium text-white/90 leading-relaxed">
              "{rec.why.length > 120 ? rec.why.substring(0, 120) + '...' : rec.why}"
            </p>
          </div>
          <div className="flex items-center pt-2 border-t border-white/10">
            <span className="text-[9px] font-black text-t-magenta uppercase tracking-widest">
              Tap to return
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
