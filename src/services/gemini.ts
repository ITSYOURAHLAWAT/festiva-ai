import type { EventContext, EventPlan } from '@/types';

/**
 * Client-side Gemini service — calls server-side API routes.
 * Never exposes API keys to the browser.
 */

export interface GeminiGenerateRequest {
  context: EventContext;
  cacheKey: string;
}

export interface GeminiCoPilotRequest {
  currentPlan: EventPlan;
  userInstruction: string;
}

export async function generateEventPlan(
  context: EventContext,
  cacheKey: string
): Promise<EventPlan> {
  const response = await fetch('/api/generate-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ context, cacheKey } satisfies GeminiGenerateRequest),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: 'Unknown error' }))) as { message?: string };
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json() as Promise<EventPlan>;
}

export async function executeCoPilotInstruction(
  currentPlan: EventPlan,
  userInstruction: string
): Promise<Partial<EventPlan>> {
  const response = await fetch('/api/copilot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPlan, userInstruction } satisfies GeminiCoPilotRequest),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: 'Unknown error' }))) as { message?: string };
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json() as Promise<Partial<EventPlan>>;
}
