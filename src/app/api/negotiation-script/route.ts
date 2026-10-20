import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import type { Vendor, EventContext } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { vendor: Vendor; context: EventContext };
    const { vendor, context } = body;

    if (!vendor || !context) {
      return NextResponse.json({ message: 'Vendor and context details are required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Realistic fallback script if offline or without API key
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      const script = `Subject: Inquiry & Scope Proposal: ${context.eventType.toUpperCase()} in ${context.city} on ${new Date(context.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}

Dear ${vendor.name || vendor.category + ' Team'},

I hope this email finds you well.

We are currently planning our ${context.eventType} celebration scheduled for ${new Date(context.eventDate).toLocaleDateString('en-IN', { dateStyle: 'full' })} in ${context.city}, hosting approximately ${context.guestCount} attendees. Your portfolio and recent execution reviews came highly recommended to us.

We are establishing our vendor contracts and would like to formally invite a detailed quotation for ${vendor.category} services.

Core Event Parameters:
- Event Nature: ${context.eventType.charAt(0).toUpperCase() + context.eventType.slice(1)} (${context.culturalTheme} Aesthetic)
- Guest Scale: ${context.guestCount} Confirmed Attendees
- Date & Location: ${new Date(context.eventDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}, ${context.city}
- Target Budget Allocation: ₹${vendor.budget.toLocaleString('en-IN')} (All-inclusive of staffing, transportation, and taxes)

Discussion Points & Deliverable Requirements:
1. Itemized Proposal: Could you furnish an itemized proposal aligning within or close to our allocated ceiling of ₹${vendor.budget.toLocaleString('en-IN')}?
2. Package Headroom: Are there bundled package discounts, seasonal incentives, or early-commitment concessions available?
3. Service Level Agreement: What is your standard payment milestone schedule (e.g., 20% advance booking, balance post-soundcheck/delivery)?
4. Backup Readiness: What contingency measures and on-site backup equipment/personnel do you guarantee in the written contract?

We are actively scheduling vendor walkthroughs this week and would appreciate reviewing your quotation by this Friday.

Warm regards,
Event Host / Coordinating Committee
Phone: [Your Phone] | Email: [Your Email]`;

      return NextResponse.json({ script });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert event manager in India. Draft an assertive, highly professional vendor quotation inquiry and price negotiation email for:

Vendor Domain: ${vendor.category}
Assigned Name: ${vendor.name}
Event Type: ${context.eventType}
City: ${context.city}
Event Date: ${context.eventDate}
Guest Count: ${context.guestCount}
Budget Ceiling: ₹${vendor.budget.toLocaleString('en-IN')}
Theme: ${context.culturalTheme}

The email must:
1. Have a clear, actionable Subject line.
2. Compliment their work while maintaining strong price negotiation discipline.
3. State the budget ceiling of ₹${vendor.budget.toLocaleString('en-IN')} clearly.
4. Request an itemized invoice, payment terms, and contingency assurances.
5. Inquire about off-peak/early-booking price concessions.
6. Return clean formatted plain text suitable for email.`;

    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        temperature: 0.6,
        maxOutputTokens: 1024,
      },
    });

    const script = result.text || 'Unable to generate script.';
    return NextResponse.json({ script });
  } catch (err) {
    console.error('Error in /api/negotiation-script:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Failed to generate negotiation script.' },
      { status: 500 }
    );
  }
}
