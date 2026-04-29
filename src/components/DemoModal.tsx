import { XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DEMO_SCENARIOS, DemoScenario } from '../constants/demoScenarios';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: DemoScenario) => void;
}

export default function DemoModal({ isOpen, onClose, onSelectScenario }: DemoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-modal-title"
            className="relative rounded-3xl glass-modal glass-specular max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 id="demo-modal-title" className="text-xl font-black uppercase tracking-tight">
                Run a <span className="text-t-magenta">Practice</span> Scenario
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close demo scenarios"
                className="focus-ring text-t-dark-gray hover:text-t-magenta transition-colors rounded"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {DEMO_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.name}
                  type="button"
                  onClick={() => {
                    onSelectScenario(scenario);
                    onClose();
                  }}
                  className="focus-ring w-full text-left p-4 rounded-2xl glass-button hover:border-t-magenta/50 hover:bg-t-magenta/5 group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{scenario.emoji}</span>
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-tight group-hover:text-t-magenta transition-colors">
                        {scenario.name}
                      </h3>
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
                </button>
              ))}
            </div>

            <p className="text-[9px] text-center text-t-muted font-medium mt-4">
              Pick one and we'll load it up — instant talking points, no typing.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
