const DEFAULT_TIMEOUT_MS = 5000;

export interface RequestSignalOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export function withTimeoutSignal(options: RequestSignalOptions = {}): {
  signal: AbortSignal;
  cleanup: () => void;
} {
  const { signal: parentSignal, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const controller = new AbortController();

  const abortFromParent = () => {
    if (!controller.signal.aborted) {
      controller.abort(parentSignal?.reason);
    }
  };

  if (parentSignal) {
    if (parentSignal.aborted) {
      abortFromParent();
    } else {
      parentSignal.addEventListener('abort', abortFromParent, { once: true });
    }
  }

  const timeoutId = setTimeout(() => {
    if (!controller.signal.aborted) {
      controller.abort(new DOMException('Request timed out.', 'AbortError'));
    }
  }, timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeoutId);
      if (parentSignal) {
        parentSignal.removeEventListener('abort', abortFromParent);
      }
    },
  };
}

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError')
    || (error instanceof Error && error.name === 'AbortError')
    || (typeof error === 'object'
      && error !== null
      && 'name' in error
      && (error as { name?: string }).name === 'AbortError')
  );
}
