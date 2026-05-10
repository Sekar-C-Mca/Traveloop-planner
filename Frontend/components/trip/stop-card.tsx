'use client';

import { DotsSixVertical, MapPin, CurrencyInr } from '@phosphor-icons/react';
import { cn, formatDateRange, formatCurrency } from '@/lib/utils';
import type { TripStop } from '@/types';

interface StopCardProps {
  stop: TripStop;
  isSelected?: boolean;
  onSelect?: () => void;
  dragHandleProps?: Record<string, unknown>;
}

export function StopCard({ stop, isSelected = false, onSelect, dragHandleProps }: StopCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'group flex items-stretch gap-0 rounded-xl border bg-white transition-all duration-150',
        isSelected
          ? 'border-l-4 border-l-ember-500 border-sand-200 shadow-warm'
          : 'border-sand-100 hover:border-sand-200 hover:shadow-warm',
        onSelect && 'cursor-pointer'
      )}
    >
      {/* Drag Handle */}
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className={cn(
            'flex items-center justify-center w-8 rounded-l-xl',
            'bg-sand-50 text-charcoal-400 hover:text-charcoal-600 hover:bg-sand-100',
            'cursor-grab active:cursor-grabbing transition-colors duration-150',
            isSelected && 'rounded-bl-none'
          )}
        >
          <DotsSixVertical size={20} weight="bold" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-3 space-y-1.5">
        {/* City Name */}
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-forest-500 flex-shrink-0" weight="duotone" />
          <span className="font-medium text-charcoal-800 text-sm">
            {stop.city?.name || 'Unknown city'}
          </span>
        </div>

        {/* Date Range */}
        <p className="text-xs text-charcoal-500 pl-6">
          {formatDateRange(stop.arrival_date, stop.departure_date)}
        </p>

        {/* Costs */}
        <div className="flex items-center gap-3 pl-6 text-xs text-charcoal-600">
          {stop.stay_cost > 0 && (
            <div className="flex items-center gap-1">
              <CurrencyInr size={12} className="text-sand-500" weight="duotone" />
              <span>Stay: {formatCurrency(stop.stay_cost)}</span>
            </div>
          )}
          {stop.transport_cost > 0 && (
            <div className="flex items-center gap-1">
              <CurrencyInr size={12} className="text-ember-400" weight="duotone" />
              <span>Transport: {formatCurrency(stop.transport_cost)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
