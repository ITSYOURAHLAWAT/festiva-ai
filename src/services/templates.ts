import type { QuickTemplate } from '@/types';

export const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    id: 'royal-wedding',
    label: 'Royal Wedding - 300 Guests',
    emoji: '💍',
    context: {
      eventType: 'wedding',
      guestCount: 300,
      totalBudget: 2500000, // ₹25 Lakhs
      city: 'Jaipur',
      culturalTheme: 'royal',
      cuisinePreference: 'north-indian',
      additionalNotes: 'Grand traditional palace wedding with Rajasthani hospitality and sunset phere.',
    },
  },
  {
    id: 'milestone-birthday',
    label: 'Milestone 30th Birthday - 50 Guests',
    emoji: '🎂',
    context: {
      eventType: 'birthday',
      guestCount: 50,
      totalBudget: 150000, // ₹1.5 Lakhs
      city: 'Bengaluru',
      culturalTheme: 'modern',
      cuisinePreference: 'mixed',
      additionalNotes: 'Chic rooftop sundowner with live acoustic music and custom cocktail station.',
    },
  },
  {
    id: 'tech-meetup',
    label: 'Local Tech Community Meetup - 150 Guests',
    emoji: '💻',
    context: {
      eventType: 'community',
      guestCount: 150,
      totalBudget: 200000, // ₹2 Lakhs
      city: 'Hyderabad',
      culturalTheme: 'minimalist',
      cuisinePreference: 'vegetarian',
      additionalNotes: 'AI Hackathon demo day with sponsor exhibition tables and networking high-tea.',
    },
  },
];
