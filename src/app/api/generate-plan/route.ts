import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import type { EventContext, EventPlan } from '@/types';
import { generateFallbackPlan } from '@/services/fallback';
import { sanitizeInput, redactPII } from '@/services/security';
import { EventPlanSchema } from '@/services/schemas';

const RequestSchema = z.object({
  context: z.object({
    eventTitle: z.string().max(120).optional(),
    eventType: z.enum(['wedding', 'birthday', 'community']),
    guestCount: z.number().int().min(1).max(10000),
    totalBudget: z.number().min(10000).max(100000000),
    eventDate: z.string().min(1),
    city: z.string().min(2).max(100),
    culturalTheme: z.enum(['royal', 'rustic', 'modern', 'boho', 'traditional', 'minimalist', 'tropical', 'vintage']),
    cuisinePreference: z.enum(['vegetarian', 'vegan', 'non-vegetarian', 'mixed', 'north-indian', 'south-indian', 'continental', 'fusion']),
    additionalNotes: z.string().max(500),
  }),
  cacheKey: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let contextData: EventContext | null = null;
  let cacheKeyData = 'default-cache-key';

  try {
    const rawBody = (await request.json()) as unknown;
    const parsed = RequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid input constraints: ' + parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { context, cacheKey } = parsed.data;
    contextData = context as EventContext;
    cacheKeyData = cacheKey;

    // Validate future date
    const targetDate = new Date(context.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(targetDate.getTime()) || targetDate < today) {
      return NextResponse.json(
        { message: 'Event date must be a valid future date.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if API key is not configured or placeholder
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      const fallback = generateFallbackPlan(contextData, cacheKeyData);
      return NextResponse.json(fallback);
    }

    // Call Gemini 1.5 Flash via @google/genai
    const ai = new GoogleGenAI({ apiKey });
    const sanitizedNotes = sanitizeInput(context.additionalNotes);

    const daysUntilEvent = Math.max(
      0,
      Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    );

    const prompt = `You are FestivaAI, an expert event architect in India. Generate a comprehensive, professional, JSON-only event architecture plan matching these parameters:

Event Type: ${context.eventType}
Guest Count: ${context.guestCount}
Total Budget: ₹${context.totalBudget.toLocaleString('en-IN')}
Event Date: ${context.eventDate} (${daysUntilEvent} days from today)
Location: ${context.city}
Theme: ${context.culturalTheme}
Cuisine Focus: ${context.cuisinePreference}
Notes: ${sanitizedNotes || 'None'}

Return ONLY valid JSON with this exact structure:
{
  "budget": {
    "totalBudget": ${context.totalBudget},
    "categories": [
      { "name": "Venue", "percentage": 30, "amount": ${Math.round(context.totalBudget * 0.3)}, "icon": "🏛️", "color": "bg-purple-500", "minPercent": 20, "alert": null },
      { "name": "Catering", "percentage": 35, "amount": ${Math.round(context.totalBudget * 0.35)}, "icon": "🍽️", "color": "bg-orange-500", "minPercent": 25, "alert": null },
      { "name": "Decor", "percentage": 12, "amount": ${Math.round(context.totalBudget * 0.12)}, "icon": "🌸", "color": "bg-pink-500", "minPercent": 5 },
      { "name": "Entertainment", "percentage": 10, "amount": ${Math.round(context.totalBudget * 0.1)}, "icon": "🎵", "color": "bg-blue-500", "minPercent": 5 },
      { "name": "Photography", "percentage": 8, "amount": ${Math.round(context.totalBudget * 0.08)}, "icon": "📷", "color": "bg-green-500", "minPercent": 2 },
      { "name": "Emergency Buffer", "percentage": 5, "amount": ${Math.round(context.totalBudget * 0.05)}, "icon": "🛡️", "color": "bg-gray-500", "minPercent": 5 }
    ],
    "perGuestCost": ${Math.round(context.totalBudget / context.guestCount)},
    "recommendations": ["string", "string", "string"]
  },
  "timeline": {
    "eventDate": "${context.eventDate}",
    "daysUntilEvent": ${daysUntilEvent},
    "milestones": [
      {
        "id": "m1",
        "phase": "Planning Phase",
        "daysOut": ${Math.min(180, daysUntilEvent)},
        "task": "Task description",
        "priority": "critical",
        "status": "pending",
        "category": "Venue",
        "notes": "Target note"
      }
    ]
  },
  "vendors": {
    "vendors": [
      {
        "id": "v1",
        "category": "Venue & Banqueting",
        "name": "Local Venue Name",
        "status": "not-started",
        "budget": ${Math.round(context.totalBudget * 0.3)},
        "notes": "",
        "vettingQuestions": [
          { "question": "Question text?", "why": "Strategic rationale" }
        ],
        "redFlags": [
          { "flag": "Flag text", "risk": "Risk text" }
        ]
      }
    ]
  },
  "vibe": {
    "colorPalette": {
      "name": "Palette name",
      "primary": "#7C3AED",
      "secondary": "#DB2777",
      "accent": "#F59E0B",
      "neutral": "#F8FAFC",
      "description": "Palette description"
    },
    "decorConcepts": ["concept 1", "concept 2", "concept 3"],
    "menuSuggestions": [
      {
        "course": "Welcome Course",
        "items": ["dish 1", "dish 2"],
        "dietaryNotes": "Dietary compliance"
      }
    ],
    "invitationWording": "Warm invitation prose...",
    "ambiance": "Ambiance narrative...",
    "musicSuggestions": ["track 1", "track 2", "track 3"]
  }
}

Customize every detail specifically for ${context.city}, ${context.culturalTheme}, and ${context.cuisinePreference}. No markdown code fences.`;

    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.6,
        maxOutputTokens: 4096,
      },
    });

    const responseText = result.text;
    if (!responseText) {
      throw new Error('Empty response received from Gemini.');
    }

    const cleanedJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const rawParsed = JSON.parse(cleanedJson) as unknown;

    // Validate structured response against Zod schema
    const validation = EventPlanSchema.safeParse(rawParsed);
    if (!validation.success) {
      console.warn('Gemini response did not strictly pass Zod schema. Using safe fallback merge.', validation.error);
      const fallback = generateFallbackPlan(contextData, cacheKeyData);
      return NextResponse.json(fallback);
    }

    const completePlan: EventPlan = {
      context: contextData,
      budget: validation.data.budget,
      timeline: validation.data.timeline,
      vendors: validation.data.vendors,
      vibe: validation.data.vibe,
      generatedAt: new Date().toISOString(),
      cacheKey: cacheKeyData,
    };

    return NextResponse.json(completePlan);
  } catch (err) {
    console.error('Error in /api/generate-plan handler:', err);
    if (contextData) {
      const fallback = generateFallbackPlan(contextData, cacheKeyData);
      return NextResponse.json(fallback);
    }
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Plan generation failed.' },
      { status: 500 }
    );
  }
}
