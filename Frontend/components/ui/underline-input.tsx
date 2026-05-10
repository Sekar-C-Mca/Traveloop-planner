'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { UseFormRegisterReturn } from 'react-hook-form';

export interface UnderlineInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: string;
  label?: string;
  error?: string;
  register?: UseFormRegisterReturn;
}

const UnderlineInput = React.forwardRef<
  HTMLInputElement,
  UnderlineInputProps
>(({ className, type = 'text', label, error, register, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label
          className={cn(
            'text-sm font-medium text-charcoal-700 transition-colors',
            error && 'text-red-500'
          )}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          'w-full bg-transparent border-0 border-b-2 px-0 py-2 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-0 transition-colors',
          error
            ? 'border-red-500 focus:border-red-500'
            : 'border-charcoal-300 focus:border-ember-500',
          className
        )}
        ref={ref}
        {...register}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 mt-0.5">{error}</p>
      )}
    </div>
  );
});
UnderlineInput.displayName = 'UnderlineInput';

export { UnderlineInput };
