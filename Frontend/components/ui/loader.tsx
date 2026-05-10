'use client';

import * as React from 'react';
import { Compass } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/* ---------------------------------------------------------------------------
 * Full-page loader
 * --------------------------------------------------------------------------- */

const FullPageLoader: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex flex-col items-center justify-center bg-cream',
        className
      )}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Compass size={48} weight="duotone" className="text-ember-500" />
      </motion.div>
      <p className="mt-4 text-sm text-charcoal-500 font-medium animate-pulse">
        Loading...
      </p>
    </div>
  );
};

/* ---------------------------------------------------------------------------
 * Inline loader
 * --------------------------------------------------------------------------- */

const InlineLoader: React.FC<{ className?: string; size?: 'sm' | 'md' }> = ({
  className,
  size = 'sm',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
  };

  return (
    <span
      className={cn(
        'inline-block rounded-full border-ember-500 border-t-transparent animate-spin',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
};

/* ---------------------------------------------------------------------------
 * Skeleton loader
 * --------------------------------------------------------------------------- */

export interface SkeletonBlockProps {
  className?: string;
}

const SkeletonBlock: React.FC<SkeletonBlockProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-sand-100',
        className
      )}
    />
  );
};

const SkeletonLoader: React.FC<{
  className?: string;
  lines?: number;
}> = ({ className, lines = 3 }) => {
  return (
    <div className={cn('space-y-3', className)}>
      <SkeletonBlock className="h-6 w-3/5" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-2/5' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

export { FullPageLoader, InlineLoader, SkeletonBlock, SkeletonLoader };
