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
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StatCard {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

interface UpcomingTrip {
  id: string;
  name: string;
  coverUrl: string;
  dateRange: string;
  cityCount: number;
  budget: number;
}

interface TrendingCity {
  name: string;
  country: string;
  imageUrl: string;
  costIndex: number;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const stats: StatCard[] = [
  {
    label: "Total Trips",
    value: 12,
    icon: MapTrifold,
    color: "text-ember-500",
  },
  {
    label: "Countries Visited",
    value: 5,
    icon: Globe,
    color: "text-forest-500",
  },
  {
    label: "Days Travelled",
    value: 47,
    icon: CalendarBlank,
    color: "text-sand-500",
  },
  {
    label: "Upcoming Trips",
    value: 3,
    icon: Clock,
    color: "text-charcoal-500",
  },
];

const upcomingTrips: UpcomingTrip[] = [
  {
    id: "1",
    name: "Rajasthan Road Trip",
    coverUrl:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    dateRange: "15 Jul – 28 Jul 2026",
    cityCount: 4,
    budget: 45000,
  },
  {
    id: "2",
    name: "Bali Wellness Retreat",
    coverUrl:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    dateRange: "10 Aug – 20 Aug 2026",
    cityCount: 2,
    budget: 72000,
  },
  {
    id: "3",
    name: "Goa Beach Escape",
    coverUrl:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    dateRange: "1 Sep – 7 Sep 2026",
    cityCount: 1,
    budget: 25000,
  },
];

const trendingCities: TrendingCity[] = [
  {
    name: "Jaipur",
    country: "India",
    imageUrl:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80",
    costIndex: 1,
  },
  {
    name: "Bali",
    country: "Indonesia",
    imageUrl:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80",
    costIndex: 2,
  },
  {
    name: "Tokyo",
    country: "Japan",
    imageUrl:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80",
    costIndex: 3,
  },
  {
    name: "Goa",
    country: "India",
    imageUrl:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=400&q=80",
    costIndex: 1,
  },
  {
    name: "Paris",
    country: "France",
    imageUrl:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80",
    costIndex: 3,
  },
  {
    name: "Dubai",
    country: "UAE",
    imageUrl:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80",
    costIndex: 3,
  },
  {
    name: "Rome",
    country: "Italy",
    imageUrl:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80",
    costIndex: 3,
  },
  {
    name: "Barcelona",
    country: "Spain",
    imageUrl:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=400&q=80",
    costIndex: 2,
  },
];

// ---------------------------------------------------------------------------
// Animated counter component
// ---------------------------------------------------------------------------

function AnimatedCounter({
  value,
  duration = 1.2,
}: {
  value: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    bounce: 0,
    duration: duration * 1000,
  });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) {
      motionVal.set(value);
    }
  }, [isInView, motionVal, value]);

  useEffect(() => {
    const unsubscribe = springVal.on("change", (latest) => {
      setDisplay(Math.round(latest));
    });
    return unsubscribe;
  }, [springVal]);

  return <span ref={ref}>{display}</span>;
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({ label, value, icon: Icon, color }: StatCard) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="warm-card flex items-center gap-4 p-5"
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sand-50",
          color,
        )}
      >
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
// Upcoming trip card
// ---------------------------------------------------------------------------

function TripCard({ trip }: { trip: UpcomingTrip }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="warm-card overflow-hidden transition-shadow hover:shadow-warm-lg"
    >
      <div className="relative h-[200px] w-full overflow-hidden rounded-t-xl">
        <Image
          src={trip.coverUrl}
          alt={trip.name}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-charcoal-800">
          {trip.name}
        </h3>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-charcoal-600">
            <CalendarIcon size={16} className="text-charcoal-400" />
            <span>{trip.dateRange}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-charcoal-600">
            <MapPin size={16} className="text-charcoal-400" />
            <span>
              {trip.cityCount} {trip.cityCount === 1 ? "city" : "cities"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-charcoal-600">
            <CurrencyInr size={16} className="text-charcoal-400" />
            <span>
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(trip.budget)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Trending city card
// ---------------------------------------------------------------------------

function costLabel(index: number): string {
  if (index <= 1) return "$";
  if (index <= 2) return "$$";
  return "$$$";
}

function CityCard({ city }: { city: TrendingCity }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative w-[160px] shrink-0 overflow-hidden rounded-xl"
    >
      <div className="relative h-[220px] w-full">
        <Image
          src={city.imageUrl}
          alt={city.name}
          fill
          className="object-cover"
          sizes="160px"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/30 to-transparent" />
        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="font-display text-base font-semibold text-white">
            {city.name}
          </p>
          <p className="text-xs text-sand-200">{city.country}</p>
        </div>
        {/* Cost badge */}
        <div className="absolute right-2 top-2 rounded-full bg-charcoal-900/60 px-2 py-0.5 text-xs font-semibold text-sand-100 backdrop-blur-sm">
          {costLabel(city.costIndex)}
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Quick action pill
// ---------------------------------------------------------------------------

interface QuickAction {
  label: string;
  icon: React.ElementType;
  href: string;
  color: string;
  bg: string;
}

const quickActions: QuickAction[] = [
  {
    label: "Plan New Trip",
    icon: PlusCircle,
    href: "/trips/new",
    color: "text-ember-500",
    bg: "bg-ember-50 hover:bg-ember-100",
  },
  {
    label: "Browse Cities",
    icon: Compass,
    href: "/explore",
    color: "text-forest-500",
    bg: "bg-forest-50 hover:bg-forest-100",
  },
  {
    label: "View Packing List",
    icon: Backpack,
    href: "/trips",
    color: "text-sand-500",
    bg: "bg-sand-50 hover:bg-sand-100",
  },
];

// ---------------------------------------------------------------------------
// Dashboard page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(" ")[0] ?? "Traveler";

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
          {upcomingTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </section>

      {/* Trending destinations */}
      <section>
        <h2 className="font-display text-xl font-semibold text-charcoal-800">
          Trending Destinations
        </h2>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
          {trendingCities.map((city) => (
            <div key={city.name} className="snap-start">
              <CityCard city={city} />
            </div>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="font-display text-xl font-semibold text-charcoal-800">
          Quick Actions
        </h2>
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
                  action.color,
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
