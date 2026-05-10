'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { TraveloopButton } from '@/components/ui/traveloop-button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  className?: string;
}

const CompassIllustration: React.FC = () => (
  <svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto mb-4"
  >
    {/* Outer circle */}
    <circle
      cx="60"
      cy="60"
      r="50"
      stroke="#DBBE8A"
      strokeWidth="2"
      fill="#FBF8F3"
    />
    {/* Inner circle */}
    <circle
      cx="60"
      cy="60"
      r="38"
      stroke="#E05520"
      strokeWidth="1.5"
      fill="none"
      opacity="0.3"
    />
    {/* Compass needle - north (ember) */}
    <polygon points="60,22 54,56 60,50 66,56" fill="#E05520" />
    {/* Compass needle - south (sand) */}
    <polygon points="60,98 54,64 60,70 66,64" fill="#C9A05A" />
    {/* Center dot */}
    <circle cx="60" cy="60" r="3" fill="#524940" />
    {/* Cardinal marks */}
    <text x="56" y="18" fontSize="8" fontWeight="bold" fill="#E05520" fontFamily="sans-serif">
      N
    </text>
    <text x="56" y="112" fontSize="8" fontWeight="bold" fill="#8C847A" fontFamily="sans-serif">
      S
    </text>
    <text x="98" y="63" fontSize="8" fontWeight="bold" fill="#8C847A" fontFamily="sans-serif">
      E
    </text>
    <text x="12" y="63" fontSize="8" fontWeight="bold" fill="#8C847A" fontFamily="sans-serif">
      W
    </text>
    {/* Tick marks */}
    <line x1="60" y1="12" x2="60" y2="16" stroke="#DBBE8A" strokeWidth="1.5" />
    <line x1="60" y1="104" x2="60" y2="108" stroke="#DBBE8A" strokeWidth="1.5" />
    <line x1="12" y1="60" x2="16" y2="60" stroke="#DBBE8A" strokeWidth="1.5" />
    <line x1="104" y1="60" x2="108" y2="60" stroke="#DBBE8A" strokeWidth="1.5" />
    {/* Decorative arc */}
    <path
      d="M30 30 A42 42 0 0 1 90 30"
      stroke="#E05520"
      strokeWidth="1"
      fill="none"
      opacity="0.2"
    />
    <path
      d="M90 90 A42 42 0 0 1 30 90"
      stroke="#C9A05A"
      strokeWidth="1"
      fill="none"
      opacity="0.2"
    />
  </svg>
);

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  ctaLabel,
  onCtaClick,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      <CompassIllustration />
      <h3 className="text-lg font-semibold text-charcoal-800 font-display mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-charcoal-500 max-w-sm mb-4">
          {description}
        </p>
      )}
      {ctaLabel && onCtaClick && (
        <TraveloopButton variant="primary" size="sm" onClick={onCtaClick}>
          {ctaLabel}
        </TraveloopButton>
      )}
    </div>
  );
};

export { EmptyState };
