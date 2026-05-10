'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlass,
  BookmarkSimple,
  Star,
  Plus,
  Funnel,
  SortAscending,
  X,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { costIndexLabel } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Region = 'All' | 'Asia' | 'Europe' | 'Americas' | 'Africa' | 'Oceania';

type SortOption = 'popularity' | 'cost-low' | 'cost-high';

interface City {
  id: string;
  name: string;
  country: string;
  flag: string;
  region: Region;
  imageUrl: string;
  costIndex: number;
  popularity: number; // 1-5
}

interface Trip {
  id: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockCities: City[] = [
  {
    id: '1',
    name: 'Jaipur',
    country: 'India',
    flag: '\u{1F1EE}\u{1F1F3}',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1524492412937-b2890037b725?w=400',
    costIndex: 1,
    popularity: 4,
  },
  {
    id: '2',
    name: 'Bali',
    country: 'Indonesia',
    flag: '\u{1F1EE}\u{1F1E9}',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae598?w=400',
    costIndex: 2,
    popularity: 5,
  },
  {
    id: '3',
    name: 'Tokyo',
    country: 'Japan',
    flag: '\u{1F1EF}\u{1F1F5}',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1530789253388-582c4ef3842b?w=400',
    costIndex: 3,
    popularity: 5,
  },
  {
    id: '4',
    name: 'Goa',
    country: 'India',
    flag: '\u{1F1EE}\u{1F1F3}',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961883?w=400',
    costIndex: 1,
    popularity: 3,
  },
  {
    id: '5',
    name: 'Paris',
    country: 'France',
    flag: '\u{1F1EB}\u{1F1F7}',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1520250493593-399114814022?w=400',
    costIndex: 3,
    popularity: 5,
  },
  {
    id: '6',
    name: 'Dubai',
    country: 'UAE',
    flag: '\u{1F1E6}\u{1F1EA}',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-589ab5bec6d5?w=400',
    costIndex: 3,
    popularity: 4,
  },
  {
    id: '7',
    name: 'Rome',
    country: 'Italy',
    flag: '\u{1F1EE}\u{1F1F9}',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1493976080388-7188966d5ee6?w=400',
    costIndex: 3,
    popularity: 4,
  },
  {
    id: '8',
    name: 'Barcelona',
    country: 'Spain',
    flag: '\u{1F1EA}\u{1F1F8}',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce13c26?w=400',
    costIndex: 2,
    popularity: 4,
  },
  {
    id: '9',
    name: 'London',
    country: 'United Kingdom',
    flag: '\u{1F1EC}\u{1F1E7}',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400',
    costIndex: 3,
    popularity: 5,
  },
  {
    id: '10',
    name: 'New York',
    country: 'USA',
    flag: '\u{1F1FA}\u{1F1F8}',
    region: 'Americas',
    imageUrl: 'https://images.unsplash.com/photo-1518509657277-7e4ee9283d0f?w=400',
    costIndex: 3,
    popularity: 5,
  },
  {
    id: '11',
    name: 'Sydney',
    country: 'Australia',
    flag: '\u{1F1E6}\u{1F1FA}',
    region: 'Oceania',
    imageUrl: 'https://images.unsplash.com/photo-1512100356356-de1b8a4dd59b?w=400',
    costIndex: 3,
    popularity: 4,
  },
  {
    id: '12',
    name: 'Cape Town',
    country: 'South Africa',
    flag: '\u{1F1FF}\u{1F1E6}',
    region: 'Africa',
    imageUrl: 'https://images.unsplash.com/photo-1555990538-1e15f0f916a8?w=400',
    costIndex: 2,
    popularity: 3,
  },
];

const mockTrips: Trip[] = [
  { id: '1', name: 'Rajasthan Road Trip' },
  { id: '2', name: 'Bali Wellness Retreat' },
  { id: '3', name: 'Goa Beach Escape' },
  { id: '4', name: 'European Summer' },
  { id: '5', name: 'Tokyo Explorer' },
];

// ---------------------------------------------------------------------------
// Region filter chips
// ---------------------------------------------------------------------------

const regions: Region[] = ['All', 'Asia', 'Europe', 'Americas', 'Africa', 'Oceania'];

// ---------------------------------------------------------------------------
// Sort options
// ---------------------------------------------------------------------------

const sortOptions: { key: SortOption; label: string }[] = [
  { key: 'popularity', label: 'Popularity' },
  { key: 'cost-low', label: 'Cost (Low-High)' },
  { key: 'cost-high', label: 'Cost (High-Low)' },
];

// ---------------------------------------------------------------------------
// AddToTripModal
// ---------------------------------------------------------------------------

interface AddToTripModalProps {
  open: boolean;
  cityName: string;
  onClose: () => void;
  onConfirm: (tripId: string) => void;
}

function AddToTripModal({ open, cityName, onClose, onConfirm }: AddToTripModalProps) {
  const [selectedTrip, setSelectedTrip] = useState<string>('');

  const handleConfirm = useCallback(() => {
    if (selectedTrip) {
      onConfirm(selectedTrip);
      setSelectedTrip('');
      onClose();
    }
  }, [selectedTrip, onConfirm, onClose]);

  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) {
        setSelectedTrip('');
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Trip</DialogTitle>
          <DialogDescription>
            Choose a trip to add <strong>{cityName}</strong> as a stop.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedTrip} onValueChange={setSelectedTrip}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a trip" />
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
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTrip}
            className="bg-ember-500 hover:bg-ember-600 text-white"
          >
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
  onToggleSave: (id: string) => void;
  onAddToTrip: (city: City) => void;
}

