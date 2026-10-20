'use client';

import { useState, useMemo } from 'react';
import {
  CheckCircle2, Circle, Clock, Flag, Filter, CalendarClock,
  Sparkles, CheckSquare2
} from 'lucide-react';
import type { Timeline, Milestone, MilestoneStatus, MilestonePriority } from '@/types';

interface TimelineTabProps {
  timeline: Timeline;
  onMilestoneUpdate: (milestoneId: string, status: MilestoneStatus) => void;
}

const PRIORITY_BADGES: Record<MilestonePriority, { label: string; text: string; bg: string; border: string }> = {
  critical: { label: 'Critical Path', text: 'text-red-700 dark:text-red-300', bg: 'bg-red-50 dark:bg-red-950/60', border: 'border-red-200 dark:border-red-800' },
  high: { label: 'High Priority', text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/60', border: 'border-amber-200 dark:border-amber-800' },
  medium: { label: 'Medium', text: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-950/60', border: 'border-blue-200 dark:border-blue-800' },
  low: { label: 'Low', text: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700' },
};

export function TimelineTab({ timeline, onMilestoneUpdate }: TimelineTabProps) {
  const [filterStatus, setFilterStatus] = useState<MilestoneStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<MilestonePriority | 'all'>('all');

  const filteredMilestones = useMemo(() => {
    return timeline.milestones.filter((m) => {
      if (filterStatus !== 'all' && m.status !== filterStatus) return false;
      if (filterPriority !== 'all' && m.priority !== filterPriority) return false;
      return true;
    });
  }, [timeline.milestones, filterStatus, filterPriority]);

  // Group milestones by Phase
  const groupedByPhase = useMemo(() => {
    const groups: Record<string, Milestone[]> = {};
    filteredMilestones.forEach((m) => {
      if (!groups[m.phase]) {
        groups[m.phase] = [];
      }
      groups[m.phase].push(m);
    });
    return groups;
  }, [filteredMilestones]);

  const completedCount = timeline.milestones.filter((m) => m.status === 'completed').length;
  const inProgressCount = timeline.milestones.filter((m) => m.status === 'in-progress').length;
  const totalCount = timeline.milestones.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleMilestoneStatus = (m: Milestone) => {
    const sequence: Record<MilestoneStatus, MilestoneStatus> = {
      pending: 'in-progress',
      'in-progress': 'completed',
      completed: 'pending',
    };
    onMilestoneUpdate(m.id, sequence[m.status]);
  };

  return (
    <section aria-labelledby="timeline-heading" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 id="timeline-heading" className="text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400">
              <CalendarClock className="w-5 h-5" aria-hidden="true" />
            </span>
            Reverse-Engineered Milestone Timeline
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Backwards scheduled from target date ({new Date(timeline.eventDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}). T-{timeline.daysUntilEvent} days remaining.
          </p>
        </div>
      </div>

      {/* Progress & Countdown KPI */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Execution Velocity</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold">
                {progressPct}% Completed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {completedCount} closed • {inProgressCount} active • {totalCount - completedCount - inProgressCount} pending
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block">Countdown</span>
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {timeline.daysUntilEvent} Days
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div
          className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Milestones completed: ${progressPct}%`}
        >
          <div
            className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
        role="toolbar"
        aria-label="Milestone filter controls"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" aria-hidden="true" />
            Status:
          </span>
          {(['all', 'pending', 'in-progress', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all focus-visible:ring-4 focus-visible:ring-purple-500 ${
                filterStatus === st
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              aria-pressed={filterStatus === st}
            >
              {st === 'all' ? 'All Tasks' : st === 'in-progress' ? 'In Progress' : st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">Priority:</span>
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((pr) => (
            <button
              key={pr}
              onClick={() => setFilterPriority(pr)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all focus-visible:ring-4 focus-visible:ring-purple-500 ${
                filterPriority === pr
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              aria-pressed={filterPriority === pr}
            >
              {pr === 'all' ? 'All' : pr.charAt(0).toUpperCase() + pr.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Milestone Phase Groups */}
      {Object.keys(groupedByPhase).length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <CheckSquare2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            No milestones match the selected filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-6" aria-live="polite">
          {Object.entries(groupedByPhase).map(([phase, milestones]) => (
            <div key={phase} className="space-y-3">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {phase}
                </h3>
                <span className="text-xs text-slate-400">({milestones.length})</span>
              </div>

              <div className="space-y-2.5">
                {milestones.map((m) => {
                  const prBadge = PRIORITY_BADGES[m.priority];
                  const isDone = m.status === 'completed';
                  const isInProg = m.status === 'in-progress';

                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                        isDone
                          ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                          : isInProg
                          ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/60 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                      }`}
                    >
                      {/* Check-off status button */}
                      <button
                        type="button"
                        onClick={() => toggleMilestoneStatus(m)}
                        className="mt-0.5 text-slate-400 hover:text-purple-600 focus-visible:ring-4 focus-visible:ring-purple-500 rounded-md transition-colors"
                        aria-label={`Mark task "${m.task}" as ${
                          m.status === 'pending'
                            ? 'in progress'
                            : m.status === 'in-progress'
                            ? 'completed'
                            : 'pending'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        ) : isInProg ? (
                          <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-spin" aria-hidden="true" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" aria-hidden="true" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p
                            className={`text-sm font-bold ${
                              isDone
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {m.task}
                          </p>
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${prBadge.bg} ${prBadge.text} ${prBadge.border}`}
                          >
                            {prBadge.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-purple-700 dark:text-purple-300">
                            {m.daysOut === 0 ? '★ Event Day-Of' : `T-${m.daysOut} Days Out`}
                          </span>
                          <span>•</span>
                          <span>Category: {m.category}</span>
                          {m.notes && (
                            <>
                              <span>•</span>
                              <span className="italic">{m.notes}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Explicit Status Dropdown for Full Control */}
                      <div className="flex-shrink-0">
                        <label htmlFor={`milestone-status-${m.id}`} className="sr-only">
                          Change status for {m.task}
                        </label>
                        <select
                          id={`milestone-status-${m.id}`}
                          value={m.status}
                          onChange={(e) => onMilestoneUpdate(m.id, e.target.value as MilestoneStatus)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus-visible:ring-4 focus-visible:ring-purple-500 focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
