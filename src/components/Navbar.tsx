'use client';

import { Moon, Sun, ZoomIn, ZoomOut, Crown, ShieldCheck, Sparkles } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface NavbarProps {
  onReset?: () => void;
}

export function Navbar({ onReset }: NavbarProps) {
  const { theme, fontSize, toggleTheme, increaseFontSize, decreaseFontSize } = useTheme();

  return (
    <header className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 sm:p-6 transition-all">
      <nav
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        aria-label="Main navigation"
      >
        {/* Brand / Logo Area */}
        <button
          onClick={onReset}
          className="flex items-center gap-4 text-left group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500 rounded-2xl p-1 -m-1 transition-opacity cursor-pointer"
          aria-label="FestivaAI Home - AI Celebration and Event Architect"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-violet-500 to-amber-400 text-white shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
            <Crown className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
              FestivaAI
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              AI Celebration &amp; Event Architect
            </p>
          </div>
        </button>

        {/* Right Section: Badges & Accessibility Toolbar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Status Badges */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Vendor-verified
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-700 dark:text-violet-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Co-Pilot active
          </span>

          {/* Accessibility Controls Toolbar */}
          <div
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white/80 p-1 dark:border-white/10 dark:bg-white/5"
            role="toolbar"
            aria-label="Accessibility controls"
          >
            {/* Font Scaler Decrement */}
            <button
              onClick={decreaseFontSize}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-4 focus-visible:ring-violet-500 cursor-pointer"
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
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-4 focus-visible:ring-violet-500 cursor-pointer"
              aria-label="Increase text font size (A+)"
              title="Increase font size"
            >
              <ZoomIn className="w-4 h-4" aria-hidden="true" />
            </button>

            <div className="w-px h-5 bg-slate-200 dark:bg-white/10 mx-0.5" aria-hidden="true" />

            {/* High-Contrast Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-4 focus-visible:ring-violet-500 cursor-pointer"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to high-contrast dark mode'}
              aria-pressed={theme === 'dark'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-violet-600" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export { Navbar as Header };
