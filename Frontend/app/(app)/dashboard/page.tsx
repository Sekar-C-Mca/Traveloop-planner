"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  MapTrifold,
  Globe,
  CalendarBlank,
  Clock,
  CalendarBlank as CalendarIcon,
  MapPin,
  CurrencyInr,
  PlusCircle,
  Compass,
  Backpack,
  SpinnerGap,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { fetchTrips, fetchCities } from "@/lib/api-hooks";
import type { Trip, City } from "@/types";

// ---------------------------------------------------------------------------
// Animated counter
// ---------------------------------------------------------------------------

function AnimatedCounter({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { bounce: 0, duration: duration * 1000 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) motionVal.set(value);
  }, [isInView, motionVal, value]);

  useEffect(() => {
    return springVal.on("change", (latest) => setDisplay(Math.round(latest)));
  }, [springVal]);

  return <span ref={ref}>{display}</span>;
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="warm-card flex items-center gap-4 p-5"
    >
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sand-50", color)}>
        <Icon size={24} weight="duotone" />
      </div>
      <div>
        <p className="text-3xl font-bold text-charcoal-800">
          <AnimatedCounter value={value} />
        </p>
        <p className="text-sm text-charcoal-500">{label}</p>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Trip card
// ---------------------------------------------------------------------------

