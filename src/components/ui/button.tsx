import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100',
      outline: 'border border-slate-200 bg-white/70 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-800 dark:text-slate-100',
      ghost: 'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100',
    };

    const sizeStyles = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-8 rounded-lg px-3 text-xs',
      lg: 'h-11 rounded-xl px-8 text-base',
      icon: 'h-9 w-9 rounded-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer rounded-xl',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
