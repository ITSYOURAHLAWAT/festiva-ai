import { Sparkles, Calendar, DollarSign, Users, Palette } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-heading"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 text-center animate-fade-in">
        <div className="relative mb-6 inline-block">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 flex items-center justify-center text-white shadow-lg mx-auto animate-pulse">
            <Sparkles className="w-8 h-8" aria-hidden="true" />
          </div>
        </div>

        <h2 id="loading-heading" className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
          Architecting Event Plan
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
          Google Gemini is applying context heuristics, balancing budget thresholds, and sequencing your reverse-timeline.
        </p>

        <div className="space-y-3 text-left">
          {[
            { icon: DollarSign, text: 'Calibrating multi-category budget splits…', color: 'text-amber-500' },
            { icon: Calendar, text: 'Synthesizing countdown milestone run-of-show…', color: 'text-purple-500' },
            { icon: Users, text: 'Formulating vendor vetting questions & red flags…', color: 'text-pink-500' },
            { icon: Palette, text: 'Curating cohesive palette, menu & invitation vibes…', color: 'text-emerald-500' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <Icon className={`w-4 h-4 ${item.color} flex-shrink-0 animate-spin`} aria-hidden="true" />
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
