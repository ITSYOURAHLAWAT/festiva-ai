import { useState, useCallback } from 'react';
import type { EventContext, FormErrors } from '@/types';

export function useFormValidation() {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = useCallback((field: keyof FormErrors, value: unknown): string | undefined => {
    switch (field) {
      case 'guestCount': {
        const n = Number(value);
        if (value === undefined || value === null || value === '' || isNaN(n)) return 'Guest count is required';
        if (n <= 0) return 'Guest count must be greater than 0';
        if (n > 10000) return 'Guest count cannot exceed 10,000';
        if (!Number.isInteger(n)) return 'Guest count must be a whole number';
        return undefined;
      }
      case 'totalBudget': {
        const b = Number(value);
        if (value === undefined || value === null || value === '' || isNaN(b)) return 'Total budget is required';
        if (b <= 0) return 'Budget must be greater than ₹0';
        if (b < 10000) return 'Minimum budget is ₹10,000 for realistic planning';
        if (b > 100000000) return 'Budget cannot exceed ₹10 Crore';
        return undefined;
      }
      case 'eventDate': {
        if (!value || typeof value !== 'string' || value.trim() === '') return 'Event date is required';
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date format';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) return 'Event date must be in the future (no past dates)';
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 5);
        if (date > maxDate) return 'Event date cannot be more than 5 years in advance';
        return undefined;
      }
      case 'city': {
        const s = String(value || '').trim();
        if (!s) return 'City/Location is required';
        if (s.length < 2) return 'City name must be at least 2 characters';
        if (s.length > 100) return 'City name is too long';
        if (/[<>&"'/]/.test(s)) return 'City name contains invalid characters';
        return undefined;
      }
      default:
        return undefined;
    }
  }, []);

  const validateAll = useCallback((context: Partial<EventContext>): boolean => {
    const newErrors: FormErrors = {};

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
