/**
 * Deterministic Fallback Engine for FestivaAI
 * Generates realistic, fully-formed event plans even if GEMINI_API_KEY is not configured.
 */

import type { EventContext, EventPlan, Milestone, Vendor } from '@/types';
import { calculateBudgetBreakdown } from './budgetMath';

function getDaysUntilEvent(eventDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const event = new Date(eventDate);
  const diff = event.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getPhaseLabel(daysOut: number): string {
  if (daysOut > 180) return '6+ Months Out';
  if (daysOut > 90) return '3-6 Months Out';
  if (daysOut > 30) return '1-3 Months Out';
  if (daysOut > 7) return '1-4 Weeks Out';
  if (daysOut > 0) return 'Final Week';
  return 'Event Day-Of';
}

export function generateFallbackPlan(context: EventContext, cacheKey: string): EventPlan {
  const budget = calculateBudgetBreakdown(context);
  const daysUntilEvent = getDaysUntilEvent(context.eventDate);

  const milestoneTemplates: Record<string, Array<{ days: number; task: string; priority: 'critical' | 'high' | 'medium' | 'low'; category: string }>> = {
    wedding: [
      { days: 240, task: 'Establish overall vision, tentative date, and core budget allocations', priority: 'critical', category: 'Venue' },
      { days: 180, task: 'Tour and lock in primary wedding venue in ' + context.city, priority: 'critical', category: 'Venue' },
      { days: 150, task: 'Contract lead caterer and finalize sample tasting sessions', priority: 'critical', category: 'Catering' },
      { days: 120, task: 'Book photographer and cinematic videography team', priority: 'high', category: 'Photography' },
      { days: 90, task: 'Finalize decor mood-board matching ' + context.culturalTheme + ' theme', priority: 'high', category: 'Decor' },
      { days: 60, task: 'Dispatch digital and printed invitations with RSVP tracking link', priority: 'high', category: 'General' },
      { days: 30, task: 'Finalize sound, DJ/live acoustic artists, and playlist cue-sheets', priority: 'medium', category: 'Entertainment' },
      { days: 14, task: 'Lock finalized guest head-count (' + context.guestCount + ') with caterer', priority: 'critical', category: 'Catering' },
      { days: 7, task: 'Reconfirm delivery schedules with all 6 vendor partners', priority: 'critical', category: 'General' },
      { days: 2, task: 'Stage rehearsal walkthrough and sound-check at venue', priority: 'high', category: 'Venue' },
      { days: 0, task: 'Live Day-Of Run of Show execution & family coordinator handoff', priority: 'critical', category: 'General' },
    ],
    birthday: [
      { days: 60, task: 'Lock in party theme (' + context.culturalTheme + ') and guest list (' + context.guestCount + ')', priority: 'high', category: 'Venue' },
      { days: 45, task: 'Reserve party venue/space in ' + context.city, priority: 'critical', category: 'Venue' },
      { days: 30, task: 'Design custom invitation cards and send save-the-dates', priority: 'high', category: 'General' },
      { days: 21, task: 'Order themed centerpiece cake and custom dessert lineup', priority: 'critical', category: 'Catering' },
      { days: 14, task: 'Hire DJ, photo-booth operator, and party games emcee', priority: 'high', category: 'Entertainment' },
      { days: 7, task: 'Assemble party favor bags and confirm balloon/decor installation', priority: 'medium', category: 'Decor' },
      { days: 2, task: 'Pick up cake accessories, props, and finalize music queue', priority: 'medium', category: 'Entertainment' },
      { days: 0, task: 'Day-of venue setup, welcoming guests, and birthday celebration', priority: 'critical', category: 'General' },
    ],
    community: [
      { days: 90, task: 'Define event charter, speaker objectives, and budget approval', priority: 'critical', category: 'General' },
      { days: 60, task: 'Secure auditorium/hall venue in ' + context.city + ' with AV infrastructure', priority: 'critical', category: 'Venue' },
      { days: 45, task: 'Publish registration portal, landing page, and call for sponsors', priority: 'high', category: 'General' },
      { days: 30, task: 'Finalize speaker lineup, session abstracts, and stage schedule', priority: 'high', category: 'Entertainment' },
      { days: 14, task: 'Confirm high-tea/lunch catering numbers and badge printing', priority: 'critical', category: 'Catering' },
      { days: 7, task: 'Send pre-event briefing logistics email to registered attendees', priority: 'high', category: 'General' },
      { days: 1, task: 'AV test, directional signage setup, and volunteer desk briefing', priority: 'critical', category: 'Venue' },
      { days: 0, task: 'Registration desk opening, keynote, lightning talks, and networking', priority: 'critical', category: 'General' },
    ],
  };

  const selectedTemplates = milestoneTemplates[context.eventType] || milestoneTemplates.community;

  const milestones: Milestone[] = selectedTemplates.map((item, idx) => {
    // Dynamic adjustment based on actual days until event
    const scaledDaysOut = Math.min(item.days, Math.max(0, daysUntilEvent));
    return {
      id: `milestone-${idx + 1}`,
      phase: getPhaseLabel(scaledDaysOut),
      daysOut: scaledDaysOut,
      task: item.task,
      priority: item.priority,
      status: scaledDaysOut > daysUntilEvent ? 'completed' : 'pending',
      category: item.category,
      notes: `Target: T-${scaledDaysOut} days`,
    };
  });

  const vendorList: Vendor[] = [
    {
      id: 'vendor-venue',
      category: 'Venue & Banqueting',
      name: `${context.city} Heritage & Banquet Space`,
      status: 'not-started',
      budget: budget.categories.find((c) => c.name === 'Venue')?.amount || Math.round(context.totalBudget * 0.3),
      notes: '',
      vettingQuestions: [
        {
          question: `Can the hall comfortably hold ${context.guestCount} seated guests while complying with local fire/safety norms?`,
          why: 'Overcrowding ruins guest experience and triggers municipal violations.',
        },
        {
          question: 'Are sound limits enforced strictly after 10:00 PM, and what is the generator power backup capacity?',
          why: 'Power cuts or police decibel restrictions can abruptly disrupt your program.',
        },
        {
          question: 'What are the exact check-in and checkout timings, including setup and teardown buffer hours?',
          why: 'Vendors need at least 3-4 hours prior to guest arrival for setup.',
        },
      ],
      redFlags: [
        {
          flag: 'Insists on 100% upfront cash payment prior to contract signing',
          risk: 'Severe cancellation or default risk with no escrow leverage.',
        },
        {
          flag: 'Refuses to list electricity, generator fuel, and cleaning charges in written annexure',
          risk: 'Post-event surprise invoices averaging 15-20% extra.',
        },
      ],
    },
    {
      id: 'vendor-catering',
      category: 'Catering & Dining',
      name: `Signature ${context.cuisinePreference.toUpperCase()} Caterers`,
      status: 'not-started',
      budget: budget.categories.find((c) => c.name === 'Catering')?.amount || Math.round(context.totalBudget * 0.35),
      notes: '',
      vettingQuestions: [
        {
          question: `What is the exact per-plate cost breakdown for ${context.guestCount} guests including live food stations?`,
          why: 'Clarifies whether crockery, service staff, water bottles, and taxes are bundled.',
        },
        {
          question: `How do you guarantee segregation and food safety for ${context.cuisinePreference} dietary preferences?`,
          why: 'Prevents cross-contamination and respects guest religious/health restrictions.',
        },
        {
          question: 'What is your staff-to-guest ratio for buffet replenishment and table service?',
          why: 'A minimum ratio of 1 server per 20 guests is necessary to avoid food counter queues.',
        },
      ],
      redFlags: [
        {
          flag: 'Does not offer a scheduled food tasting session before booking confirmation',
          risk: 'Quality variance on event day cannot be rectified.',
        },
        {
          flag: 'No commercial FSSAI / food handler hygiene certifications available',
          risk: 'High food poisoning liability for hosts.',
        },
      ],
    },
    {
      id: 'vendor-decor',
      category: 'Decor & Production',
      name: `Artisan ${context.culturalTheme.toUpperCase()} Stylists`,
      status: 'not-started',
      budget: budget.categories.find((c) => c.name === 'Decor')?.amount || Math.round(context.totalBudget * 0.12),
      notes: '',
      vettingQuestions: [
        {
          question: `Will real or artificial florals be utilized for the entrance and stage backdrop in ${context.city}?`,
          why: 'Fresh exotic flowers increase pricing dramatically in extreme weather.',
        },
        {
          question: 'Do you supply comprehensive 3D visual renders or mood boards before ordering fabrication materials?',
          why: 'Prevents misaligned aesthetic expectations on setup day.',
        },
      ],
      redFlags: [
        {
          flag: 'Only exhibits Pinterest photos rather than their own completed execution portfolio',
          risk: 'Inability to execute complex structures safely.',
        },
      ],
    },
    {
      id: 'vendor-photo',
      category: 'Photography & Cinema',
      name: 'Lens & Light Visuals',
      status: 'not-started',
      budget: budget.categories.find((c) => c.name === 'Photography')?.amount || Math.round(context.totalBudget * 0.08),
      notes: '',
      vettingQuestions: [
        {
          question: 'Who will be the specific lead photographer shooting on-site (not just agency sub-contractors)?',
          why: 'Secures the actual talent and artistic style you reviewed in their portfolio.',
        },
        {
          question: 'What is the promised contract turnaround timeline for teaser videos and full raw/edited galleries?',
          why: 'Prevents standard industry delays stretching 6+ months.',
        },
      ],
      redFlags: [
        {
          flag: 'Contract lacks explicit raw footage handover or equipment backup clauses',
          risk: 'Loss of irreproducible memories due to single SD card or sensor failure.',
        },
      ],
    },
    {
      id: 'vendor-entertainment',
      category: 'Entertainment & Audio/Visual',
      name: 'Rhythm & Beats Sound Works',
      status: 'not-started',
      budget: budget.categories.find((c) => c.name === 'Entertainment')?.amount || Math.round(context.totalBudget * 0.1),
      notes: '',
      vettingQuestions: [
        {
          question: 'Do you provide professional wireless microphones, stage monitors, and an on-site sound engineer?',
          why: 'Ensures clear speeches, music fidelity, and zero audio feedback screeches.',
        },
        {
          question: 'Can you seamlessly accommodate song requests and custom ceremony/entrance playlists?',
          why: 'Keeps crowd engagement high throughout the celebration.',
        },
      ],
      redFlags: [
        {
          flag: 'Does not provide backup amplifiers or mixer consoles on site',
          risk: 'Single audio hardware failure halts the entire event.',
        },
      ],
    },
  ];

  const colorPalettes: Record<string, { primary: string; secondary: string; accent: string; neutral: string; name: string }> = {
    royal: { primary: '#6B21A8', secondary: '#B45309', accent: '#F59E0B', neutral: '#FAF5FF', name: 'Regal Velvet & Marigold Gold' },
    rustic: { primary: '#78350F', secondary: '#15803D', accent: '#D97706', neutral: '#FFFBEB', name: 'Earthy Terracotta & Forest Olive' },
    modern: { primary: '#0F172A', secondary: '#6366F1', accent: '#EC4899', neutral: '#F8FAFC', name: 'Neo-Midnight & Neon Magenta' },
    boho: { primary: '#9A3412', secondary: '#D97706', accent: '#E11D48', neutral: '#FFF7ED', name: 'Desert Sunset & Pampas Rose' },
    traditional: { primary: '#991B1B', secondary: '#D97706', accent: '#047857', neutral: '#FEF2F2', name: 'Auspicious Crimson, Saffron & Emerald' },
    minimalist: { primary: '#1E293B', secondary: '#64748B', accent: '#0EA5E9', neutral: '#F1F5F9', name: 'Monochrome Slate & Nordic Cyan' },
    tropical: { primary: '#047857', secondary: '#0284C7', accent: '#F59E0B', neutral: '#ECFDF5', name: 'Amazonian Palm & Coral Hibiscus' },
    vintage: { primary: '#831843', secondary: '#A16207', accent: '#475569', neutral: '#FDF2F8', name: 'Antique Bordeaux & Aged Brass' },
  };

  const themeNormalized = ((): string => {
    const raw = String(context.culturalTheme || '').toLowerCase();
    if (raw.includes('royal')) return 'royal';
    if (raw.includes('retro') || raw.includes('modern')) return 'modern';
    if (raw.includes('minimal')) return 'minimalist';
    if (raw.includes('bloom') || raw.includes('boho')) return 'boho';
    if (raw.includes('gold') || raw.includes('vintage')) return 'vintage';
    if (raw.includes('coastal') || raw.includes('tropical')) return 'tropical';
    if (raw.includes('rustic') || raw.includes('desert')) return 'rustic';
    if (raw.includes('traditional') || raw.includes('art deco')) return 'traditional';
    return 'royal';
  })();

  const palette = colorPalettes[themeNormalized] || colorPalettes.royal;

  const menusByCuisine: Record<string, Array<{ course: string; items: string[]; dietaryNotes: string }>> = {
    'north-indian': [
      { course: 'Welcome Beverages & Street Starters', items: ['Kesaria Thandai', 'Dahi Bhalla Shots', 'Amritsari Paneer Tikka', 'Tandoori Broccoli'], dietaryNotes: '100% Vegetarian options curated' },
      { course: 'Royal Main Course', items: ['Dal Makhani Simmered 24hrs', 'Shahi Paneer Lababdar', 'Subz Dum Biryani', 'Assorted Chur Chur Naans & Tandoori Rotis'], dietaryNotes: 'Rich, authentic regional gravies' },
      { course: 'Dessert Extravaganza', items: ['Hot Jalebi with Rabri', 'Gulab Jamun Flambé', 'Kesar Pista Kulfi'], dietaryNotes: 'Contains milk/dry fruits' },
    ],
    'south-indian': [
      { course: 'Welcome Refreshments', items: ['Elaneer Payasam Cooler', 'Guntur Podi Idli Bites', 'Mysore Bonda with Coconut Chutneys'], dietaryNotes: 'Fresh coconut and gluten-sensitive' },
      { course: 'Traditional Sadhya / Feast', items: ['Avial', 'Bisibelebath with Boondi', 'Parippu Curry with Ghee', 'Malabar Parotta with Veg Kurma'], dietaryNotes: 'Rich in traditional spices' },
      { course: 'Sweet Finish', items: ['Ada Pradhaman', 'Filter Coffee Ice Cream', 'Mysore Pak Cubes'], dietaryNotes: 'Authentic jaggery and ghee' },
    ],
    vegetarian: [
      { course: 'Artisanal Starters', items: ['Crispy Lotus Stem in Sweet Chili', 'Smoked Paneer Skewers', 'Stuffed Wild Mushroom Crostini'], dietaryNotes: 'Pure vegetarian & crisp' },
      { course: 'Wholesome Mains', items: ['Sun-dried Tomato Risotto or Paneer Tikka Masala', 'Charred Garden Greens', 'Saffron Pulao'], dietaryNotes: 'Farm-fresh and balanced' },
      { course: 'Desserts', items: ['Belgian Dark Chocolate Mousse', 'Baked Rasgulla', 'Berry Panna Cotta'], dietaryNotes: 'Vegetarian gelatin alternatives used' },
    ],
    mixed: [
      { course: 'Appetizers (Veg & Non-Veg)', items: ['Bhatti Murgh Tikka', 'Crispy Corn & Water Chestnut', 'Fish Amritsari', 'Tandoori Malai Soya Chaap'], dietaryNotes: 'Clear color-coded serving platters' },
      { course: 'Signature Mains', items: ['Slow-cooked Dum Butter Chicken', 'Dal Bukhara', 'Kashmiri Mutton Rogan Josh or Paneer Pasanda', 'Zaffrani Biryani with Burani Raita'], dietaryNotes: 'Dual kitchen live buffet' },
      { course: 'Dessert Bar', items: ['Molten Chocolate Fondant', 'Warm Moong Dal Halwa', 'Vanilla Bean Gelato'], dietaryNotes: 'Comprehensive crowd favorites' },
    ],
  };

  const cuisineNormalized = ((): string => {
    const raw = String(context.cuisinePreference || '').toLowerCase();
    if (raw.includes('rajasthani') || raw.includes('north') || raw.includes('mughlai')) return 'north-indian';
    if (raw.includes('south')) return 'south-indian';
    if (raw.includes('vegan') || raw.includes('veg') || raw.includes('dessert')) return 'vegetarian';
    return 'mixed';
  })();

  const menu = menusByCuisine[cuisineNormalized] || menusByCuisine.mixed;

  const invitationWording =
    context.eventType === 'wedding'
      ? `Together with their families, you are warmly invited to honor and celebrate the union of two souls in ${context.city}. Join us on ${new Date(context.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} for an unforgettable evening of love, tradition, and shared memories. RSVP required.`
      : context.eventType === 'birthday'
      ? `A celebration of life, laughter, and a landmark journey! Please join us as we celebrate a fabulous birthday bash on ${new Date(context.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} in ${context.city}. Get ready for good vibes, great food, and dancing!`
      : `You are cordially invited to attend the ${context.city} Community Summit on ${new Date(context.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}. Join innovators, creators, and leaders for a day of inspiring keynotes, networking sessions, and collaborative growth.`;

  return {
    context,
    budget,
    timeline: {
      eventDate: context.eventDate,
      daysUntilEvent,
      milestones,
    },
    vendors: {
      vendors: vendorList,
    },
    vibe: {
      colorPalette: {
        ...palette,
        description: `Curated ${context.culturalTheme} aesthetic tailored for ${context.eventType} in ${context.city}.`,
      },
      decorConcepts: [
        `Grand entrance pathway framed with warm uplighting and ${palette.name} floral drapes.`,
        `Low-seating lounge nook with textured bolsters and brass hurricane lantern candle clusters.`,
        `Photo-op feature wall featuring illuminated monogram signage and themed textures.`,
        `Focal stage centerpiece incorporating delicate ambient fabric layers and pin-spot lighting.`,
        `Scented marigold or jasmine water bowl accents placed across guest registration tables.`,
      ],
      menuSuggestions: menu,
      invitationWording,
      ambiance: `Warm, welcoming, and celebratory with acoustic instrumental melodies drifting during welcome reception, transitioning into dynamic celebration rhythms.`,
      musicSuggestions: [
        `Welcome reception: Acoustic instrumental guitar & Santoor fusion`,
        `Dining hour: Curated soft indie-folk & retro lounge classics`,
        `Celebration climax: High-energy dance tracks and celebratory anthems`,
      ],
    },
    generatedAt: new Date().toISOString(),
    cacheKey,
  };
}
