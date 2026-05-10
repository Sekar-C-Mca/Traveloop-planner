'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  CalendarBlank,
  CurrencyInr,
  ShareNetwork,
  Printer,
  Clock,
  Camera,
  ForkKnife,
  Tree,
  CastleTurret,
  ShoppingBag,
  PersonSimpleSwim,
  Compass,
  List,
  Calendar,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { formatDateRange, formatCurrency } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  addMonths,
  subMonths,
} from 'date-fns';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Activity {
  id: string;
  name: string;
  category: string;
  scheduledTime: string;
  scheduledDate: string;
  cost: number;
}

interface Stop {
  id: string;
  city: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  stayCost: number;
  transportCost: number;
  activities: Activity[];
}

// ---------------------------------------------------------------------------
// Category config
// ---------------------------------------------------------------------------

const categoryConfig: Record<
  string,
  { icon: React.ElementType; color: string }
> = {
  sightseeing: {
    icon: Camera,
    color: 'bg-ember-100 text-ember-700',
  },
  food: {
    icon: ForkKnife,
    color: 'bg-sand-200 text-sand-700',
  },
  adventure: {
    icon: Tree,
    color: 'bg-forest-100 text-forest-700',
  },
  culture: {
    icon: CastleTurret,
    color: 'bg-charcoal-100 text-charcoal-700',
  },
  shopping: {
    icon: ShoppingBag,
    color: 'bg-sand-100 text-charcoal-700',
  },
  relaxation: {
    icon: PersonSimpleSwim,
    color: 'bg-ember-50 text-ember-600',
  },
};

function getCategoryIcon(category: string) {
  return categoryConfig[category]?.icon ?? Compass;
}

