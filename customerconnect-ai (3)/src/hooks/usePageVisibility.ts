import { useEffect, useState } from 'react';

/**
 * Returns true when the tab is visible and focused, false otherwise.
 * Combines the Page Visibility API with window focus/blur as a fallback
 * for iOS PWAs where `visibilitychange` can lag behind.
 */
export function usePageVisibility(): boolean {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof document === 'undefined') return true;
    return document.visibilityState === 'visible';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const onVisibilityChange = () => {
      setVisible(document.visibilityState === 'visible');
    };
    const onBlur = () => setVisible(false);
    const onFocus = () => {
      if (document.visibilityState === 'visible') setVisible(true);
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return visible;
}
