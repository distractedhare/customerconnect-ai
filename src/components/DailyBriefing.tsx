import { ChangeEvent, DragEvent as ReactDragEvent, useEffect, useRef, useState } from 'react';
import { Zap, Shield, Wifi, ChevronDown, ChevronUp, AlertCircle, Target, TrendingUp, Flame, Upload, RotateCcw, CheckCircle2, FileJson } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WeeklyUpdate } from '../services/weeklyUpdateSchema';
import { DIFFERENTIATORS } from '../data/differentiators';
import { clearUploadedUpdate, uploadWeeklyUpdate, WeeklyUpdateSource } from '../services/localGenerationService';

interface DailyBriefingProps {
  weeklyData: WeeklyUpdate | null;
  weeklySource: WeeklyUpdateSource;
  onDataUpdate: () => void | Promise<void>;
}

const DEFAULT_SECTION = (data: WeeklyUpdate | null) =>
  data?.trending && data.trending.length > 0 ? 'trending' : 'focus';

const formatDate = (value?: string) => {
  if (!value) return 'Unknown date';

  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function DailyBriefing({ weeklyData, weeklySource, onDataUpdate }: DailyBriefingProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    DEFAULT_SECTION(weeklyData)
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toggle = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  useEffect(() => {
    setExpandedSection(DEFAULT_SECTION(weeklyData));
  }, [weeklyData?.metadata.updatedDate, weeklyData?.metadata.version]);

  const networkDiff = DIFFERENTIATORS.find(d => d.category === 'Network');

  // Admin-only upload — only show when ?admin is in the URL
  const isAdmin = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('admin');
  const currentSourceLabel = weeklySource === 'uploaded'
    ? `Uploaded (${formatDate(weeklyData?.metadata.updatedDate)})`
    : weeklySource === 'placeholder'
    ? 'Placeholder fallback'
    : 'Built-in data';

  const handleFile = async (file: File) => {
    const isJson = file.name.toLowerCase().endsWith('.json') || file.type === 'application/json' || file.type === '';
    if (!isJson) {
      setUploadSuccess(null);
      setUploadError('Please upload a .json file.');
      return;
    }

    setIsUploading(true);
    setUploadSuccess(null);
    setUploadError(null);

    try {
      const contents = await file.text();
      const result = uploadWeeklyUpdate(contents);

      if (!result.success) {
        setUploadError(result.error ?? 'Upload failed.');
        return;
      }

      await onDataUpdate();
      setUploadSuccess(`Uploaded ${formatDate(result.metadata?.updatedDate)} • v${result.metadata?.version}`);
    } catch {
      setUploadError('Could not read that file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleDrop = async (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleRevert = () => {
    clearUploadedUpdate();
    window.location.reload();
  };

  return (
    <div className="space-y-3">
      {isAdmin && (
      <div className="glass-stage-quiet space-y-3 rounded-3xl p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-muted">Weekly Update Loader</p>
            <p className="text-xs font-bold text-t-dark-gray mt-1">Using: {currentSourceLabel}</p>
            <p className="text-[10px] text-t-dark-gray font-medium mt-1">
              Upload a validated `weekly-update.json` to refresh promos, intel, and talking points offline.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRevert}
            className="focus-ring glass-control inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-t-dark-gray transition-all hover:text-t-magenta"
          >
            <RotateCcw className="w-3 h-3 shrink-0" />
            Revert to built-in data
          </button>
        </div>

        <div
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            if (event.currentTarget === event.target) {
              setIsDragging(false);
            }
          }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="Upload weekly update JSON file"
          className={`focus-ring cursor-pointer rounded-2xl p-6 text-center transition-all ${
            isDragging
              ? 'glass-feature'
              : 'glass-reading hover:bg-t-magenta/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleInputChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-t-magenta/10 p-3">
              <Upload className="w-5 h-5 text-t-magenta" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-t-dark-gray">
              {isUploading ? 'Validating update...' : 'Drop a JSON file here or click to browse'}
            </p>
            <p className="text-[10px] font-medium text-t-dark-gray">
              Local-only upload. The current dataset stays active unless validation passes.
            </p>
          </div>
        </div>

        {uploadSuccess && (
          <div className="glass-reading rounded-2xl px-4 py-3 text-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-t-magenta mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest">Upload successful</p>
                <p className="text-xs font-bold mt-1">{uploadSuccess}</p>
              </div>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="glass-reading rounded-2xl px-4 py-3 text-foreground">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-t-magenta mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest">Upload failed</p>
                <p className="text-xs font-bold mt-1">{uploadError}</p>
              </div>
            </div>
          </div>
        )}

        {weeklyData && (
          <div className="glass-reading rounded-2xl px-4 py-3">
            <div className="flex items-start gap-2">
              <FileJson className="w-4 h-4 text-t-magenta mt-0.5 shrink-0" />
              <div className="flex flex-col gap-1 text-[10px] font-bold text-t-dark-gray">
                <span>Version: {weeklyData.metadata.version}</span>
                <span>Updated: {formatDate(weeklyData.metadata.updatedDate)}</span>
                <span>Valid Until: {formatDate(weeklyData.metadata.validUntil)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* This Week's Focus — always first, always visible */}
      {weeklyData && weeklyData.weeklyFocus.headline !== 'No weekly update loaded' && (
        <BriefingCard
          icon={<Target className="w-4 h-4" />}
          title="This Week's Focus"
          id="focus"
          expanded={expandedSection === 'focus'}
          onToggle={() => toggle('focus')}
        >
          <p className="text-sm font-black text-t-magenta mb-2">{weeklyData.weeklyFocus.headline}</p>
          <p className="text-xs text-t-dark-gray font-medium">{weeklyData.weeklyFocus.context}</p>
        </BriefingCard>
      )}

      {/* What's Trending — top 4 */}
      {weeklyData?.trending && weeklyData.trending.length > 0 && (
        <BriefingCard
          icon={<Flame className="w-4 h-4" />}
          title="What's Trending"
          id="trending"
          expanded={expandedSection === 'trending'}
          onToggle={() => toggle('trending')}
          accent
        >
          <div className="space-y-2">
            {weeklyData.trending.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <Flame className="w-3 h-3 text-t-magenta mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-black text-t-dark-gray">{item.buzz}</p>
                  <p className="text-[11px] font-bold text-t-magenta">{item.repTip}</p>
                </div>
              </div>
            ))}
          </div>
        </BriefingCard>
      )}

      {/* Top Promos — 4 most important, not all 16 */}
      {weeklyData && weeklyData.currentPromos.length > 0 && (
        <BriefingCard
          icon={<Zap className="w-4 h-4" />}
          title="Top Promos"
          id="promos"
          expanded={expandedSection === 'promos'}
          onToggle={() => toggle('promos')}
        >
          <div className="space-y-2">
            {weeklyData.currentPromos.slice(0, 4).map((promo, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-t-magenta/15 flex items-center justify-center text-[8px] font-black text-t-magenta mt-0.5">{i + 1}</span>
                <div>
                  <p className="text-xs font-black text-t-dark-gray uppercase">{promo.name}</p>
                  <p className="text-[11px] text-t-dark-gray font-medium mt-0.5 leading-snug">{promo.details.split('.').slice(0, 2).join('.') + '.'}</p>
                </div>
              </div>
            ))}
          </div>
          {weeklyData.currentPromos.length > 4 && (
            <p className="text-[10px] text-t-muted font-bold mt-3 text-center">
              + {weeklyData.currentPromos.length - 4} more promos — see Learn → Plans for full list
            </p>
          )}
        </BriefingCard>
      )}

      {/* Competitor Intel — top 4 */}
      {weeklyData && weeklyData.competitiveIntel.length > 0 && (
        <BriefingCard
          icon={<TrendingUp className="w-4 h-4" />}
          title="Competitor Intel"
          id="intel"
          expanded={expandedSection === 'intel'}
          onToggle={() => toggle('intel')}
        >
          <div className="space-y-2">
            {weeklyData.competitiveIntel.slice(0, 4).map((intel, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="shrink-0 text-[9px] font-black uppercase bg-error-surface text-error-foreground px-2 py-0.5 rounded-full mt-0.5">
                  {intel.carrier}
                </span>
                <p className="text-xs font-bold text-t-magenta">{intel.talkingPoint}</p>
              </div>
            ))}
          </div>
        </BriefingCard>
      )}

      {/* Network Stats — already compact (4 stat cards) */}
      <BriefingCard
        icon={<Wifi className="w-4 h-4" />}
        title="Network Highlights"
        id="network"
        expanded={expandedSection === 'network'}
        onToggle={() => toggle('network')}
      >
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="5G Median Speed" value="309 Mbps" subtext="2x faster than AT&T" />
          <StatCard label="5G Coverage" value="325M+" subtext="1.9M sq miles" />
          <StatCard label="JD Power" value="#1" subtext="5 of 6 regions" />
          <StatCard label="T-Satellite" value="650+" subtext="Starlink satellites" />
        </div>
      </BriefingCard>

      {/* Known Issues — top 4 */}
      {weeklyData && weeklyData.knownIssues.length > 0 && (
        <BriefingCard
          icon={<AlertCircle className="w-4 h-4" />}
          title={`Heads Up (${Math.min(weeklyData.knownIssues.length, 4)})`}
          id="issues"
          expanded={expandedSection === 'issues'}
          onToggle={() => toggle('issues')}
          warning
        >
          <div className="space-y-2">
            {weeklyData.knownIssues.slice(0, 4).map((issue, i) => (
              <div key={i}>
                <p className="text-xs font-bold text-warning-foreground">{issue.issue}</p>
                <p className="text-[11px] text-warning-foreground/70 font-medium">→ {issue.workaround}</p>
              </div>
            ))}
          </div>
        </BriefingCard>
      )}
    </div>
  );
}

function BriefingCard({
  icon, title, id, expanded, onToggle, children, accent, warning
}: {
  icon: React.ReactNode;
  title: string;
  id: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  accent?: boolean;
  warning?: boolean;
}) {
  return (
    <div className={`rounded-[1.5rem] overflow-hidden transition-all glass-specular ${
      accent ? 'glass-feature' :
      warning ? 'glass-reading' :
      'glass-utility'
    }`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`briefing-${id}`}
        className="focus-ring w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <div className={`${accent ? 'text-t-magenta' : warning ? 'text-warning-accent' : 'text-t-dark-gray'}`}>
            {icon}
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-t-dark-gray">{title}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-t-muted" /> : <ChevronDown className="w-4 h-4 text-t-muted" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            id={`briefing-${id}`}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, subtext }: { label: string; value: string; subtext: string }) {
  return (
    <div className="rounded-xl glass-feature glass-specular p-3 text-center">
      <p className="text-[9px] font-black uppercase tracking-widest text-t-muted">{label}</p>
      <p className="text-lg font-black text-t-magenta">{value}</p>
      <p className="text-[9px] font-bold text-t-dark-gray">{subtext}</p>
    </div>
  );
}
