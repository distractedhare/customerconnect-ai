const CACHE_PREFIX = 'customerconnect-';
const CONTROLLER_CHANGE_TIMEOUT_MS = 1500;

interface RefreshPwaAppOptions {
  waitingWorker?: ServiceWorker | null;
  onWarning?: (error: unknown) => void;
}

function canUseServiceWorkers(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

function waitForControllerChange(timeoutMs = CONTROLLER_CHANGE_TIMEOUT_MS): Promise<void> {
  if (!canUseServiceWorkers() || typeof window === 'undefined') {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      resolve();
    };

    const onControllerChange = () => finish();
    const timeoutId = window.setTimeout(finish, timeoutMs);

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange, { once: true });
  });
}

function collectWaitingWorkers(
  registrations: readonly ServiceWorkerRegistration[],
  preferredWorker?: ServiceWorker | null,
): ServiceWorker[] {
  const workers = new Set<ServiceWorker>();

  if (preferredWorker) {
    workers.add(preferredWorker);
  }

  registrations.forEach((registration) => {
    if (registration.waiting) {
      workers.add(registration.waiting);
    }
  });

  return [...workers];
}

async function clearCustomerConnectCaches(): Promise<void> {
  if (
    typeof window === 'undefined'
    || typeof navigator === 'undefined'
    || !navigator.onLine
    || !('caches' in window)
  ) {
    return;
  }

  const cacheKeys = await caches.keys();
  await Promise.all(
    cacheKeys
      .filter((key) => key.startsWith(CACHE_PREFIX))
      .map((key) => caches.delete(key))
  );
}

export async function refreshPwaApp({
  waitingWorker,
  onWarning,
}: RefreshPwaAppOptions = {}): Promise<void> {
  try {
    const controllerChangePromise = canUseServiceWorkers()
      ? waitForControllerChange()
      : Promise.resolve();

    const registrations = canUseServiceWorkers()
      ? await navigator.serviceWorker.getRegistrations()
      : [];

    await Promise.all(registrations.map((registration) => registration.update().catch(() => undefined)));

    const waitingWorkers = collectWaitingWorkers(registrations, waitingWorker);

    waitingWorkers.forEach((worker) => {
      try {
        worker.postMessage({ type: 'SKIP_WAITING' });
      } catch {
        /* silent */
      }
    });

    await clearCustomerConnectCaches();
    await controllerChangePromise;
  } catch (error) {
    onWarning?.(error);
  }

  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}
