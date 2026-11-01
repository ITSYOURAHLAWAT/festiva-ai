import { describe, it, expect } from 'vitest';
import { parseCoPilotInstruction } from '@/services/copilotParser';
import type { EventContext } from '@/types';

const BASE_CONTEXT: EventContext = {
  eventType: 'wedding',
  eventTitle: "Aarav & Meera's Wedding",
  eventDate: '2026-11-14',
  city: 'Udaipur',
  guestCount: 320,
  totalBudget: 4500000,
  culturalTheme: 'Royal Heritage',
  cuisinePreference: 'Rajasthani',
  additionalNotes: '',
};

describe('AI Co-Pilot NLP Parser Suite', () => {
  it('correctly switches event type from wedding to tech event', () => {
    const result = parseCoPilotInstruction(
      'change the event theme from wedding to tech event',
      BASE_CONTEXT
    );
    expect(result.patch.eventType).toBe('community');
    expect(result.patch.eventTitle).toContain('Summit');
    expect(result.descriptions).toContain('Event Type → Tech / Community Event');
  });

  it('correctly parses 4 crore budget', () => {
    const result = parseCoPilotInstruction(
      'make the wedding budget 4 crore',
      BASE_CONTEXT
    );
    expect(result.patch.totalBudget).toBe(40000000);
    expect(result.descriptions.some((d) => d.includes('4.00 Crore'))).toBe(true);
  });

  it('correctly parses 40 lakhs budget', () => {
    const result = parseCoPilotInstruction(
      'set budget to 40 lakhs',
      BASE_CONTEXT
    );
    expect(result.patch.totalBudget).toBe(4000000);
    expect(result.descriptions.some((d) => d.includes('40.0 Lakhs'))).toBe(true);
  });

  it('correctly parses theme changes to Boho Desert', () => {
    const result = parseCoPilotInstruction(
      'change theme to Boho Desert',
      BASE_CONTEXT
    );
    expect(result.patch.culturalTheme).toBe('Boho Desert');
    expect(result.descriptions).toContain('Theme → Boho Desert');
  });

  it('correctly parses theme changes to Neon Retro', () => {
    const result = parseCoPilotInstruction(
      'switch to a cool neon retro vibe',
      BASE_CONTEXT
    );
    expect(result.patch.culturalTheme).toBe('Neon Retro');
    expect(result.descriptions).toContain('Theme → Neon Retro');
  });

  it('correctly parses cuisine change to Pan-Asian', () => {
    const result = parseCoPilotInstruction(
      'switch cuisine to Pan-Asian',
      BASE_CONTEXT
    );
    expect(result.patch.cuisinePreference).toBe('Pan-Asian');
    expect(result.descriptions).toContain('Cuisine → Pan-Asian');
  });

  it('correctly parses cuisine change to Vegan Garden', () => {
    const result = parseCoPilotInstruction(
      'make the food 100% plant-based and vegan',
      BASE_CONTEXT
    );
    expect(result.patch.cuisinePreference).toBe('Vegan Garden');
    expect(result.descriptions).toContain('Cuisine → Vegan Garden');
  });

  it('handles multi-variable command in one prompt', () => {
    const result = parseCoPilotInstruction(
      'change to a tech meetup in Goa for 150 attendees with Pan-Asian food and Minimal Luxe theme and budget 50 lakhs',
      BASE_CONTEXT
    );
    expect(result.patch.eventType).toBe('community');
    expect(result.patch.city).toBe('Goa');
    expect(result.patch.guestCount).toBe(150);
    expect(result.patch.cuisinePreference).toBe('Pan-Asian');
    expect(result.patch.culturalTheme).toBe('Minimal Luxe');
    expect(result.patch.totalBudget).toBe(5000000);
  });

  it('correctly handles percentage budget reduction', () => {
    const result = parseCoPilotInstruction(
      'trim budget by 20%',
      BASE_CONTEXT
    );
    expect(result.patch.totalBudget).toBe(3600000); // 4,500,000 * 0.8
  });
});