function getCategoryColor(category: string) {
  return categoryConfig[category]?.color ?? 'bg-sand-100 text-charcoal-600';
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockStops: Stop[] = [
  {
    id: 'stop-1',
    city: 'Jaipur',
    country: 'India',
    arrivalDate: '2026-07-15',
    departureDate: '2026-07-18',
    stayCost: 12000,
    transportCost: 4500,
    activities: [
      {
        id: 'a-1',
        name: 'Amber Fort Tour',
        category: 'sightseeing',
        scheduledTime: '09:00',
        scheduledDate: '2026-07-15',
        cost: 1500,
      },
      {
        id: 'a-2',
        name: 'Hawa Mahal Visit',
        category: 'sightseeing',
        scheduledTime: '14:00',
        scheduledDate: '2026-07-15',
        cost: 500,
      },
      {
        id: 'a-3',
        name: 'Chokhi Dhani Dinner',
        category: 'food',
        scheduledTime: '19:00',
        scheduledDate: '2026-07-16',
        cost: 2000,
      },
    ],
  },
  {
    id: 'stop-2',
    city: 'Udaipur',
    country: 'India',
    arrivalDate: '2026-07-18',
    departureDate: '2026-07-21',
    stayCost: 15000,
    transportCost: 3000,
    activities: [
      {
        id: 'a-4',
        name: 'City Palace Visit',
        category: 'sightseeing',
        scheduledTime: '10:00',
        scheduledDate: '2026-07-18',
        cost: 800,
      },
      {
        id: 'a-5',
        name: 'Traditional Rajasthani Thali',
        category: 'food',
        scheduledTime: '13:00',
        scheduledDate: '2026-07-18',
        cost: 600,
      },
      {
        id: 'a-6',
        name: 'Lake Pichola Boat Ride',
        category: 'relaxation',
        scheduledTime: '16:00',
        scheduledDate: '2026-07-19',
        cost: 1200,
      },
    ],
  },
  {
    id: 'stop-3',
    city: 'Jodhpur',
    country: 'India',
    arrivalDate: '2026-07-21',
    departureDate: '2026-07-24',
    stayCost: 10000,
    transportCost: 2500,
    activities: [
      {
        id: 'a-7',
        name: 'Mehrangarh Fort',
        category: 'sightseeing',
        scheduledTime: '08:30',
        scheduledDate: '2026-07-21',
        cost: 1000,
      },
      {
        id: 'a-8',
        name: 'Blue City Walking Tour',
        category: 'culture',
        scheduledTime: '15:00',
        scheduledDate: '2026-07-22',
        cost: 500,
      },
    ],
  },
  {
    id: 'stop-4',
    city: 'Jaisalmer',
    country: 'India',
    arrivalDate: '2026-07-24',
    departureDate: '2026-07-28',
    stayCost: 8000,
    transportCost: 3500,
    activities: [
      {
        id: 'a-9',
        name: 'Patwon Ki Haveli',
        category: 'culture',
        scheduledTime: '09:00',
        scheduledDate: '2026-07-24',
        cost: 400,
      },
      {
        id: 'a-10',
        name: 'Desert Safari',
        category: 'adventure',
        scheduledTime: '16:00',
        scheduledDate: '2026-07-25',
        cost: 3000,
      },
      {
        id: 'a-11',
        name: 'Sam Sand Dunes Sunset',
        category: 'sightseeing',
        scheduledTime: '18:00',
        scheduledDate: '2026-07-25',
        cost: 1500,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Computed values
// ---------------------------------------------------------------------------

function computeTripDays(stops: Stop[]): number {
  if (stops.length === 0) return 0;
  const earliest = stops.reduce(
    (min, s) => (s.arrivalDate < min ? s.arrivalDate : min),
    stops[0].arrivalDate
  );
  const latest = stops.reduce(
    (max, s) => (s.departureDate > max ? s.departureDate : max),
    stops[0].departureDate
  );
  const start = parseISO(earliest);
  const end = parseISO(latest);
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

function computeTotalCost(stops: Stop[]): number {
  return stops.reduce((total, stop) => {
    const activityCost = stop.activities.reduce((sum, a) => sum + a.cost, 0);
    return total + stop.stayCost + stop.transportCost + activityCost;
  }, 0);
}

function getTripDateRange(stops: Stop[]) {
  if (stops.length === 0) return null;
  const earliest = stops.reduce(
    (min, s) => (s.arrivalDate < min ? s.arrivalDate : min),
    stops[0].arrivalDate
  );
  const latest = stops.reduce(
    (max, s) => (s.departureDate > max ? s.departureDate : max),
    stops[0].departureDate
  );
  return { start: parseISO(earliest), end: parseISO(latest) };
}

function getTripDates(stops: Stop[]): Date[] {
  const range = getTripDateRange(stops);
  if (!range) return [];
  return eachDayOfInterval({ start: range.start, end: range.end });
}

// ---------------------------------------------------------------------------
// ActivityChip
// ---------------------------------------------------------------------------

interface ActivityChipProps {
  activity: Activity;
}

function ActivityChip({ activity }: ActivityChipProps) {
  const Icon = getCategoryIcon(activity.category);
  const colorClass = getCategoryColor(activity.category);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-sand-100 bg-white p-3">
      <span className="inline-flex items-center rounded-md bg-ember-100 px-2 py-1 text-xs font-semibold text-ember-700">
        {activity.scheduledTime}
      </span>
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
          colorClass
        )}
      >
        <Icon size={12} />
      </span>
      <span className="flex-1 text-sm font-medium text-charcoal-800">
        {activity.name}
      </span>
      <span className="flex items-center gap-1 text-xs text-charcoal-500">
        <CurrencyInr size={12} className="text-charcoal-400" />
        {activity.cost > 0 ? formatCurrency(activity.cost) : 'Free'}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CitySection (List view)
// ---------------------------------------------------------------------------

interface CitySectionProps {
  stop: Stop;
}

function CitySection({ stop }: CitySectionProps) {
  // Group activities by date
  const activitiesByDate = useMemo(() => {
    const grouped: Record<string, Activity[]> = {};
    for (const activity of stop.activities) {
      if (!grouped[activity.scheduledDate]) {
        grouped[activity.scheduledDate] = [];
      }
      grouped[activity.scheduledDate].push(activity);
    }
    // Sort activities within each date by time
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a: Activity, b: Activity) =>
        a.scheduledTime.localeCompare(b.scheduledTime)
      );
    });
    // Sort dates
    const sortedEntries = Object.entries(grouped).sort(
      ([dateA], [dateB]) => dateA.localeCompare(dateB)
    );
    return sortedEntries;
  }, [stop.activities]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="warm-card overflow-hidden"
    >
      {/* City header */}
      <div className="border-b border-sand-100 bg-sand-50/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ember-100">
            <MapPin size={18} weight="fill" className="text-ember-500" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-charcoal-800">
              {stop.city}
            </h3>
            <div className="flex items-center gap-2 text-sm text-charcoal-500">
              <CalendarBlank size={14} className="text-charcoal-400" />
              <span>
                {formatDateRange(stop.arrivalDate, stop.departureDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Day-wise activity blocks */}
      <div className="divide-y divide-sand-50 px-6 py-4">
        {activitiesByDate.map(([date, activities]) => (
          <div key={date} className="py-4 first:pt-0 last:pb-0">
            <div className="mb-3 flex items-center gap-2">
              <CalendarBlank size={14} className="text-charcoal-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-400">
                {format(parseISO(date), 'EEE, d MMM yyyy')}
              </span>
            </div>
            <div className="space-y-2">
              {activities.map((activity) => (
                <ActivityChip key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        ))}
        {stop.activities.length === 0 && (
          <p className="py-4 text-sm text-charcoal-400">
            No activities planned for this stop.
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// CalendarMonth
// ---------------------------------------------------------------------------

interface CalendarMonthProps {
  stops: Stop[];
  currentMonth: Date;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function CalendarMonth({ stops, currentMonth }: CalendarMonthProps) {
  const tripDates = useMemo(() => getTripDates(stops), [stops]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  // Activities grouped by date
  const activitiesByDate = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const stop of stops) {
      for (const activity of stop.activities) {
        const existing = map.get(activity.scheduledDate) ?? [];
        existing.push(activity);
        map.set(activity.scheduledDate, existing);
      }
    }
    return map;
  }, [stops]);

  return (
    <div className="warm-card overflow-hidden p-5">
      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-charcoal-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-16" />
        ))}

        {daysInMonth.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isTripDay = tripDates.some((td) => isSameDay(td, day));
          const dayActivities = activitiesByDate.get(dateStr) ?? [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);

          return (
            <div
              key={dateStr}
              className={cn(
                'relative flex h-16 flex-col items-center justify-start rounded-lg border p-1 text-xs transition-colors',
                isTripDay
                  ? 'border-ember-200 bg-ember-50 text-ember-700'
                  : isCurrentMonth
                    ? 'border-sand-100 text-charcoal-500'
                    : 'border-transparent text-charcoal-300',
                today && 'ring-2 ring-ember-500 ring-offset-1'
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold',
                  isTripDay && 'bg-ember-500 text-white'
                )}
              >
                {format(day, 'd')}
              </span>
              {dayActivities.length > 0 && (
                <div className="mt-0.5 flex gap-0.5">
                  {dayActivities.slice(0, 3).map((act) => (
                    <div
                      key={act.id}
                      className="h-1.5 w-1.5 rounded-full bg-ember-400"
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ViewItineraryPage
// ---------------------------------------------------------------------------

type ViewMode = 'list' | 'calendar';

export default function ViewItineraryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 1)); // July 2026
  const [copied, setCopied] = useState(false);

  const totalDays = useMemo(() => computeTripDays(mockStops), []);
  const totalCities = mockStops.length;
  const totalCost = useMemo(() => computeTotalCost(mockStops), []);

  async function handleShare() {
    const publicUrl = `${window.location.origin}/trips/abc123/share`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = publicUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* ----------------------------------------------------------------- */}
      {/* Page header                                                       */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl font-bold text-charcoal-800">
          Rajasthan Road Trip
        </h1>
        <p className="mt-1 text-sm text-charcoal-500">
          Your complete itinerary at a glance
        </p>
      </motion.div>

      {/* ----------------------------------------------------------------- */}
      {/* Toolbar: view toggle + actions                                     */}
      {/* ----------------------------------------------------------------- */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-full bg-sand-100 p-1">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
              viewMode === 'list'
                ? 'bg-ember-500 text-white shadow-sm'
                : 'text-charcoal-600 hover:bg-sand-200'
            )}
          >
            <List size={16} />
            List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
              viewMode === 'calendar'
                ? 'bg-ember-500 text-white shadow-sm'
                : 'text-charcoal-600 hover:bg-sand-200'
            )}
          >
            <Calendar size={16} />
            Calendar View
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className={cn(
              'pill-button inline-flex items-center gap-2 border border-sand-200 bg-white text-charcoal-600 transition-all hover:bg-sand-50',
              copied && 'border-forest-300 bg-forest-50 text-forest-700'
            )}
          >
            <ShareNetwork size={18} />
            {copied ? 'Link copied!' : 'Share'}
          </button>
          <button
            onClick={handlePrint}
            className="pill-button inline-flex items-center gap-2 border border-sand-200 bg-white text-charcoal-600 transition-all hover:bg-sand-50"
          >
            <Printer size={18} />
            Print
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Content area                                                       */}
      {/* ----------------------------------------------------------------- */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {mockStops.map((stop) => (
              <CitySection key={stop.id} stop={stop} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Calendar navigation */}
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-charcoal-800">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-sand-200 text-charcoal-500 transition-colors hover:bg-sand-50"
                >
                  &larr;
                </button>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-sand-200 text-charcoal-500 transition-colors hover:bg-sand-50"
                >
                  &rarr;
                </button>
              </div>
            </div>

            <CalendarMonth stops={mockStops} currentMonth={currentMonth} />

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-charcoal-500">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-ember-500" />
                <span>Trip day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-ember-400" />
                  <div className="h-1.5 w-1.5 rounded-full bg-ember-400" />
                  <div className="h-1.5 w-1.5 rounded-full bg-ember-400" />
                </div>
                <span>Activities</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------------------- */}
      {/* Summary footer                                                     */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-10 warm-card p-6"
      >
        <h3 className="mb-4 font-display text-lg font-bold text-charcoal-800">
          Trip Summary
        </h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ember-100">
              <CalendarBlank size={24} weight="fill" className="text-ember-500" />
            </div>
            <span className="mt-2 text-2xl font-bold text-charcoal-800">
              {totalDays}
            </span>
            <span className="text-xs text-charcoal-500">Total Days</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-100">
              <MapPin size={24} weight="fill" className="text-forest-500" />
            </div>
            <span className="mt-2 text-2xl font-bold text-charcoal-800">
              {totalCities}
            </span>
            <span className="text-xs text-charcoal-500">Cities</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand-200">
              <CurrencyInr size={24} weight="fill" className="text-sand-600" />
            </div>
            <span className="mt-2 text-2xl font-bold text-charcoal-800">
              {formatCurrency(totalCost)}
            </span>
            <span className="text-xs text-charcoal-500">Est. Cost</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
