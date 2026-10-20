/**
 * Security & Responsible AI Hardening Service for FestivaAI
 * - XSS input sanitization
 * - PII detection & redaction ([REDACTED])
 * - Input validation constraints
 */

// Regex patterns for sensitive PII identification
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(?:\+?\d{1,3}[\s.-]*)?\(?\d{3,5}\)?[\s.-]?\d{3,5}(?:[\s.-]?\d{4,5})?|\b\d{10}\b/g;
const CREDIT_CARD_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
const AADHAAR_REGEX = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
const PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g;

/**
 * Strips HTML, script tags, and SQL injection syntax to prevent Cross-Site Scripting (XSS).
 */
export function sanitizeInput(text: string): string {
  if (!text || typeof text !== 'string') return '';
  // Strip HTML / script / style tags
  const noHtml = text.replace(/<[^>]*>/g, '');
  // Strip common SQL injection tokens
  const noSql = noHtml.replace(/('|"|;|--|\/\*|\*\/|xp_|UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)/gi, '');
  // Apply PII redaction and enforce length cap of 500 chars
  return redactPII(noSql).trim().slice(0, 500);
}

/**
 * Masks all personally identifiable information (emails, phone numbers, card numbers, tax IDs)
 * with [REDACTED] before prompt synthesis for Google Gemini.
 */
export function redactPII(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(EMAIL_REGEX, '[REDACTED]')
    .replace(CREDIT_CARD_REGEX, '[REDACTED]')
    .replace(PHONE_REGEX, '[REDACTED]')
    .replace(AADHAAR_REGEX, '[REDACTED]')
    .replace(PAN_REGEX, '[REDACTED]');
}

// Backward-compatibility alias
export const maskPII = redactPII;

/**
 * Security validation helper for numerical budgets
 */
export function validateBudgetInput(budget: number | string): { valid: boolean; error?: string } {
  const num = typeof budget === 'string' ? parseFloat(budget) : budget;
  if (isNaN(num)) return { valid: false, error: 'Budget must be a valid number.' };
  if (num <= 0) return { valid: false, error: 'Budget must be strictly greater than ₹0.' };
  if (num < 10000) return { valid: false, error: 'Minimum viable budget is ₹10,000 for realistic vendor allocations.' };
  if (num > 100000000) return { valid: false, error: 'Maximum budget cannot exceed ₹10 Crore.' };
  return { valid: true };
}

/**
 * Security validation helper for guest attendance
 */
export function validateGuestCountInput(guests: number | string): { valid: boolean; error?: string } {
  const num = typeof guests === 'string' ? parseInt(guests, 10) : guests;
  if (isNaN(num)) return { valid: false, error: 'Guest count must be a valid number.' };
  if (num <= 0) return { valid: false, error: 'Guest count must be strictly greater than 0.' };
  if (!Number.isInteger(num)) return { valid: false, error: 'Guest count must be a whole integer.' };
  if (num > 10000) return { valid: false, error: 'Maximum guest count capacity is 10,000 attendees.' };
  return { valid: true };
}
