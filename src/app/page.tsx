'use client';

import { useState, useCallback } from 'react';
import type { EventContext, EventPlan } from '@/types';
import { getCacheKey, getCachedPlan, setCachedPlan } from '@/services/cache';
import { Navbar } from '@/components/Navbar';
import { IntakeForm } from '@/components/IntakeForm';
import { Dashboard } from '@/components/Dashboard';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Sparkles, AlertTriangle } from 'lucide-react';

export default function HomePage() {
  const [step, setStep] = useState<'intake' | 'dashboard'>('intake');
  const [plan, setPlan] = useState<EventPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCoPilotLoading, setIsCoPilotLoading] = useState(false);

  const handleFormSubmit = useCallback(async (context: EventContext) => {
    setIsLoading(true);
    setError(null);

    const cacheKey = getCacheKey(context);

    // 0ms Cache Check for identical parameters
    const cachedPlan = getCachedPlan<EventPlan>(cacheKey);
    if (cachedPlan) {
      setPlan(cachedPlan);
      setStep('dashboard');
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
      setStep('dashboard');
    } catch (err) {
      console.error('Submission error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to generate event plan. Please check inputs and retry.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePlanUpdate = useCallback((updates: Partial<EventPlan>) => {
    setPlan((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const handleCoPilotInstruction = useCallback(
    async (instruction: string) => {
      if (!plan) return;
      setIsCoPilotLoading(true);
      try {
        const response = await fetch('/api/copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPlan: plan, userInstruction: instruction }),
        });

        if (!response.ok) {
          throw new Error('Co-pilot could not apply modification.');
        }

        const updates = (await response.json()) as Partial<EventPlan>;
        setPlan((prev) => (prev ? { ...prev, ...updates } : prev));
      } finally {
        setIsCoPilotLoading(false);
      }
    },
    [plan]
  );

  const handleReset = useCallback(() => {
    setStep('intake');
    setError(null);
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Navigation Bar with Accessibility Controls */}
      <Navbar onReset={handleReset} />

      {/* Screen Overlay Loading State */}
      {isLoading && <LoadingScreen />}

      {/* Global Error Banner (Aria-live asserted) */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="max-w-4xl mx-auto px-4 mt-6 w-full"
        >
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border-2 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-200 text-xs font-bold hover:bg-red-200 transition-colors focus-visible:ring-4 focus-visible:ring-red-400"
              aria-label="Dismiss error notification"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Context Intake Form */}
      {step === 'intake' && (
        <IntakeForm onSubmit={handleFormSubmit} isLoading={isLoading} />
      )}

      {/* Step 2: Interactive 4-Tab Command Center Dashboard */}
      {step === 'dashboard' && plan && (
        <Dashboard
          plan={plan}
          onPlanUpdate={handlePlanUpdate}
          onCoPilotInstruction={handleCoPilotInstruction}
          isCoPilotLoading={isCoPilotLoading}
          onReset={handleReset}
        />
      )}

      {/* Semantic Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            <span>FestivaAI — Hackathon Challenge 5</span>
          </div>
          <p className="text-[11px]">
            WCAG AAA Accessible • Zero Heavy Assets (&lt;1MB) • Google Gemini 1.5 Flash
          </p>
        </div>
      </footer>
    </div>
  );
}
