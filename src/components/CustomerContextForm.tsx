import { useState } from 'react';
import { User, CheckCircle2, ChevronDown, MapPin, Smartphone, Users, WifiOff, Sparkles, Wifi } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { SalesContext } from '../types';
import USMap from './USMap';

interface CustomerContextFormProps {
  context: SalesContext;
  setContext: React.Dispatch<React.SetStateAction<SalesContext>>;
  inline?: boolean;
  showAge?: boolean;
  showLocation?: boolean;
  showCarrier?: boolean;
  showSharperRead?: boolean;
  defaultLocationOpen?: boolean;
  locationLabel?: string;
  locationHint?: string;
  locationPanelId?: string;
}

export default function CustomerContextForm({
  context,
  setContext,
  inline,
  showAge = true,
  showLocation = true,
  showCarrier = true,
  showSharperRead = true,
  defaultLocationOpen = false,
  locationLabel = 'Location',
  locationHint,
  locationPanelId,
}: CustomerContextFormProps) {
  const [locationOpen, setLocationOpen] = useState(defaultLocationOpen);
  const [sharperReadOpen, setSharperReadOpen] = useState(true);
  const zipInputId = inline ? 'customer-zip-inline' : 'customer-zip';
  const resolvedLocationPanelId = locationPanelId || (inline ? 'location-panel-inline' : 'location-panel');

  const locationSummary = context.region !== 'Not Specified'
    ? `${context.region}${context.state ? ` — ${context.state}` : ''}${context.zipCode ? ` (${context.zipCode})` : ''}`
    : context.zipCode
      ? `ZIP: ${context.zipCode}`
      : null;

  const content = (
    <div className="space-y-6">

      {showAge && (
        <fieldset className="space-y-2">
          <legend className="text-xs font-bold text-t-dark-gray">
            Age range
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {(['18-24', '25-34', '35-54', '55+', 'Not Specified'] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setContext(prev => ({ ...prev, age: a }))}
                aria-pressed={context.age === a}
                className={`focus-ring min-h-[44px] py-2.5 px-2.5 text-[10px] font-black rounded-lg border-2 uppercase transition-all ${
                  context.age === a
                    ? 'bg-t-magenta text-white border-t-magenta shadow-md shadow-t-magenta/10'
                    : 'bg-surface text-t-dark-gray border-t-light-gray hover:border-t-magenta/30'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {showLocation && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setLocationOpen(!locationOpen)}
            aria-expanded={locationOpen}
            aria-controls={resolvedLocationPanelId}
            className="focus-ring w-full flex items-center justify-between rounded-lg"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-t-magenta" />
              <span className="text-xs font-bold text-t-dark-gray">
                {locationLabel}
              </span>
              {locationSummary && (
                <span className="text-[9px] font-bold text-t-magenta bg-t-magenta/10 px-2 py-0.5 rounded-full">
                  {locationSummary}
                </span>
              )}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-t-muted transition-transform ${locationOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {locationOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
                id={resolvedLocationPanelId}
              >
                <div className="space-y-3 pt-1">
                  {locationHint && (
                    <p className="text-[10px] font-medium leading-relaxed text-t-dark-gray">
                      {locationHint}
                    </p>
                  )}
                  {/* Region map */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-t-dark-gray uppercase tracking-wider">Region</span>
                      {context.region !== 'Not Specified' && (
                        <button
                          type="button"
                          onClick={() => setContext(prev => ({ ...prev, region: 'Not Specified', state: undefined }))}
                          className="focus-ring text-[9px] font-black uppercase text-t-dark-gray hover:text-t-magenta transition-colors rounded"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <USMap
                      selectedRegion={context.region}
                      onSelectRegion={(r) => setContext(prev => ({ ...prev, region: r as SalesContext['region'], state: undefined }))}
                      selectedState={context.state}
                      onSelectState={(s) => setContext(prev => ({ ...prev, state: s }))}
                    />
                  </div>

                  {/* ZIP Code */}
                  <div>
                    <label htmlFor={zipInputId} className="text-[10px] font-bold text-t-dark-gray uppercase tracking-wider mb-1 block">
                      Zip code <span className="font-medium normal-case text-t-muted">(optional)</span>
                    </label>
                    <input
                      id={zipInputId}
                      type="text"
                      placeholder="e.g. 90210"
                      value={context.zipCode || ''}
                      onChange={(e) => setContext(prev => ({ ...prev, zipCode: e.target.value }))}
                      inputMode="numeric"
                      className="focus-ring w-full bg-surface border-2 border-t-light-gray rounded-lg py-2 px-3 text-xs font-bold text-foreground transition-all placeholder:text-t-dark-gray/30"
                      maxLength={5}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {showCarrier && (
        <fieldset className="space-y-2">
          <legend className="text-xs font-bold text-t-dark-gray">
            Their current carrier
          </legend>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {(['AT&T', 'Verizon', 'Spectrum', 'Xfinity', 'US Cellular', 'Prepaid (Mint, Boost, etc.)', 'Other', 'Not Specified'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setContext(prev => ({ ...prev, currentCarrier: c }))}
                aria-pressed={context.currentCarrier === c}
                className={`focus-ring min-h-[44px] py-2.5 px-3 text-left text-[10px] font-black rounded-lg border-2 uppercase transition-all flex items-center justify-between ${
                  context.currentCarrier === c
                    ? 'bg-t-magenta text-white border-t-magenta shadow-lg shadow-t-magenta/20'
                    : 'bg-surface text-t-dark-gray border-t-light-gray hover:border-t-magenta/50'
                }`}
              >
                <span className="leading-tight">{c}</span>
                {context.currentCarrier === c && <CheckCircle2 className="w-3 h-3 shrink-0 ml-1" />}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {showSharperRead && (
        <div className="space-y-4 pt-2 border-t border-t-light-gray/50">
          <button
            type="button"
            onClick={() => setSharperReadOpen(!sharperReadOpen)}
            className="flex items-center justify-between w-full group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-t-magenta" />
              <h3 className="text-xs font-black uppercase tracking-widest text-t-magenta">Sharper Read</h3>
            </div>
            <ChevronDown className={`w-4 h-4 text-t-muted transition-transform ${sharperReadOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {sharperReadOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-t-dark-gray uppercase tracking-wider flex items-center gap-1.5">
                      <Smartphone className="w-3 h-3" /> Total Lines
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 4"
                      value={context.totalLines || ''}
                      onChange={(e) => setContext(prev => ({ ...prev, totalLines: parseInt(e.target.value) || undefined }))}
                      className="focus-ring w-full bg-surface border-2 border-t-light-gray rounded-lg py-2.5 px-3 text-xs font-bold text-foreground transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-t-dark-gray uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3 h-3" /> Family Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 5"
                      value={context.familyCount || ''}
                      onChange={(e) => setContext(prev => ({ ...prev, familyCount: parseInt(e.target.value) || undefined }))}
                      className="focus-ring w-full bg-surface border-2 border-t-light-gray rounded-lg py-2.5 px-3 text-xs font-bold text-foreground transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-t-dark-gray uppercase tracking-wider">Current Platform</label>
                    <select
                      value={context.currentPlatform || 'Not Specified'}
                      onChange={(e) => setContext(prev => ({ ...prev, currentPlatform: e.target.value as any }))}
                      className="focus-ring w-full bg-surface border-2 border-t-light-gray rounded-lg py-2.5 px-3 text-xs font-bold text-foreground transition-all"
                    >
                      <option value="Not Specified">Not Specified</option>
                      <option value="iOS">iOS (iPhone)</option>
                      <option value="Android">Android</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-t-dark-gray uppercase tracking-wider">Desired Platform</label>
                    <select
                      value={context.desiredPlatform || 'Not Specified'}
                      onChange={(e) => setContext(prev => ({ ...prev, desiredPlatform: e.target.value as any }))}
                      className="focus-ring w-full bg-surface border-2 border-t-light-gray rounded-lg py-2.5 px-3 text-xs font-bold text-foreground transition-all"
                    >
                      <option value="Not Specified">Not Specified</option>
                      <option value="iOS">iOS (iPhone)</option>
                      <option value="Android">Android</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setContext(prev => ({ ...prev, hintAvailable: prev.hintAvailable === undefined ? true : prev.hintAvailable === true ? false : undefined }))}
                    className={`focus-ring w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                      context.hintAvailable === false
                        ? 'bg-warning-surface border-warning-border text-warning-foreground'
                        : context.hintAvailable === true
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-surface border-t-light-gray text-t-dark-gray'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {context.hintAvailable === false ? <WifiOff className="w-4 h-4" /> : context.hintAvailable === true ? <Wifi className="w-4 h-4" /> : <Wifi className="w-4 h-4 opacity-40" />}
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        HINT Availability
                      </span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      context.hintAvailable === false ? 'bg-warning-accent text-white' : context.hintAvailable === true ? 'bg-emerald-500 text-white' : 'bg-t-light-gray text-t-dark-gray'
                    }`}>
                      {context.hintAvailable === false ? 'Unavailable' : context.hintAvailable === true ? 'Available' : 'Not Checked'}
                    </span>
                  </button>
                  {context.hintAvailable === false && (
                    <p className="mt-2 text-[10px] font-medium text-warning-foreground/80 px-1">
                      * Open spots full. Use waiting list & pivot to BTS/IOT or early phone port.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );

  if (inline) return content;

  return (
    <section className="rounded-3xl glass-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
          <User className="w-5 h-5 text-t-magenta" /> Customer Context
        </h2>
      </div>
      {content}
    </section>
  );
}
