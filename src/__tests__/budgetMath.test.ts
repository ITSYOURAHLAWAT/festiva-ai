import { describe, it, expect } from 'vitest';
import { calculateBudgetBreakdown, rebalanceBudget } from '@/services/budgetMath';
import type { EventContext } from '@/types';

const testContext: EventContext = {
  eventType: 'wedding',
  guestCount: 200,
  totalBudget: 1000000,
  eventDate: '2027-06-15',
  city: 'Mumbai',
  culturalTheme: 'royal',
  cuisinePreference: 'mixed',
  additionalNotes: '',
};

describe('calculateBudgetBreakdown', () => {
  it('returns correct total budget and per guest cost', () => {
    const result = calculateBudgetBreakdown(testContext);
    expect(result.totalBudget).toBe(1000000);
    expect(result.perGuestCost).toBe(5000);
  });

  it('allocates all 6 core categories', () => {
    const result = calculateBudgetBreakdown(testContext);
    expect(result.categories).toHaveLength(6);
    const categoryNames = result.categories.map((c) => c.name);
    expect(categoryNames).toContain('Venue');
    expect(categoryNames).toContain('Catering');
    expect(categoryNames).toContain('Decor');
    expect(categoryNames).toContain('Entertainment');
    expect(categoryNames).toContain('Photography');
    expect(categoryNames).toContain('Emergency Buffer');
  });

  it('sums to approximately 100% and total budget', () => {
    const result = calculateBudgetBreakdown(testContext);
    const totalPercentage = result.categories.reduce((acc, c) => acc + c.percentage, 0);
    expect(totalPercentage).toBe(100);

    const totalAllocated = result.categories.reduce((acc, c) => acc + c.amount, 0);
    expect(Math.abs(totalAllocated - testContext.totalBudget)).toBeLessThanOrEqual(1000);
  });

  it('raises alert when catering is underfunded for guest scale', () => {
    const tightContext: EventContext = {
      ...testContext,
      totalBudget: 50000,
      guestCount: 250, // ₹200/guest total -> catering is way below ₹300
    };
    const result = calculateBudgetBreakdown(tightContext);
    const catering = result.categories.find((c) => c.name === 'Catering');
    expect(catering?.alert).toBeDefined();
    expect(catering?.alert).toContain('below standard minimums');
  });
});

describe('rebalanceBudget', () => {
  it('adjusts target percentage and recalculates amounts', () => {
    const breakdown = calculateBudgetBreakdown(testContext);
    const updated = rebalanceBudget(breakdown.categories, 0, 40, testContext.totalBudget);
    expect(updated[0].percentage).toBe(40);
    expect(updated[0].amount).toBe(400000);
  });

  it('respects minPercent floor constraints', () => {
    const breakdown = calculateBudgetBreakdown(testContext);
    const venue = breakdown.categories[0];
    // Attempting to set below minPercent (20%)
    const updated = rebalanceBudget(breakdown.categories, 0, 5, testContext.totalBudget);
    expect(updated[0].percentage).toBe(venue.minPercent);
  });
});
