'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        upcoming: 'bg-forest-500 text-white',
        ongoing: 'bg-ember-500 text-white',
        completed: 'bg-charcoal-400 text-white',
        category: 'bg-sand-300 text-charcoal-800',
        cost: 'bg-sand-100 text-charcoal-700',
      },
    },
    defaultVariants: {
      variant: 'upcoming',
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <span
        className={cn(statusBadgeVariants({ variant, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </span>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

export { StatusBadge, statusBadgeVariants };
