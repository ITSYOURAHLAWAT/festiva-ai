'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Crown,
  Cake,
  Users,
  Sparkles,
  Utensils,
  Calendar,
  MapPin,
  Sliders,
  Wand2,
  Minus,
  Plus,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { EventContext, EventType, ThemePreference, CuisinePreference } from '@/types';
import { validateBudgetInput, validateGuestCountInput, validateEventDateInput, validateEventTitleInput, validateCityInput } from '@/services/security';

export type EventConfig = EventContext;

export interface ConfigStudioProps {
  context: EventContext;
  onChange: (c: EventContext) => void;
  onGenerateAI?: () => void;
  isLoading?: boolean;
}

const PERSONAS = [
  {
    label: 'Royal Wedding',
    icon: Crown,
    patch: {
      eventType: 'wedding' as EventType,
      eventTitle: "Aarav & Meera's Wedding",
      guestCount: 320,
      totalBudget: 4500000,
      culturalTheme: 'Royal Heritage' as ThemePreference,
      cuisinePreference: 'Rajasthani' as CuisinePreference,
      city: 'Udaipur',
    },
  },
  {
    label: '30th Milestone',
    icon: Cake,
    patch: {
      eventType: 'birthday' as EventType,
      eventTitle: "Riya's 30th Birthday",
      guestCount: 60,
      totalBudget: 350000,
      culturalTheme: 'Neon Retro' as ThemePreference,
      cuisinePreference: 'Continental' as CuisinePreference,
      city: 'Bengaluru',
    },
  },
  {
    label: 'Tech Meetup',
    icon: Users,
    patch: {
      eventType: 'community' as EventType,
      eventTitle: 'Bengaluru AI Founders Night',
      guestCount: 150,
      totalBudget: 180000,
      culturalTheme: 'Minimal Luxe' as ThemePreference,
      cuisinePreference: 'Fusion Tapas' as CuisinePreference,
      city: 'Bengaluru',
    },
  },
];

const THEMES: Array<{ label: ThemePreference; icon: typeof Crown }> = [
  { label: 'Royal Heritage', icon: Crown },
  { label: 'Neon Retro', icon: Sparkles },
  { label: 'Minimal Luxe', icon: Sliders },
  { label: 'Garden Bloom', icon: Sparkles },
  { label: 'Midnight Gold', icon: Crown },
  { label: 'Coastal Breeze', icon: MapPin },
  { label: 'Boho Desert', icon: Sparkles },
  { label: 'Art Deco', icon: Sliders },
];

const CUISINES: Array<{ label: CuisinePreference; icon: typeof Utensils }> = [
  { label: 'Rajasthani', icon: Utensils },
  { label: 'Continental', icon: Utensils },
  { label: 'Fusion Tapas', icon: Utensils },
  { label: 'South Indian', icon: Utensils },
  { label: 'Pan-Asian', icon: Utensils },
  { label: 'Mughlai', icon: Utensils },
  { label: 'Vegan Garden', icon: Utensils },
  { label: 'Dessert Bar', icon: Cake },
];

