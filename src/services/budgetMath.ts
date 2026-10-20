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

    // Alert if venue is underfunded for guest count (< ₹500/guest)
    if (template.name === 'Venue' && amountPerGuest < 500) {
      alert = `Venue budget (₹${amountPerGuest.toFixed(0)}/guest) may be tight. Consider community or outdoor venues.`;
    }
    // Alert if catering is underfunded (< ₹300/guest)
    if (template.name === 'Catering' && amountPerGuest < 300) {
      alert = `Catering at ₹${amountPerGuest.toFixed(0)}/guest is below standard minimums. Consider buffet or high-tea.`;
    }
    // Alert if emergency buffer is too low (< ₹5,000)
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
  const remainingBudgetShare = 100 - clampedNew;

  // Calculate total percentage of all other categories
  const otherIndices = categories.map((_, i) => i).filter((i) => i !== changedIndex);
  const othersTotal = otherIndices.reduce((sum, i) => sum + categories[i].percentage, 0);

  const updated = categories.map((cat, i) => {
    if (i === changedIndex) {
      const amount = Math.round((clampedNew / 100) * totalBudget);
      return { ...cat, percentage: clampedNew, amount };
    }

    // Proportional distribution of the remaining budget share
    const share = othersTotal > 0 ? cat.percentage / othersTotal : 1 / otherIndices.length;
    const rawPct = remainingBudgetShare * share;
    const safePct = Math.max(cat.minPercent, Math.min(80, rawPct));
    const roundedPct = Math.round(safePct * 10) / 10;
    const amount = Math.round((roundedPct / 100) * totalBudget);

    return {
      ...cat,
      percentage: roundedPct,
      amount,
    };
  });

  // Normalize rounding difference to ensure sum of all percentages is exactly 100%
  const currentSum = updated.reduce((sum, c) => sum + c.percentage, 0);
  const diffFrom100 = Math.round((100 - currentSum) * 10) / 10;

  if (diffFrom100 !== 0 && otherIndices.length > 0) {
    const adjustIdx = otherIndices[0];
    updated[adjustIdx].percentage = Math.round((updated[adjustIdx].percentage + diffFrom100) * 10) / 10;
    updated[adjustIdx].amount = Math.round((updated[adjustIdx].percentage / 100) * totalBudget);
  }

  return updated;
}
