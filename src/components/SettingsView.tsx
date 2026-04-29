import { useState, useEffect } from 'react';
import { 
  Settings, Users, MessageSquare, Rocket, Download, 
  Wifi, ShieldCheck, Loader2, CheckCircle2, AlertCircle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TeamConfig from './levelup/TeamConfig';
import FeedbackForm from './levelup/FeedbackForm';
import Roadmap from './levelup/Roadmap';
import { localAiService } from '../services/localAiService';
import { InitProgressReport } from '@mlc-ai/web-llm';

export type SettingsTab = 'team' | 'feedback' | 'roadmap' | 'offline-ai';

interface SettingsViewProps {
  initialTab?: SettingsTab;
}

const VERSION = "1.2.4-stable";
const FALLBACK_BUILD_ID = "CC-AI-2026-04-23";

function getRuntimeMeta() {
  const runtimeEnv = import.meta.env as ImportMetaEnv & Record<string, string | boolean | undefined>;
  const host = typeof window !== 'undefined' ? window.location.hostname : '';

  if (import.meta.env.DEV || host === 'localhost' || host === '127.0.0.1') {
    return {
      environmentLabel: 'Local Dev',
      environmentClass: 'text-warning-accent',
      buildId: 'LOCAL',
    };
  }

  if (host.includes('projects.vercel.app')) {
    return {
      environmentLabel: 'Preview',
      environmentClass: 'text-info-foreground',
      buildId: typeof runtimeEnv.VERCEL_GIT_COMMIT_SHA === 'string'
        ? runtimeEnv.VERCEL_GIT_COMMIT_SHA.slice(0, 7).toUpperCase()
        : FALLBACK_BUILD_ID,
    };
  }

  if (typeof runtimeEnv.VERCEL_ENV === 'string' && runtimeEnv.VERCEL_ENV.toLowerCase() === 'preview') {
    return {
      environmentLabel: 'Preview',
      environmentClass: 'text-info-foreground',
      buildId: typeof runtimeEnv.VERCEL_GIT_COMMIT_SHA === 'string'
        ? runtimeEnv.VERCEL_GIT_COMMIT_SHA.slice(0, 7).toUpperCase()
        : FALLBACK_BUILD_ID,
    };
  }

  return {
    environmentLabel: 'Production',
    environmentClass: 'text-success-accent',
    buildId: typeof runtimeEnv.VERCEL_GIT_COMMIT_SHA === 'string'
      ? runtimeEnv.VERCEL_GIT_COMMIT_SHA.slice(0, 7).toUpperCase()
      : typeof runtimeEnv.VITE_BUILD_ID === 'string' && runtimeEnv.VITE_BUILD_ID
        ? runtimeEnv.VITE_BUILD_ID
        : FALLBACK_BUILD_ID,
  };
}

export default function SettingsView({ initialTab = 'team' }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [isAiReady, setIsAiReady] = useState(localAiService.isReady());
  const [aiProgress, setAiProgress] = useState<InitProgressReport | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const runtimeMeta = getRuntimeMeta();

  useEffect(() => {
    const unsubscribeProgress = localAiService.onProgress((p) => setAiProgress(p));
    const unsubscribeReady = localAiService.onReady((ready) => {
      setIsAiReady(ready);
      if (ready) setIsDownloading(false);
    });

    return () => {
      unsubscribeProgress();
      unsubscribeReady();
    };
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleDownloadAi = async () => {
    if (isAiReady || isDownloading) return;
    setIsDownloading(true);
    setAiError(null);
    try {
      await localAiService.initialize();
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Your device might not support WebGPU.';
      setAiError(`Failed to initialize local AI. ${reason}`);
      setIsDownloading(false);
    }
  };

  const tabGroups: { heading: string; tabs: { id: SettingsTab; icon: typeof Users; label: string; description: string }[] }[] = [
    {
      heading: 'Rep Tools',
      tabs: [
        { id: 'team', icon: Users, label: 'Team Setup', description: 'Squad name, mascot, and challenge focus.' },
        { id: 'offline-ai', icon: Wifi, label: 'Offline AI', description: 'Gemma status, download, and recovery tools.' },
      ],
    },
    {
      heading: 'Admin / Pilot Tools',
      tabs: [
        { id: 'feedback', icon: MessageSquare, label: 'Feedback', description: 'Send notes from reps, testers, or managers.' },
        { id: 'roadmap', icon: Rocket, label: 'Roadmap', description: 'See what is live now and what is next.' },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-t-magenta/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-t-magenta" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Settings</h1>
          <p className="text-xs font-medium text-t-dark-gray">Configure your experience and manage local assets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar Nav */}
        <div className="md:col-span-4 space-y-2">
          {tabGroups.map((group) => (
            <div key={group.heading} className="space-y-2">
              <p className="px-1 text-[9px] font-black uppercase tracking-[0.18em] text-t-muted">{group.heading}</p>
              {group.tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-3 border ${
                      isActive 
                        ? 'bg-t-magenta text-white border-t-magenta shadow-lg shadow-t-magenta/20' 
                        : 'bg-surface text-t-dark-gray border-t-light-gray hover:bg-t-light-gray/20'
                    }`}
                  >
                    <tab.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-t-magenta'}`} />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider">{tab.label}</p>
                      <p className={`text-[10px] font-medium ${isActive ? 'text-white/70' : 'text-t-muted'}`}>
                        {tab.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}

          {/* App Info Card */}
          <div className="mt-6 p-4 rounded-2xl border border-t-light-gray bg-surface-elevated space-y-3">
            <div className="flex items-center gap-2 text-t-magenta">
              <Info className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">System Info</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-t-muted">Version</span>
                <span className="text-t-dark-gray">{VERSION}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-t-muted">Build ID</span>
                <span className="text-t-dark-gray">{runtimeMeta.buildId}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-t-muted">Environment</span>
                <span className={runtimeMeta.environmentClass}>{runtimeMeta.environmentLabel}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('feedback')}
              className="w-full mt-2 py-2 rounded-lg border border-t-light-gray bg-surface text-[9px] font-black uppercase tracking-widest text-t-dark-gray hover:bg-t-light-gray/30 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-3 h-3" />
              Send Pilot Feedback
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="glass-card rounded-3xl p-6 min-h-[400px]"
            >
              {activeTab === 'team' && <TeamConfig />}
              {activeTab === 'feedback' && <FeedbackForm />}
              {activeTab === 'roadmap' && <Roadmap onSwitchToFeedback={() => setActiveTab('feedback')} />}
              
              {activeTab === 'offline-ai' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-t-magenta/10 flex items-center justify-center">
                      <Wifi className="w-6 h-6 text-t-magenta" />
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold tracking-tight">Gemma Offline Coach</h2>
                      <p className="text-xs font-medium text-t-dark-gray">Keep the rep-safe coach ready for dead zones and bad Wi-Fi.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-t-light-gray bg-t-light-gray/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className={`w-4 h-4 ${isAiReady ? 'text-success-accent' : 'text-t-muted'}`} />
                        <span className="text-xs font-bold">Model Status</span>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                        isAiReady ? 'bg-success-surface text-success-accent' : 'bg-t-light-gray text-t-muted'
                      }`}>
                        {isAiReady ? 'Ready' : 'Not Loaded'}
                      </span>
                    </div>

                    <p className="text-xs text-t-dark-gray leading-relaxed">
                      Download Gemma once on this device, then reps can open the coach instantly without a network connection. If the full model struggles on the device, use Gemma Lite as the fallback expectation for tighter hardware.
                    </p>

                    {isDownloading && aiProgress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-t-magenta">
                          <span>{aiProgress.text}</span>
                          <span>{Math.round((aiProgress.progress || 0) * 100)}%</span>
                        </div>
                        <div className="h-2 w-full bg-t-light-gray rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-t-magenta"
                            initial={{ width: 0 }}
                            animate={{ width: `${(aiProgress.progress || 0) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {aiError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-error-surface text-error-foreground border border-error-border">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p className="text-[10px] font-bold">{aiError}</p>
                      </div>
                    )}

                    <button
                      onClick={handleDownloadAi}
                      disabled={isAiReady || isDownloading}
                      className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all ${
                        isAiReady 
                          ? 'bg-success-accent/10 text-success-accent border border-success-accent/20 cursor-default' 
                          : 'bg-t-magenta text-white shadow-lg shadow-t-magenta/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50'
                      }`}
                    >
                      {isAiReady ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-xs font-black uppercase tracking-widest">Model Installed</span>
                        </>
                      ) : isDownloading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-xs font-black uppercase tracking-widest">Downloading…</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          <span className="text-xs font-black uppercase tracking-widest">Download Gemma</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <InfoPill label="Privacy" value="100% On-Device" />
                    <InfoPill label="Download" value="About 1.5 GB" />
                    <InfoPill label="Best For" value="Dead zones & demos" />
                  </div>

                  <div className="rounded-2xl border border-info-border bg-info-surface p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-info-foreground">What to do next</p>
                    <div className="mt-2 space-y-2 text-[11px] font-medium leading-relaxed text-info-foreground">
                      <p>1. Download Gemma on a stable connection before the shift starts.</p>
                      <p>2. Open Offline Coach once to confirm it is truly ready on this device.</p>
                      <p>3. If the device struggles, clear the files and try again with the lighter Gemma path.</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl border border-t-light-gray bg-surface text-center">
      <p className="text-[9px] font-black uppercase tracking-widest text-t-muted">{label}</p>
      <p className="text-[10px] font-bold text-t-dark-gray mt-1">{value}</p>
    </div>
  );
}
