"use client";

import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlass,
  Funnel,
  Clock,
  CurrencyDollar,
  MapPin,
  Tag,
  Plus,
  SlidersHorizontal,
  X,
  Check,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { costIndexLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActivityCategory =
  | "Adventure"
  | "Culture"
  | "Food"
  | "Nature"
  | "Shopping"
  | "Nightlife";

interface Activity {
  id: string;
  name: string;
  category: ActivityCategory;
  imageUrl: string;
  cost: number; // in USD
  durationHours: number;
  city: string;
  cityId: string;
}

interface Trip {
  id: string;
  name: string;
  stops: Stop[];
}

interface Stop {
  id: string;
  name: string;
  cityId: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const categories: ActivityCategory[] = [
  "Adventure",
  "Culture",
  "Food",
  "Nature",
  "Shopping",
  "Nightlife",
];

const categoryColors: Record<ActivityCategory, string> = {
  Adventure: "bg-ember-100 text-ember-700",
  Culture: "bg-forest-100 text-forest-700",
  Food: "bg-sand-200 text-sand-700",
  Nature: "bg-forest-50 text-forest-600",
  Shopping: "bg-sand-100 text-sand-600",
  Nightlife: "bg-charcoal-100 text-charcoal-700",
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockActivities: Activity[] = [
  {
    id: "1",
    name: "Sunrise Trek to Mount Batur",
    category: "Adventure",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80",
    cost: 45,
    durationHours: 6,
    city: "Bali",
    cityId: "2",
  },
  {
    id: "2",
    name: "Sushi Making Masterclass",
    category: "Food",
    imageUrl:
      "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=600&q=80",
    cost: 80,
    durationHours: 3,
    city: "Tokyo",
    cityId: "3",
  },
  {
    id: "3",
    name: "Street Food Tour of Old Delhi",
    category: "Food",
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    cost: 25,
    durationHours: 4,
    city: "Jaipur",
    cityId: "1",
  },
  {
    id: "4",
    name: "Surfing Lessons at Kuta Beach",
    category: "Adventure",
    imageUrl:
      "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=600&q=80",
    cost: 35,
    durationHours: 2,
    city: "Bali",
    cityId: "2",
  },
  {
    id: "5",
    name: "Louvre Museum Guided Tour",
    category: "Culture",
    imageUrl:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80",
    cost: 60,
    durationHours: 4,
    city: "Paris",
    cityId: "5",
  },
  {
    id: "6",
    name: "Colosseum Underground Tour",
    category: "Culture",
    imageUrl:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80",
    cost: 55,
    durationHours: 3,
    city: "Rome",
    cityId: "7",
  },
  {
    id: "7",
    name: "Central Park Bike Tour",
    category: "Nature",
    imageUrl:
      "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=600&q=80",
    cost: 40,
    durationHours: 2,
    city: "New York",
    cityId: "10",
  },
  {
    id: "8",
    name: "La Boqueria Market Walk",
    category: "Shopping",
    imageUrl:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80",
    cost: 15,
    durationHours: 2,
    city: "Barcelona",
    cityId: "8",
  },
  {
    id: "9",
    name: "Table Mountain Sunset Hike",
    category: "Nature",
    imageUrl:
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=600&q=80",
    cost: 20,
    durationHours: 4,
    city: "Cape Town",
    cityId: "12",
  },
  {
    id: "10",
    name: "Rooftop Bar Hopping in Dubai",
    category: "Nightlife",
    imageUrl:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    cost: 90,
    durationHours: 4,
    city: "Dubai",
    cityId: "6",
  },
  {
    id: "11",
    name: "Camel Safari in Thar Desert",
    category: "Adventure",
    imageUrl:
      "https://images.unsplash.com/photo-1548634928-df54e7d8d4e2?auto=format&fit=crop&w=600&q=80",
    cost: 30,
    durationHours: 5,
    city: "Jaipur",
    cityId: "1",
  },
  {
    id: "12",
    name: "Shoreditch Nightlife Crawl",
    category: "Nightlife",
    imageUrl:
      "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=600&q=80",
    cost: 50,
    durationHours: 4,
    city: "London",
    cityId: "9",
  },
];

const mockTrips: Trip[] = [
  {
    id: "1",
    name: "Rajasthan Road Trip",
    stops: [
      { id: "s1", name: "Jaipur Stop", cityId: "1" },
      { id: "s2", name: "Jodhpur Stop", cityId: "1" },
    ],
  },
  {
    id: "2",
    name: "Bali Wellness Retreat",
    stops: [
      { id: "s3", name: "Ubud Stop", cityId: "2" },
      { id: "s4", name: "Seminyak Stop", cityId: "2" },
    ],
  },
  {
    id: "3",
    name: "Goa Beach Escape",
    stops: [{ id: "s5", name: "North Goa Stop", cityId: "4" }],
  },
  {
    id: "4",
    name: "European Summer",
    stops: [
      { id: "s6", name: "Paris Stop", cityId: "5" },
      { id: "s7", name: "Rome Stop", cityId: "7" },
      { id: "s8", name: "Barcelona Stop", cityId: "8" },
    ],
  },
  {
    id: "5",
    name: "Tokyo Explorer",
    stops: [
      { id: "s9", name: "Shibuya Stop", cityId: "3" },
      { id: "s10", name: "Asakusa Stop", cityId: "3" },
    ],
  },
];

// ---------------------------------------------------------------------------
// AddToTripDrawer
// ---------------------------------------------------------------------------

interface AddToTripDrawerProps {
  open: boolean;
  activityName: string;
  onClose: () => void;
  onConfirm: (tripId: string, stopId: string, time: string) => void;
}

function AddToTripDrawer({
  open,
  activityName,
  onClose,
  onConfirm,
}: AddToTripDrawerProps) {
  const [selectedTrip, setSelectedTrip] = useState<string>("");
  const [selectedStop, setSelectedStop] = useState<string>("");
  const [time, setTime] = useState<string>("09:00");

  const currentTrip = useMemo(
    () => mockTrips.find((t) => t.id === selectedTrip),
    [selectedTrip],
  );

  const availableStops = useMemo(() => currentTrip?.stops ?? [], [currentTrip]);

  const handleConfirm = useCallback(() => {
    if (selectedTrip && selectedStop && time) {
      onConfirm(selectedTrip, selectedStop, time);
      setSelectedTrip("");
      setSelectedStop("");
      setTime("09:00");
      onClose();
    }
  }, [selectedTrip, selectedStop, time, onConfirm, onClose]);

  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) {
        setSelectedTrip("");
        setSelectedStop("");
        setTime("09:00");
        onClose();
      }
    },
    [onClose],
  );

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add Activity to Trip</DrawerTitle>
          <DrawerDescription>
            Add <strong>{activityName}</strong> to a specific stop in your trip.
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-5 px-4 pb-2">
          {/* Select trip */}
          <div className="space-y-2">
            <Label htmlFor="trip-select">Select Trip</Label>
            <Select
              value={selectedTrip}
              onValueChange={(v) => {
                setSelectedTrip(v);
                setSelectedStop("");
              }}
            >
              <SelectTrigger id="trip-select" className="w-full">
                <SelectValue placeholder="Choose a trip" />
              </SelectTrigger>
              <SelectContent>
                {mockTrips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    {trip.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Select stop */}
          <div className="space-y-2">
            <Label htmlFor="stop-select">Select Stop</Label>
            <Select
              value={selectedStop}
              onValueChange={setSelectedStop}
              disabled={!selectedTrip}
            >
              <SelectTrigger id="stop-select" className="w-full">
                <SelectValue
                  placeholder={
                    selectedTrip ? "Choose a stop" : "Select a trip first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableStops.map((stop) => (
                  <SelectItem key={stop.id} value={stop.id}>
                    {stop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Set time */}
          <div className="space-y-2">
            <Label htmlFor="time-input">Set Time</Label>
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
            disabled={!selectedTrip || !selectedStop}
            className="bg-ember-500 hover:bg-ember-600 text-white"
          >
            <Check size={18} className="mr-1.5" />
            Confirm
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// ---------------------------------------------------------------------------
// ActivityCard
// ---------------------------------------------------------------------------

interface ActivityCardProps {
  activity: Activity;
  onAddToTrip: (activity: Activity) => void;
}

function ActivityCard({ activity, onAddToTrip }: ActivityCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35 }}
      className="overflow-hidden rounded-xl bg-white shadow-warm transition-shadow hover:shadow-warm-lg"
    >
      {/* Image */}
      <div className="relative h-[140px] sm:h-[180px] w-full overflow-hidden rounded-t-xl">
        <Image
          src={activity.imageUrl}
          alt={activity.name}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name */}
        <h3 className="font-display text-base font-semibold text-charcoal-800 line-clamp-1">
          {activity.name}
        </h3>

        {/* Category pill + Duration chip */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
              categoryColors[activity.category],
            )}
          >
            {activity.category}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-sand-50 px-2.5 py-0.5 text-xs font-medium text-charcoal-600">
            <Clock size={12} />
            {activity.durationHours}h
          </span>
        </div>

        {/* Cost + City tag */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-ember-600">
            <CurrencyDollar size={16} weight="bold" />
            {activity.cost} USD
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-charcoal-500">
            <MapPin size={12} />
            {activity.city}
          </span>
        </div>

        {/* Add to trip button */}
        <button
          onClick={() => onAddToTrip(activity)}
          className={cn(
            "inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-ember-500/10 px-3 py-2 text-sm font-medium text-ember-600 transition-colors hover:bg-ember-500 hover:text-white",
          )}
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

interface FilterSidebarProps {
  selectedCategories: Set<ActivityCategory>;
  onToggleCategory: (cat: ActivityCategory) => void;
  costMin: string;
  costMax: string;
  onCostMinChange: (v: string) => void;
  onCostMaxChange: (v: string) => void;
  durationMin: string;
  durationMax: string;
  onDurationMinChange: (v: string) => void;
  onDurationMaxChange: (v: string) => void;
  onClearFilters: () => void;
}

function FilterSidebar({
  selectedCategories,
  onToggleCategory,
  costMin,
  costMax,
  onCostMinChange,
  onCostMaxChange,
  durationMin,
  durationMax,
  onDurationMinChange,
  onDurationMaxChange,
  onClearFilters,
}: FilterSidebarProps) {
  const hasFilters =
    selectedCategories.size > 0 ||
    costMin !== "" ||
    costMax !== "" ||
    durationMin !== "" ||
    durationMax !== "";

  return (
    <aside className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-charcoal-800 flex items-center gap-2">
          <SlidersHorizontal
            size={20}
            weight="duotone"
            className="text-ember-500"
          />
          Filters
        </h3>
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs font-medium text-ember-500 hover:text-ember-600 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category checkboxes */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Category
        </h4>
        <div className="space-y-2.5">
          {categories.map((cat) => (
            <label
              key={cat}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-sand-50"
            >
              <Checkbox
                checked={selectedCategories.has(cat)}
                onCheckedChange={() => onToggleCategory(cat)}
                className="data-[state=checked]:bg-ember-500 data-[state=checked]:border-ember-500"
              />
              <span className="text-sm text-charcoal-700">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Cost range */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Cost Range (USD)
        </h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={costMin}
            onChange={(e) => onCostMinChange(e.target.value)}
            className="h-9 text-sm"
            min={0}
          />
          <span className="text-charcoal-400">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={costMax}
            onChange={(e) => onCostMaxChange(e.target.value)}
            className="h-9 text-sm"
            min={0}
          />
        </div>
      </div>

      {/* Duration range */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Duration (hours)
        </h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={durationMin}
            onChange={(e) => onDurationMinChange(e.target.value)}
            className="h-9 text-sm"
            min={0}
          />
          <span className="text-charcoal-400">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={durationMax}
            onChange={(e) => onDurationMaxChange(e.target.value)}
            className="h-9 text-sm"
            min={0}
          />
        </div>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// MobileFilterSheet
// ---------------------------------------------------------------------------

interface MobileFilterSheetProps {
  open: boolean;
  onClose: () => void;
  selectedCategories: Set<ActivityCategory>;
  onToggleCategory: (cat: ActivityCategory) => void;
  costMin: string;
  costMax: string;
  onCostMinChange: (v: string) => void;
  onCostMaxChange: (v: string) => void;
  durationMin: string;
  durationMax: string;
  onDurationMinChange: (v: string) => void;
  onDurationMaxChange: (v: string) => void;
  onClearFilters: () => void;
}

function MobileFilterSheet({
  open,
  onClose,
  selectedCategories,
  onToggleCategory,
  costMin,
  costMax,
  onCostMinChange,
  onCostMaxChange,
  durationMin,
  durationMax,
  onDurationMinChange,
  onDurationMaxChange,
  onClearFilters,
}: MobileFilterSheetProps) {
  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Refine your activity search</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <FilterSidebar
            selectedCategories={selectedCategories}
            onToggleCategory={onToggleCategory}
            costMin={costMin}
            costMax={costMax}
            onCostMinChange={onCostMinChange}
            onCostMaxChange={onCostMaxChange}
            durationMin={durationMin}
            durationMax={durationMax}
            onDurationMinChange={onDurationMinChange}
            onDurationMaxChange={onDurationMaxChange}
            onClearFilters={() => {
              onClearFilters();
              onClose();
            }}
          />
        </div>
        <DrawerFooter>
          <Button
            onClick={onClose}
            className="bg-ember-500 hover:bg-ember-600 text-white"
          >
            Apply Filters
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// ---------------------------------------------------------------------------
// ActivitiesPage
// ---------------------------------------------------------------------------

export default function ActivitiesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<
    Set<ActivityCategory>
  >(new Set());
  const [costMin, setCostMin] = useState("");
  const [costMax, setCostMax] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [durationMax, setDurationMax] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [addToTripActivity, setAddToTripActivity] = useState<Activity | null>(
    null,
  );

  const handleToggleCategory = useCallback((cat: ActivityCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedCategories(new Set());
    setCostMin("");
    setCostMax("");
    setDurationMin("");
    setDurationMax("");
  }, []);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return mockActivities.filter((activity) => {
      // Search
      const matchesSearch =
        search === "" ||
        activity.name.toLowerCase().includes(search.toLowerCase()) ||
        activity.city.toLowerCase().includes(search.toLowerCase()) ||
        activity.category.toLowerCase().includes(search.toLowerCase());

      // Category
      const matchesCategory =
        selectedCategories.size === 0 ||
        selectedCategories.has(activity.category);

      // Cost range
      const costMinNum = costMin !== "" ? parseFloat(costMin) : 0;
      const costMaxNum = costMax !== "" ? parseFloat(costMax) : Infinity;
      const matchesCost =
        activity.cost >= costMinNum && activity.cost <= costMaxNum;

      // Duration range
      const durMinNum = durationMin !== "" ? parseFloat(durationMin) : 0;
      const durMaxNum = durationMax !== "" ? parseFloat(durationMax) : Infinity;
      const matchesDuration =
        activity.durationHours >= durMinNum &&
        activity.durationHours <= durMaxNum;

      return matchesSearch && matchesCategory && matchesCost && matchesDuration;
    });
  }, [search, selectedCategories, costMin, costMax, durationMin, durationMax]);

  const handleAddToTripConfirm = useCallback(
    (tripId: string, stopId: string, time: string) => {
      console.log(
        `Added activity to trip ${tripId}, stop ${stopId}, at ${time}`,
      );
    },
    [],
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal-800">
          Activities
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-charcoal-500">
          Find experiences and add them to your trips
        </p>
      </div>

      {/* Search bar + mobile filter toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={20}
            weight="regular"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities, cities, categories..."
            className={cn(
              "h-11 w-full rounded-xl border border-sand-200 bg-white pl-11 pr-10 text-sm text-charcoal-800",
              "placeholder:text-charcoal-300 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20",
              "shadow-warm transition-all duration-200",
            )}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-charcoal-400 hover:bg-sand-100 hover:text-charcoal-600"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {/* Mobile filter toggle */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className={cn(
            "flex lg:hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sand-200 bg-white shadow-warm text-charcoal-500 hover:text-ember-500 transition-colors",
          )}
          aria-label="Open filters"
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {/* Main layout: sidebar + grid */}
      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-[220px] shrink-0">
          <FilterSidebar
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            costMin={costMin}
            costMax={costMax}
            onCostMinChange={setCostMin}
            onCostMaxChange={setCostMax}
            durationMin={durationMin}
            durationMax={durationMax}
            onDurationMinChange={setDurationMin}
            onDurationMaxChange={setDurationMax}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Results grid */}
        <div className="flex-1 min-w-0">
          {filteredActivities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sand-100">
                <Funnel size={40} weight="duotone" className="text-sand-400" />
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold text-charcoal-700">
                No activities found
              </h3>
              <p className="mt-2 max-w-sm text-sm text-charcoal-400">
                Try adjusting your search or filters to find what you&apos;re
                looking for.
              </p>
            </motion.div>
          ) : (
            <>
              <p className="mb-4 text-sm text-charcoal-500">
                {filteredActivities.length} activit
                {filteredActivities.length === 1 ? "y" : "ies"} found
              </p>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {filteredActivities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      onAddToTrip={setAddToTripActivity}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <MobileFilterSheet
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
        costMin={costMin}
        costMax={costMax}
        onCostMinChange={setCostMin}
        onCostMaxChange={setCostMax}
        durationMin={durationMin}
        durationMax={durationMax}
        onDurationMinChange={setDurationMin}
        onDurationMaxChange={setDurationMax}
        onClearFilters={handleClearFilters}
      />

      {/* Add to Trip drawer */}
      <AddToTripDrawer
        open={addToTripActivity !== null}
        activityName={addToTripActivity?.name ?? ""}
        onClose={() => setAddToTripActivity(null)}
        onConfirm={handleAddToTripConfirm}
      />
    </div>
  );
}
