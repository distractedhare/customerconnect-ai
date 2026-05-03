// Best-effort durable storage. Browsers grant `persist()` based on
// engagement signals (PWA install, bookmark, user interaction). We ask
// once after the first meaningful interaction.

let asked = false;

export async function requestPersistentStorage(): Promise<boolean> {
  if (asked) return false;
  asked = true;
  if (typeof navigator === 'undefined') return false;
  if (!navigator.storage?.persist) return false;
  try {
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

export async function isStoragePersisted(): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;
  if (!navigator.storage?.persisted) return false;
  try {
    return await navigator.storage.persisted();
  } catch {
    return false;
  }
}

let interactionWired = false;

export function wirePersistentStorageOnFirstInteraction(): void {
  if (interactionWired) return;
  if (typeof window === 'undefined') return;
  interactionWired = true;
  const handler = () => {
    void requestPersistentStorage();
    window.removeEventListener('pointerdown', handler);
    window.removeEventListener('keydown', handler);
  };
  window.addEventListener('pointerdown', handler, { once: false, passive: true });
  window.addEventListener('keydown', handler, { once: false, passive: true });
}
