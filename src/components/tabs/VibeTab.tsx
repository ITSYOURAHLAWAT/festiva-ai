'use client';

import { useState } from 'react';
import {
  Sparkles, Palette, UtensilsCrossed, Music2, Mail,
  Send, Loader2, ArrowRight, CheckCircle2, Copy, Check
} from 'lucide-react';
import type { VibeStudio } from '@/types';

interface VibeTabProps {
  vibe: VibeStudio;
  onCoPilotInstruction: (instruction: string) => Promise<void>;
  isCoPilotLoading: boolean;
}

const DEMO_PROMPTS = [
  'Switch menu to 100% vegetarian North Indian and reduce decor budget by 15%',
  'Change color palette to tropical emerald theme and add live beach music vibes',
  'Make the invitation wording formal, traditional and culturally rooted',
  'Add artisanal midnight dessert bar and live mocktail cocktail counters',
];

export function VibeTab({ vibe, onCoPilotInstruction, isCoPilotLoading }: VibeTabProps) {
  const [instruction, setInstruction] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const handleCoPilotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isCoPilotLoading) return;
    setStatusMessage('GenAI Co-Pilot is refining your event plan…');
    try {
      await onCoPilotInstruction(instruction);
      setStatusMessage('Event plan successfully revised!');
      setInstruction('');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch {
      setStatusMessage('Could not apply updates. Please try again.');
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(vibe.invitationWording);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  return (
    <section aria-labelledby="vibe-studio-heading" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 id="vibe-studio-heading" className="text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Palette className="w-5 h-5" aria-hidden="true" />
            </span>
            Personalized Theme, Menu & Vibe Studio
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Bespoke aesthetic DNA: harmonized color swatches, decor architectural concepts, dietary-compliant menus, and invitation prose.
          </p>
        </div>
      </div>

      {/* AI Co-Pilot Dynamic Interactive Prompt Bar */}
      <div className="bg-gradient-to-tr from-purple-900 via-indigo-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4 border border-purple-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-md">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
              <span>Dynamic AI Co-Pilot & Plan Re-Architect</span>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold uppercase tracking-wider border border-pink-500/40">
                Live Re-write Engine
              </span>
            </h3>
            <p className="text-xs text-purple-200">
              Command Gemini in natural language to update palettes, dietary menus, decor styling, or budget parameters in real-time.
            </p>
          </div>
        </div>

        {/* Quick Demo Action Chips */}
        <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Suggested Co-Pilot Prompts">
          {DEMO_PROMPTS.map((promptText, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInstruction(promptText)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-purple-100 border border-white/10 transition-colors focus-visible:ring-4 focus-visible:ring-purple-400 text-left"
            >
              &ldquo;{promptText}&rdquo;
            </button>
          ))}
        </div>

        {/* Prompt Input Form */}
        <form onSubmit={handleCoPilotSubmit} className="flex gap-2 pt-2">
          <label htmlFor="copilot-input" className="sr-only">
            Instruction for FestivaAI Co-Pilot
          </label>
          <input
            id="copilot-input"
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={isCoPilotLoading}
            placeholder='e.g. "Switch menu to 100% vegetarian North Indian and reduce decor budget by 15%"'
            className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-purple-300/60 text-xs sm:text-sm focus:outline-none focus:border-pink-400 focus-visible:ring-4 focus-visible:ring-pink-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isCoPilotLoading || !instruction.trim()}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-400 hover:opacity-90 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-4 focus-visible:ring-pink-400 flex-shrink-0"
            aria-label="Submit instruction to FestivaAI Co-Pilot"
          >
            {isCoPilotLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span className="hidden sm:inline">Processing…</span>
              </>
            ) : (
              <>
                <span>Execute</span>
                <Send className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        {statusMessage && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 text-xs font-bold text-pink-300 pt-1"
          >
            {isCoPilotLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Aesthetic Color Palette Swatches */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-50">
              Color Palette: {vibe.colorPalette.name}
            </h3>
          </div>
          <span className="text-xs text-slate-400 italic">4-Point Harmonics</span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {vibe.colorPalette.description}
        </p>

        {/* Swatches Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2" role="group" aria-label="Event color swatches">
          {[
            { label: 'Primary Brand Tone', hex: vibe.colorPalette.primary },
            { label: 'Secondary Tone', hex: vibe.colorPalette.secondary },
            { label: 'Vibrant Accent', hex: vibe.colorPalette.accent },
            { label: 'Neutral Canvas', hex: vibe.colorPalette.neutral },
          ].map((swatch, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-800/50 p-2.5"
            >
              <div
                className="h-16 rounded-xl w-full shadow-inner border border-black/10 dark:border-white/10 mb-2 transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: swatch.hex }}
                role="img"
                aria-label={`${swatch.label} with hex code ${swatch.hex}`}
              />
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{swatch.label}</div>
              <div className="font-mono text-[10px] text-slate-400 uppercase">{swatch.hex}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Decor Concepts & Atmosphere Architecture */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" aria-hidden="true" />
          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-50">
            Decor Architecture & Spatial Concepts
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          &ldquo;{vibe.ambiance}&rdquo;
        </p>

        <ul className="space-y-2.5 pt-2">
          {vibe.decorConcepts.map((concept, i) => (
            <li
              key={i}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-200 flex items-start gap-3"
            >
              <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold flex items-center justify-center flex-shrink-0 text-[10px]">
                {i + 1}
              </span>
              <span className="leading-relaxed">{concept}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Curated Dietary-Aware Food Menu */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-orange-500" aria-hidden="true" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-50">
              Dietary-Aware Curated Tasting Menu
            </h3>
          </div>
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400 px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800">
            {vibe.menuSuggestions.length} Courses
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {vibe.menuSuggestions.map((course, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-orange-50/40 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-900 dark:text-slate-100">{course.course}</span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-orange-700 dark:text-orange-300">
                  Course #{idx + 1}
                </span>
              </div>

              <ul className="space-y-1 pl-3 text-xs text-slate-700 dark:text-slate-300">
                {course.items.map((item, j) => (
                  <li key={j} className="list-disc leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>

              <div className="text-[11px] font-semibold text-orange-800 dark:text-orange-300 italic pt-1">
                🥗 Dietary Compliance: {course.dietaryNotes}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Acoustic & Musical Atmosphere */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Music2 className="w-5 h-5 text-blue-500" aria-hidden="true" />
          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-50">
            Music & Acoustic Flow
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {vibe.musicSuggestions.map((track, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
            >
              <Music2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span className="leading-relaxed">{track}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bespoke Invitation Wording */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-pink-500" aria-hidden="true" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-50">
              Personalized Invitation Copy
            </h3>
          </div>
          <button
            type="button"
            onClick={handleCopyInvite}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors focus-visible:ring-4 focus-visible:ring-purple-500"
            aria-label="Copy invitation wording"
          >
            {copiedInvite ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copy Copy</span>
              </>
            )}
          </button>
        </div>

        <blockquote className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/50 via-pink-50/40 to-slate-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-slate-900 border-l-4 border-purple-600 text-slate-800 dark:text-slate-200 text-sm leading-relaxed italic">
          &ldquo;{vibe.invitationWording}&rdquo;
        </blockquote>
      </div>
    </section>
  );
}
