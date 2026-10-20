import { describe, it, expect } from 'vitest';
import { calculateBudgetBreakdown, rebalanceBudget } from '@/services/budgetMath';
import type { EventContext } from '@/types';

const testContext: EventContext = {
  eventTitle: 'Aarav & Priya Grand Sangeet',
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

  it('budget allocation percentages always sum to exactly 100% for all event types', () => {
    const eventTypes: Array<'wedding' | 'birthday' | 'community'> = ['wedding', 'birthday', 'community'];

    eventTypes.forEach((eventType) => {
      const breakdown = calculateBudgetBreakdown({
        ...testContext,
        eventType,
      });
      const totalPercentage = breakdown.categories.reduce((acc, c) => acc + c.percentage, 0);
      expect(totalPercentage).toBe(100);

      const totalAllocated = breakdown.categories.reduce((acc, c) => acc + c.amount, 0);
      expect(Math.abs(totalAllocated - testContext.totalBudget)).toBeLessThanOrEqual(1000);
    });
  });

  it('triggers warnings when per-guest catering drops below realistic thresholds (< ₹300/guest)', () => {
    const tightContext: EventContext = {
      ...testContext,
      totalBudget: 50000,
      guestCount: 250, // Catering at 35% is ₹17,500 for 250 guests = ₹70/guest (< ₹300)
    };
    const result = calculateBudgetBreakdown(tightContext);
    const catering = result.categories.find((c) => c.name === 'Catering');
    expect(catering?.alert).toBeDefined();
    expect(catering?.alert).toContain('below standard minimums');
  });

  it('does not trigger catering warning when catering budget is comfortable', () => {
    const comfortableContext: EventContext = {
      ...testContext,
      totalBudget: 2000000,
      guestCount: 200, // ₹3,500/guest catering
    };
    const result = calculateBudgetBreakdown(comfortableContext);
    const catering = result.categories.find((c) => c.name === 'Catering');
    expect(catering?.alert).toBeUndefined();
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

  it('re-balances remaining percentages so the entire plan maintains 100% total', () => {
    const breakdown = calculateBudgetBreakdown(testContext);
    const updated = rebalanceBudget(breakdown.categories, 1, 45, testContext.totalBudget); // Catering +10%
    const sum = updated.reduce((acc, c) => acc + c.percentage, 0);
    expect(Math.round(sum)).toBe(100);
  });
});
