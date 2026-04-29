type VibratePattern = number | number[];

const canVibrate = (): boolean =>
  typeof window !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  typeof navigator.vibrate === 'function';

function fire(pattern: VibratePattern): void {
  if (!canVibrate()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* vibration can throw on some WebViews — silent no-op */
  }
}

export const lightTap = (): void => fire([10]);

export const successBuzz = (): void => fire([30, 50, 30]);

export const heavyCrash = (): void => fire([100, 30, 100, 30, 100]);
