import { useEffect, useState } from 'react';

export default function useTheme() {
  const [isDark, setIsDark] = useState(() => window.localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDark);
    window.localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return [isDark, () => setIsDark((currentTheme) => !currentTheme)];
}
