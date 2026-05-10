"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlass,
  Funnel,
  Clock,
  CurrencyInr,
  MapPin,
  Plus,
  SlidersHorizontal,
  X,
  Check,
  SpinnerGap,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { fetchActivities, fetchCategories, fetchTrips } from "@/lib/api-hooks";
import type { Activity, ActivityCategory, Trip } from "@/types";

// ---------------------------------------------------------------------------
// Category color mapping (by category name from DB)
// ---------------------------------------------------------------------------

const categoryColorMap: Record<string, string> = {
  Adventure: "bg-ember-100 text-ember-700",
  "Culture & History": "bg-forest-100 text-forest-700",
  "Food & Dining": "bg-sand-200 text-sand-700",
  Nature: "bg-forest-50 text-forest-600",
  Shopping: "bg-sand-100 text-sand-600",
  Nightlife: "bg-charcoal-100 text-charcoal-700",
  Sightseeing: "bg-sky-100 text-sky-700",
  Wellness: "bg-purple-100 text-purple-700",
};

function categoryColor(name: string) {
  return categoryColorMap[name] ?? "bg-sand-100 text-charcoal-600";
}

// ---------------------------------------------------------------------------
// AddToTripDrawer
// ---------------------------------------------------------------------------

interface AddToTripDrawerProps {
  open: boolean;
  activity: Activity | null;
  trips: Trip[];
  onClose: () => void;
}

