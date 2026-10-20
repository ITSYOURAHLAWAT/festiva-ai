import type { BudgetBreakdown, BudgetCategory, EventContext } from '@/types';

interface CategoryTemplate {
  name: string;
  icon: string;
  color: string;
  wedding: number;
  birthday: number;
  community: number;
  minPercent: number;
}

const CATEGORY_TEMPLATES: CategoryTemplate[] = [
  { name: 'Venue', icon: '🏛️', color: 'bg-purple-500', wedding: 30, birthday: 25, community: 35, minPercent: 20 },
  { name: 'Catering', icon: '🍽️', color: 'bg-orange-500', wedding: 35, birthday: 30, community: 30, minPercent: 25 },
  { name: 'Decor', icon: '🌸', color: 'bg-pink-500', wedding: 12, birthday: 15, community: 10, minPercent: 5 },
  { name: 'Entertainment', icon: '🎵', color: 'bg-blue-500', wedding: 10, birthday: 15, community: 15, minPercent: 5 },
  { name: 'Photography', icon: '📷', color: 'bg-green-500', wedding: 8, birthday: 5, community: 3, minPercent: 2 },
  { name: 'Emergency Buffer', icon: '🛡️', color: 'bg-gray-500', wedding: 5, birthday: 10, community: 7, minPercent: 5 },
];

export function calculateBudgetBreakdown(context: EventContext): BudgetBreakdown {
  const { eventType, guestCount, totalBudget } = context;
  const perGuestCost = guestCount > 0 ? totalBudget / guestCount : 0;

  const categories: BudgetCategory[] = CATEGORY_TEMPLATES.map((template) => {
    const percentage = template[eventType] || 15;
    const amount = Math.round((percentage / 100) * totalBudget);
    const amountPerGuest = guestCount > 0 ? amount / guestCount : 0;

    let alert: string | undefined;

    // Alert if venue is underfunded for guest count
    if (template.name === 'Venue' && amountPerGuest < 500) {
      alert = `Venue budget (₹${amountPerGuest.toFixed(0)}/guest) may be tight. Consider community or outdoor venues.`;
    }
    // Alert if catering is underfunded
    if (template.name === 'Catering' && amountPerGuest < 300) {
      alert = `Catering at ₹${amountPerGuest.toFixed(0)}/guest is below standard minimums. Consider buffet or high-tea.`;
    }
    // Alert if emergency buffer is too low
    if (template.name === 'Emergency Buffer' && amount < 5000) {
      alert = `Emergency buffer of ₹${amount.toLocaleString('en-IN')} is critically low. Recommended at least ₹5,000.`;
    }

    return {
      name: template.name,
      percentage,
      amount,
      icon: template.icon,
      color: template.color,
      minPercent: template.minPercent,
      alert,
    };
  });

  const recommendations: string[] = [];
  if (perGuestCost < 1000) {
    recommendations.push('Consider optimizing guest list or increasing budget for a more comfortable experience.');
  }
  if (perGuestCost > 8000) {
    recommendations.push('Generous per-guest allocation enables luxury vendor selection and premium catering.');
  }
  if (context.eventType === 'wedding') {
    recommendations.push('Book venue and lead caterer at least 6 months prior to peak wedding season dates.');
  }
  if (context.eventType === 'community') {
    recommendations.push('Explore local sponsors or early-bird tickets to offset core venue and audio-visual costs.');
  }

  return {
    totalBudget,
    categories,
    perGuestCost: Math.round(perGuestCost),
    recommendations,
  };
}

export function rebalanceBudget(
  categories: BudgetCategory[],
  changedIndex: number,
  newPercentage: number,
  totalBudget: number
): BudgetCategory[] {
  const targetCategory = categories[changedIndex];
  if (!targetCategory) return categories;

  const clampedNew = Math.max(targetCategory.minPercent, Math.min(80, newPercentage));
  const oldPercentage = targetCategory.percentage;
  const diff = clampedNew - oldPercentage;

  if (diff === 0) return categories;

  // Calculate total of other categories
  const otherIndices = categories.map((_, i) => i).filter((i) => i !== changedIndex);
  const othersTotal = otherIndices.reduce((sum, i) => sum + categories[i].percentage, 0);

  return categories.map((cat, i) => {
    if (i === changedIndex) {
      const amount = Math.round((clampedNew / 100) * totalBudget);
      return { ...cat, percentage: clampedNew, amount };
    }

    // Distribute reduction/increase proportionally across other categories
    const share = othersTotal > 0 ? cat.percentage / othersTotal : 1 / otherIndices.length;
    const rawPct = cat.percentage - diff * share;
    const safePct = Math.max(cat.minPercent, Math.min(80, rawPct));
    const amount = Math.round((safePct / 100) * totalBudget);

    return {
      ...cat,
      percentage: Math.round(safePct * 10) / 10,
      amount,
    };
  });
}
