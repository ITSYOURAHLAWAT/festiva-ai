import { describe, it, expect } from 'vitest';
import { maskPII, sanitizeInput } from '@/services/piiMasker';

describe('maskPII', () => {
  it('masks email addresses', () => {
    const text = 'Reach out at planner@festiva.ai or test.user@gmail.com for details';
    const masked = maskPII(text);
    expect(masked).not.toContain('planner@festiva.ai');
    expect(masked).not.toContain('test.user@gmail.com');
    expect(masked).toContain('[REDACTED]');
  });

  it('masks telephone and mobile numbers', () => {
    const text = 'Call coordinator on +91 98765 43210 or 9876543210 immediately.';
    const masked = maskPII(text);
    expect(masked).not.toContain('98765 43210');
    expect(masked).not.toContain('9876543210');
    expect(masked).toContain('[REDACTED]');
  });

  it('masks Indian PAN cards', () => {
    const text = 'Tax identity: ABCDE1234F attached.';
    const masked = maskPII(text);
    expect(masked).not.toContain('ABCDE1234F');
    expect(masked).toContain('[REDACTED]');
  });
});

describe('sanitizeInput', () => {
  it('strips dangerous HTML and script tags', () => {
    const dirty = '<script>alert("XSS")</script><b>Celebrate</b> with us';
    const clean = sanitizeInput(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('<b>');
    expect(clean).toContain('Celebrate with us');
  });

  it('strips common SQL injection phrases', () => {
    const dirty = "Venue requirements'; DROP TABLE events; --";
    const clean = sanitizeInput(dirty);
    expect(clean).not.toContain('DROP TABLE');
    expect(clean).not.toContain('--');
  });

  it('enforces maximum character truncation of 500 characters', () => {
    const longString = 'A'.repeat(600);
    const clean = sanitizeInput(longString);
    expect(clean.length).toBeLessThanOrEqual(500);
  });
});