function TripCard({ trip }: { trip: Trip }) {
  const dateRange = `${new Date(trip.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} – ${new Date(trip.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
  const stopCount = (trip.stops ?? []).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="warm-card overflow-hidden transition-shadow hover:shadow-warm-lg"
    >
      <Link href={`/trips/${trip.id}`}>
        <div className="relative h-[180px] sm:h-[200px] w-full overflow-hidden rounded-t-xl bg-sand-100">
          {trip.cover_photo_url ? (
            <Image
              src={trip.cover_photo_url}
              alt={trip.name}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapTrifold size={40} className="text-sand-300" weight="duotone" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-display text-lg font-semibold text-charcoal-800 truncate">{trip.name}</h3>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-charcoal-600">
              <CalendarIcon size={16} className="text-charcoal-400" />
              <span>{dateRange}</span>
            </div>
            {stopCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-charcoal-600">
                <MapPin size={16} className="text-charcoal-400" />
                <span>{stopCount} {stopCount === 1 ? "city" : "cities"}</span>
              </div>
            )}
            {trip.total_budget && (
              <div className="flex items-center gap-2 text-sm text-charcoal-600">
                <CurrencyInr size={16} className="text-charcoal-400" />
                <span>
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: trip.currency ?? "INR",
                    maximumFractionDigits: 0,
                  }).format(Number(trip.total_budget))}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Trending city card
// ---------------------------------------------------------------------------

function costLabel(index: number | null): string {
  if (!index || index <= 3) return "$";
  if (index <= 6) return "$$";
  return "$$$";
}

function CityCard({ city }: { city: City }) {
  return (
    <Link href="/explore">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-[160px] shrink-0 overflow-hidden rounded-xl"
      >
        <div className="relative h-[220px] w-full">
          {city.image_url ? (
            <Image src={city.image_url} alt={city.name} fill className="object-cover" sizes="160px" />
          ) : (
            <div className="w-full h-full bg-sand-200" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3">
            <p className="font-display text-base font-semibold text-white">{city.name}</p>
            <p className="text-xs text-sand-200">{city.country}</p>
          </div>
          <div className="absolute right-2 top-2 rounded-full bg-charcoal-900/60 px-2 py-0.5 text-xs font-semibold text-sand-100 backdrop-blur-sm">
            {costLabel(Number(city.cost_index))}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div className="warm-card overflow-hidden animate-pulse">
      <div className="h-[180px] bg-sand-100 rounded-t-xl" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-sand-100 rounded w-3/4" />
        <div className="h-3 bg-sand-100 rounded w-1/2" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick actions (static — these are navigation links)
// ---------------------------------------------------------------------------

const quickActions = [
  { label: "Plan New Trip", icon: PlusCircle, href: "/trips/new", color: "text-ember-500", bg: "bg-ember-50 hover:bg-ember-100" },
  { label: "Browse Cities", icon: Compass, href: "/explore", color: "text-forest-500", bg: "bg-forest-50 hover:bg-forest-100" },
  { label: "View Packing List", icon: Backpack, href: "/trips", color: "text-sand-500", bg: "bg-sand-50 hover:bg-sand-100" },
];

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(" ")[0] ?? "Traveler";

  const [trips, setTrips] = useState<Trip[]>([]);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [trendingCities, setTrendingCities] = useState<City[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(true);

  useEffect(() => {
    // Fetch upcoming trips for the cards
    fetchTrips({ status: "upcoming" })
      .then(setTrips)
      .catch(() => setTrips([]))
      .finally(() => setTripsLoading(false));

    // Fetch all trips for stats computation
    fetchTrips().then(setAllTrips).catch(() => setAllTrips([]));

    // Fetch top cities by popularity for the trending row
    fetchCities({ sort: "popularity", limit: 8 })
      .then((res) => setTrendingCities(res.cities))
      .catch(() => setTrendingCities([]))
      .finally(() => setCitiesLoading(false));
  }, []);

  // Compute stats from real trip data
  const totalTrips = allTrips.length;
  const upcomingCount = allTrips.filter((t) => t.status === "upcoming").length;
  const countriesVisited = new Set(
    allTrips.flatMap((t) => (t.stops ?? []).map((s: any) => s.city?.country).filter(Boolean))
  ).size;
  const daysTravelled = allTrips
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => {
      const diff = Math.abs(new Date(t.end_date).getTime() - new Date(t.start_date).getTime());
      return sum + Math.ceil(diff / (1000 * 60 * 60 * 24));
    }, 0);

  const stats = [
    { label: "Total Trips", value: totalTrips, icon: MapTrifold, color: "text-ember-500" },
    { label: "Countries Visited", value: countriesVisited, icon: Globe, color: "text-forest-500" },
    { label: "Days Travelled", value: daysTravelled, icon: CalendarBlank, color: "text-sand-500" },
    { label: "Upcoming Trips", value: upcomingCount, icon: Clock, color: "text-charcoal-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <section className="rounded-2xl bg-gradient-to-r from-sand-50 to-cream px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal-800">
          Ready to wander, {firstName}?
        </h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-charcoal-500">
          Your next adventure is just a few clicks away.
        </p>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      {/* Upcoming trips */}
      <section>
        <h2 className="font-display text-xl font-semibold text-charcoal-800">
          Your upcoming trips
        </h2>
        <div className="mt-3 sm:mt-4 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tripsLoading ? (
            [1, 2, 3].map((i) => <SkeletonCard key={i} />)
          ) : trips.length === 0 ? (
            <div className="col-span-full flex flex-col items-center py-12 text-center">
              <MapTrifold size={40} className="text-sand-300 mb-3" weight="duotone" />
              <p className="text-charcoal-500 text-sm">No upcoming trips yet</p>
              <Link href="/trips/new" className="mt-3 text-ember-500 text-sm font-medium hover:underline">
                Plan your first trip →
              </Link>
            </div>
          ) : (
            trips.slice(0, 3).map((trip) => <TripCard key={trip.id} trip={trip} />)
          )}
        </div>
      </section>

      {/* Trending destinations */}
      <section>
        <h2 className="font-display text-xl font-semibold text-charcoal-800">
          Trending Destinations
        </h2>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
          {citiesLoading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="w-[160px] h-[220px] shrink-0 rounded-xl bg-sand-100 animate-pulse" />
            ))
          ) : (
            trendingCities.map((city) => (
              <div key={city.id} className="snap-start">
                <CityCard city={city} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="font-display text-xl font-semibold text-charcoal-800">Quick Actions</h2>
        <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className={cn(
                  "pill-button inline-flex items-center gap-2 border border-transparent transition-colors",
                  action.bg,
                  action.color
                )}
              >
                <Icon size={20} weight="duotone" />
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
