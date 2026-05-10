'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarBlank,
  MapPin,
  CurrencyInr,
  Eye,
  PencilSimple,
  Trash,
  AirplaneTilt,
  PlusCircle,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { formatDateRange, formatCurrency, getTripStatus } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TripStatus = 'upcoming' | 'ongoing' | 'completed';

type TabFilter = 'all' | TripStatus;

interface Trip {
  id: string;
  name: string;
  coverUrl: string;
  startDate: string;
  endDate: string;
  cityCount: number;
  budget: number;
  currency: string;
  status: TripStatus;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockTrips: Trip[] = [
  {
    id: '1',
    name: 'Rajasthan Road Trip',
    coverUrl: 'https://images.unsplash.com/photo-1524492412937-b2890037b725?w=600',
    startDate: '2026-07-15',
    endDate: '2026-07-28',
    cityCount: 4,
    budget: 45000,
    currency: 'INR',
    status: 'upcoming',
  },
  {
    id: '2',
    name: 'Bali Wellness Retreat',
    coverUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600',
    startDate: '2026-08-10',
    endDate: '2026-08-20',
    cityCount: 2,
    budget: 72000,
    currency: 'INR',
    status: 'upcoming',
  },
  {
    id: '3',
    name: 'Goa Beach Escape',
    coverUrl: 'https://images.unsplash.com/photo-1506929562872-b034d5099b21?w=600',
    startDate: '2026-05-01',
    endDate: '2026-05-15',
    cityCount: 1,
    budget: 25000,
    currency: 'INR',
    status: 'ongoing',
  },
  {
    id: '4',
    name: 'Scandinavian Adventure',
    coverUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae598?w=600',
    startDate: '2026-05-05',
    endDate: '2026-05-20',
    cityCount: 3,
    budget: 150000,
    currency: 'INR',
    status: 'ongoing',
  },
  {
    id: '5',
    name: 'Tokyo Explorer',
    coverUrl: 'https://images.unsplash.com/photo-1530789253388-582c4ef3842b?w=600',
    startDate: '2026-01-10',
    endDate: '2026-01-24',
    cityCount: 5,
    budget: 180000,
    currency: 'INR',
    status: 'completed',
  },
  {
    id: '6',
    name: 'Kerala Backwaters',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961883?w=600',
    startDate: '2025-12-20',
    endDate: '2025-12-30',
    cityCount: 3,
    budget: 35000,
    currency: 'INR',
    status: 'completed',
  },
];

// ---------------------------------------------------------------------------
// StatusBadge component
// ---------------------------------------------------------------------------

interface StatusBadgeProps {
  status: TripStatus;
}

const statusConfig: Record<TripStatus, { label: string; className: string }> = {
  upcoming: {
    label: 'Upcoming',
    className: 'bg-forest-100 text-forest-700',
  },
  ongoing: {
    label: 'Ongoing',
    className: 'bg-sand-200 text-sand-700',
  },
  completed: {
    label: 'Completed',
    className: 'bg-charcoal-100 text-charcoal-500',
  },
};

function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// EmptyState component
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sand-100">
        <AirplaneTilt size={40} weight="duotone" className="text-sand-400" />
      </div>
      <h3 className="mt-6 font-display text-xl font-semibold text-charcoal-700">
        No trips yet. Let&rsquo;s change that!
      </h3>
      <p className="mt-2 max-w-sm text-sm text-charcoal-400">
        Start planning your next adventure and it will show up right here.
      </p>
      <Link
        href="/trips/new"
        className={cn(
          'pill-button mt-6 inline-flex items-center gap-2 bg-ember-500 text-white hover:bg-ember-600'
        )}
      >
        <PlusCircle size={20} weight="fill" />
        Create Trip
      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// DeleteConfirmModal
// ---------------------------------------------------------------------------

interface DeleteConfirmModalProps {
  open: boolean;
  tripName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({ open, tripName, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Trip</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{tripName}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2 gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// TripCard
// ---------------------------------------------------------------------------

interface TripCardProps {
  trip: Trip;
  onDelete: (trip: Trip) => void;
}

function TripCard({ trip, onDelete }: TripCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35 }}
      className="warm-card overflow-hidden transition-shadow hover:shadow-warm-lg"
    >
      {/* Cover photo */}
      <div className="relative h-[200px] w-full overflow-hidden rounded-t-xl">
        <Image
          src={trip.coverUrl}
          alt={trip.name}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute right-3 top-3">
          <StatusBadge status={trip.status} />
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-charcoal-800">
          {trip.name}
        </h3>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-charcoal-600">
            <CalendarBlank size={16} className="shrink-0 text-charcoal-400" />
            <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-charcoal-600">
            <MapPin size={16} className="shrink-0 text-charcoal-400" />
            <span>
              {trip.cityCount} {trip.cityCount === 1 ? 'city' : 'cities'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-charcoal-600">
            <CurrencyInr size={16} className="shrink-0 text-charcoal-400" />
            <span>{formatCurrency(trip.budget, trip.currency)}</span>
          </div>
        </div>

        {/* Actions row */}
        <div className="mt-4 flex items-center gap-1 border-t border-sand-100 pt-3">
          <Link
            href={`/trips/${trip.id}`}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-lg text-charcoal-400 transition-colors hover:bg-forest-50 hover:text-forest-600'
            )}
            title="View"
          >
            <Eye size={18} />
          </Link>
          <Link
            href={`/trips/${trip.id}/edit`}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-lg text-charcoal-400 transition-colors hover:bg-sand-50 hover:text-sand-600'
            )}
            title="Edit"
          >
            <PencilSimple size={18} />
          </Link>
          <button
            onClick={() => onDelete(trip)}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-lg text-charcoal-400 transition-colors hover:bg-red-50 hover:text-red-500'
            )}
            title="Delete"
          >
            <Trash size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// MyTripsPage
// ---------------------------------------------------------------------------

const tabs: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'completed', label: 'Completed' },
];

export default function MyTripsPage() {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null);

  const filteredTrips =
    activeTab === 'all' ? trips : trips.filter((t) => t.status === activeTab);

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setTrips((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal-800">
            My Trips
          </h1>
          <p className="mt-1 text-sm text-charcoal-500">
            Manage and explore all your planned adventures
          </p>
        </div>
        <Link
          href="/trips/new"
          className={cn(
            'pill-button inline-flex items-center gap-2 bg-ember-500 text-white hover:bg-ember-600'
          )}
        >
          <PlusCircle size={20} weight="fill" />
          Create Trip
        </Link>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'pill-button text-sm transition-all duration-200',
              activeTab === tab.key
                ? 'bg-ember-500 text-white shadow-sm'
                : 'bg-sand-100 text-charcoal-600 hover:bg-sand-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trip grid */}
      {filteredTrips.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div layout className="grid gap-5 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onDelete={(t) => setDeleteTarget(t)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        open={deleteTarget !== null}
        tripName={deleteTarget?.name ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
