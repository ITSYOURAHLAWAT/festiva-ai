/**
 * PII Masker — strips personal identifiers before sending to Gemini
 */

// Regex patterns for PII detection
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
const AADHAAR_REGEX = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
const PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g;
const CREDIT_CARD_REGEX = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;

export function maskPII(text: string): string {
  return text
    .replace(EMAIL_REGEX, '[EMAIL_REDACTED]')
    .replace(PHONE_REGEX, '[PHONE_REDACTED]')
    .replace(AADHAAR_REGEX, '[ID_REDACTED]')
    .replace(PAN_REGEX, '[PAN_REDACTED]')
    .replace(CREDIT_CARD_REGEX, '[CARD_REDACTED]');
}

export function sanitizeInput(input: string): string {
  // Strip HTML tags and script content
  const noHtml = input.replace(/<[^>]*>/g, '');
  // Strip SQL injection patterns
  const noSql = noHtml.replace(/('|"|;|--|\/\*|\*\/|xp_|UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)/gi, '');
  // Apply PII masking
  return maskPII(noSql).trim().slice(0, 500);
}
