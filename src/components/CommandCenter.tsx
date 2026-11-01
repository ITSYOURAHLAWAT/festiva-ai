'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Crown,
  Cake,
  Users,
  Sparkles,
  Utensils,
  Calendar,
  MapPin,
  ShieldCheck,
  Sliders,
  Wand2,
  Check,
  Clock,
  MessageSquareQuote,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { EventContext, EventPlan, BudgetCategory, Milestone, Vendor } from '@/types';
import { calculateBudgetBreakdown, rebalanceBudget } from '@/services/budgetMath';

interface CommandCenterProps {
  context: EventContext;
  plan?: EventPlan | null;
  onPlanUpdate?: (updates: Partial<EventPlan>) => void;
  onContextUpdate?: (updates: Partial<EventContext>) => void;
}

const DEFAULT_ALLOCATIONS = [
  { key: 'Venue', color: 'bg-violet-500', ring: '#8b5cf6' },
  { key: 'Catering', color: 'bg-amber-500', ring: '#f59e0b' },
  { key: 'Decor', color: 'bg-emerald-500', ring: '#10b981' },
  { key: 'Entertainment', color: 'bg-rose-500', ring: '#f43f5e' },
  { key: 'Photography', color: 'bg-sky-500', ring: '#0ea5e9' },
  { key: 'Emergency Buffer', color: 'bg-slate-500', ring: '#64748b' },
];

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300',
  high: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  medium: 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300',
  low: 'border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-300',
};

