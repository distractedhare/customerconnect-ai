import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { refreshPwaApp } from '../services/pwaRefreshService';

export default function PwaUpdater() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const latestWorkerRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    let cancelled = false;

    const showWaitingWorker = (worker: ServiceWorker | null) => {
      if (!worker) return;
      if (latestWorkerRef.current !== worker) {
        latestWorkerRef.current = worker;
        setDismissed(false);
      }
      setWaitingWorker(worker);
    };

    const trackRegistration = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        showWaitingWorker(registration.waiting);
      }

      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (
            installing.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            showWaitingWorker(installing);
          }
        });
      });
    };

    navigator.serviceWorker
      .getRegistration()
      .then((registration) => {
        if (cancelled || !registration) return;
        trackRegistration(registration);
      })
      .catch(() => {
        /* silent — SW unavailable */
      });

    const onControllerChange = () => {
      // New SW has taken control — any pending "waiting" state is resolved.
      latestWorkerRef.current = null;
      setWaitingWorker(null);
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      navigator.serviceWorker
        .getRegistration()
        .then((reg) => {
          if (!reg) return;
          reg.update().catch(() => undefined);
          if (reg.waiting) showWaitingWorker(reg.waiting);
        })
        .catch(() => undefined);
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const handleRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);
    await refreshPwaApp({ waitingWorker });
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  const visible = Boolean(waitingWorker) && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pwa-updater-toast"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          role="status"
          aria-live="polite"
          className="fixed inset-x-3 top-3 z-[120] mx-auto flex max-w-md items-center gap-3 rounded-2xl glass-card px-4 py-3 shadow-lg md:top-4 md:left-1/2 md:right-auto md:-translate-x-1/2"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-t-magenta/15 text-t-magenta">
            <Sparkles className="h-4 w-4" />
          </div>
          <button
            type="button"
            onClick={() => { void handleRefresh(); }}
            disabled={refreshing}
            className="focus-ring min-w-0 flex-1 text-left"
          >
            <p className="text-[11px] font-black uppercase tracking-widest text-t-magenta">
              New Promos Available!
            </p>
            <p className="truncate text-[11px] font-medium text-t-dark-gray">
              {refreshing ? 'Refreshing the latest build…' : 'Tap to refresh and load the latest build.'}
            </p>
          </button>
          <button
            type="button"
            onClick={() => { void handleRefresh(); }}
            aria-label="Refresh to load the new version"
            disabled={refreshing}
            className="focus-ring hidden shrink-0 items-center gap-1.5 rounded-full bg-t-magenta px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-wait disabled:opacity-60 sm:inline-flex"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss update notice"
            className="focus-ring flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-t-muted hover:bg-t-light-gray/30 hover:text-t-dark-gray"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
