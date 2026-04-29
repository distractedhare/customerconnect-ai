import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Calculator, CheckCircle2, XCircle, Info, TrendingDown, Gift, Zap } from 'lucide-react';
import { POSTPAID_PLANS } from '../data/plans';

interface PlanMathVisualizerProps {
  lineCount?: number;
}

export default function PlanMathVisualizer({ lineCount = 3 }: PlanMathVisualizerProps) {
  const [lines, setLines] = useState(lineCount);

  const beyondPlan = POSTPAID_PLANS.find(p => p.name === 'Experience Beyond')!;
  const essentialsPlan = POSTPAID_PLANS.find(p => p.name === 'Essentials')!;

  const beyondPricing = beyondPlan.pricing.find(p => p.lines === lines) || beyondPlan.pricing[beyondPlan.pricing.length - 1];
  const essentialsPricing = essentialsPlan.pricing.find(p => p.lines === lines) || essentialsPlan.pricing[essentialsPlan.pricing.length - 1];

  const perksValue = useMemo(() => {
    // Hardcoded values for perks
    return {
      netflix: 7.99,
      hulu: 9.99,
      appleTV: 9.99,
      aaa: 5.00, // Roughly $60/yr
      scamShield: 4.00,
      hotspotValue: 25.00, // Estimated value of 250GB vs 3G
    };
  }, []);

  const totalPerksValue = perksValue.netflix + perksValue.hulu + perksValue.appleTV + perksValue.aaa + perksValue.scamShield;
  const effectiveBeyondPrice = beyondPricing.monthlyTotal - totalPerksValue;

  return (
    <div className="rounded-3xl glass-card p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black tracking-tight text-t-dark-gray flex items-center gap-2">
            <Calculator className="w-5 h-5 text-t-magenta" />
            Plan Math Visualizer
          </h3>
          <p className="text-[10px] font-medium text-t-dark-gray/60 uppercase tracking-widest">
            Uncover the True Value
          </p>
        </div>
        <div className="flex bg-t-light-gray/20 rounded-xl p-1 w-full sm:w-auto overflow-x-auto scrollbar-hide">
          {[1, 2, 3, 4].map(num => (
            <button
              key={num}
              onClick={() => setLines(num)}
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                lines === num ? 'bg-white text-t-magenta shadow-sm' : 'text-t-muted hover:text-t-dark-gray'
              }`}
            >
              {num} {num === 1 ? 'Line' : 'Lines'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Essentials Card */}
        <div className="p-4 rounded-2xl border border-t-light-gray bg-surface relative overflow-hidden">
          <p className="text-[10px] font-black text-t-muted uppercase mb-1">Value Pick</p>
          <p className="text-sm font-black text-t-dark-gray mb-4">Essentials</p>
          
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-[11px] font-medium text-t-dark-gray">
              <span>Monthly Total</span>
              <span className="font-black">${essentialsPricing.monthlyTotal}</span>
            </div>
            <div className="flex justify-between text-[11px] font-medium text-t-dark-gray/40">
              <span>Streaming Perks</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between text-[11px] font-medium text-t-dark-gray/40">
              <span>Travel Perks</span>
              <span>$0.00</span>
            </div>
          </div>

          <div className="pt-4 border-t border-t-light-gray">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] font-black text-t-muted uppercase">Effective Cost</p>
                <p className="text-xl font-black text-t-dark-gray">${essentialsPricing.monthlyTotal}</p>
              </div>
              <Info className="w-5 h-5 text-t-muted/60" />
            </div>
          </div>
        </div>

        {/* Beyond Card */}
        <div className="p-4 rounded-2xl border-2 border-t-magenta bg-t-magenta/5 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-2">
            <Zap className="w-10 h-10 text-t-magenta/10" />
          </div>
          <p className="text-[10px] font-black text-t-magenta uppercase mb-1">Premium Plan</p>
          <p className="text-sm font-black text-t-dark-gray mb-4">Experience Beyond</p>
          
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-[11px] font-medium text-t-dark-gray">
              <span>Monthly Total</span>
              <span className="font-black">${beyondPricing.monthlyTotal}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-success-accent">
              <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> Streaming (Netflix/Hulu/Apple)</span>
              <span>-${(perksValue.netflix + perksValue.hulu + perksValue.appleTV).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-success-accent">
              <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> AAA & Scam Shield</span>
              <span>-${(perksValue.aaa + perksValue.scamShield).toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-t-magenta/20">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] font-black text-t-magenta uppercase">Effective Cost</p>
                <p className="text-xl font-black text-t-magenta">${effectiveBeyondPrice.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-success-accent uppercase bg-success-surface px-1.5 py-0.5 rounded-full inline-block mb-1">
                  ${(essentialsPricing.monthlyTotal - effectiveBeyondPrice).toFixed(2)} Cheaper
                </p>
                <CheckCircle2 className="w-5 h-5 text-success-accent ml-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-t-dark-gray text-white">
        <p className="text-[10px] font-black text-t-magenta uppercase mb-2 tracking-widest flex items-center gap-2">
          <TrendingDown className="w-4 h-4" />
          The "Beyond" Advantage
        </p>
        <p className="text-xs font-medium leading-relaxed">
          When you add up the subscriptions T-Mobile pays for you, <span className="text-t-magenta font-black">Experience Beyond</span> actually costs less than the budget plan. Plus, you get the fastest 5G data that never slows down.
        </p>
      </div>
    </div>
  );
}
