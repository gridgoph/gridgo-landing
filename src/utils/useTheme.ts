import { useEffect, useState } from 'react';

/**
 * The site's light/dark toggle, shared by every route.
 *
 * The theme is a `dark` class on <html> plus a `theme` key in localStorage.
 * It lives here rather than inside App so that /support and /download honour
 * the reader's choice when they are opened directly, instead of always
 * starting light because the landing route never mounted.
 */
function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
  document.body.style.backgroundColor = dark ? '#000' : '#fff';
}

/**
 * localStorage throws outright when storage is blocked — private windows, an
 * embedded webview, or a browser set to refuse site data. Reading it during
 * render means that exception takes the whole page down, so both directions
 * fall back to the default rather than propagating.
 */
function readStoredTheme() {
  try {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  } catch {
    return true;
  }
}

function storeTheme(dark: boolean) {
  try {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  } catch {
    // The choice still applies for this visit; it just will not be remembered.
  }
}

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(readStoredTheme);

  useEffect(() => {
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((previous) => {
      const next = !previous;
      storeTheme(next);
      return next;
    });
  };

  return { isDarkMode, toggleDarkMode };
}
