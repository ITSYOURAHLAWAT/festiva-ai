import { z } from 'zod';

// ── Budget Schema ──────────────────────────────────────────────
export const BudgetCategorySchema = z.object({
  name: z.string().min(1),
  percentage: z.number().min(0).max(100),
  amount: z.number().min(0),
  icon: z.string().min(1),
  color: z.string().min(1),
  minPercent: z.number().min(0).max(100),
  alert: z.string().optional(),
});

export const BudgetBreakdownSchema = z.object({
  totalBudget: z.number().positive(),
  categories: z.array(BudgetCategorySchema).min(1),
  perGuestCost: z.number().min(0),
  recommendations: z.array(z.string()),
});

// ── Timeline Schema ────────────────────────────────────────────
export const MilestoneSchema = z.object({
  id: z.string().min(1),
  phase: z.string().min(1),
  daysOut: z.number().min(0),
  task: z.string().min(1),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  status: z.enum(['pending', 'in-progress', 'completed']),
  category: z.string().min(1),
  notes: z.string().optional(),
});

export const TimelineSchema = z.object({
  eventDate: z.string().min(1),
  daysUntilEvent: z.number().min(0),
  milestones: z.array(MilestoneSchema).min(1),
});

// ── Vendor Schema ──────────────────────────────────────────────
export const VettingQuestionSchema = z.object({
  question: z.string().min(1),
  why: z.string().min(1),
});

export const ContractRedFlagSchema = z.object({
  flag: z.string().min(1),
  risk: z.string().min(1),
});

export const VendorSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(['not-started', 'researching', 'contacted', 'quoted', 'booked', 'confirmed']),
  budget: z.number().min(0),
  actualQuote: z.number().min(0).optional(),
  vettingQuestions: z.array(VettingQuestionSchema),
  redFlags: z.array(ContractRedFlagSchema),
  negotiationScript: z.string().optional(),
  notes: z.string(),
});

export const VendorChecklistSchema = z.object({
  vendors: z.array(VendorSchema).min(1),
});

// ── Vibe Schema ────────────────────────────────────────────────
export const ColorPaletteSchema = z.object({
  name: z.string().min(1),
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  neutral: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  description: z.string().min(1),
});

export const MenuSuggestionSchema = z.object({
  course: z.string().min(1),
  items: z.array(z.string()).min(1),
  dietaryNotes: z.string(),
});

export const VibeStudioSchema = z.object({
  colorPalette: ColorPaletteSchema,
  decorConcepts: z.array(z.string()).min(3),
  menuSuggestions: z.array(MenuSuggestionSchema).min(2),
  invitationWording: z.string().min(10),
  ambiance: z.string().min(5),
  musicSuggestions: z.array(z.string()).min(3),
});

// ── Full Plan Schema ───────────────────────────────────────────
export const EventPlanSchema = z.object({
  budget: BudgetBreakdownSchema,
  timeline: TimelineSchema,
  vendors: VendorChecklistSchema,
  vibe: VibeStudioSchema,
});

export type ValidatedEventPlan = z.infer<typeof EventPlanSchema>;
