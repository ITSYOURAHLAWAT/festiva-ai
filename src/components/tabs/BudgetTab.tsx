'use client';

import { useState, useCallback, useId } from 'react';
import { AlertTriangle, TrendingUp, Users, IndianRupee, RefreshCw, Sparkles, ShieldAlert } from 'lucide-react';
import type { BudgetBreakdown, EventContext } from '@/types';
import { rebalanceBudget } from '@/services/budgetMath';
import { useDebounce } from '@/hooks/useDebounce';

interface BudgetTabProps {
  budget: BudgetBreakdown;
  context: EventContext;
  onBudgetChange: (updated: BudgetBreakdown) => void;
}

export function BudgetTab({ budget, context, onBudgetChange }: BudgetTabProps) {
  const [whatIfGuests, setWhatIfGuests] = useState(context.guestCount);
  const [whatIfBudget, setWhatIfBudget] = useState(context.totalBudget);

  const whatIfGuestsInputId = useId();
  const whatIfBudgetInputId = useId();

  const debouncedGuests = useDebounce(whatIfGuests, 300);
  const debouncedBudget = useDebounce(whatIfBudget, 300);

  const whatIfPerGuest = debouncedGuests > 0 ? Math.round(debouncedBudget / debouncedGuests) : 0;

  const handleSliderChange = useCallback(
    (index: number, newPercentage: number) => {
      const updatedCategories = rebalanceBudget(budget.categories, index, newPercentage, budget.totalBudget);
      onBudgetChange({
        ...budget,
        categories: updatedCategories,
      });
    },
    [budget, onBudgetChange]
  );

  const formatINR = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const activeAlerts = budget.categories.filter((c) => c.alert);

  return (
    <section aria-labelledby="budget-architect-heading" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 id="budget-architect-heading" className="text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <IndianRupee className="w-5 h-5" aria-hidden="true" />
            </span>
            Smart Budget Architect & Re-balancer
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dynamic constraint re-balancer: adjusting any category proportionally re-distributes across remaining allocations while safeguarding statutory minimums.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Capital</span>
            <IndianRupee className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-50">
            {formatINR(budget.totalBudget)}
          </div>
          <p className="text-xs text-slate-400 mt-1">₹{(budget.totalBudget / 100000).toFixed(2)} Lakhs allocated</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Guest Scale</span>
            <Users className="w-4 h-4 text-pink-600 dark:text-pink-400" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-50">
            {context.guestCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">Confirmed attendee baseline</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Cost Per Guest</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-50">
            {formatINR(budget.perGuestCost)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Calculated spend density</p>
        </div>
      </div>

      {/* Underfunded Category Alerts */}
      {activeAlerts.length > 0 && (
        <div
          role="region"
          aria-label="Underfunded budget warnings"
          className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 space-y-2"
        >
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span>Underfunded Allocation Warning Detected ({activeAlerts.length})</span>
          </div>
          <ul className="space-y-1.5 pl-7 text-xs text-amber-700 dark:text-amber-300">
            {activeAlerts.map((cat) => (
              <li key={cat.name} className="list-disc leading-relaxed">
                <strong className="font-semibold">{cat.name}:</strong> {cat.alert}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Category Allocation Sliders */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Category-Wise Sliders (Proportional Lock)
          </h3>
          <span className="text-xs text-slate-400">Total: 100% Normalized</span>
        </div>

        <div className="space-y-5" role="group" aria-label="Budget categories">
          {budget.categories.map((cat, idx) => {
            const hasAlert = !!cat.alert;
            return (
              <div
                key={cat.name}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl" aria-hidden="true">{cat.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{cat.name}</span>
                        {hasAlert && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                            Underfunded
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        Min threshold: {cat.minPercent}% • ₹{(cat.amount / context.guestCount).toFixed(0)}/guest
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-base text-slate-900 dark:text-slate-50">{formatINR(cat.amount)}</div>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{cat.percentage.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3"
                  role="progressbar"
                  aria-valuenow={cat.percentage}
                  aria-valuemin={cat.minPercent}
                  aria-valuemax={80}
                  aria-label={`${cat.name} percentage`}
                >
                  <div
                    className={`h-full ${cat.color} transition-all duration-200 rounded-full`}
                    style={{ width: `${Math.min(100, Math.max(0, cat.percentage))}%` }}
                  />
                </div>

                {/* Slider */}
                <div className="flex items-center gap-3">
                  <label htmlFor={`slider-${idx}`} className="sr-only">
                    {cat.name} allocation slider
                  </label>
                  <input
                    id={`slider-${idx}`}
                    type="range"
                    min={cat.minPercent}
                    max={80}
                    step={0.5}
                    value={cat.percentage}
                    onChange={(e) => handleSliderChange(idx, parseFloat(e.target.value))}
                    className="w-full cursor-pointer accent-purple-600 focus-visible:ring-4 focus-visible:ring-purple-500 rounded"
                    aria-label={`Adjust ${cat.name} budget share`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive What-If Scenario Modifier */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-900 rounded-3xl p-6 sm:p-8 border border-purple-200 dark:border-purple-900/60 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-600 text-white">
            <RefreshCw className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Interactive &quot;What-If&quot; Scale & Capital Stress Tester
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simulate shifting parameters in real-time (300ms debounced feedback).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              <label htmlFor={whatIfGuestsInputId}>What-If Guest Attendance</label>
              <span className="text-purple-600 dark:text-purple-400">{whatIfGuests} Guests</span>
            </div>
            <input
              id={whatIfGuestsInputId}
              type="range"
              min="20"
              max="1500"
              step="10"
              value={whatIfGuests}
              onChange={(e) => setWhatIfGuests(parseInt(e.target.value))}
              className="w-full cursor-pointer accent-purple-600 focus-visible:ring-4 focus-visible:ring-purple-500 rounded"
              aria-label="What if guest count adjustment slider"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>20 (Intimate)</span>
              <span>1,500 (Grand Scale)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              <label htmlFor={whatIfBudgetInputId}>What-If Total Budget</label>
              <span className="text-amber-600 dark:text-amber-400">{formatINR(whatIfBudget)}</span>
            </div>
            <input
              id={whatIfBudgetInputId}
              type="range"
              min="50000"
              max="10000000"
              step="25000"
              value={whatIfBudget}
              onChange={(e) => setWhatIfBudget(parseFloat(e.target.value))}
              className="w-full cursor-pointer accent-amber-500 focus-visible:ring-4 focus-visible:ring-purple-500 rounded"
              aria-label="What if budget adjustment slider"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹50K</span>
              <span>₹1 Crore</span>
            </div>
          </div>
        </div>

        {/* Live Simulation Banner */}
        <div
          role="status"
          aria-live="polite"
          className={`p-4 rounded-2xl text-center text-xs font-bold border transition-colors ${
            whatIfPerGuest < 800
              ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900'
              : whatIfPerGuest < 2500
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
          }`}
        >
          Simulation Result: {formatINR(whatIfPerGuest)} spend per guest •{' '}
          {whatIfPerGuest < 800
            ? '⚠️ High Risk: Per-guest capital is inadequate for full catering & venue. Recommend pruning attendees or scaling budget.'
            : whatIfPerGuest < 2500
            ? '🟡 Balanced: Viable with diligent vendor negotiations and buffet catering selections.'
            : '✅ Premium: Ample headroom for signature experiences, lavish decor, and bespoke entertainment.'}
        </div>
      </div>

      {/* Strategic AI Recommendations */}
      {budget.recommendations && budget.recommendations.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-slate-200">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            <span>AI Budget Strategy Insights</span>
          </div>
          <ul className="space-y-2">
            {budget.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="text-purple-600 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
