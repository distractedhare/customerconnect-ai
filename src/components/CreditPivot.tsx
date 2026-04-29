import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, ArrowRightLeft, Sparkles, ShieldCheck, AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';
import { Device, PHONES } from '../data/devices';
import { GoogleGenAI } from "@google/genai";

interface CreditPivotProps {
  targetDevice?: Device | null;
  onClose?: () => void;
}

export default function CreditPivot({ targetDevice: initialTarget, onClose }: CreditPivotProps) {
  const [targetDevice, setTargetDevice] = useState<Device | null>(initialTarget || null);
  const [pivotDevice, setPivotDevice] = useState<Device | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [talkTrack, setTalkTrack] = useState<string>('');

  const budgetOptions = useMemo(() => {
    if (!targetDevice) return [];
    // Find devices in the same category but cheaper, or Revvl/A-series
    return PHONES.filter(p => 
      p.name !== targetDevice.name && 
      (Number(p.startingPrice) < Number(targetDevice.startingPrice) || p.category === 'other' || p.name.includes('A17'))
    ).sort((a, b) => Number(a.startingPrice) - Number(b.startingPrice)).slice(0, 4);
  }, [targetDevice]);

  const generateTalkTrack = async () => {
    if (!targetDevice || !pivotDevice) return;
    
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `
        You are a world-class T-Mobile sales coach. 
        A customer wants the ${targetDevice.name} (Price: $${targetDevice.startingPrice}) but their credit score only allows them to get the ${pivotDevice.name} (Price: $${pivotDevice.startingPrice}) without a massive downpayment.
        
        Target Device Specs: ${targetDevice.keySpecs}
        Pivot Device Specs: ${pivotDevice.keySpecs}
        
        Generate a short, empathetic, and high-energy talk track (max 3 sentences) that:
        1. Acknowledges the desire for the ${targetDevice.name}.
        2. Pivots to the ${pivotDevice.name} as a "smart move" that still delivers the core experience (e.g., same 5G speed, great screen, or same AI features).
        3. Focuses on the "Zero Down" or "Lower Monthly" benefit.
        
        Tone: Empathetic, professional, T-Mobile "magenta" energy.
        No preamble, just the talk track.
      `;

      const response = await ai.models.generateContent({
        model: "gemma-2-9b-it",
        contents: prompt,
      });

      setTalkTrack(response.text || "I understand you had your eye on the flagship, but the great news is we can get you started today with the " + pivotDevice.name + " for zero down. You'll still get that blazing fast 5G and a stunning display without the upfront cost.");
      setIsFlipped(true);
    } catch (error) {
      console.error("Gemini Error:", error);
      setTalkTrack("I know the flagship is exciting, but we can get you into the " + pivotDevice.name + " today with much lower upfront costs while still giving you that premium T-Mobile experience.");
      setIsFlipped(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-stage rounded-3xl p-6 space-y-6 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black tracking-tight text-t-dark-gray flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-t-magenta" />
            Credit Pivot Engine
          </h3>
          <p className="text-[10px] font-medium text-t-dark-gray/60 uppercase tracking-widest">
            Flagship desire → Budget reality
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-t-muted hover:text-t-magenta transition-colors">
            <AlertCircle className="w-5 h-5 rotate-45" />
          </button>
        )}
      </div>

      {!targetDevice ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PHONES.filter(p => Number(p.startingPrice) > 900).slice(0, 4).map(p => (
            <button
              key={p.name}
              onClick={() => setTargetDevice(p)}
              className="glass-reading p-3 rounded-2xl transition-all text-left group"
            >
              <p className="text-[10px] font-black text-t-magenta uppercase mb-1">Target</p>
              <p className="text-xs font-bold text-t-dark-gray group-hover:text-t-magenta">{p.name}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="relative perspective-1000 min-h-[300px]">
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            style={{ transformStyle: "preserve-3d" }}
            className="w-full h-full"
          >
            {/* FRONT SIDE */}
            <div className={`w-full h-full backface-hidden ${isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
              <div className="space-y-4">
                <div className="glass-feature flex items-center gap-4 rounded-2xl p-4">
                  <div className="w-12 h-12 rounded-xl bg-t-magenta/10 flex items-center justify-center shrink-0">
                    <Smartphone className="w-6 h-6 text-t-magenta" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-t-magenta uppercase">Customer Wants</p>
                    <p className="text-sm font-black text-t-dark-gray">{targetDevice.name}</p>
                    <p className="text-[10px] font-medium text-t-dark-gray/60">${targetDevice.startingPrice} • Flagship</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-t-dark-gray/40 uppercase tracking-widest px-1">Recommended Pivots</p>
                  <div className="grid grid-cols-1 gap-2">
                    {budgetOptions.map(p => (
                      <button
                        key={p.name}
                        onClick={() => setPivotDevice(p)}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                          pivotDevice?.name === p.name 
                            ? 'glass-feature shadow-md'
                            : 'glass-reading'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pivotDevice?.name === p.name ? 'bg-t-magenta text-white' : 'bg-t-light-gray/50 text-t-dark-gray'}`}>
                            <Smartphone className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-t-dark-gray">{p.name}</p>
                            <p className="text-[9px] font-medium text-t-dark-gray/60">${p.startingPrice} • {p.category === 'other' ? 'Revvl/Value' : 'Budget'}</p>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${pivotDevice?.name === p.name ? 'text-t-magenta' : 'text-t-muted'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  disabled={!pivotDevice || loading}
                  onClick={generateTalkTrack}
                  className="cta-primary w-full rounded-2xl py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate Pivot Track
                </button>
              </div>
            </div>

            {/* BACK SIDE */}
            <div 
              className={`absolute inset-0 w-full h-full backface-hidden flex flex-col ${!isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
              style={{ transform: "rotateY(180deg)" }}
            >
              <div className="flex-1 flex flex-col space-y-4">
                <div className="p-5 rounded-2xl bg-t-dark-gray text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Sparkles className="w-12 h-12" />
                  </div>
                  <p className="text-[10px] font-black text-t-magenta uppercase mb-3 tracking-widest">Empathetic Pivot</p>
                  <p className="text-sm font-medium leading-relaxed">
                    "{talkTrack}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-reading rounded-xl p-3">
                    <p className="text-[9px] font-black text-t-magenta uppercase mb-1">Why it works</p>
                    <p className="text-[10px] font-medium text-t-dark-gray">Focuses on "Zero Down" to remove the credit barrier immediately.</p>
                  </div>
                  <div className="glass-reading rounded-xl p-3">
                    <p className="text-[9px] font-black text-t-magenta uppercase mb-1">Key Spec Match</p>
                    <p className="text-[10px] font-medium text-t-dark-gray">Both have 5G and large screens for streaming.</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsFlipped(false)}
                  className="glass-control w-full rounded-xl py-3 text-[10px] font-black uppercase tracking-widest text-t-dark-gray transition-colors"
                >
                  Edit Comparison
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </div>
  );
}
