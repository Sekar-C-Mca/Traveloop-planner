"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarBlank,
  MapPin,
  CurrencyInr,
  Eye,
  PencilSimple,
  Trash,
  AirplaneTilt,
  PlusCircle,
  MagnifyingGlass,
  X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { formatDateRange, formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TripStatus = "upcoming" | "ongoing" | "completed";
type TabFilter = "all" | TripStatus;

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

// Helper to determine trip status based on dates
function calculateTripStatus(startDate: string, endDate: string): TripStatus {
  const today = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (today > end) return "completed";
  if (today >= start && today <= end) return "ongoing";
  return "upcoming";
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

const statusConfig: Record<TripStatus, { label: string; className: string }> = {
  upcoming: { label: "Upcoming", className: "bg-forest-100 text-forest-700" },
  ongoing: { label: "Ongoing", className: "bg-sand-200 text-sand-700" },
  completed: {
    label: "Completed",
    className: "bg-charcoal-100 text-charcoal-500",
  },
};

function StatusBadge({ status }: { status: TripStatus }) {
  const { label, className } = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        className,
      )}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Skeleton card — shown instantly, no layout shift
// ---------------------------------------------------------------------------

function TripCardSkeleton() {
  return (
    <div className="warm-card overflow-hidden">
      <div className="h-[180px] w-full animate-pulse rounded-t-xl bg-sand-100" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded-md bg-sand-100" />
        <div className="h-4 w-1/2 animate-pulse rounded-md bg-sand-100" />
        <div className="h-4 w-2/5 animate-pulse rounded-md bg-sand-100" />
        <div className="mt-3 flex gap-2 border-t border-sand-100 pt-3">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-sand-100" />
          <div className="h-8 w-8 animate-pulse rounded-lg bg-sand-100" />
          <div className="h-8 w-8 animate-pulse rounded-lg bg-sand-100" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trip card — optimised: no layout prop, shorter animation, priority on first 2
// ---------------------------------------------------------------------------

interface TripCardProps {
  trip: Trip;
  index: number;
  onDelete: (trip: Trip) => void;
}

function TripCard({ trip, index, onDelete }: TripCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const isAboveFold = index < 2; // preload first 2 cards

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }} // stagger 40ms, not 350ms each
      className="warm-card overflow-hidden transition-shadow hover:shadow-warm-lg"
    >
      {/* Cover photo */}
      <div className="relative h-[180px] w-full overflow-hidden rounded-t-xl bg-sand-100">
        {/* Skeleton shimmer underneath while image loads */}
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-sand-100" />
        )}
        <Image
          src={trip.coverUrl}
          alt={trip.name}
          fill
          priority={isAboveFold} // preload visible images
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={cn(
            "object-cover transition-all duration-300 hover:scale-105",
            imgLoaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setImgLoaded(true)}
        />
        <div className="absolute right-2 top-2">
          <StatusBadge status={trip.status} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-display text-base font-semibold text-charcoal-800 line-clamp-1">
          {trip.name}
        </h3>

        <div className="mt-2.5 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-charcoal-600">
            <CalendarBlank size={14} className="shrink-0 text-charcoal-400" />
            <span className="truncate">
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-charcoal-600">
            <MapPin size={14} className="shrink-0 text-charcoal-400" />
            <span>
              {trip.cityCount} {trip.cityCount === 1 ? "city" : "cities"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-charcoal-600">
            <CurrencyInr size={14} className="shrink-0 text-charcoal-400" />
            <span>{formatCurrency(trip.budget, trip.currency)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-0.5 border-t border-sand-100 pt-3">
          <Link
            href={`/trips/${trip.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-400 transition-colors hover:bg-forest-50 hover:text-forest-600"
            title="View"
          >
            <Eye size={16} />
          </Link>
          <Link
            href={`/trips/${trip.id}/edit`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-400 transition-colors hover:bg-sand-50 hover:text-sand-600"
            title="Edit"
          >
            <PencilSimple size={16} />
          </Link>
          <button
            onClick={() => onDelete(trip)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-400 transition-colors hover:bg-red-50 hover:text-red-500"
            title="Delete"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sand-100">
        <AirplaneTilt size={32} weight="duotone" className="text-sand-400" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-charcoal-700">
        {isFiltered
          ? "No trips match your filter"
          : "No trips yet. Let's change that!"}
      </h3>
      <p className="mt-1.5 max-w-xs text-sm text-charcoal-400">
        {isFiltered
          ? "Try a different tab or search term."
          : "Start planning your next adventure."}
      </p>
      {!isFiltered && (
        <Link
          href="/trips/new"
          className="pill-button mt-5 inline-flex items-center gap-2 bg-ember-500 text-white hover:bg-ember-600"
        >
          <PlusCircle size={18} weight="fill" />
          Create Trip
        </Link>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete confirm modal
// ---------------------------------------------------------------------------

function DeleteConfirmModal({
  open,
  tripName,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  tripName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Trip</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{tripName}</strong>? This
            cannot be undone.
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
// Tabs config
// ---------------------------------------------------------------------------

const tabs: { key: TabFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "ongoing", label: "Ongoing" },
  { key: "completed", label: "Completed" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MyTripsPage() {
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [search, setSearch] = useState("");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null);

  // Fetch trips from API
  useEffect(() => {
    let cancelled = false;

    async function loadTrips() {
      try {
        setLoading(true);
        const { data } = await api.get('/api/trips');
        
        if (!cancelled && data?.trips) {
          const transformedTrips = data.trips.map((t: any) => ({
            id: String(t.id),
            name: t.name,
            coverUrl: t.cover_photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=75',
            startDate: t.start_date,
            endDate: t.end_date,
            cityCount: t.stop_count || 0,
            budget: t.total_budget || 0,
            currency: t.currency || 'INR',
            status: calculateTripStatus(t.start_date, t.end_date),
          }));
          
          setTrips(transformedTrips);
        }
      } catch (err) {
        console.error('Failed to load trips:', err);
        setTrips([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTrips();

    return () => {
      cancelled = true;
    };
  }, []);

  // Derived — memoised so tab/search don't re-create the array on every keystroke
  const filteredTrips = useMemo(() => {
    let list =
      activeTab === "all" ? trips : trips.filter((t) => t.status === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }
    return list;
  }, [trips, activeTab, search]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    // Optimistic remove
    setTrips((prev) => prev.filter((t) => t.id !== id));
    setDeleteTarget(null);
    try {
      await api.delete(`/api/trips/${id}`);
    } catch {
      // Revert on failure — re-fetch from server
      api.get<{ trips: unknown[] }>('/api/trips')
        .then(({ data }) => {
          const raw = data.trips ?? [];
          setTrips(
            raw.map((t: any) => ({
              id: String(t.id),
              name: t.name ?? '',
              coverUrl: t.cover_photo_url ?? '',
              startDate: t.start_date,
              endDate: t.end_date,
              cityCount: t.stop_count ?? 0,
              budget: Number(t.total_budget) || 0,
              currency: t.currency ?? 'INR',
              status: calculateTripStatus(t.start_date, t.end_date),
            }))
          );
        })
        .catch(() => {});
    }
  }, [deleteTarget]);

  const handleTabChange = useCallback((key: TabFilter) => {
    setActiveTab(key);
    setSearch(""); // clear search on tab switch
  }, []);

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-800 sm:text-3xl">
            My Trips
          </h1>
          <p className="mt-0.5 text-sm text-charcoal-500">
            {loading ? 'Loading...' : `${trips.length} ${trips.length === 1 ? "trip" : "trips"} planned`}
          </p>
        </div>
        <Link
          href="/trips/new"
          className="pill-button inline-flex items-center gap-2 bg-ember-500 text-white hover:bg-ember-600 self-start sm:self-auto"
        >
          <PlusCircle size={18} weight="fill" />
          New Trip
        </Link>
      </div>

      {/* ── Search + Tabs row ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips…"
            className="h-9 w-full rounded-lg border border-sand-200 bg-white pl-9 pr-8 text-sm text-charcoal-800 placeholder:text-charcoal-300 focus:border-ember-400 focus:outline-none focus:ring-2 focus:ring-ember-100 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-charcoal-400 hover:text-charcoal-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {tabs.map((tab) => {
            const count =
              tab.key === "all"
                ? trips.length
                : trips.filter((t) => t.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150",
                  activeTab === tab.key
                    ? "bg-ember-500 text-white shadow-sm"
                    : "bg-sand-100 text-charcoal-600 hover:bg-sand-200",
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                      activeTab === tab.key
                        ? "bg-white/25 text-white"
                        : "bg-sand-200 text-charcoal-500",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Loading state ──────────────────────────────────────────────── */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <TripCardSkeleton key={i} />
          ))}
        </motion.div>
      )}

      {/* ── Grid ───────────────────────────────────────────────────────── */}
      {!loading && (
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredTrips.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <EmptyState isFiltered={activeTab !== "all" || !!search} />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredTrips.map((trip, i) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    index={i}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ── Delete modal ───────────────────────────────────────────────── */}
      <DeleteConfirmModal
        open={deleteTarget !== null}
        tripName={deleteTarget?.name ?? ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
