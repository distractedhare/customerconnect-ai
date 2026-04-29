import confetti from 'canvas-confetti';

const BRAND_COLORS = ['#E20074', '#FFFFFF', '#861B54'];

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export type CelebrateIntensity = 'light' | 'heavy';

export function celebrate(options: { intensity?: CelebrateIntensity } = {}): void {
  if (prefersReducedMotion()) return;
  const intensity = options.intensity ?? 'light';

  if (intensity === 'light') {
    void confetti({
      particleCount: 90,
      spread: 68,
      startVelocity: 28,
      scalar: 0.9,
      colors: BRAND_COLORS,
      origin: { y: 0.72 },
    });
    return;
  }

  void confetti({
    particleCount: 160,
    spread: 82,
    startVelocity: 34,
    scalar: 1,
    colors: BRAND_COLORS,
    origin: { y: 0.62 },
  });

  window.setTimeout(() => {
    void confetti({
      particleCount: 120,
      spread: 120,
      startVelocity: 26,
      scalar: 0.95,
      colors: BRAND_COLORS,
      origin: { x: 0.22, y: 0.66 },
    });
    void confetti({
      particleCount: 120,
      spread: 120,
      startVelocity: 26,
      scalar: 0.95,
      colors: BRAND_COLORS,
      origin: { x: 0.78, y: 0.66 },
    });
  }, 160);
}
