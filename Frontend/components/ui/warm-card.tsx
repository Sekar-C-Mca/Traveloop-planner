'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface WarmCardProps extends React.HTMLAttributes<HTMLDivElement> {
  onClick?: () => void;
}

const WarmCard = React.forwardRef<HTMLDivElement, WarmCardProps>(
  ({ className, onClick, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        className={cn(
          'bg-white border border-sand-100 rounded-xl shadow-warm transition-all duration-200',
          onClick &&
            'cursor-pointer hover:shadow-warm-lg hover:-translate-y-[2px] active:translate-y-0',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
WarmCard.displayName = 'WarmCard';

export { WarmCard };
