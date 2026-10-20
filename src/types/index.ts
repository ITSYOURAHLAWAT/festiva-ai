// ============================================================
// FestivaAI – Strict TypeScript Interfaces (zero `any`)
// ============================================================

export type EventType = 'wedding' | 'birthday' | 'community';

export type ThemePreference =
  | 'royal'
  | 'rustic'
  | 'modern'
  | 'boho'
  | 'traditional'
  | 'minimalist'
  | 'tropical'
  | 'vintage';

export type CuisinePreference =
  | 'vegetarian'
  | 'vegan'
  | 'non-vegetarian'
  | 'mixed'
  | 'north-indian'
  | 'south-indian'
  | 'continental'
  | 'fusion';

// ── Event Context (user intake form) ─────────────────────────
export interface EventContext {
  eventType: EventType;
  guestCount: number;
  totalBudget: number;
  eventDate: string; // ISO date string "YYYY-MM-DD"
  city: string;
  culturalTheme: ThemePreference;
  cuisinePreference: CuisinePreference;
  additionalNotes: string;
}

// ── Budget ───────────────────────────────────────────────────
export interface BudgetCategory {
  name: string;
  percentage: number;
  amount: number;
  icon: string;
  color: string;
  minPercent: number; // Minimum recommended %
  alert?: string;     // Warning if underfunded
}

export interface BudgetBreakdown {
  totalBudget: number;
  categories: BudgetCategory[];
  perGuestCost: number;
  recommendations: string[];
}

// ── Timeline ─────────────────────────────────────────────────
export type MilestoneStatus = 'pending' | 'in-progress' | 'completed';
export type MilestonePriority = 'critical' | 'high' | 'medium' | 'low';

export interface Milestone {
  id: string;
  phase: string;        // e.g., "6 Months Out", "Day Of"
  daysOut: number;      // Days before event
  task: string;
  priority: MilestonePriority;
  status: MilestoneStatus;
  category: string;     // Budget category it relates to
  notes?: string;
}

export interface Timeline {
  eventDate: string;
  daysUntilEvent: number;
  milestones: Milestone[];
}

// ── Vendor ───────────────────────────────────────────────────
export type VendorStatus = 'not-started' | 'researching' | 'contacted' | 'quoted' | 'booked' | 'confirmed';

export interface VettingQuestion {
  question: string;
  why: string;  // Explanation of why this matters
}

export interface ContractRedFlag {
  flag: string;
  risk: string;
}

export interface Vendor {
  id: string;
  category: string;
  name: string;
  status: VendorStatus;
  budget: number;
  actualQuote?: number;
  vettingQuestions: VettingQuestion[];
  redFlags: ContractRedFlag[];
  negotiationScript?: string;
  notes: string;
}

export interface VendorChecklist {
  vendors: Vendor[];
}

// ── Vibe & Theme Studio ──────────────────────────────────────
export interface ColorPalette {
  name: string;
  primary: string;    // hex color
  secondary: string;
  accent: string;
  neutral: string;
  description: string;
}

export interface MenuSuggestion {
  course: string;
  items: string[];
  dietaryNotes: string;
}

export interface VibeStudio {
  colorPalette: ColorPalette;
  decorConcepts: string[];
  menuSuggestions: MenuSuggestion[];
  invitationWording: string;
  ambiance: string;
  musicSuggestions: string[];
}

// ── Complete AI Plan ─────────────────────────────────────────
export interface EventPlan {
  context: EventContext;
  budget: BudgetBreakdown;
  timeline: Timeline;
  vendors: VendorChecklist;
  vibe: VibeStudio;
  generatedAt: string;
  cacheKey: string;
}

// ── Form Validation Errors ───────────────────────────────────
export interface FormErrors {
  eventType?: string;
  guestCount?: string;
  totalBudget?: string;
  eventDate?: string;
  city?: string;
  culturalTheme?: string;
  cuisinePreference?: string;
}

// ── App State ────────────────────────────────────────────────
export type ActiveTab = 'budget' | 'timeline' | 'vendors' | 'vibe';

export interface AppState {
  step: 'intake' | 'dashboard';
  context: EventContext | null;
  plan: EventPlan | null;
  isLoading: boolean;
  error: string | null;
  activeTab: ActiveTab;
}

// ── Quick Templates ──────────────────────────────────────────
export interface QuickTemplate {
  id: string;
  label: string;
  emoji: string;
  context: Omit<EventContext, 'eventDate'>;
}
