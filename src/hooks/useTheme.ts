'use client';

import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';
export type FontSize = 'small' | 'normal' | 'large' | 'xlarge';

const FONT_SIZE_MAP: Record<FontSize, string> = {
  small: '14px',
  normal: '16px',
  large: '18px',
  xlarge: '20px',
};

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');
  const [fontSize, setFontSize] = useState<FontSize>('normal');

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('festiva_theme') as Theme | null;
      const savedSize = localStorage.getItem('festiva_fontsize') as FontSize | null;
      if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
      if (savedSize && FONT_SIZE_MAP[savedSize]) setFontSize(savedSize);
    } catch {
      // Ignore localStorage read errors in SSR/test
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('festiva_theme', theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.fontSize = FONT_SIZE_MAP[fontSize];
    try {
      localStorage.setItem('festiva_fontsize', fontSize);
    } catch {
      // Ignore storage errors
    }
  }, [fontSize]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const increaseFontSize = () => {
    setFontSize((f) => {
      const order: FontSize[] = ['small', 'normal', 'large', 'xlarge'];
      const idx = order.indexOf(f);
      return idx < order.length - 1 ? order[idx + 1] : f;
    });
  };

  const decreaseFontSize = () => {
    setFontSize((f) => {
      const order: FontSize[] = ['small', 'normal', 'large', 'xlarge'];
      const idx = order.indexOf(f);
      return idx > 0 ? order[idx - 1] : f;
    });
  };

  return { theme, fontSize, toggleTheme, increaseFontSize, decreaseFontSize };
}
