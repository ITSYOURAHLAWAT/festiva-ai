'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Calendar, Users, IndianRupee, MapPin, Palette, Utensils,
  Sparkles, ArrowRight, AlertCircle, BookmarkCheck
} from 'lucide-react';
import type { EventContext, EventType, ThemePreference, CuisinePreference } from '@/types';
import { QUICK_TEMPLATES } from '@/services/templates';
import { useFormValidation } from '@/hooks/useFormValidation';

interface IntakeFormProps {
  onSubmit: (context: EventContext) => void;
  isLoading: boolean;
}

const EVENT_TYPES: Array<{ value: EventType; label: string; emoji: string; desc: string }> = [
  { value: 'wedding', label: 'Wedding', emoji: '💍', desc: 'Ceremonies, reception & grand guest hospitality' },
  { value: 'birthday', label: 'Birthday', emoji: '🎂', desc: 'Milestone bashes, sundowners & intimate parties' },
  { value: 'community', label: 'Community Event', emoji: '🤝', desc: 'Conferences, hackathons, meetups & galas' },
];

const THEMES: Array<{ value: ThemePreference; label: string; icon: string }> = [
  { value: 'royal', label: 'Royal & Grand', icon: '👑' },
  { value: 'rustic', label: 'Rustic & Earthy', icon: '🌾' },
  { value: 'modern', label: 'Chic Modern', icon: '🏙️' },
  { value: 'boho', label: 'Boho Sunset', icon: '🌿' },
  { value: 'traditional', label: 'Auspicious Heritage', icon: '🪔' },
  { value: 'minimalist', label: 'Minimalist Clean', icon: '◻️' },
  { value: 'tropical', label: 'Tropical Lush', icon: '🌺' },
  { value: 'vintage', label: 'Classic Vintage', icon: '🎞️' },
];

const CUISINES: Array<{ value: CuisinePreference; label: string; icon: string }> = [
  { value: 'north-indian', label: 'North Indian Royal', icon: '🫕' },
  { value: 'south-indian', label: 'South Indian Traditional', icon: '🍛' },
  { value: 'vegetarian', label: '100% Pure Vegetarian', icon: '🥗' },
  { value: 'vegan', label: 'Plant-Based Vegan', icon: '🌱' },
  { value: 'non-vegetarian', label: 'Gourmet Non-Veg', icon: '🍗' },
  { value: 'mixed', label: 'Mixed Continental & Indian', icon: '🍽️' },
  { value: 'continental', label: 'Artisanal Continental', icon: '🥘' },
  { value: 'fusion', label: 'Global Fusion Tapas', icon: '🌮' },
];

