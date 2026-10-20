import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Navbar } from '@/components/Navbar';

describe('Accessibility Suite (WCAG AAA Verification)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.fontSize = '16px';
  });

  it('renders accessibility controls with valid ARIA landmark roles and labels', () => {
    render(<Navbar />);

    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(nav).toBeDefined();
    expect(nav.getAttribute('aria-label')).toBe('Main navigation');

    const toolbar = screen.getByRole('toolbar', { name: /accessibility controls/i });
    expect(toolbar).toBeDefined();
    expect(toolbar.getAttribute('aria-label')).toBe('Accessibility controls');

    const brandBtn = screen.getByRole('button', { name: /festivaai home/i });
    expect(brandBtn.getAttribute('aria-label')).toContain('FestivaAI');

    const decreaseBtn = screen.getByRole('button', { name: /decrease text font size/i });
    expect(decreaseBtn.getAttribute('aria-label')).toContain('Decrease text font size');

    const increaseBtn = screen.getByRole('button', { name: /increase text font size/i });
    expect(increaseBtn.getAttribute('aria-label')).toContain('Increase text font size');

    const themeToggleBtn = screen.getByRole('button', { name: /switch to (high-contrast dark|light) mode/i });
    expect(themeToggleBtn.getAttribute('aria-label')).toBeDefined();
    expect(themeToggleBtn.getAttribute('aria-pressed')).toBe('false');
  });

  it('Font Scaler (A+ / A-) updates root document font sizing dynamically', () => {
    render(<Navbar />);

    const increaseBtn = screen.getByRole('button', { name: /increase text font size/i });
    const decreaseBtn = screen.getByRole('button', { name: /decrease text font size/i });

    // Initial default is normal (16px)
    expect(document.documentElement.style.fontSize).toBe('16px');

    // Click A+ -> switches to large (18px)
    fireEvent.click(increaseBtn);
    expect(document.documentElement.style.fontSize).toBe('18px');
    expect(localStorage.getItem('festiva_fontsize')).toBe('large');

    // Click A+ again -> switches to xlarge (20px)
    fireEvent.click(increaseBtn);
    expect(document.documentElement.style.fontSize).toBe('20px');
    expect(localStorage.getItem('festiva_fontsize')).toBe('xlarge');

    // Click A- -> reverts back down to large (18px)
    fireEvent.click(decreaseBtn);
    expect(document.documentElement.style.fontSize).toBe('18px');
    expect(localStorage.getItem('festiva_fontsize')).toBe('large');

    // Click A- -> reverts to normal (16px)
    fireEvent.click(decreaseBtn);
    expect(document.documentElement.style.fontSize).toBe('16px');
    expect(localStorage.getItem('festiva_fontsize')).toBe('normal');

    // Click A- -> switches to small (14px)
    fireEvent.click(decreaseBtn);
    expect(document.documentElement.style.fontSize).toBe('14px');
    expect(localStorage.getItem('festiva_fontsize')).toBe('small');
  });

  it('High-Contrast Theme Toggle toggles the dark class and updates aria-pressed', () => {
    render(<Navbar />);

    const themeToggle = screen.getByRole('button', { name: /switch to (high-contrast dark|light) mode/i });
    expect(themeToggle.getAttribute('aria-pressed')).toBe('false');

    // Toggle to Dark
    fireEvent.click(themeToggle);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('festiva_theme')).toBe('dark');
    expect(themeToggle.getAttribute('aria-pressed')).toBe('true');

    // Toggle back to Light
    fireEvent.click(themeToggle);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('festiva_theme')).toBe('light');
    expect(themeToggle.getAttribute('aria-pressed')).toBe('false');
  });
});
