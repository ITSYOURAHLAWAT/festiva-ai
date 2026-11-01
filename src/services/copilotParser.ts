import type { EventContext, EventType, ThemePreference, CuisinePreference } from '@/types';

export interface ParsedInstructionResult {
  patch: Partial<EventContext>;
  descriptions: string[];
}

/**
 * Intelligent natural-language parser for FestivaAI Co-Pilot.
 * Extracts eventType, culturalTheme, cuisinePreference, totalBudget, guestCount, city, and eventTitle.
 */
export function parseCoPilotInstruction(
  instruction: string,
  currentContext: EventContext
): ParsedInstructionResult {
  const text = instruction.trim();
  const lower = text.toLowerCase();
  const patch: Partial<EventContext> = {};
  const descriptions: string[] = [];

  // ── 1. Event Type ──────────────────────────────────────────────────────────
  // Check for explicit transitions like "from wedding to tech event", "switch to birthday", etc.
  if (
    lower.includes('tech event') ||
    lower.includes('tech meetup') ||
    lower.includes('tech') ||
    lower.includes('community') ||
    lower.includes('meetup') ||
    lower.includes('conference') ||
    lower.includes('hackathon') ||
    lower.includes('summit') ||
    lower.includes('corporate') ||
    lower.includes('seminar')
  ) {
    if (currentContext.eventType !== 'community') {
      patch.eventType = 'community' as EventType;
      // Also adjust default title if currently wedding- or birthday-specific
      if (!currentContext.eventTitle || currentContext.eventTitle.includes('Wedding') || currentContext.eventTitle.includes('Birthday')) {
        patch.eventTitle = `${currentContext.city || 'Tech'} Innovation Summit`;
      }
      descriptions.push('Event Type → Tech / Community Event');
    }
  } else if (
    lower.includes('wedding') ||
    lower.includes('marriage') ||
    lower.includes('shaadi') ||
    lower.includes('sangeet') ||
    lower.includes('reception')
  ) {
    if (currentContext.eventType !== 'wedding') {
      patch.eventType = 'wedding' as EventType;
      if (!currentContext.eventTitle || currentContext.eventTitle.includes('Summit') || currentContext.eventTitle.includes('Birthday')) {
        patch.eventTitle = "Grand Royal Wedding Celebration";
      }
      descriptions.push('Event Type → Royal Wedding');
    }
  } else if (
    lower.includes('birthday') ||
    lower.includes('bday') ||
    lower.includes('anniversary') ||
    lower.includes('milestone bash')
  ) {
    if (currentContext.eventType !== 'birthday') {
      patch.eventType = 'birthday' as EventType;
      if (!currentContext.eventTitle || currentContext.eventTitle.includes('Wedding') || currentContext.eventTitle.includes('Summit')) {
        patch.eventTitle = "Milestone Birthday Celebration";
      }
      descriptions.push('Event Type → Milestone Birthday');
    }
  }

  // ── 2. Cultural / Visual Theme ─────────────────────────────────────────────
  // 8 Themes: Royal Heritage, Neon Retro, Minimal Luxe, Garden Bloom, Midnight Gold, Coastal Breeze, Boho Desert, Art Deco
  if (lower.includes('neon') || lower.includes('retro') || lower.includes('synthwave') || lower.includes('80s')) {
    patch.culturalTheme = 'Neon Retro';
    descriptions.push('Theme → Neon Retro');
  } else if (lower.includes('minimal') || lower.includes('luxe') || lower.includes('sleek') || lower.includes('nordic')) {
    patch.culturalTheme = 'Minimal Luxe';
    descriptions.push('Theme → Minimal Luxe');
  } else if (lower.includes('garden') || lower.includes('bloom') || lower.includes('floral') || lower.includes('botanical')) {
    patch.culturalTheme = 'Garden Bloom';
    descriptions.push('Theme → Garden Bloom');
  } else if (lower.includes('midnight') || lower.includes('gold') || lower.includes('starlight') || lower.includes('celestial')) {
    patch.culturalTheme = 'Midnight Gold';
    descriptions.push('Theme → Midnight Gold');
  } else if (lower.includes('coastal') || lower.includes('breeze') || lower.includes('beach') || lower.includes('ocean') || lower.includes('tropical') || lower.includes('seaside')) {
    patch.culturalTheme = 'Coastal Breeze';
    descriptions.push('Theme → Coastal Breeze');
  } else if (lower.includes('boho') || lower.includes('desert') || lower.includes('rustic') || lower.includes('pampas')) {
    patch.culturalTheme = 'Boho Desert';
    descriptions.push('Theme → Boho Desert');
  } else if (lower.includes('art deco') || lower.includes('deco') || lower.includes('gatsby') || lower.includes('vintage') || lower.includes('antique')) {
    patch.culturalTheme = 'Art Deco';
    descriptions.push('Theme → Art Deco');
  } else if (lower.includes('royal') || lower.includes('heritage') || lower.includes('palace') || lower.includes('regal')) {
    patch.culturalTheme = 'Royal Heritage';
    descriptions.push('Theme → Royal Heritage');
  }

  // ── 3. Cuisine Preference ──────────────────────────────────────────────────
  // 8 Cuisines: Rajasthani, Continental, Fusion Tapas, South Indian, Pan-Asian, Mughlai, Vegan Garden, Dessert Bar
  if (lower.includes('pan-asian') || lower.includes('pan asian') || lower.includes('asian') || lower.includes('dimsum') || lower.includes('thai') || lower.includes('chinese') || lower.includes('sushi')) {
    patch.cuisinePreference = 'Pan-Asian';
    descriptions.push('Cuisine → Pan-Asian');
  } else if (lower.includes('rajasthani') || lower.includes('marwari') || lower.includes('dal baati')) {
    patch.cuisinePreference = 'Rajasthani';
    descriptions.push('Cuisine → Rajasthani');
  } else if (lower.includes('continental') || lower.includes('italian') || lower.includes('european') || lower.includes('pasta') || lower.includes('risotto')) {
    patch.cuisinePreference = 'Continental';
    descriptions.push('Cuisine → Continental');
  } else if (lower.includes('fusion') || lower.includes('tapas') || lower.includes('modern indian')) {
    patch.cuisinePreference = 'Fusion Tapas';
    descriptions.push('Cuisine → Fusion Tapas');
  } else if (lower.includes('south indian') || lower.includes('dosa') || lower.includes('idli') || lower.includes('sadhya') || lower.includes('chettinad')) {
    patch.cuisinePreference = 'South Indian';
    descriptions.push('Cuisine → South Indian');
  } else if (lower.includes('mughlai') || lower.includes('north indian') || lower.includes('biryani') || lower.includes('kebab') || lower.includes('awadhi') || lower.includes('nawabi')) {
    patch.cuisinePreference = 'Mughlai';
    descriptions.push('Cuisine → Mughlai');
  } else if (lower.includes('vegan') || lower.includes('plant-based') || lower.includes('plant based') || lower.includes('cruelty free') || lower.includes('dairy free')) {
    patch.cuisinePreference = 'Vegan Garden';
    descriptions.push('Cuisine → Vegan Garden');
  } else if (lower.includes('dessert') || lower.includes('patisserie') || lower.includes('bakery') || lower.includes('sweet bar') || lower.includes('gelato')) {
    patch.cuisinePreference = 'Dessert Bar';
    descriptions.push('Cuisine → Dessert Bar');
  }

  // ── 4. Total Budget ────────────────────────────────────────────────────────
  // Matches "4 crore", "4.5 crore", "40 lakhs", "₹5000000", "budget 2500000", "trim by 15%"
  const cleanNumText = lower.replace(/[,₹$\s]/g, '');
  const croreMatch = cleanNumText.match(/(\d+(?:\.\d+)?)crore/);
  const lakhMatch = cleanNumText.match(/(\d+(?:\.\d+)?)(?:lakh|lac)/);
  const bareBudgetMatch = text.match(/(?:budget|cost)\s*(?:to|=|:|\s)\s*[₹$]?\s*([\d,]+)/i);

  if (croreMatch) {
    const val = Math.round(parseFloat(croreMatch[1]) * 1e7);
    if (val > 0) {
      patch.totalBudget = val;
      descriptions.push(`Budget → ₹${(val / 1e7).toFixed(2)} Crore`);
    }
  } else if (lakhMatch) {
    const val = Math.round(parseFloat(lakhMatch[1]) * 1e5);
    if (val > 0) {
      patch.totalBudget = val;
      descriptions.push(`Budget → ₹${(val / 1e5).toFixed(1)} Lakhs`);
    }
  } else if (bareBudgetMatch) {
    const parsed = parseInt(bareBudgetMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      patch.totalBudget = parsed;
      descriptions.push(`Budget → ₹${parsed.toLocaleString('en-IN')}`);
    }
  } else if (lower.includes('trim') || lower.includes('cut') || lower.includes('reduce')) {
    const pctMatch = text.match(/(\d+)\s*%/);
    const reduction = pctMatch ? parseInt(pctMatch[1], 10) : 12;
    const factor = Math.max(0.1, 1 - reduction / 100);
    const newBudget = Math.round(currentContext.totalBudget * factor);
    patch.totalBudget = newBudget;
    descriptions.push(`Budget trimmed by ${reduction}% → ₹${newBudget.toLocaleString('en-IN')}`);
  }

  // ── 5. Guest Count ─────────────────────────────────────────────────────────
  const guestMatch =
    text.match(/(\d+)\s*(?:guests?|people|persons?|attendees?|heads?)/i) ||
    text.match(/(?:guests?|people|attendees?)\s*(?:to|=|:)\s*(\d+)/i);
  if (guestMatch) {
    const g = parseInt(guestMatch[1], 10);
    if (!isNaN(g) && g > 0) {
      patch.guestCount = g;
      descriptions.push(`Guests → ${g}`);
    }
  }

  // ── 6. City / Location ─────────────────────────────────────────────────────
  // e.g. "in Udaipur", "in Mumbai", "in Delhi", "in Bengaluru", "in Bangalore", "in Goa", "in Jaipur", "city to Jaipur", "location to Goa"
  const cityExplicit = text.match(/(?:city|location|venue in|at)\s*(?:to|=|:|\s)\s*([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
  const cityIn = text.match(/\bin\s+([A-Z][a-zA-Z]+)/);

  const matchedCity = cityExplicit ? cityExplicit[1].trim() : cityIn ? cityIn[1].trim() : null;
  // Filter out common non-city words that follow "in"
  const nonCityWords = new Set(['the', 'our', 'a', 'an', 'this', 'that', 'all', 'november', 'december', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october']);
  if (matchedCity && !nonCityWords.has(matchedCity.toLowerCase())) {
    patch.city = matchedCity;
    descriptions.push(`City → ${matchedCity}`);
  }

  // ── 7. Explicit Event Title ────────────────────────────────────────────────
  const titleMatch = text.match(/(?:title|name|call it)\s*(?:to|=|:|\s)\s*["']?([^"'\n,;]+)["']?/i);
  if (titleMatch && titleMatch[1].trim().length >= 3) {
    patch.eventTitle = titleMatch[1].trim();
    descriptions.push(`Title → "${patch.eventTitle}"`);
  }

  return { patch, descriptions };
}
