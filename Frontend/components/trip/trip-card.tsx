'use client';

import { CalendarBlank, MapPin, CurrencyInr, Eye, PencilSimple, Trash } from '@phosphor-icons/react';
import { WarmCard } from '@/components/ui/warm-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn, formatDateRange, formatCurrency } from '@/lib/utils';
import type { Trip } from '@/types';

interface TripCardProps {
  trip: Trip;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TripCard({ trip, onView, onEdit, onDelete }: TripCardProps) {
  return (
    <WarmCard className="overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-[200px] overflow-hidden rounded-t-xl">
        {trip.cover_photo_url ? (
          <img
            src={trip.cover_photo_url}
            alt={trip.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sand-100 to-sand-200">
            <MapPin size={40} className="text-sand-400" weight="duotone" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge variant={trip.status}>{trip.status}</StatusBadge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Trip Name */}
        <h3 className="font-display text-lg font-semibold text-charcoal-800 leading-tight line-clamp-1">
          {trip.name}
        </h3>

        {/* Details */}
        <div className="space-y-1.5">
          {/* Date Range */}
          <div className="flex items-center gap-2 text-sm text-charcoal-600">
            <CalendarBlank size={16} className="text-ember-500 flex-shrink-0" weight="duotone" />
            <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
          </div>

          {/* City Count */}
          <div className="flex items-center gap-2 text-sm text-charcoal-600">
            <MapPin size={16} className="text-forest-500 flex-shrink-0" weight="duotone" />
            <span>
              {trip.stops?.length
                ? `${trip.stops.length} ${trip.stops.length === 1 ? 'city' : 'cities'}`
                : 'No cities yet'}
            </span>
          </div>

          {/* Budget */}
          {trip.total_budget != null && (
            <div className="flex items-center gap-2 text-sm text-charcoal-600">
              <CurrencyInr size={16} className="text-sand-500 flex-shrink-0" weight="duotone" />
              <span>{formatCurrency(trip.total_budget, trip.currency)}</span>
            </div>
          )}
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-1 pt-2 border-t border-sand-100">
          {onView && (
            <button
              onClick={onView}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm',
                'text-charcoal-600 hover:bg-sand-50 hover:text-ember-600',
                'transition-colors duration-150'
              )}
            >
              <Eye size={16} weight="duotone" />
              <span>View</span>
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm',
                'text-charcoal-600 hover:bg-sand-50 hover:text-forest-600',
                'transition-colors duration-150'
              )}
            >
              <PencilSimple size={16} weight="duotone" />
              <span>Edit</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm',
                'text-charcoal-600 hover:bg-red-50 hover:text-red-600',
                'transition-colors duration-150'
              )}
            >
              <Trash size={16} weight="duotone" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </WarmCard>
  );
}
