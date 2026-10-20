import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import type { EventPlan, VibeStudio, BudgetBreakdown } from '@/types';
import { sanitizeInput } from '@/services/piiMasker';
import { rebalanceBudget } from '@/services/budgetMath';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { currentPlan: EventPlan; userInstruction: string };
    const { currentPlan, userInstruction } = body;

    if (!userInstruction || typeof userInstruction !== 'string' || !userInstruction.trim()) {
      return NextResponse.json({ message: 'Instruction is required.' }, { status: 400 });
    }

    const sanitizedInstruction = sanitizeInput(userInstruction);
    const lowerInstr = sanitizedInstruction.toLowerCase();
    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback or offline simulation
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      let updatedVibe: VibeStudio = { ...currentPlan.vibe };
      let updatedBudget: BudgetBreakdown = { ...currentPlan.budget };

      if (lowerInstr.includes('vegetarian') || lowerInstr.includes('veg')) {
        updatedVibe = {
          ...updatedVibe,
          menuSuggestions: [
            { course: 'Welcome Refreshers', items: ['Rose Sharbat Cooler', 'Aam Panna', 'Fresh Coconut Spritz'], dietaryNotes: '100% Plant-Based & Vegan' },
            { course: 'Royal Starters', items: ['Amritsari Paneer Tikka', 'Dahi Ke Kebab', 'Charred Malai Broccoli', 'Crispy Lotus Bites'], dietaryNotes: 'Pure Vegetarian Certified' },
            { course: 'Grand Feast', items: ['Dal Makhani Cooked Slow Overnight', 'Paneer Lababdar', 'Subz Dum Handi', 'Kashmiri Saffron Pulao', 'Garlic Chur-Chur Naan'], dietaryNotes: 'Authentic Traditional Vegetarian Recipes' },
            { course: 'Dessert Gallery', items: ['Angoori Rasmalai with Saffron', 'Hot Jalebi with Rabri', 'Baked Gulab Jamun'], dietaryNotes: 'Contains pure dairy ghee and saffron' },
          ],
        };
      }

      if (lowerInstr.includes('decor') && (lowerInstr.includes('reduce') || lowerInstr.includes('cut'))) {
        const decorIdx = updatedBudget.categories.findIndex((c) => c.name === 'Decor');
        if (decorIdx !== -1) {
          const currentPct = updatedBudget.categories[decorIdx].percentage;
          const newPct = Math.max(5, currentPct * 0.85);
          const rebalanced = rebalanceBudget(updatedBudget.categories, decorIdx, newPct, updatedBudget.totalBudget);
          updatedBudget = { ...updatedBudget, categories: rebalanced };
        }
      }

      if (lowerInstr.includes('tropical') || lowerInstr.includes('beach')) {
        updatedVibe = {
          ...updatedVibe,
          colorPalette: {
            name: 'Tropical Coral & Ocean Emerald',
            primary: '#047857',
            secondary: '#0284C7',
            accent: '#F59E0B',
            neutral: '#ECFDF5',
            description: 'Vibrant tropical aesthetic with sun-soaked coral hues and lush palms.',
          },
          musicSuggestions: [
            'Acoustic ukulele & steel drum welcoming tunes',
            'Sunset Bossa Nova during appetizer service',
            'High-energy tropical house & beach pop for celebration',
          ],
        };
      }

      if (lowerInstr.includes('formal') || lowerInstr.includes('traditional')) {
        updatedVibe = {
          ...updatedVibe,
          invitationWording: `With the blessings of our elders and the grace of the Almighty, we cordially request the honor of your auspicious presence as we celebrate this landmark occasion in ${currentPlan.context.city}. Your gracious presence and prayers will bestow immense joy upon our family.`,
        };
      }

      return NextResponse.json({
        vibe: updatedVibe,
        budget: updatedBudget,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are FestivaAI Co-Pilot. The user wants to modify their event plan for a ${currentPlan.context.eventType} in ${currentPlan.context.city}.

User Modification Instruction: "${sanitizedInstruction}"

Current Vibe Studio:
${JSON.stringify(currentPlan.vibe, null, 2)}

Current Budget:
${JSON.stringify(currentPlan.budget, null, 2)}

Apply the requested changes and output ONLY a JSON object containing the updated fields:
{
  "vibe": { ...complete updated vibe studio structure },
  "budget": { ...complete updated budget structure if budget was modified, otherwise omit }
}

No markdown, pure JSON.`;

    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.6,
        maxOutputTokens: 2048,
      },
    });

    const responseText = result.text;
    if (!responseText) throw new Error('Empty response from Gemini co-pilot');

    const cleanedJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const updates = JSON.parse(cleanedJson) as Partial<EventPlan>;

    return NextResponse.json(updates);
  } catch (err) {
    console.error('Error in /api/copilot:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Co-pilot refinement failed.' },
      { status: 500 }
    );
  }
}
