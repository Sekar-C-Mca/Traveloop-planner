"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlass,
  BookmarkSimple,
  Star,
  Plus,
  SortAscending,
  X,
  SpinnerGap,
  Warning,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { costIndexLabel } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchCities, fetchTrips, saveDestination, removeSavedDestination, fetchSavedDestinations } from "@/lib/api-hooks";
import api from "@/lib/api";
import type { City, Trip } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Region = "All" | "Asia" | "Europe" | "Americas" | "Africa" | "Oceania";
type SortOption = "popularity" | "cost_asc" | "cost_desc";

const regions: Region[] = ["All", "Asia", "Europe", "Americas", "Africa", "Oceania"];
const sortOptions: { key: SortOption; label: string }[] = [
  { key: "popularity", label: "Popularity" },
  { key: "cost_asc", label: "Cost (Low–High)" },
  { key: "cost_desc", label: "Cost (High–Low)" },
];

// ---------------------------------------------------------------------------
// Add to Trip Modal
// ---------------------------------------------------------------------------

interface AddToTripModalProps {
  open: boolean;
  city: City | null;
  trips: Trip[];
  onClose: () => void;
}

function AddToTripModal({ open, city, trips, onClose }: AddToTripModalProps) {
  const [selectedTrip, setSelectedTrip] = useState<string>("");

  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const handleConfirm = useCallback(async () => {
    if (!selectedTrip || !city) return;
    setAdding(true);
    setAddError('');
    try {
      await api.post(`/api/trips/${selectedTrip}/stops`, { city_id: Number(city.id) });
      setSelectedTrip('');
      onClose();
    } catch {
      setAddError('Failed to add city. Please try again.');
    } finally {
      setAdding(false);
    }
  }, [selectedTrip, city, onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setSelectedTrip(""); onClose(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Trip</DialogTitle>
          <DialogDescription>
            Choose a trip to add <strong>{city?.name}</strong> as a stop.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {trips.length === 0 ? (
            <p className="text-sm text-charcoal-400 text-center py-4">
              No trips yet. Create a trip first.
            </p>
          ) : (
            <Select value={selectedTrip} onValueChange={setSelectedTrip}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a trip" />
              </SelectTrigger>
              <SelectContent>
                {trips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    {trip.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {addError && (
          <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
            <Warning size={14} /> {addError}
          </p>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={adding}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTrip || adding}
            className="bg-ember-500 hover:bg-ember-600 text-white inline-flex items-center gap-2"
          >
            {adding && <SpinnerGap size={14} className="animate-spin" />}
            Add to Trip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// CityCard
// ---------------------------------------------------------------------------

interface CityCardProps {
  city: City;
  isSaved: boolean;
  onToggleSave: (city: City) => void;
  onAddToTrip: (city: City) => void;
}

function CityCard({ city, isSaved, onToggleSave, onAddToTrip }: CityCardProps) {
  const popularity = Math.round((Number(city.popularity_score) / 100) * 5);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group relative h-[200px] sm:h-[240px] md:h-[280px] overflow-hidden rounded-xl touch-manipulation"
    >
      <Image
        src={city.image_url ?? "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600"}
        alt={city.name}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, 25vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/40 to-transparent" />

      {/* Bookmark */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleSave(city); }}
        className={cn(
          "absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-colors",
          isSaved ? "bg-ember-500 text-white" : "bg-charcoal-900/40 text-white hover:bg-charcoal-900/60"
        )}
        aria-label={isSaved ? "Unsave city" : "Save city"}
      >
        <BookmarkSimple size={20} weight={isSaved ? "fill" : "regular"} />
      </button>

      {/* Cost badge */}
      <div className="absolute right-3 top-3 z-10 rounded-full bg-charcoal-900/60 px-2.5 py-1 text-xs font-semibold text-sand-100 backdrop-blur-sm">
        {costIndexLabel(Number(city.cost_index))}
      </div>

      {/* Info */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="font-display text-xl font-semibold text-white drop-shadow-md">{city.name}</h3>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-sand-200">
          <span>{city.country}</span>
          {city.region && <span className="text-sand-400">· {city.region}</span>}
        </div>
        <div className="mt-2 flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={14} weight={i < popularity ? "fill" : "regular"}
              className={i < popularity ? "text-ember-400" : "text-charcoal-500"} />
          ))}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onAddToTrip(city); }}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-ember-500/90 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-ember-500"
        >
          <Plus size={16} weight="bold" />
          Add to Trip
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function CityCardSkeleton() {
  return <div className="h-[200px] sm:h-[240px] md:h-[280px] rounded-xl bg-sand-100 animate-pulse" />;
}

// ---------------------------------------------------------------------------
// ExplorePage
// ---------------------------------------------------------------------------

export default function ExplorePage() {
  const [cities, setCities] = useState<City[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [addToTripCity, setAddToTripCity] = useState<City | null>(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [activeRegion, setActiveRegion] = useState<Region>("All");
  const [sort, setSort] = useState<SortOption>("popularity");

  // Debounce search
  const debounceRef = useRef<NodeJS.Timeout>();

  // Fetch cities whenever filters change
  const loadCities = useCallback((params: { search?: string; region?: Region; sort?: SortOption }) => {
    setLoading(true);
    fetchCities({
      search: params.search || undefined,
      region: params.region !== "All" ? params.region : undefined,
      sort: params.sort,
      limit: 50,
    })
      .then((res) => { setCities(res.cities); setTotal(res.total); })
      .catch(() => setCities([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCities({ search, region: activeRegion, sort });
  }, [activeRegion, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search input
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadCities({ search, region: activeRegion, sort });
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load user trips + saved destinations on mount
  useEffect(() => {
    fetchTrips().then(setTrips).catch(() => setTrips([]));
    fetchSavedDestinations()
      .then((saved) => setSavedIds(new Set(saved.map((c) => Number(c.id)))))
      .catch(() => {});
  }, []);

  const handleToggleSave = useCallback(async (city: City) => {
    const id = Number(city.id);
    const isSaved = savedIds.has(id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      isSaved ? next.delete(id) : next.add(id);
      return next;
    });
    try {
      if (isSaved) await removeSavedDestination(id);
      else await saveDestination(id);
    } catch {
      // Revert on error
      setSavedIds((prev) => {
        const next = new Set(prev);
        isSaved ? next.add(id) : next.delete(id);
        return next;
      });
    }
  }, [savedIds]);

  return (
    <div className="w-full space-y-6 min-h-screen">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-r from-sand-50 to-cream px-3 py-6 sm:px-6 sm:py-10 md:px-8 md:py-14">
        <h1 className="font-display text-xl sm:text-3xl md:text-4xl font-bold text-charcoal-800 text-center">
          Explore Cities
        </h1>
        <p className="mt-2 text-sm sm:text-base text-charcoal-500 text-center">
          Discover your next destination and start planning your adventure
        </p>
        <div className="mx-auto mt-4 sm:mt-8 max-w-2xl">
          <div className="relative">
            <MagnifyingGlass size={20} className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cities or countries..."
              className={cn(
                "h-12 sm:h-14 w-full rounded-xl sm:rounded-2xl border-2 border-sand-200 bg-white pl-12 sm:pl-14 pr-10 sm:pr-12 text-base sm:text-lg text-charcoal-800",
                "placeholder:text-charcoal-300 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20",
                "shadow-warm transition-all duration-200"
              )}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-charcoal-400 hover:bg-sand-100 transition-colors"
              >
                <X size={18} weight="bold" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-wrap gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 sm:pb-0">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              className={cn(
                "pill-button text-sm whitespace-nowrap transition-all duration-200 active:scale-95",
                activeRegion === region ? "bg-ember-500 text-white shadow-sm" : "bg-sand-100 text-charcoal-600 hover:bg-sand-200"
              )}
            >
              {region}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={cn(
                "pill-button inline-flex items-center gap-1.5 text-sm whitespace-nowrap transition-all duration-200",
                sort === opt.key ? "bg-charcoal-800 text-white" : "bg-sand-100 text-charcoal-600 hover:bg-sand-200"
              )}
            >
              {opt.key === "popularity" ? <Star size={14} weight="fill" /> : <SortAscending size={14} />}
              <span className="hidden sm:inline">{opt.label}</span>
              <span className="sm:hidden">{opt.key === "popularity" ? "Pop" : opt.key === "cost_asc" ? "Low" : "High"}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-charcoal-400">{total} {total === 1 ? "city" : "cities"} found</p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CityCardSkeleton key={i} />)}
        </div>
      ) : cities.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 sm:py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sand-100">
            <MagnifyingGlass size={32} weight="duotone" className="text-sand-400" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-charcoal-700">No cities found</h3>
          <p className="mt-2 max-w-sm text-sm text-charcoal-400 px-4">
            Try adjusting your search or filters.
          </p>
        </motion.div>
      ) : (
        <motion.div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <AnimatePresence mode="popLayout">
            {cities.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                isSaved={savedIds.has(Number(city.id))}
                onToggleSave={handleToggleSave}
                onAddToTrip={setAddToTripCity}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AddToTripModal
        open={addToTripCity !== null}
        city={addToTripCity}
        trips={trips}
        onClose={() => setAddToTripCity(null)}
      />
    </div>
  );
}