export function CommandCenter({
  context,
  plan,
  onPlanUpdate,
}: CommandCenterProps) {
  // If plan exists, derive budget breakdown from it; otherwise calculate dynamically
  const calculatedBudget = useMemo(() => calculateBudgetBreakdown(context), [context]);
  const activeBudget = plan?.budget || calculatedBudget;

  const [categories, setCategories] = useState<BudgetCategory[]>(activeBudget.categories);

  // Sync categories whenever activeBudget updates (e.g. persona switch or budget changes)
  useEffect(() => {
    setCategories(activeBudget.categories);
  }, [activeBudget.categories]);

  const [scriptOpen, setScriptOpen] = useState(false);
  const [selectedVendorForScript, setSelectedVendorForScript] = useState<string | null>(null);

  const [now, setNow] = useState<number>(0);
  useEffect(() => {
    setNow(Date.now());
  }, []);

  // Dynamic future-calculated milestones relative to context.eventDate
  const dynamicMilestones = useMemo(() => {
    const eventTime = new Date(context.eventDate).getTime();
    const currentTime = now || eventTime - 180 * 86400000;
    const daysUntil = Math.max(0, Math.ceil((eventTime - currentTime) / 86400000));

    const steps = [
      {
        title: `Lock ${context.eventType} venue & finalize date`,
        offsetDays: Math.min(daysUntil, 180),
        priority: 'critical' as const,
        phase: 'Milestone 1',
      },
      {
        title: `Book catering tasting for ${context.cuisinePreference} menu`,
        offsetDays: Math.min(daysUntil, 90),
        priority: 'high' as const,
        phase: 'Milestone 2',
      },
      {
        title: `Finalize ${context.culturalTheme} decor moodboard & florals`,
        offsetDays: Math.min(daysUntil, 45),
        priority: 'medium' as const,
        phase: 'Milestone 3',
      },
      {
        title: `Send formal invitations to ${context.guestCount} guests`,
        offsetDays: Math.min(daysUntil, 30),
        priority: 'high' as const,
        phase: 'Milestone 4',
      },
      {
        title: 'Confirm run-of-show & emergency contingency checklist',
        offsetDays: Math.min(daysUntil, 7),
        priority: 'critical' as const,
        phase: 'Milestone 5',
      },
    ];

    return steps.map((s, i) => {
      // Calculate due date in future: Event Date minus offsetDays
      const due = new Date(eventTime - s.offsetDays * 86400000);
      return {
        id: `ms-${i}`,
        title: s.title,
        priority: s.priority,
        due,
        dueLabel: due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        isFuture: due.getTime() >= (now || 0),
      };
    });
  }, [context.eventDate, context.eventType, context.cuisinePreference, context.culturalTheme, context.guestCount, now]);

  // Default vendors
  const initialVendors: Array<{ id: string; name: string; category: string; done: boolean; quote?: number }> = useMemo(() => {
    if (plan?.vendors?.vendors?.length) {
      return plan.vendors.vendors.map((v) => ({
        id: v.id,
        name: v.name,
        category: v.category,
        done: v.status === 'confirmed' || v.status === 'booked',
        quote: v.actualQuote || v.budget,
      }));
    }
    return [
      { id: 'v1', name: 'The Grand Heritage Venue', category: 'Venue', done: true, quote: Math.round(context.totalBudget * 0.3) },
      { id: 'v2', name: 'Saffron & Spice Gourmet Catering', category: 'Catering', done: true, quote: Math.round(context.totalBudget * 0.35) },
      { id: 'v3', name: 'Bloom & Petal Decor Design', category: 'Decor', done: false, quote: Math.round(context.totalBudget * 0.12) },
      { id: 'v4', name: 'DJ Nova Live & Acoustics', category: 'Entertainment', done: false, quote: Math.round(context.totalBudget * 0.1) },
      { id: 'v5', name: 'Lenscraft Cinema & Photo', category: 'Photography', done: false, quote: Math.round(context.totalBudget * 0.08) },
    ];
  }, [plan, context.totalBudget]);

  const [vendorList, setVendorList] = useState(initialVendors);

  const toggleVendor = (id: string) => {
    setVendorList((prev) =>
      prev.map((v) => (v.id === id ? { ...v, done: !v.done } : v))
    );
  };

  const handleSliderChange = (index: number, newPercentage: number) => {
    const updated = rebalanceBudget(activeBudget.categories, index, newPercentage, context.totalBudget);
    setCategories(updated);
    if (onPlanUpdate && plan) {
      onPlanUpdate({
        budget: {
          ...plan.budget,
          categories: updated,
        },
      });
    }
  };

  const totalPercentage = categories.reduce((sum, c) => sum + c.percentage, 0) || 100;
  const perGuest = context.guestCount > 0 ? Math.round(context.totalBudget / context.guestCount) : 0;

  const countdown = useMemo(() => {
    const target = new Date(context.eventDate).getTime();
    const currentTime = now || target - 180 * 86400000;
    return Math.max(0, Math.ceil((target - currentTime) / 86400000));
  }, [context.eventDate, now]);

  const doneCount = vendorList.filter((v) => v.done).length;

  const eventTypeLower = String(context.eventType || '').toLowerCase();
  const EventIcon =
    eventTypeLower === 'wedding'
      ? Crown
      : eventTypeLower === 'birthday'
      ? Cake
      : Users;

  return (
    <div className="space-y-6">
      {/* Top Event Blueprint Card */}
      <section
        aria-label="Live Event Blueprint"
        className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40"
      >
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-amber-400 text-white shadow-lg shadow-violet-500/20">
              <EventIcon className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-500 dark:text-violet-300">
                Live Event Blueprint
              </p>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
                {context.eventTitle || 'Untitled Celebration'}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  {context.eventDate}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {context.city || '—'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  {context.guestCount} guests
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {context.culturalTheme}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-300">
              <Utensils className="h-3.5 w-3.5" aria-hidden="true" />
              {context.cuisinePreference}
            </span>
          </div>
        </div>

        {/* 4 Quick Stat Tiles */}
        <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total Budget" value={`₹${context.totalBudget.toLocaleString('en-IN')}`} />
          <Stat label="Per Guest" value={`₹${perGuest.toLocaleString('en-IN')}`} />
          <Stat label="Days to Go" value={`${countdown}`} />
          <Stat label="Vendors Ready" value={`${doneCount}/${vendorList.length}`} />
        </div>
      </section>

      {/* 2-Column Section: Donut Budget & Milestone Timeline */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Budget Allocation Card with SVG Donut Chart */}
        <section
          aria-label="Budget Allocation"
          className="rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-violet-500" aria-hidden="true" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Budget Allocation
              </h3>
            </div>
            <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
              {Math.round(totalPercentage)}% Distributed
            </span>
          </div>

          {/* SVG Donut Chart and Legend */}
          <div className="mt-5 flex items-center gap-6">
            <Donut categories={categories} total={totalPercentage} />
            <div className="flex-1 space-y-2">
              {categories.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', c.color || 'bg-violet-500')} />
                  <span className="flex-1 text-slate-600 dark:text-slate-300 truncate">{c.name}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    ₹{c.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Sliders */}
          <div className="mt-6 space-y-3" role="group" aria-label="Adjust budget percentages">
            {categories.map((cat, idx) => (
              <div key={cat.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <span>{cat.icon || '•'}</span>
                    <span>{cat.name}</span>
                    {cat.alert && (
                      <AlertTriangle className="h-3 w-3 text-amber-500" aria-label={cat.alert} />
                    )}
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {cat.percentage.toFixed(1)}% (₹{cat.amount.toLocaleString('en-IN')})
                  </span>
                </div>
                <input
                  type="range"
                  min={cat.minPercent || 5}
                  max={60}
                  step={0.5}
                  value={cat.percentage}
                  onChange={(e) => handleSliderChange(idx, Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-violet-500 dark:bg-white/10"
                  aria-label={`Adjust ${cat.name} percentage`}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Milestone Timeline with Priority Pills & Future Dates */}
        <section
          aria-label="Milestone Timeline"
          className="rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" aria-hidden="true" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Milestone Timeline
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {countdown} days remaining
            </span>
          </div>

          <ol className="mt-5 space-y-4">
            {dynamicMilestones.map((m, i) => (
              <li key={m.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0',
                      m.isFuture
                        ? 'bg-violet-500/15 text-violet-600 dark:text-violet-300'
                        : 'bg-rose-500 text-white'
                    )}
                  >
                    {i + 1}
                  </span>
                  {i < dynamicMilestones.length - 1 && (
                    <span className="mt-1 h-8 w-px bg-slate-200 dark:bg-white/10" aria-hidden="true" />
                  )}
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {m.title}
                    </p>
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shrink-0',
                        PRIORITY_STYLES[m.priority] || PRIORITY_STYLES.medium
                      )}
                    >
                      {m.priority}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Target due by {m.dueLabel}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Vendor Checklist Card */}
      <section
        aria-label="Vendor Checklist"
        className="rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Vendor Checklist &amp; Quotations
            </h3>
          </div>
          <Button
            type="button"
            onClick={() => {
              setSelectedVendorForScript(null);
              setScriptOpen(true);
            }}
            className="gap-1.5 bg-gradient-to-r from-violet-600 to-amber-500 text-white hover:opacity-90 shadow-md shadow-violet-500/20"
          >
            <Wand2 className="h-4 w-4" aria-hidden="true" />
            AI Negotiation Script
          </Button>
        </div>

        {/* Vendor Progress */}
        <div className="mt-4">
          <Progress value={(doneCount / (vendorList.length || 1)) * 100} className="h-2" />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {doneCount} of {vendorList.length} vendors confirmed
          </p>
        </div>

        {/* Vendor Grid */}
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2" role="list">
          {vendorList.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => toggleVendor(v.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition cursor-pointer focus-visible:ring-4 focus-visible:ring-violet-500',
                  v.done
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-slate-200 bg-white/50 hover:border-violet-300 dark:border-white/10 dark:bg-white/5'
                )}
                aria-label={`Mark ${v.name} (${v.category}) as ${v.done ? 'pending' : 'confirmed'}`}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors',
                    v.done
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 dark:border-white/20'
                  )}
                  aria-hidden="true"
                >
                  {v.done && <Check className="h-3.5 w-3.5" />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                    {v.name}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {v.category} {v.quote ? `• ₹${v.quote.toLocaleString('en-IN')}` : ''}
                  </span>
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVendorForScript(v.category);
                    setScriptOpen(true);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Generate script for this vendor"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                      setSelectedVendorForScript(v.category);
                      setScriptOpen(true);
                    }
                  }}
                >
                  <MessageSquareQuote className="h-4 w-4" aria-hidden="true" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* AI Negotiation Script Modal Dialog */}
      <Dialog open={scriptOpen} onOpenChange={setScriptOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif text-xl">
              <MessageSquareQuote className="h-5 w-5 text-violet-500" aria-hidden="true" />
              AI Negotiation Script
            </DialogTitle>
            <DialogDescription>
              Custom-crafted for {context.eventTitle || 'your celebration'} · {context.guestCount} guests in {context.city}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5 space-y-2">
              <p className="font-mono text-xs text-violet-600 dark:text-violet-400 uppercase font-semibold">
                Draft Email / WhatsApp Message:
              </p>
              <p className="italic">
                "Hello! We are planning {context.eventTitle || 'our celebration'} for {context.guestCount} guests in {context.city || 'your city'} on {context.eventDate}, celebrating with a {context.culturalTheme} vibe and {context.cuisinePreference} catering.
                {selectedVendorForScript ? ` We are reviewing options for ${selectedVendorForScript}.` : ''} Our target budget allocation is ₹{context.totalBudget.toLocaleString('en-IN')}. Could you kindly provide your most competitive rate card, package inclusions, and any off-peak or combo discounts available?"
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                Pro Negotiation Strategy:
              </p>
              <p>
                1. Offer a 25% immediate deposit with balance upon milestone sign-off.
              </p>
              <p>
                2. Request complimentary add-ons (welcome mocktail station or extended sound curfew) instead of direct price cuts if rates are firm.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dynamic Theme & Cuisine Vibe Showcase Card */}
      {plan?.vibe && (
        <section
          aria-label="Theme, Menu & Vibe Studio Preview"
          className="rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 space-y-5 transition-all"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 pb-4 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-amber-500 text-white shadow-md">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-50">
                  Theme &amp; Tasting Studio
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Curated {context.culturalTheme} Palette &amp; {context.cuisinePreference} Gastronomy
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                Palette: {plan.vibe.colorPalette.name}
              </span>
            </div>
          </div>

          {/* Color Swatches Grid */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
              Harmonized Palette Swatches ({context.culturalTheme})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: 'Primary Tone', hex: plan.vibe.colorPalette.primary },
                { label: 'Secondary Tone', hex: plan.vibe.colorPalette.secondary },
                { label: 'Vibrant Accent', hex: plan.vibe.colorPalette.accent },
                { label: 'Neutral Canvas', hex: plan.vibe.colorPalette.neutral },
              ].map((swatch, idx) => (
                <div
                  key={idx}
                  className="group rounded-2xl border border-slate-200/80 bg-white/80 p-2.5 shadow-sm dark:border-white/10 dark:bg-white/5 transition-transform hover:scale-[1.02]"
                >
                  <div
                    className="h-12 w-full rounded-xl shadow-inner border border-black/10 dark:border-white/10 mb-2 transition-transform"
                    style={{ backgroundColor: swatch.hex }}
                    role="img"
                    aria-label={`${swatch.label} (${swatch.hex})`}
                  />
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    {swatch.label}
                  </p>
                  <p className="font-mono text-[10px] uppercase text-slate-400 dark:text-slate-500">
                    {swatch.hex}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Curated Tasting Menu */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Curated Tasting Menu ({context.cuisinePreference})
              </p>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                {plan.vibe.menuSuggestions.length} Courses Curated
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plan.vibe.menuSuggestions.map((course, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-1.5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-bold text-slate-900 dark:text-slate-100">
                      {course.course}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Course #{idx + 1}
                    </span>
                  </div>
                  <ul className="space-y-0.5 text-xs text-slate-700 dark:text-slate-300 pl-4 list-disc">
                    {course.items.map((item, j) => (
                      <li key={j} className="leading-snug">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] italic text-amber-700 dark:text-amber-300 pt-1">
                    ✓ {course.dietaryNotes}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Invitation Prose Preview */}
          <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/5 via-amber-500/5 to-transparent p-4">
            <div className="flex items-center gap-2 mb-1.5 text-violet-600 dark:text-violet-400">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Tailored Invitation Copy
              </span>
            </div>
            <p className="font-serif text-xs italic text-slate-700 dark:text-slate-300 leading-relaxed">
              "{plan.vibe.invitationWording}"
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-3.5 dark:border-white/10 dark:bg-white/5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

function Donut({ categories, total }: { categories: BudgetCategory[]; total: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const ringColors = ['#8b5cf6', '#f59e0b', '#10b981', '#f43f5e', '#0ea5e9', '#64748b'];

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="12"
          className="stroke-slate-200 dark:stroke-white/10"
        />
        {categories.map((c, i) => {
          const fraction = c.percentage / total;
          const dash = fraction * circumference;
          const el = (
            <circle
              key={c.name}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={ringColors[i % ringColors.length]}
              strokeWidth="12"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Allocated
        </span>
        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">100%</span>
      </div>
    </div>
  );
}
