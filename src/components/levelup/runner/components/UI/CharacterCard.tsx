import React, { useState } from 'react';
import type { RunnerCharacter } from '../../content';
import { RunnerPicture } from './RunnerPicture';

interface Props {
  character: RunnerCharacter;
  isActive: boolean;
}

export const CharacterCard: React.FC<Props> = ({ character, isActive }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  return (
    <div className={`relative w-[85vw] max-w-sm shrink-0 transition-all duration-500 snap-center
      ${isActive ? 'opacity-100 scale-100' : 'opacity-60 scale-95'}`}>

      {/* Pop-out Hero Image: MUST BE absolute, z-20, pointer-events-none */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-56 z-20 pointer-events-none">
        <RunnerPicture
          src={character.assets.cutout}
          alt={character.name}
          pictureClassName="block h-full w-full"
          className="w-full h-full object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]"
          loading="lazy"
        />
      </div>

      {/* Main Card Container: MUST HAVE overflow-visible */}
      <div className="relative mt-24 bg-[#151720] border-2 rounded-3xl p-6 pt-32 shadow-2xl overflow-visible"
           style={{ borderColor: character.color }}>

        <div className="mb-4">
          <h3 className="text-white text-3xl font-black uppercase italic leading-none">{character.name}</h3>
          <p className="text-xs uppercase font-bold mt-1" style={{ color: character.color }}>{character.role}</p>
          <p className="text-gray-400 text-[10px] mt-2 leading-tight uppercase">{character.trait}</p>
        </div>

        {/* Native Stat Bars */}
        <div className="space-y-2 mb-6">
          {Object.entries(character.stats).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-[9px] uppercase font-bold text-gray-500 w-12">{key}</span>
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-1000"
                  style={{ width: `${(value as number / 10) * 100}%`, backgroundColor: character.color }}
                />
              </div>
              <span className="text-[9px] font-black text-white">{value}</span>
            </div>
          ))}
        </div>

        {/* Interactive Ability Grid */}
        <div className="grid grid-cols-3 gap-2">
          {character.abilities.map((ability) => (
            <div
              key={ability.slot}
              className="relative flex flex-col items-center gap-1 cursor-pointer group"
              onClick={() => setActiveTooltip(activeTooltip === ability.label ? null : ability.label)}
            >
              <div className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:border-white transition-colors z-10">
                <RunnerPicture
                  src={ability.path}
                  alt={ability.label}
                  pictureClassName="block h-8 w-8"
                  className="h-full w-full object-contain opacity-80 group-hover:opacity-100"
                  loading="lazy"
                />
              </div>
              <span className="text-[8px] text-gray-400 uppercase font-bold text-center leading-none">{ability.label}</span>

              {/* Tooltip: MUST HAVE z-50 */}
              {activeTooltip === ability.label && (
                <div className="absolute bottom-full mb-2 w-32 bg-white text-black p-2 rounded-lg text-[9px] font-bold z-50 shadow-xl">
                  {ability.description}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
