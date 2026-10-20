import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const clamped = Math.min(100, Math.max(0, value));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn('relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10', className)}
        {...props}
      >
        <div
          className="h-full bg-gradient-to-r from-violet-600 to-amber-500 transition-all duration-300 rounded-full"
          style={{ width: `${clamped}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';