export function ConfigStudio({
  context,
  onChange,
  onGenerateAI,
  isLoading = false,
}: ConfigStudioProps) {
  const [activePersona, setActivePersona] = useState<string>('Royal Wedding');
  const [isEdgeCase, setIsEdgeCase] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute live validation errors for high-impact edge-case testing
  const titleValidation = validateEventTitleInput(context.eventTitle || '');
  const budgetValidation = validateBudgetInput(context.totalBudget);
  const guestValidation = validateGuestCountInput(context.guestCount);
  const dateValidation = mounted ? validateEventDateInput(context.eventDate) : { valid: true };
  const cityValidation = validateCityInput(context.city);

  const applyPersona = (patch: typeof PERSONAS[0]['patch'], label: string) => {
    setIsEdgeCase(false);
    setActivePersona(label);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 180);
    onChange({
      ...context,
      ...patch,
      eventDate: futureDate.toISOString().split('T')[0],
    });
  };

  const testEdgeCases = useCallback(() => {
    setIsEdgeCase(true);
    setActivePersona('Edge Case');
    onChange({
      ...context,
      eventTitle: '',
      guestCount: 0,
      totalBudget: 0,
      eventDate: '2020-01-01', // Past date edge case
      city: '',
      culturalTheme: 'Minimal Luxe',
      cuisinePreference: 'Vegan Garden',
    });
  }, [context, onChange]);

  const update = (patch: Partial<EventContext>) => {
    onChange({ ...context, ...patch });
  };

  return (
    <section
      aria-label="Event Configuration Studio"
      className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 sm:p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-violet-500" aria-hidden="true" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Event Configuration Studio
          </h2>
        </div>
        {onGenerateAI && (
          <Button
            type="button"
            size="sm"
            onClick={onGenerateAI}
            disabled={isLoading}
            className="gap-1.5 bg-gradient-to-r from-violet-600 to-amber-500 text-white hover:opacity-90 shadow-md shadow-violet-500/20"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>AI Refresh</span>
          </Button>
        )}
      </div>

      {/* Persona and Edge-Case Quick Pills */}
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Quick-load personas and edge-cases">
        {PERSONAS.map((p) => {
          const Icon = p.icon;
          const active = !isEdgeCase && activePersona === p.label;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPersona(p.patch, p.label)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition cursor-pointer focus-visible:ring-4 focus-visible:ring-violet-500',
                active
                  ? 'border-violet-500 bg-violet-500 text-white shadow-sm shadow-violet-500/30'
                  : 'border-slate-200 bg-white/60 text-slate-600 hover:border-violet-400 hover:text-violet-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-violet-300'
              )}
              aria-pressed={active}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {p.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={testEdgeCases}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-500',
            isEdgeCase
              ? 'border-amber-400 bg-amber-400 text-slate-900 shadow-sm shadow-amber-400/30'
              : 'border-slate-900 bg-slate-900 text-white hover:bg-slate-700 dark:border-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200'
          )}
          aria-pressed={isEdgeCase}
          aria-label="Test edge cases with invalid budget, guests, and past date"
        >
          <Sliders className="h-3.5 w-3.5" aria-hidden="true" />
          Test Edge Cases
        </button>
      </div>

      {/* Form Fields */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Event Name */}
        <Field label="Event Name" icon={Sparkles} className="sm:col-span-2">
          <Input
            value={context.eventTitle || ''}
            onChange={(e) => update({ eventTitle: e.target.value })}
            placeholder="Name your celebration"
            aria-invalid={!titleValidation.valid}
            aria-describedby={!titleValidation.valid ? 'title-edge-alert' : undefined}
          />
          {!titleValidation.valid && (
            <p id="title-edge-alert" role="alert" className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {titleValidation.error}
            </p>
          )}
        </Field>

        {/* Date */}
        <Field label="Date" icon={Calendar}>
          <Input
            type="date"
            value={context.eventDate}
            onChange={(e) => update({ eventDate: e.target.value })}
            aria-invalid={!dateValidation.valid}
            aria-describedby={!dateValidation.valid ? 'date-edge-alert' : undefined}
          />
          {!dateValidation.valid && (
            <p id="date-edge-alert" role="alert" className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {dateValidation.error}
            </p>
          )}
        </Field>

        {/* City */}
        <Field label="City" icon={MapPin}>
          <Input
            value={context.city}
            onChange={(e) => update({ city: e.target.value })}
            placeholder="City"
            aria-invalid={!cityValidation.valid}
            aria-describedby={!cityValidation.valid ? 'city-edge-alert' : undefined}
          />
          {!cityValidation.valid && (
            <p id="city-edge-alert" role="alert" className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {cityValidation.error}
            </p>
          )}
        </Field>

        {/* Guest Count */}
        <Field label="Guest Count" icon={Users}>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => update({ guestCount: Math.max(0, context.guestCount - 10) })}
              aria-label="Decrease guest count by 10"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Input
              type="number"
              className="text-center font-semibold"
              value={context.guestCount}
              onChange={(e) => update({ guestCount: parseInt(e.target.value) || 0 })}
              aria-label="Guest count"
              aria-invalid={!guestValidation.valid}
              aria-describedby={!guestValidation.valid ? 'guest-edge-alert' : undefined}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => update({ guestCount: context.guestCount + 10 })}
              aria-label="Increase guest count by 10"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          {!guestValidation.valid && (
            <p id="guest-edge-alert" role="alert" className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {guestValidation.error}
            </p>
          )}
        </Field>

        {/* Budget */}
        <Field label="Total Budget" icon={Sparkles}>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-amber-600 dark:text-amber-400">
              ₹
            </span>
            <Input
              type="number"
              className="pl-8 font-semibold"
              value={context.totalBudget}
              onChange={(e) => update({ totalBudget: Number(e.target.value) || 0 })}
              aria-label="Total budget in Rupees"
              aria-invalid={!budgetValidation.valid}
              aria-describedby={!budgetValidation.valid ? 'budget-edge-alert' : undefined}
            />
          </div>
          {!budgetValidation.valid && (
            <p id="budget-edge-alert" role="alert" className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {budgetValidation.error}
            </p>
          )}
        </Field>
      </div>

      {/* 2x4 Theme Selection Grid */}
      <div className="mt-6">
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Theme
        </Label>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Cultural and theme options">
          {THEMES.map((t) => {
            const Icon = t.icon;
            const active = context.culturalTheme === t.label;
            return (
              <button
                key={t.label}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => update({ culturalTheme: t.label })}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-medium transition cursor-pointer focus-visible:ring-4 focus-visible:ring-violet-500',
                  active
                    ? 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300'
                    : 'border-slate-200 bg-white/50 text-slate-500 hover:border-violet-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg',
                    active
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300'
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2x4 Cuisine Selection Grid */}
      <div className="mt-6">
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Cuisine
        </Label>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Cuisine preference options">
          {CUISINES.map((c) => {
            const Icon = c.icon;
            const active = context.cuisinePreference === c.label;
            return (
              <button
                key={c.label}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => update({ cuisinePreference: c.label })}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-medium transition cursor-pointer focus-visible:ring-4 focus-visible:ring-amber-500',
                  active
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                    : 'border-slate-200 bg-white/50 text-slate-500 hover:border-amber-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg',
                    active
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300'
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {c.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  icon: Icon,
  children,
  className,
}: {
  label: string;
  icon: typeof Crown;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <Icon className="h-3.5 w-3.5 text-violet-500" aria-hidden="true" />
        {label}
      </Label>
      {children}
    </div>
  );
}
