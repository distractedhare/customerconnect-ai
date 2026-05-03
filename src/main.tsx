import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { hydrate as hydrateStorage } from './services/storage/kvStore';
import { wirePersistentStorageOnFirstInteraction } from './services/storage/persistence';

async function boot() {
  // Hydrate the in-memory KV store from IDB+LS before first render so
  // services that read synchronously (bingo, prize, runner, etc.) see
  // the rep's saved state on the first paint.
  try {
    await hydrateStorage();
  } catch {
    // Hydration failure (private mode, IDB blocked) — services fall
    // back to localStorage transparently. Anonymous flow still works.
  }
  wirePersistentStorageOnFirstInteraction();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void boot();
