'use client';

import { useState } from 'react';
import {
  Users2, ChevronDown, ChevronUp, AlertOctagon, HelpCircle,
  MailCheck, Copy, Check, Sparkles, IndianRupee, FileText
} from 'lucide-react';
import type { Vendor, VendorChecklist, VendorStatus } from '@/types';

interface VendorTabProps {
  vendors: VendorChecklist;
  onVendorUpdate: (vendorId: string, updates: Partial<Vendor>) => void;
  onGenerateScript: (vendorId: string) => Promise<void>;
  isGeneratingScript: string | null;
}

const STATUS_MAP: Record<VendorStatus, { label: string; bg: string; text: string; border: string }> = {
  'not-started': { label: 'Not Started', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-300 dark:border-slate-700' },
  researching: { label: 'Shortlisting', bg: 'bg-blue-50 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  contacted: { label: 'Inquiry Sent', bg: 'bg-purple-50 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  quoted: { label: 'Quote Received', bg: 'bg-amber-50 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  booked: { label: 'Deposit Paid', bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  confirmed: { label: 'Contract Locked ✓', bg: 'bg-emerald-100 dark:bg-emerald-900/60', text: 'text-emerald-800 dark:text-emerald-200', border: 'border-emerald-300 dark:border-emerald-700' },
};

function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function VendorTab({ vendors, onVendorUpdate, onGenerateScript, isGeneratingScript }: VendorTabProps) {
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(vendors.vendors[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const confirmedCount = vendors.vendors.filter((v) => v.status === 'booked' || v.status === 'confirmed').length;

  const handleCopyScript = (scriptText: string, id: string) => {
    navigator.clipboard.writeText(scriptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <section aria-labelledby="vendor-tracker-heading" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 id="vendor-tracker-heading" className="text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Users2 className="w-5 h-5" aria-hidden="true" />
            </span>
            Context-Aware Vendor Checklist & AI Negotiator
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Proactively vet vendor credentials, protect contracts from red flags, and deploy customized quotation negotiation templates.
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
          {confirmedCount} / {vendors.vendors.length} Contracts Locked
        </div>
      </div>

      {/* Vendor Cards Stack */}
      <div className="space-y-4" role="list" aria-label="Event vendor list">
        {vendors.vendors.map((vendor) => {
          const isExpanded = expandedVendorId === vendor.id;
          const statusConfig = STATUS_MAP[vendor.status];
          const hasQuote = typeof vendor.actualQuote === 'number' && vendor.actualQuote > 0;
          const isOverBudget = hasQuote && (vendor.actualQuote || 0) > vendor.budget;
          const isGeneratingThis = isGeneratingScript === vendor.id;

          return (
            <div
              key={vendor.id}
              role="listitem"
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
            >
              {/* Header Bar */}
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                    <span className="font-black text-lg text-slate-900 dark:text-slate-50">{vendor.category}</span>
                    <span
                      className={`text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-purple-700 dark:text-purple-300">
                      Target Allocation: {formatINR(vendor.budget)}
                    </span>
                    {hasQuote && (
                      <>
                        <span>•</span>
                        <span className={`font-bold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          Quote: {formatINR(vendor.actualQuote!)} {isOverBudget ? '(Over Target)' : '(Within Target ✓)'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status Selector & Expand Button */}
                <div className="flex items-center gap-3">
                  <label htmlFor={`vendor-status-${vendor.id}`} className="sr-only">
                    Change status for {vendor.category}
                  </label>
                  <select
                    id={`vendor-status-${vendor.id}`}
                    value={vendor.status}
                    onChange={(e) => onVendorUpdate(vendor.id, { status: e.target.value as VendorStatus })}
                    className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus-visible:ring-4 focus-visible:ring-purple-500 focus:outline-none"
                  >
                    <option value="not-started">Not Started</option>
                    <option value="researching">Shortlisting</option>
                    <option value="contacted">Inquiry Sent</option>
                    <option value="quoted">Quote Received</option>
                    <option value="booked">Deposit Paid</option>
                    <option value="confirmed">Contract Locked ✓</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setExpandedVendorId(isExpanded ? null : vendor.id)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors focus-visible:ring-4 focus-visible:ring-purple-500"
                    aria-expanded={isExpanded}
                    aria-controls={`vendor-details-${vendor.id}`}
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} details for ${vendor.category}`}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Details Body */}
              {isExpanded && (
                <div
                  id={`vendor-details-${vendor.id}`}
                  className="px-5 pb-6 sm:px-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-6"
                >
                  {/* Quote Received Input & Vendor Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label htmlFor={`vendor-name-${vendor.id}`} className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                        Assigned Vendor / Agency Name
                      </label>
                      <input
                        id={`vendor-name-${vendor.id}`}
                        type="text"
                        value={vendor.name}
                        onChange={(e) => onVendorUpdate(vendor.id, { name: e.target.value })}
                        placeholder="e.g. Royal Palace Banquets"
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-purple-600 focus-visible:ring-4 focus-visible:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label htmlFor={`vendor-quote-${vendor.id}`} className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                        Formal Quote Received (₹)
                      </label>
                      <div className="relative">
                        <IndianRupee className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" aria-hidden="true" />
                        <input
                          id={`vendor-quote-${vendor.id}`}
                          type="number"
                          min="0"
                          value={vendor.actualQuote ?? ''}
                          onChange={(e) =>
                            onVendorUpdate(vendor.id, { actualQuote: parseFloat(e.target.value) || undefined })
                          }
                          placeholder={`Target allocation: ₹${vendor.budget.toLocaleString('en-IN')}`}
                          className="w-full pl-8 pr-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-purple-600 focus-visible:ring-4 focus-visible:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vetting Questions */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                      <span>AI Vetting Interview Questions ({vendor.vettingQuestions.length})</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {vendor.vettingQuestions.map((vq, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 text-xs"
                        >
                          <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                            Q{idx + 1}: &quot;{vq.question}&quot;
                          </p>
                          <p className="text-purple-700 dark:text-purple-300 italic">
                            💡 Strategic Rationale: {vq.why}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contract Red Flags */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      <AlertOctagon className="w-4 h-4 text-red-600 dark:text-red-400" aria-hidden="true" />
                      <span>Contract Red Flags to Audit</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {vendor.redFlags.map((rf, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 text-xs"
                        >
                          <p className="font-bold text-red-900 dark:text-red-200 mb-0.5">
                            ⚠ Clause Risk: {rf.flag}
                          </p>
                          <p className="text-red-700 dark:text-red-300">
                            Impact: {rf.risk}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Negotiation Script Generator & Viewer */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        <MailCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        <span>AI Negotiation Script & Email Outreach</span>
                      </div>

                      {!vendor.negotiationScript && (
                        <button
                          type="button"
                          onClick={() => onGenerateScript(vendor.id)}
                          disabled={isGeneratingThis}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all focus-visible:ring-4 focus-visible:ring-purple-500 disabled:opacity-60"
                        >
                          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{isGeneratingThis ? 'Synthesizing…' : 'Generate 1-Click Script'}</span>
                        </button>
                      )}
                    </div>

                    {vendor.negotiationScript ? (
                      <div className="relative rounded-2xl bg-slate-900 dark:bg-slate-950 p-4 border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed">
                        <button
                          type="button"
                          onClick={() => handleCopyScript(vendor.negotiationScript!, vendor.id)}
                          className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors focus-visible:ring-4 focus-visible:ring-purple-500"
                          aria-label="Copy negotiation email to clipboard"
                          title="Copy script"
                        >
                          {copiedId === vendor.id ? (
                            <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                          ) : (
                            <Copy className="w-4 h-4" aria-hidden="true" />
                          )}
                        </button>
                        <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 pr-8">
                          {vendor.negotiationScript}
                        </pre>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-400">
                        Click &quot;Generate 1-Click Script&quot; to synthesize an assertive, tactful price negotiation template tailored to this vendor.
                      </div>
                    )}
                  </div>

                  {/* Private Negotiation Notes */}
                  <div>
                    <label htmlFor={`vendor-notes-${vendor.id}`} className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Private Meeting Notes & Progress Log
                    </label>
                    <textarea
                      id={`vendor-notes-${vendor.id}`}
                      rows={2}
                      value={vendor.notes}
                      onChange={(e) => onVendorUpdate(vendor.id, { notes: e.target.value })}
                      placeholder="Add personal call notes, manager contact, agreed discount terms..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-purple-600 focus-visible:ring-4 focus-visible:ring-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
