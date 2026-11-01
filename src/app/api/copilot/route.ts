import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import type { EventPlan, VibeStudio, BudgetBreakdown, EventContext } from '@/types';
import { sanitizeInput } from '@/services/security';
import { rebalanceBudget } from '@/services/budgetMath';
import { parseCoPilotInstruction } from '@/services/copilotParser';
import { generateFallbackPlan } from '@/services/fallback';

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

    // ── Deterministic fallback (no API key or demo mode) ────────────────────
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      const { patch: parsedPatch } = parseCoPilotInstruction(sanitizedInstruction, currentPlan.context);
      const newContext: EventContext = { ...currentPlan.context, ...parsedPatch };

      // If context changed, generate a freshly themed/budgeted fallback plan
      const regeneratedPlan = generateFallbackPlan(newContext, 'copilot_fallback');
      let updatedVibe: VibeStudio = { ...regeneratedPlan.vibe };
      let updatedBudget: BudgetBreakdown = { ...regeneratedPlan.budget };

      // Extra fine-grained overrides:
      if (lowerInstr.includes('sangeet')) {
        updatedVibe = {
          ...updatedVibe,
          ambiance: 'Vibrant Sangeet celebration with dazzling festive fairy lights, traditional Dhol drummers, and a high-energy LED dance floor.',
          musicSuggestions: [
            'Live Dhol entrance beats',
            'Choreographed family Sangeet dance medley',
            'Bollywood DJ chartbusters & Punjabi folk remix for open floor',
          ],
        };
      }

      if (lowerInstr.includes('decor') && (lowerInstr.includes('reduce') || lowerInstr.includes('cut') || lowerInstr.includes('trim'))) {
        const decorIdx = updatedBudget.categories.findIndex((c) => c.name === 'Decor');
        if (decorIdx !== -1) {
          const pctMatch = sanitizedInstruction.match(/(\d+)\s*%/);
          const reductionPct = pctMatch ? parseInt(pctMatch[1], 10) : 15;
          const currentPct = updatedBudget.categories[decorIdx].percentage;
          const newPct = Math.max(5, currentPct * (1 - reductionPct / 100));
          const rebalanced = rebalanceBudget(updatedBudget.categories, decorIdx, newPct, updatedBudget.totalBudget);
          updatedBudget = { ...updatedBudget, categories: rebalanced };
        }
      }

      return NextResponse.json({
        context: newContext,
        vibe: updatedVibe,
        budget: updatedBudget,
      });
    }

    // ── Live Gemini Path ─────────────────────────────────────────────────────
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are FestivaAI Co-Pilot. The user wants to modify their event plan for a ${currentPlan.context.eventType} in ${currentPlan.context.city}.

User Modification Instruction: "${sanitizedInstruction}"

Current Context:
${JSON.stringify(currentPlan.context, null, 2)}

Current Vibe Studio:
${JSON.stringify(currentPlan.vibe, null, 2)}

Current Budget:
${JSON.stringify(currentPlan.budget, null, 2)}

Apply the requested changes and output ONLY a JSON object containing the updated fields:
{
  "context": { ...updated context fields if changed },
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

