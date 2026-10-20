'use client';

import { useState, useCallback } from 'react';
import {
  IndianRupee, CalendarClock, Users2, Sparkles, MapPin,
  Calendar, Users, ArrowLeft, RefreshCw, type LucideIcon
} from 'lucide-react';
import type { EventPlan, ActiveTab, Vendor, VendorStatus, MilestoneStatus, BudgetBreakdown } from '@/types';
import { BudgetTab } from './tabs/BudgetTab';
import { TimelineTab } from './tabs/TimelineTab';
import { VendorTab } from './tabs/VendorTab';
import { VibeTab } from './tabs/VibeTab';

interface DashboardProps {
  plan: EventPlan;
  onPlanUpdate: (updated: Partial<EventPlan>) => void;
  onCoPilotInstruction: (instruction: string) => Promise<void>;
  isCoPilotLoading: boolean;
  onReset: () => void;
}

const TABS: Array<{ id: ActiveTab; label: string; icon: LucideIcon }> = [
  { id: 'budget', label: 'Budget Architect', icon: IndianRupee },
  { id: 'timeline', label: 'Timeline & Run-of-Show', icon: CalendarClock },
  { id: 'vendors', label: 'Vendor Checklist & Scripts', icon: Users2 },
  { id: 'vibe', label: 'Personalized Vibe & AI Co-Pilot', icon: Sparkles },
];

export function Dashboard({
  plan,
  onPlanUpdate,
  onCoPilotInstruction,
  isCoPilotLoading,
  onReset,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('budget');
  const [isGeneratingScript, setIsGeneratingScript] = useState<string | null>(null);

  const handleBudgetChange = useCallback(
    (updated: BudgetBreakdown) => {
      onPlanUpdate({ budget: updated });
    },
    [onPlanUpdate]
  );

  const handleMilestoneUpdate = useCallback(
    (milestoneId: string, status: MilestoneStatus) => {
      const updatedMilestones = plan.timeline.milestones.map((m) =>
        m.id === milestoneId ? { ...m, status } : m
      );
      onPlanUpdate({
        timeline: {
          ...plan.timeline,
          milestones: updatedMilestones,
        },
      });
    },
    [plan.timeline, onPlanUpdate]
  );

  const handleVendorUpdate = useCallback(
    (vendorId: string, updates: Partial<Vendor>) => {
      const updatedVendors = plan.vendors.vendors.map((v) =>
        v.id === vendorId ? { ...v, ...updates } : v
      );
      onPlanUpdate({
        vendors: {
          vendors: updatedVendors,
        },
      });
    },
    [plan.vendors, onPlanUpdate]
  );

  const handleGenerateScript = useCallback(
    async (vendorId: string) => {
      setIsGeneratingScript(vendorId);
      try {
        const vendor = plan.vendors.vendors.find((v) => v.id === vendorId);
        if (!vendor) return;

        const response = await fetch('/api/negotiation-script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vendor,
            context: plan.context,
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as { script: string };
          handleVendorUpdate(vendorId, { negotiationScript: data.script });
        }
      } catch (err) {
        console.error('Failed to generate script:', err);
      } finally {
        setIsGeneratingScript(null);
      }
    },
    [plan.vendors, plan.context, handleVendorUpdate]
  );

  const formattedDate = new Date(plan.context.eventDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <main id="main-content" className="max-w-6xl mx-auto px-4 py-8 sm:py-10 space-y-6">
      {/* Context Command Center Header Banner */}
      <section
        aria-label="Event overview summary banner"
        className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-purple-700/50"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-purple-200 text-xs font-bold transition-colors focus-visible:ring-4 focus-visible:ring-purple-400"
                aria-label="Edit event context constraints"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Change Constraints</span>
              </button>

              <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-pink-500/30 text-pink-200 border border-pink-400/30">
                {plan.context.eventType}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black capitalize tracking-tight">
              {plan.context.eventTitle || `${plan.context.culturalTheme} Celebration in ${plan.context.city}`}
            </h1>

            <p className="text-xs sm:text-sm text-purple-200 line-clamp-1">
              {plan.context.additionalNotes || 'AI-Synthesized Event Architecture'}
            </p>
          </div>

          {/* Quick Context Metric Badges */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold">
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[90px]">
              <span className="text-purple-300 block text-[10px] uppercase tracking-wider">Attendance</span>
              <span className="text-lg font-black text-white">{plan.context.guestCount}</span>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[100px]">
              <span className="text-amber-300 block text-[10px] uppercase tracking-wider">Total Capital</span>
              <span className="text-lg font-black text-amber-300">
                ₹{(plan.context.totalBudget / 100000).toFixed(1)}L
              </span>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[100px]">
              <span className="text-pink-300 block text-[10px] uppercase tracking-wider">Target Date</span>
              <span className="text-lg font-black text-white">{formattedDate}</span>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[80px]">
              <span className="text-emerald-300 block text-[10px] uppercase tracking-wider">Countdown</span>
              <span className="text-lg font-black text-emerald-300">{plan.timeline.daysUntilEvent}d</span>
            </div>
          </div>
        </div>
      </section>

      {/* Connected Navigation Tabs */}
      <nav
        aria-label="FestivaAI Command Center modules"
        className="flex gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto"
        role="tablist"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all whitespace-nowrap focus-visible:ring-4 focus-visible:ring-purple-500 ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 shadow-md border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Screen Reader Tab Announcement */}
      <div aria-live="polite" className="sr-only">
        Active module: {TABS.find((t) => t.id === activeTab)?.label}
      </div>

      {/* Tab Panels */}
      <div
        id={`tabpanel-budget`}
        role="tabpanel"
        aria-labelledby="tab-budget"
        hidden={activeTab !== 'budget'}
      >
        {activeTab === 'budget' && (
          <BudgetTab
            budget={plan.budget}
            context={plan.context}
            onBudgetChange={handleBudgetChange}
          />
        )}
      </div>

      <div
        id={`tabpanel-timeline`}
        role="tabpanel"
        aria-labelledby="tab-timeline"
        hidden={activeTab !== 'timeline'}
      >
        {activeTab === 'timeline' && (
          <TimelineTab
            timeline={plan.timeline}
            onMilestoneUpdate={handleMilestoneUpdate}
          />
        )}
      </div>

      <div
        id={`tabpanel-vendors`}
        role="tabpanel"
        aria-labelledby="tab-vendors"
        hidden={activeTab !== 'vendors'}
      >
        {activeTab === 'vendors' && (
          <VendorTab
            vendors={plan.vendors}
            onVendorUpdate={handleVendorUpdate}
            onGenerateScript={handleGenerateScript}
            isGeneratingScript={isGeneratingScript}
          />
        )}
      </div>

      <div
        id={`tabpanel-vibe`}
        role="tabpanel"
        aria-labelledby="tab-vibe"
        hidden={activeTab !== 'vibe'}
      >
        {activeTab === 'vibe' && (
          <VibeTab
            vibe={plan.vibe}
            onCoPilotInstruction={onCoPilotInstruction}
            isCoPilotLoading={isCoPilotLoading}
          />
        )}
      </div>
    </main>
  );
}
