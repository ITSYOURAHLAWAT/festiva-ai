'use client';

import { Moon, Sun, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface NavbarProps {
  onReset?: () => void;
}

export function Navbar({ onReset }: NavbarProps) {
  const { theme, fontSize, toggleTheme, increaseFontSize, decreaseFontSize } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <button
          onClick={onReset}
          className="flex items-center gap-2.5 text-xl font-extrabold text-purple-700 dark:text-purple-400 hover:opacity-90 transition-opacity focus-visible:ring-4 focus-visible:ring-purple-500 rounded-lg p-1.5"
          aria-label="FestivaAI Home - Celebration and Event Planner"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="tracking-tight bg-gradient-to-r from-purple-700 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            FestivaAI
          </span>
          <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            Challenge 5
          </span>
        </button>

        {/* Accessibility Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2" role="toolbar" aria-label="Accessibility controls">
          {/* Font Scaler Decrement */}
          <button
            onClick={decreaseFontSize}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-4 focus-visible:ring-purple-500 border border-slate-200 dark:border-slate-700"
            aria-label="Decrease text font size (A-)"
            title="Decrease font size"
          >
            <ZoomOut className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Current Scale Display */}
          <span
            className="text-xs font-bold text-slate-600 dark:text-slate-300 w-10 text-center select-none"
            aria-live="polite"
            aria-atomic="true"
          >
            {fontSize === 'small' ? 'A-' : fontSize === 'large' ? 'A+' : fontSize === 'xlarge' ? 'A++' : '100%'}
          </span>

          {/* Font Scaler Increment */}
          <button
            onClick={increaseFontSize}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-4 focus-visible:ring-purple-500 border border-slate-200 dark:border-slate-700"
            aria-label="Increase text font size (A+)"
            title="Increase font size"
          >
            <ZoomIn className="w-4 h-4" aria-hidden="true" />
          </button>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" aria-hidden="true" />

          {/* High-Contrast Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-4 focus-visible:ring-purple-500 border border-slate-200 dark:border-slate-700"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to high-contrast dark mode'}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 text-purple-600" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
