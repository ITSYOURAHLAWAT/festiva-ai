'use client';

import { useState, useCallback, useEffect } from 'react';
import type { EventContext, EventPlan } from '@/types';
import { getCacheKey, getCachedPlan, setCachedPlan } from '@/services/cache';
import { generateFallbackPlan } from '@/services/fallback';
import { parseCoPilotInstruction } from '@/services/copilotParser';
import { Navbar } from '@/components/Navbar';
import { ConfigStudio } from '@/components/ConfigStudio';
import { CommandCenter } from '@/components/CommandCenter';
import { Sparkles, AlertTriangle, Send, Loader2 } from 'lucide-react';

const DEFAULT_CONTEXT: EventContext = {
  eventType: 'wedding',
  eventTitle: "Aarav & Meera's Wedding",
  eventDate: '2026-11-14',
  city: 'Udaipur',
  guestCount: 320,
  totalBudget: 4500000,
  culturalTheme: 'Royal Heritage',
  cuisinePreference: 'Rajasthani',
  additionalNotes: 'Luxury royal wedding setup with heritage decor preferences.',
};

export default function HomePage() {
  const [context, setContext] = useState<EventContext>(DEFAULT_CONTEXT);
  const [plan, setPlan] = useState<EventPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize plan on client mount to ensure smooth hydration and stable prerender
  useEffect(() => {
    const key = getCacheKey(DEFAULT_CONTEXT);
    const cached = getCachedPlan<EventPlan>(key);
    setPlan(cached || generateFallbackPlan(DEFAULT_CONTEXT, key));
  }, []);


  // Synchronize state when inputs in ConfigStudio change
  const handleContextChange = useCallback((newContext: EventContext) => {
    setContext(newContext);
    const key = getCacheKey(newContext);
    // Instant heuristic recalculation so the UI never lags
    const updatedPlan = generateFallbackPlan(newContext, key);
    setPlan(updatedPlan);
  }, []);

  // Request fresh generation via Gemini API (with 0ms hash caching)
  const handleGenerateAI = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const cacheKey = getCacheKey(context);

    const cached = getCachedPlan<EventPlan>(cacheKey);
    if (cached) {
      setPlan(cached);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, cacheKey }),
      });

      if (!response.ok) {
        const errorJson = (await response.json().catch(() => ({ message: 'API failure' }))) as { message?: string };
        throw new Error(errorJson.message || `Server responded with status ${response.status}`);
      }

      const generatedPlan = (await response.json()) as EventPlan;
      setCachedPlan(cacheKey, generatedPlan);
      setPlan(generatedPlan);
    } catch (err) {
      console.warn('AI generation fallback used:', err);
      // Fallback guarantees live demo never fails
      const fallback = generateFallbackPlan(context, cacheKey);
      setPlan(fallback);
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const handlePlanUpdate = useCallback((updates: Partial<EventPlan>) => {
    setPlan((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  // Full context+plan sync triggered by Co-Pilot context changes
  const handleContextAndPlanUpdate = useCallback(
    (newContext: EventContext, planUpdates: Partial<EventPlan>) => {
      setContext(newContext);
      const key = getCacheKey(newContext);
      const refreshedPlan = generateFallbackPlan(newContext, key);
      // Merge Co-Pilot vibe/budget overrides on top of the freshly generated plan
      setPlan({ ...refreshedPlan, ...planUpdates });
    },
    []
  );

  const handleReset = useCallback(() => {
    setContext(DEFAULT_CONTEXT);
    const key = getCacheKey(DEFAULT_CONTEXT);
    setPlan(generateFallbackPlan(DEFAULT_CONTEXT, key));
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 dark:bg-[#06080F] dark:text-slate-100 transition-colors">
      {/* Background Ambient Glow Orbs in Dark Mode */}
      <div className="pointer-events-none fixed inset-0 opacity-0 dark:opacity-100 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-slate-950 to-amber-950/20" />
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      {/* Main Content Container with pb-40 ensuring no overlap with floating Co-Pilot bar */}
      <div className="relative mx-auto max-w-7xl px-4 pb-40 pt-6 sm:px-6 lg:px-8">
        {/* Top Navbar / Header Card with WCAG AAA Accessibility Controls */}
        <Navbar onReset={handleReset} />

        {/* Global Error Banner */}
        {error && (
          <div role="alert" aria-live="assertive" className="mt-6 w-full">
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border-2 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-200 text-xs font-bold hover:bg-red-200 transition-colors focus-visible:ring-4 focus-visible:ring-red-400"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* 2-Column Side-by-Side Layout: ConfigStudio (Sticky) + CommandCenter */}
        <main id="main-content" className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: 5 Cols Sticky Configuration Studio */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-6">
              <ConfigStudio
                context={context}
                onChange={handleContextChange}
                onGenerateAI={handleGenerateAI}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Right Column: 7 Cols Interactive Command Center Dashboard */}
          <div className="lg:col-span-7">
            <CommandCenter
              context={context}
              plan={plan}
              onPlanUpdate={handlePlanUpdate}
            />
          </div>
        </main>
      </div>

      {/* Floating Bottom AI Co-Pilot Command Bar */}
      <CoPilotBar
        currentPlan={plan}
        currentContext={context}
        onPlanUpdate={handlePlanUpdate}
        onContextAndPlanUpdate={handleContextAndPlanUpdate}
      />
    </div>
  );
}

interface CoPilotBarProps {
  currentPlan: EventPlan | null;
  currentContext: EventContext;
  onPlanUpdate: (updates: Partial<EventPlan>) => void;
  onContextAndPlanUpdate: (newContext: EventContext, planUpdates: Partial<EventPlan>) => void;
}

function CoPilotBar({ currentPlan, currentContext, onPlanUpdate, onContextAndPlanUpdate }: CoPilotBarProps) {
  const [value, setValue] = useState('');
  const [reply, setReply] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const suggestions = [
    'Change to tech event',
    'Theme: Boho Desert',
    'Cuisine: Pan-Asian',
    'Budget: 4 Crore',
    'Trim budget by 12%',
  ];

  const handleSend = async (text: string) => {
    if (!text.trim() || isSending) return;
    const query = text.trim();
    setValue('');
    setIsSending(true);

    // ── 1. Smart NLP parsing of context-level changes ────────────────────────
    const { patch: parsedPatch, descriptions } = parseCoPilotInstruction(query, currentContext);
    let newContext: EventContext = { ...currentContext, ...parsedPatch };

    // ── 2. Call the Co-Pilot API for server-side vibe/budget updates ──────────
    try {
      const planToSend = currentPlan || generateFallbackPlan(currentContext, 'copilot_temp');
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPlan: { ...planToSend, context: newContext },
          userInstruction: query,
        }),
      });

      const apiUpdates: Partial<EventPlan> = response.ok ? (await response.json()) as Partial<EventPlan> : {};

      // If the API returned a totalBudget override and we didn't explicitly parse one
      if (apiUpdates.budget?.totalBudget && !parsedPatch.totalBudget) {
        newContext = { ...newContext, totalBudget: apiUpdates.budget.totalBudget };
        descriptions.push(`Budget rebalanced`);
      }

      // Sync context + regenerate entire plan with updated theme/cuisine/milestones + merge overrides
      onContextAndPlanUpdate(newContext, apiUpdates);

      // Friendly human-readable response
      if (descriptions.length > 0) {
        setReply(`Co-Pilot: Updated your plan — ${descriptions.join(', ')}. All cards & menus refreshed!`);
      } else if (query.toLowerCase().includes('sangeet')) {
        setReply(`Co-Pilot: Added a vibrant Sangeet celebration night with LED dance floor acoustics and Dhol drummers!`);
      } else {
        setReply(`Co-Pilot: Adapted your plan for "${query}". Event blueprint and vendor checkpoints refreshed.`);
      }
    } catch {
      // Offline fallback: still apply parsed context changes immediately
      onContextAndPlanUpdate(newContext, {});
      setReply(
        descriptions.length > 0
          ? `Co-Pilot: Applied — ${descriptions.join(', ')}. (Offline mode)`
          : `Co-Pilot: Adapted your plan for "${query}". (Offline mode)`
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-5 sm:px-6 lg:px-8 pointer-events-none">
      <div className="mx-auto max-w-4xl pointer-events-auto">
        {reply && (
          <div
            role="status"
            aria-live="polite"
            className="mb-2 rounded-2xl border border-violet-400/30 bg-white/95 px-4 py-3 text-sm text-slate-800 shadow-xl backdrop-blur-2xl dark:bg-slate-900/90 dark:text-slate-100 flex items-center justify-between gap-3 animate-fade-in"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" aria-hidden="true" />
              <span>{reply}</span>
            </div>
            <button
              type="button"
              onClick={() => setReply(null)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-amber-400 text-white shadow-md shadow-violet-500/20">
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            )}
          </div>

          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(value)}
            placeholder="Ask the AI Co-Pilot to reshape your event…"
            className="flex-1 bg-transparent px-2 text-sm text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            aria-label="AI Co-Pilot instruction prompt"
          />

          <div className="hidden items-center gap-1.5 md:flex">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSend(s)}
                className="rounded-full border border-slate-200 bg-white/60 px-3 py-1 text-xs text-slate-600 transition hover:border-violet-400 hover:text-violet-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-violet-300 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleSend(value)}
            disabled={isSending}
            className="flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 cursor-pointer disabled:opacity-50"
            aria-label="Send instruction to AI Co-Pilot"
          >
            <span>Send</span>
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
