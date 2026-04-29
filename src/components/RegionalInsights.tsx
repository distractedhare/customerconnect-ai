import { useMemo } from 'react';
import { MapPin, Shield, Wifi, Zap, ChevronRight, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { REGIONAL_DATA, getStateTalkingPoints, RegionKey } from '../data/regionalData';

interface RegionalInsightsProps {
  region: string;
  state?: string;
  currentCarrier?: string;
}

/** Live regional recommendations that update as the user taps through the map */
export default function RegionalInsights({ region, state, currentCarrier }: RegionalInsightsProps) {
  const data = useMemo(() => {
    if (region === 'Not Specified') return null;
    return REGIONAL_DATA[region as RegionKey] ?? null;
  }, [region]);

  const stateTip = useMemo(() => {
    if (!state || region === 'Not Specified') return null;
    return getStateTalkingPoints(region as RegionKey, state);
  }, [region, state]);

  // Find carrier-specific counter if customer's carrier is a threat in this region
  const carrierCounter = useMemo(() => {
    if (!data || !currentCarrier || currentCarrier === 'Not Specified' || currentCarrier === 'Other') return null;
    // Normalize carrier name for matching (e.g. "Prepaid (Mint, Boost, etc.)" won't match)
    return data.competitorThreats.find(t =>
      currentCarrier.toLowerCase().includes(t.carrier.toLowerCase())
    ) ?? null;
  }, [data, currentCarrier]);

  if (!data) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${region}-${state ?? ''}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="space-y-3"
      >
        {/* Network edge — the headline */}
        <div className="glass-stage-quiet rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-t-magenta text-white">
              <Zap className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-t-magenta mb-1">
                Network Edge — {region}{state ? ` > ${state}` : ''}
              </p>
              <p className="text-[11px] font-bold text-t-dark-gray leading-relaxed">
                {data.networkEdge}
              </p>
            </div>
          </div>
        </div>

        {/* State-specific tip */}
        {stateTip && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="glass-feature rounded-xl px-4 py-3"
          >
            <div className="flex items-start gap-2">
              <MapPin className="w-3 h-3 text-t-magenta mt-0.5 shrink-0" />
              <p className="text-[11px] font-bold text-t-dark-gray leading-relaxed">
                <span className="text-t-magenta font-black">{state}:</span> {stateTip}
              </p>
            </div>
          </motion.div>
        )}

        {/* Carrier-specific counter (if their carrier is a local threat) */}
        {carrierCounter && (
          <div className="glass-stage-quiet rounded-2xl p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-t-magenta mb-2 flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              vs {carrierCounter.carrier} in {region}
            </p>
            <p className="text-[10px] font-medium text-t-dark-gray mb-1.5">{carrierCounter.threat}</p>
            <div className="glass-reading flex items-start gap-2 rounded-lg px-3 py-2">
              <ChevronRight className="w-3 h-3 text-t-magenta mt-0.5 shrink-0" />
              <p className="text-[11px] font-bold text-t-dark-gray leading-snug">{carrierCounter.counter}</p>
            </div>
          </div>
        )}

        {/* Competitor threats (non-carrier-specific) */}
        {data.competitorThreats
          .filter(t => !carrierCounter || t.carrier !== carrierCounter.carrier)
          .slice(0, 2)
          .map((threat, i) => (
            <div key={i} className="glass-reading rounded-xl p-3 shadow-sm">
              <div className="flex items-start gap-2">
                <Shield className="w-3 h-3 text-t-muted mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-wider text-t-dark-gray mb-0.5">
                    vs {threat.carrier}
                  </p>
                  <p className="text-[10px] font-medium text-t-dark-gray mb-1">{threat.threat}</p>
                  <p className="text-[11px] font-bold text-t-dark-gray leading-snug">{threat.counter}</p>
                </div>
              </div>
            </div>
          ))}

        {/* Local angles */}
        <div className="glass-stage-quiet rounded-2xl p-4 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-t-dark-gray mb-2.5 flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-t-magenta" />
            Local Angles
          </p>
          <div className="space-y-2">
            {data.localAngles.map((angle, i) => (
              <div key={i} className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 text-t-magenta mt-0.5 shrink-0" />
                <p className="text-[11px] font-bold text-t-dark-gray leading-snug">{angle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Home Internet note */}
        <div className="glass-feature rounded-xl px-4 py-3 flex items-center gap-3">
          <Home className="w-4 h-4 text-white shrink-0" />
          <p className="text-[11px] font-bold text-white leading-relaxed">{data.homeInternetNote}</p>
        </div>

        {/* Quick stat */}
        <div className="text-center py-2">
          <p className="text-[10px] font-black text-t-magenta uppercase tracking-wider">{data.quickStat}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