function CityCard({ city, isSaved, onToggleSave, onAddToTrip }: CityCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35 }}
      className="group relative h-[280px] overflow-hidden rounded-xl"
    >
      {/* Background image */}
      <Image
        src={city.imageUrl}
        alt={city.name}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, 25vw"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/40 to-transparent" />

      {/* Bookmark button - top left */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave(city.id);
        }}
        className={cn(
          'absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-colors',
          isSaved
            ? 'bg-ember-500 text-white'
            : 'bg-charcoal-900/40 text-white hover:bg-charcoal-900/60'
        )}
        aria-label={isSaved ? 'Unsave city' : 'Save city'}
      >
        <BookmarkSimple size={20} weight={isSaved ? 'fill' : 'regular'} />
      </button>

      {/* Cost index badge - top right */}
      <div className="absolute right-3 top-3 z-10 rounded-full bg-charcoal-900/60 px-2.5 py-1 text-xs font-semibold text-sand-100 backdrop-blur-sm">
        {costIndexLabel(city.costIndex)}
      </div>

      {/* City info overlay - bottom */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="font-display text-xl font-semibold text-white drop-shadow-md">
          {city.name}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-sand-200">
          <span>{city.flag}</span>
          <span>{city.country}</span>
        </div>

        {/* Popularity stars */}
        <div className="mt-2 flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              size={14}
              weight={i < city.popularity ? 'fill' : 'regular'}
              className={i < city.popularity ? 'text-ember-400' : 'text-charcoal-500'}
            />
          ))}
        </div>

        {/* Add to Trip button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToTrip(city);
          }}
          className={cn(
            'mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-ember-500/90 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-ember-500'
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
// ExplorePage
// ---------------------------------------------------------------------------

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [activeRegion, setActiveRegion] = useState<Region>('All');
  const [sort, setSort] = useState<SortOption>('popularity');
  const [savedCities, setSavedCities] = useState<Set<string>>(new Set());
  const [addToTripCity, setAddToTripCity] = useState<City | null>(null);

  // Filter cities by search and region
  const filteredCities = useMemo(() => {
    let cities = mockCities.filter((city) => {
      const matchesSearch =
        city.name.toLowerCase().includes(search.toLowerCase()) ||
        city.country.toLowerCase().includes(search.toLowerCase());
      const matchesRegion = activeRegion === 'All' || city.region === activeRegion;
      return matchesSearch && matchesRegion;
    });

    // Sort
    switch (sort) {
      case 'popularity':
        cities = [...cities].sort((a, b) => b.popularity - a.popularity);
        break;
      case 'cost-low':
        cities = [...cities].sort((a, b) => a.costIndex - b.costIndex);
        break;
      case 'cost-high':
        cities = [...cities].sort((a, b) => b.costIndex - a.costIndex);
        break;
    }

    return cities;
  }, [search, activeRegion, sort]);

  const handleToggleSave = useCallback((id: string) => {
    setSavedCities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleAddToTripConfirm = useCallback((tripId: string) => {
    // In a real app, this would add the city to the selected trip
    console.log(`Added city to trip ${tripId}`);
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero search section */}
      <section className="rounded-2xl bg-gradient-to-r from-sand-50 to-cream px-6 py-10 md:px-8 md:py-14">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal-800 text-center">
          Explore Cities
        </h1>
        <p className="mt-2 text-charcoal-500 text-center">
          Discover your next destination and start planning your adventure
        </p>

        {/* Search bar */}
        <div className="mx-auto mt-8 max-w-2xl">
          <div className="relative">
            <MagnifyingGlass
              size={24}
              weight="regular"
              className="absolute left-5 top-1/2 -translate-y-1/2 text-charcoal-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cities or countries..."
              className={cn(
                'h-14 w-full rounded-2xl border-2 border-sand-200 bg-white pl-14 pr-12 text-xl text-charcoal-800',
                'placeholder:text-charcoal-300 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20',
                'shadow-warm transition-all duration-200'
              )}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-charcoal-400 hover:bg-sand-100 hover:text-charcoal-600"
                aria-label="Clear search"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filters row: Region chips + Sort */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Region filter chips */}
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              className={cn(
                'pill-button text-sm transition-all duration-200',
                activeRegion === region
                  ? 'bg-ember-500 text-white shadow-sm'
                  : 'bg-sand-100 text-charcoal-600 hover:bg-sand-200'
              )}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Sort pills */}
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={cn(
                'pill-button inline-flex items-center gap-1.5 text-sm transition-all duration-200',
                sort === opt.key
                  ? 'bg-charcoal-800 text-white shadow-sm'
                  : 'bg-sand-100 text-charcoal-600 hover:bg-sand-200'
              )}
            >
              {opt.key === 'popularity' && <Star size={14} weight="fill" />}
              {opt.key.startsWith('cost') && <SortAscending size={14} />}
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* City cards grid */}
      {filteredCities.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sand-100">
            <MagnifyingGlass size={40} weight="duotone" className="text-sand-400" />
          </div>
          <h3 className="mt-6 font-display text-xl font-semibold text-charcoal-700">
            No cities found
          </h3>
          <p className="mt-2 max-w-sm text-sm text-charcoal-400">
            Try adjusting your search or filters to find what you&apos;re looking for.
          </p>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filteredCities.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                isSaved={savedCities.has(city.id)}
                onToggleSave={handleToggleSave}
                onAddToTrip={setAddToTripCity}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add to Trip modal */}
      <AddToTripModal
        open={addToTripCity !== null}
        cityName={addToTripCity?.name ?? ''}
        onClose={() => setAddToTripCity(null)}
        onConfirm={handleAddToTripConfirm}
      />
    </div>
  );
}
