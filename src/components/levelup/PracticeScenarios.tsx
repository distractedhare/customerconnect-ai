import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import { DEMO_SCENARIOS, DemoScenario } from '../../constants/demoScenarios';

interface PracticeScenariosProps {
  onSelectScenario: (scenario: DemoScenario) => void;
}

export default function PracticeScenarios({ onSelectScenario }: PracticeScenariosProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mb-1">Practice Scenarios</p>
        <p className="text-xs text-t-dark-gray font-medium">
          Pick a customer profile to practice with. It'll load into Live mode with a full game plan ready.
        </p>
      </div>

      <div className="space-y-3">
        {DEMO_SCENARIOS.map((scenario) => (
          <motion.button
            key={scenario.name}
            type="button"
            onClick={() => onSelectScenario(scenario)}
            whileTap={{ scale: 0.98 }}
            className="focus-ring w-full text-left p-4 rounded-2xl border-2 border-t-light-gray bg-surface-elevated hover:border-t-magenta/50 hover:bg-t-magenta/5 transition-all group"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{scenario.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-black text-sm uppercase tracking-tight group-hover:text-t-magenta transition-colors">
                    {scenario.name}
                  </h3>
                  <Play className="w-3.5 h-3.5 text-t-dark-gray/30 group-hover:text-t-magenta transition-colors shrink-0" />
                </div>
                <p className="text-xs text-t-dark-gray font-medium mt-1">
                  {scenario.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[9px] font-black uppercase bg-t-light-gray/50 text-t-dark-gray px-2 py-0.5 rounded-full">
                    {scenario.context.age}
                  </span>
                  <span className="text-[9px] font-black uppercase bg-t-light-gray/50 text-t-dark-gray px-2 py-0.5 rounded-full">
                    {scenario.context.product.join(' + ')}
                  </span>
                  <span className="text-[9px] font-black uppercase bg-t-magenta/10 text-t-magenta px-2 py-0.5 rounded-full">
                    From {scenario.context.currentCarrier}
                  </span>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <p className="text-[9px] text-center text-t-muted font-medium">
        Pick one and we'll load it up — instant talking points, no typing.
      </p>
    </div>
  );
}