function AddToTripDrawer({ open, activity, trips, onClose }: AddToTripDrawerProps) {
  const [selectedTrip, setSelectedTrip] = useState<string>("");
  const [time, setTime] = useState<string>("09:00");

  const handleConfirm = useCallback(() => {
    console.log(`Add activity ${activity?.id} to trip ${selectedTrip} at ${time}`);
    setSelectedTrip("");
    setTime("09:00");
    onClose();
  }, [selectedTrip, time, activity, onClose]);

  return (
    <Drawer open={open} onOpenChange={(v) => { if (!v) { setSelectedTrip(""); setTime("09:00"); onClose(); } }}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add Activity to Trip</DrawerTitle>
          <DrawerDescription>
            Add <strong>{activity?.name}</strong> to one of your trips.
          </DrawerDescription>
        </DrawerHeader>
        <div className="space-y-5 px-4 pb-2">
          <div className="space-y-2">
            <Label htmlFor="trip-select">Select Trip</Label>
            {trips.length === 0 ? (
              <p className="text-sm text-charcoal-400">No trips yet. Create a trip first.</p>
            ) : (
              <Select value={selectedTrip} onValueChange={setSelectedTrip}>
                <SelectTrigger id="trip-select" className="w-full">
                  <SelectValue placeholder="Choose a trip" />
                </SelectTrigger>
                <SelectContent>
                  {trips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>{trip.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="time-input">Preferred Time</Label>
            <Input
              id="time-input"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        <DrawerFooter>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTrip}
            className="bg-ember-500 hover:bg-ember-600 text-white"
          >
            <Check size={18} className="mr-1.5" />
            Confirm
          </Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// ---------------------------------------------------------------------------
// ActivityCard
// ---------------------------------------------------------------------------

function ActivityCard({
  activity,
  onAddToTrip,
}: {
  activity: Activity & { category_name?: string; city_name?: string };
  onAddToTrip: (a: Activity) => void;
}) {
  const catName = activity.category_name ?? (activity.category as any)?.name ?? "Activity";
  const durationHours = activity.duration_minutes ? Math.round(activity.duration_minutes / 60 * 10) / 10 : null;
  const cost = activity.estimated_cost ? Number(activity.estimated_cost) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35 }}
      className="overflow-hidden rounded-xl bg-white shadow-warm transition-shadow hover:shadow-warm-lg"
    >
      {/* Image */}
      <div className="relative h-[140px] sm:h-[180px] w-full overflow-hidden rounded-t-xl bg-sand-100">
        {activity.image_url ? (
          <Image
            src={activity.image_url}
            alt={activity.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin size={32} className="text-sand-300" weight="duotone" />
          </div>
        )}
        {activity.is_popular && (
          <div className="absolute top-2 right-2 rounded-full bg-ember-500 px-2 py-0.5 text-[10px] font-bold text-white">
            Popular
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-display text-base font-semibold text-charcoal-800 line-clamp-2">
          {activity.name}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", categoryColor(catName))}>
            {catName}
          </span>
          {durationHours && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sand-50 px-2.5 py-0.5 text-xs font-medium text-charcoal-600">
              <Clock size={12} />
              {durationHours}h
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          {cost !== null ? (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-ember-600">
              <CurrencyInr size={14} weight="bold" />
              {cost.toLocaleString("en-IN")}
            </span>
          ) : <span className="text-sm text-charcoal-400">Free</span>}
          {activity.city_name && (
            <span className="inline-flex items-center gap-1 text-xs text-charcoal-500">
              <MapPin size={12} />
              {activity.city_name}
            </span>
          )}
        </div>

        <button
          onClick={() => onAddToTrip(activity)}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-ember-500/10 px-3 py-2 text-sm font-medium text-ember-600 transition-colors hover:bg-ember-500 hover:text-white"
        >
          <Plus size={16} weight="bold" />
          Add to Trip
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// FilterSidebar
// ---------------------------------------------------------------------------

function FilterSidebar({
  categories,
  selectedCategoryIds,
  onToggleCategory,
  costMin,
  costMax,
  onCostMinChange,
  onCostMaxChange,
  durationMax,
  onDurationMaxChange,
  onClearFilters,
}: {
  categories: ActivityCategory[];
  selectedCategoryIds: Set<number>;
  onToggleCategory: (id: number) => void;
  costMin: string;
  costMax: string;
  onCostMinChange: (v: string) => void;
  onCostMaxChange: (v: string) => void;
  durationMax: string;
  onDurationMaxChange: (v: string) => void;
  onClearFilters: () => void;
}) {
  const hasFilters = selectedCategoryIds.size > 0 || costMin !== "" || costMax !== "" || durationMax !== "";

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-charcoal-800 flex items-center gap-2">
          <SlidersHorizontal size={20} weight="duotone" className="text-ember-500" />
          Filters
        </h3>
        {hasFilters && (
          <button onClick={onClearFilters} className="text-xs font-medium text-ember-500 hover:text-ember-600 transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Category checkboxes */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">Category</h4>
        <div className="space-y-2.5">
          {categories.map((cat) => (
            <label key={cat.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-sand-50">
              <Checkbox
                checked={selectedCategoryIds.has(Number(cat.id))}
                onCheckedChange={() => onToggleCategory(Number(cat.id))}
                className="data-[state=checked]:bg-ember-500 data-[state=checked]:border-ember-500"
              />
              <span className="text-sm text-charcoal-700">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Cost range */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">Cost Range (₹)</h4>
        <div className="flex items-center gap-2">
          <Input type="number" placeholder="Min" value={costMin} onChange={(e) => onCostMinChange(e.target.value)} className="h-9 text-sm" min={0} />
          <span className="text-charcoal-400">-</span>
          <Input type="number" placeholder="Max" value={costMax} onChange={(e) => onCostMaxChange(e.target.value)} className="h-9 text-sm" min={0} />
        </div>
      </div>

      {/* Duration max */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">Max Duration (hours)</h4>
        <Input type="number" placeholder="e.g. 4" value={durationMax} onChange={(e) => onDurationMaxChange(e.target.value)} className="h-9 text-sm" min={0} />
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// MobileFilterSheet
// ---------------------------------------------------------------------------

function MobileFilterSheet({
  open, onClose, ...filterProps
}: { open: boolean; onClose: () => void } & React.ComponentProps<typeof FilterSidebar>) {
  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Refine your activity search</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <FilterSidebar {...filterProps} onClearFilters={() => { filterProps.onClearFilters(); onClose(); }} />
        </div>
        <DrawerFooter>
          <Button onClick={onClose} className="bg-ember-500 hover:bg-ember-600 text-white">Apply Filters</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// ---------------------------------------------------------------------------
// ActivitiesPage
// ---------------------------------------------------------------------------

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<(Activity & { category_name?: string; city_name?: string })[]>([]);
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(new Set());
  const [costMin, setCostMin] = useState("");
  const [costMax, setCostMax] = useState("");
  const [durationMax, setDurationMax] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [addToTripActivity, setAddToTripActivity] = useState<Activity | null>(null);

  // Load all data on mount
  useEffect(() => {
    Promise.all([
      fetchActivities(),
      fetchCategories(),
      fetchTrips(),
    ])
      .then(([acts, cats, trps]) => {
        setActivities(acts as any);
        setCategories(cats);
        setTrips(trps);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggleCategory = useCallback((id: number) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedCategoryIds(new Set());
    setCostMin("");
    setCostMax("");
    setDurationMax("");
  }, []);

  // Client-side filtering on top of the full fetched list
  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchesSearch =
        search === "" ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        (a.city_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (a.category_name ?? "").toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategoryIds.size === 0 || selectedCategoryIds.has(Number(a.category_id));

      const cost = Number(a.estimated_cost ?? 0);
      const matchesCost =
        (costMin === "" || cost >= parseFloat(costMin)) &&
        (costMax === "" || cost <= parseFloat(costMax));

      const dur = a.duration_minutes ? a.duration_minutes / 60 : 0;
      const matchesDuration = durationMax === "" || dur <= parseFloat(durationMax);

      return matchesSearch && matchesCategory && matchesCost && matchesDuration;
    });
  }, [activities, search, selectedCategoryIds, costMin, costMax, durationMax]);

  const filterProps = {
    categories,
    selectedCategoryIds,
    onToggleCategory: handleToggleCategory,
    costMin,
    costMax,
    onCostMinChange: setCostMin,
    onCostMaxChange: setCostMax,
    durationMax,
    onDurationMaxChange: setDurationMax,
    onClearFilters: handleClearFilters,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal-800">Activities</h1>
        <p className="mt-1 text-xs sm:text-sm text-charcoal-500">
          Find experiences and add them to your trips
        </p>
      </div>

      {/* Search + mobile filter toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities, cities, categories..."
            className={cn(
              "h-11 w-full rounded-xl border border-sand-200 bg-white pl-11 pr-10 text-sm text-charcoal-800",
              "placeholder:text-charcoal-300 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20",
              "shadow-warm transition-all duration-200"
            )}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-charcoal-400 hover:bg-sand-100">
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="flex lg:hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sand-200 bg-white shadow-warm text-charcoal-500 hover:text-ember-500 transition-colors"
          aria-label="Open filters"
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {/* Main layout */}
      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-[220px] shrink-0">
          <FilterSidebar {...filterProps} />
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <SpinnerGap size={32} className="animate-spin text-ember-400" />
            </div>
          ) : filteredActivities.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sand-100">
                <Funnel size={40} weight="duotone" className="text-sand-400" />
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold text-charcoal-700">No activities found</h3>
              <p className="mt-2 max-w-sm text-sm text-charcoal-400">
                Try adjusting your search or filters.
              </p>
            </motion.div>
          ) : (
            <>
              <p className="mb-4 text-sm text-charcoal-500">
                {filteredActivities.length} activit{filteredActivities.length === 1 ? "y" : "ies"} found
              </p>
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filteredActivities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} onAddToTrip={setAddToTripActivity} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <MobileFilterSheet open={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)} {...filterProps} />

      {/* Add to trip drawer */}
      <AddToTripDrawer
        open={addToTripActivity !== null}
        activity={addToTripActivity}
        trips={trips}
        onClose={() => setAddToTripActivity(null)}
      />
    </div>
  );
}