export function IntakeForm({ onSubmit, isLoading }: IntakeFormProps) {
  const [minDate, setMinDate] = useState<string>('2026-01-01');
  const [form, setForm] = useState<Partial<EventContext>>({
    eventType: 'wedding',
    culturalTheme: 'royal',
    cuisinePreference: 'north-indian',
    guestCount: 250,
    totalBudget: 1500000,
    city: 'Jaipur',
    eventDate: '2027-04-18',
    additionalNotes: 'Dreaming of sunset pheras with royal acoustic Shehnai and Rajasthani dessert counters.',
  });

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setMinDate(d.toISOString().split('T')[0]);
  }, []);

  const { errors, validateAll, clearError, setErrors } = useFormValidation();

  const handleTemplateLoad = useCallback((templateId: string) => {
    const template = QUICK_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 120);
    setForm({
      ...template.context,
      eventDate: futureDate.toISOString().split('T')[0],
    });
    setErrors({});
  }, [setErrors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll(form)) return;
    onSubmit(form as EventContext);
  };

  const updateField = <K extends keyof EventContext>(field: K, value: EventContext[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearError(field as keyof import('@/types').FormErrors);
  };

  return (
    <main id="main-content" className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
      {/* Hero Header */}
      <section aria-labelledby="intake-title" className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-4 border border-purple-200 dark:border-purple-800">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          Challenge 5: Celebration & Event Planner
        </div>
        <h1
          id="intake-title"
          className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-4"
        >
          Intelligent Event Architecture,{' '}
          <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
            Powered by GenAI
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Input your celebration constraints. FestivaAI dynamically re-balances your budget, reverse-engineers a countdown timeline, provisions vetted vendor criteria, and crafts a bespoke vibe studio.
        </p>
      </section>

      {/* Quick-Load Templates */}
      <section aria-labelledby="templates-heading" className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 id="templates-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <BookmarkCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            Quick-Load Persona Templates
          </h2>
          <span className="text-xs text-slate-400">1-click populated presets</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {QUICK_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => handleTemplateLoad(tmpl.id)}
              className="p-3.5 text-left rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500 dark:hover:border-purple-500 transition-all focus-visible:ring-4 focus-visible:ring-purple-500 group shadow-sm"
              aria-label={`Load preset template: ${tmpl.label}`}
            >
              <div className="text-2xl mb-1.5" aria-hidden="true">{tmpl.emoji}</div>
              <div className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {tmpl.label}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                {tmpl.context.city} • ₹{(tmpl.context.totalBudget / 100000).toFixed(1)}L • {tmpl.context.culturalTheme}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Main Intake Form */}
      <section aria-labelledby="form-heading">
        <h2 id="form-heading" className="sr-only">Event Context Input Form</h2>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8"
        >
          {/* Event Type Radio Group */}
          <fieldset>
            <legend className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
              <span>Event Persona / Celebration Type <span className="text-red-500">*</span></span>
              <span className="text-xs font-normal text-slate-400">Determines default heuristics</span>
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {EVENT_TYPES.map((et) => {
                const isSelected = form.eventType === et.value;
                return (
                  <label
                    key={et.value}
                    className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="eventType"
                      value={et.value}
                      checked={isSelected}
                      onChange={() => updateField('eventType', et.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl" aria-hidden="true">{et.emoji}</span>
                      <span className="font-bold text-base">{et.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{et.desc}</p>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Guest Count & Budget Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Guest Count */}
            <div>
              <label
                htmlFor="guest-count"
                className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                  Estimated Guests <span className="text-red-500">*</span>
                </span>
                {form.guestCount && form.guestCount > 0 ? (
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                    {form.guestCount} attendees
                  </span>
                ) : null}
              </label>
              <input
                id="guest-count"
                type="number"
                min="1"
                max="10000"
                value={form.guestCount ?? ''}
                onChange={(e) => updateField('guestCount', parseInt(e.target.value) || 0)}
                placeholder="e.g. 200"
                className={`w-full px-4 py-3 rounded-2xl border-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:border-purple-600 transition-colors focus-visible:ring-4 focus-visible:ring-purple-500 ${
                  errors.guestCount ? 'border-red-500 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'
                }`}
                aria-required="true"
                aria-invalid={!!errors.guestCount}
                aria-describedby={errors.guestCount ? 'guest-count-error' : undefined}
              />
              {errors.guestCount && (
                <p id="guest-count-error" role="alert" className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-semibold mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  {errors.guestCount}
                </p>
              )}
            </div>

            {/* Total Budget */}
            <div>
              <label
                htmlFor="total-budget"
                className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-amber-500" aria-hidden="true" />
                  Total Budget (₹) <span className="text-red-500">*</span>
                </span>
                {form.totalBudget && form.totalBudget > 0 ? (
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    ≈ ₹{(form.totalBudget / 100000).toFixed(2)} Lakh
                  </span>
                ) : null}
              </label>
              <input
                id="total-budget"
                type="number"
                min="10000"
                step="5000"
                value={form.totalBudget ?? ''}
                onChange={(e) => updateField('totalBudget', parseFloat(e.target.value) || 0)}
                placeholder="e.g. 1000000"
                className={`w-full px-4 py-3 rounded-2xl border-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:border-purple-600 transition-colors focus-visible:ring-4 focus-visible:ring-purple-500 ${
                  errors.totalBudget ? 'border-red-500 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'
                }`}
                aria-required="true"
                aria-invalid={!!errors.totalBudget}
                aria-describedby={errors.totalBudget ? 'budget-error' : undefined}
              />
              {errors.totalBudget && (
                <p id="budget-error" role="alert" className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-semibold mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  {errors.totalBudget}
                </p>
              )}
            </div>
          </div>

          {/* Event Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Event Date */}
            <div>
              <label
                htmlFor="event-date"
                className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4 text-pink-600 dark:text-pink-400" aria-hidden="true" />
                Target Celebration Date <span className="text-red-500">*</span>
              </label>
              <input
                id="event-date"
                type="date"
                min={minDate}
                value={form.eventDate || ''}
                onChange={(e) => updateField('eventDate', e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl border-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-purple-600 transition-colors focus-visible:ring-4 focus-visible:ring-purple-500 ${
                  errors.eventDate ? 'border-red-500 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'
                }`}
                aria-required="true"
                aria-invalid={!!errors.eventDate}
                aria-describedby={errors.eventDate ? 'date-error' : undefined}
              />
              {errors.eventDate && (
                <p id="date-error" role="alert" className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-semibold mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  {errors.eventDate}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                City / Destination <span className="text-red-500">*</span>
              </label>
              <input
                id="city"
                type="text"
                maxLength={100}
                value={form.city || ''}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="e.g. Mumbai, Udaipur, Goa, Delhi"
                className={`w-full px-4 py-3 rounded-2xl border-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:border-purple-600 transition-colors focus-visible:ring-4 focus-visible:ring-purple-500 ${
                  errors.city ? 'border-red-500 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'
                }`}
                aria-required="true"
                aria-invalid={!!errors.city}
                aria-describedby={errors.city ? 'city-error' : undefined}
              />
              {errors.city && (
                <p id="city-error" role="alert" className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-semibold mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  {errors.city}
                </p>
              )}
            </div>
          </div>

          {/* Theme Preference */}
          <fieldset>
            <legend className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
              Aesthetic & Cultural Theme Preference
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {THEMES.map((th) => {
                const isSelected = form.culturalTheme === th.value;
                return (
                  <label
                    key={th.value}
                    className={`cursor-pointer p-3 rounded-xl border-2 text-center transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-100 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="culturalTheme"
                      value={th.value}
                      checked={isSelected}
                      onChange={() => updateField('culturalTheme', th.value)}
                      className="sr-only"
                    />
                    <div className="text-xl mb-1" aria-hidden="true">{th.icon}</div>
                    <div className="text-xs leading-tight">{th.label}</div>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Cuisine Preference */}
          <fieldset>
            <legend className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-orange-500" aria-hidden="true" />
              Cuisine & Dietary Focus
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CUISINES.map((cu) => {
                const isSelected = form.cuisinePreference === cu.value;
                return (
                  <label
                    key={cu.value}
                    className={`cursor-pointer p-3 rounded-xl border-2 text-center transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-950 dark:text-orange-100 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cuisinePreference"
                      value={cu.value}
                      checked={isSelected}
                      onChange={() => updateField('cuisinePreference', cu.value)}
                      className="sr-only"
                    />
                    <div className="text-xl mb-1" aria-hidden="true">{cu.icon}</div>
                    <div className="text-xs leading-tight">{cu.label}</div>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Additional Notes */}
          <div>
            <label
              htmlFor="additional-notes"
              className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between"
            >
              <span>Custom Preferences & Specific Requirements</span>
              <span className="text-xs text-slate-400 font-normal">Auto-sanitized & PII stripped</span>
            </label>
            <textarea
              id="additional-notes"
              rows={3}
              maxLength={500}
              value={form.additionalNotes || ''}
              onChange={(e) => updateField('additionalNotes', e.target.value)}
              placeholder="e.g. Seeking high-energy live acoustic band, pet-friendly lawn venue, and Jain dietary counter."
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:border-purple-600 transition-colors focus-visible:ring-4 focus-visible:ring-purple-500 text-sm leading-relaxed"
            />
            <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
              <span>Security: Emails, phone numbers, and payment details are masked automatically.</span>
              <span>{(form.additionalNotes || '').length} / 500</span>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-extrabold text-base tracking-wide flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] shadow-lg shadow-purple-500/20 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-4 focus-visible:ring-purple-500"
            aria-busy={isLoading}
          >
            <Sparkles className="w-5 h-5" aria-hidden="true" />
            <span>Generate FestivaAI Architecture Plan</span>
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </form>
      </section>
    </main>
  );
}
