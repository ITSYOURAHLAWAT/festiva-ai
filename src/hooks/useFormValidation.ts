import { useState, useCallback } from 'react';
import type { EventContext, FormErrors } from '@/types';
import { validateBudgetInput, validateGuestCountInput } from '@/services/security';

export function useFormValidation() {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = useCallback((field: keyof FormErrors, value: unknown): string | undefined => {
    switch (field) {
      case 'eventTitle': {
        const s = String(value || '').trim();
        if (!s) return 'Event celebration title is required (cannot be empty).';
        if (s.length < 3) return 'Event title must be at least 3 characters.';
        if (s.length > 120) return 'Event title cannot exceed 120 characters.';
        return undefined;
      }
      case 'guestCount': {
        if (value === undefined || value === null || value === '') {
          return 'Guest count is required (must be greater than 0).';
        }
        const guestValidation = validateGuestCountInput(value as number);
        return guestValidation.valid ? undefined : guestValidation.error;
      }
      case 'totalBudget': {
        if (value === undefined || value === null || value === '') {
          return 'Total budget is required (cannot be ₹0 or negative).';
        }
        const budgetValidation = validateBudgetInput(value as number);
        return budgetValidation.valid ? undefined : budgetValidation.error;
      }
      case 'eventDate': {
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return 'Celebration date is required.';
        }
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date format.';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
          return 'Invalid date: Event date cannot be in the past. Please select a future date.';
        }
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 5);
        if (date > maxDate) {
          return 'Event date cannot be more than 5 years in advance.';
        }
        return undefined;
      }
      case 'city': {
        const s = String(value || '').trim();
        if (!s) return 'City or destination is required (cannot be empty).';
        if (s.length < 2) return 'City name must be at least 2 characters.';
        if (s.length > 100) return 'City name is too long.';
        if (/[<>&"'/]/.test(s)) return 'City name contains invalid characters.';
        return undefined;
      }
      default:
        return undefined;
    }
  }, []);

  const validateAll = useCallback((context: Partial<EventContext>): boolean => {
    const newErrors: FormErrors = {};

    const titleError = validateField('eventTitle', context.eventTitle);
    if (titleError) newErrors.eventTitle = titleError;

    const guestError = validateField('guestCount', context.guestCount);
    if (guestError) newErrors.guestCount = guestError;

    const budgetError = validateField('totalBudget', context.totalBudget);
    if (budgetError) newErrors.totalBudget = budgetError;

    const dateError = validateField('eventDate', context.eventDate);
    if (dateError) newErrors.eventDate = dateError;

    const cityError = validateField('city', context.city);
    if (cityError) newErrors.city = cityError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validateField]);

  const clearError = useCallback((field: keyof FormErrors) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  return { errors, validateField, validateAll, clearError, setErrors };
}
