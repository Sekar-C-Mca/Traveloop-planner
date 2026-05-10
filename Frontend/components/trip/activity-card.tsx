'use client';

import { MapPin, Clock, Plus } from '@phosphor-icons/react';
import { WarmCard } from '@/components/ui/warm-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn, formatCurrency } from '@/lib/utils';
import type { Activity } from '@/types';

interface ActivityCardProps {
  activity: Activity;
  onAdd?: (activity: Activity) => void;
}

export function ActivityCard({ activity, onAdd }: ActivityCardProps) {
  return (
    <WarmCard className="overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative h-[180px] overflow-hidden rounded-t-xl">
        {activity.image_url ? (
          <img
            src={activity.image_url}
            alt={activity.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-forest-50 to-forest-100">
            <MapPin size={36} className="text-forest-300" weight="duotone" />
          </div>
        )}

        {/* Category Pill Badge */}
        {activity.category && (
          <div className="absolute top-3 left-3">
            <StatusBadge variant="category">{activity.category.name}</StatusBadge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-2">
        {/* Name */}
        <h4 className="font-display text-base font-semibold text-charcoal-800 leading-tight line-clamp-1">
          {activity.name}
        </h4>

        {/* Duration Chip + Cost */}
        <div className="flex items-center gap-2 flex-wrap">
          {activity.duration_minutes != null && (
            <div className="flex items-center gap-1 rounded-full bg-sand-50 px-2 py-0.5 text-xs text-charcoal-600">
              <Clock size={12} className="text-sand-500" weight="duotone" />
              <span>{activity.duration_minutes} min</span>
            </div>
          )}
          {activity.estimated_cost != null && (
            <span className="text-sm font-medium text-charcoal-700">
              {formatCurrency(activity.estimated_cost)}
            </span>
          )}
        </div>

        {/* Add to Trip Button */}
        {onAdd && (
          <button
            onClick={() => onAdd(activity)}
            className={cn(
              'mt-2 w-full flex items-center justify-center gap-1.5',
              'px-3 py-2 rounded-lg text-sm font-medium',
              'bg-ember-500 text-white hover:bg-ember-600',
              'transition-colors duration-150'
            )}
          >
            <Plus size={16} weight="bold" />
            <span>Add to trip</span>
          </button>
        )}
      </div>
    </WarmCard>
  );
}
