'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarBlank,
  MapPin,
  CurrencyInr,
  MagnifyingGlass,
  X,
  Lock,
  Globe,
  ArrowLeft,
  ArrowRight,
  Check,
  Image as ImageIcon,
} from '@phosphor-icons/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { formatDateRange, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CityResult {
  id: string;
  name: string;
  country: string;
}

interface AddedCity {
  id: string;
  name: string;
  country: string;
  state?: string;
  arrivalDate: string;
  departureDate: string;
}

type TripVisibility = 'public' | 'private';

// ---------------------------------------------------------------------------
// Mock city search data — now fetched from backend in StepAddCities
// ---------------------------------------------------------------------------

// Cities are fetched from /api/cities endpoint in StepAddCities component

// ---------------------------------------------------------------------------
// Zod schemas per step
// ---------------------------------------------------------------------------

const step1Schema = z.object({
  name: z.string().min(1, 'Trip name is required').max(80, 'Trip name is too long'),
  description: z.string().max(500, 'Description too long').optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  coverUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']),
});

type Step1Data = z.infer<typeof step1Schema>;

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

const steps = [
  { key: 'basic', label: 'Basic Info' },
  { key: 'cities', label: 'Add Cities' },
  { key: 'review', label: 'Review' },
] as const;

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      {/* Progress bar */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-sand-100">
        <motion.div
          className="h-full rounded-full bg-ember-500"
          initial={false}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      </div>

      {/* Step labels */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          return (
            <div key={step.key} className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300',
                  isCompleted && 'bg-ember-500 text-white',
                  isActive && 'bg-ember-500 text-white ring-4 ring-ember-100',
                  !isCompleted && !isActive && 'bg-sand-100 text-charcoal-400'
                )}
              >
                {isCompleted ? <Check size={16} weight="bold" /> : index + 1}
              </div>
              <span
                className={cn(
                  'hidden text-xs sm:block',
                  isActive ? 'font-semibold text-charcoal-800' : 'text-charcoal-400'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1 - Basic Info
// ---------------------------------------------------------------------------

function StepBasicInfo({ form }: { form: ReturnType<typeof useForm<Step1Data>> }) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form;

  const coverUrl = watch('coverUrl');
  const [imageOk, setImageOk] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Validate image URL by attempting to load
  React.useEffect(() => {
    if (!coverUrl) {
      setImageOk(false);
      setImageLoading(false);
      return;
    }
    setImageLoading(true);
    const img = new window.Image();
    img.onload = () => {
      setImageOk(true);
      setImageLoading(false);
    };
    img.onerror = () => {
      setImageOk(false);
      setImageLoading(false);
    };
    img.src = coverUrl;
  }, [coverUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Trip name */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-charcoal-700">
          Trip Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Rajasthan Road Trip..."
          {...register('name')}
          className={cn(
            'underline-input w-full text-2xl font-display',
            errors.name && 'border-red-400 focus:border-red-500'
          )}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-charcoal-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="What's this trip about?"
          {...register('description')}
          className={cn(
            'w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-charcoal-800 placeholder:text-charcoal-300 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-100',
            errors.description && 'border-red-400 focus:border-red-500'
          )}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Date range */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="startDate" className="flex items-center gap-2 text-sm font-medium text-charcoal-700">
            <CalendarBlank size={16} className="text-charcoal-400" />
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            {...register('startDate')}
            className={cn(
              'w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-charcoal-800 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-100',
              errors.startDate && 'border-red-400 focus:border-red-500'
            )}
          />
          {errors.startDate && (
            <p className="text-sm text-red-500">{errors.startDate.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="endDate" className="flex items-center gap-2 text-sm font-medium text-charcoal-700">
            <CalendarBlank size={16} className="text-charcoal-400" />
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            {...register('endDate')}
            className={cn(
              'w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-charcoal-800 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-100',
              errors.endDate && 'border-red-400 focus:border-red-500'
            )}
          />
          {errors.endDate && (
            <p className="text-sm text-red-500">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      {/* Cover photo URL + preview */}
      <div className="space-y-2">
        <label htmlFor="coverUrl" className="flex items-center gap-2 text-sm font-medium text-charcoal-700">
          <ImageIcon size={16} className="text-charcoal-400" />
          Cover Photo URL
        </label>
        <input
          id="coverUrl"
          type="url"
          placeholder="https://images.unsplash.com/photo-..."
          {...register('coverUrl')}
          className={cn(
            'w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-charcoal-800 placeholder:text-charcoal-300 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-100',
            errors.coverUrl && 'border-red-400 focus:border-red-500'
          )}
        />
        {errors.coverUrl && (
          <p className="text-sm text-red-500">{errors.coverUrl.message}</p>
        )}
        {/* Loading skeleton */}
        {imageLoading && (
          <div className="relative mt-3 h-[180px] overflow-hidden rounded-xl bg-sand-100 animate-pulse" />
        )}
        {/* Error state */}
        {coverUrl && !imageLoading && !imageOk && (
          <div className="relative mt-3 h-[180px] overflow-hidden rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
            <p className="text-sm text-red-600">Failed to load image. Please check the URL.</p>
          </div>
        )}
        {/* Live preview */}
        {coverUrl && imageOk && !imageLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="relative mt-3 h-[180px] overflow-hidden rounded-xl"
          >
            <Image
              src={coverUrl}
              alt="Cover preview"
              fill
              className="object-cover"
              sizes="600px"
              priority
            />
          </motion.div>
        )}
      </div>

      {/* Currency selector */}
      <div className="space-y-2">
        <label htmlFor="currency" className="flex items-center gap-2 text-sm font-medium text-charcoal-700">
          <CurrencyInr size={16} className="text-charcoal-400" />
          Currency
        </label>
        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <select
              id="currency"
              value={field.value}
              onChange={field.onChange}
              className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-charcoal-800 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-100"
            >
              <option value="INR">INR - Indian Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          )}
        />
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 - Add Cities
// ---------------------------------------------------------------------------

function StepAddCities({
  cities,
  onAddCity,
  onRemoveCity,
  onUpdateCity,
}: {
  cities: AddedCity[];
  onAddCity: (city: CityResult) => void;
  onRemoveCity: (cityId: string) => void;
  onUpdateCity: (cityId: string, field: 'arrivalDate' | 'departureDate', value: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [allCities, setAllCities] = useState<CityResult[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  // Server-side search with debounce
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setCitiesLoading(true);
        setCitiesError(null);
        
        // Search cities with limit and optional query
        const { data } = await api.get(`/api/cities`, {
          params: {
            search: search.trim() || undefined,
            limit: 20
          }
        });

        if (!cancelled && data?.cities) {
          setAllCities(
            data.cities.map((c: any) => ({
              id: String(c.id),
              name: c.name,
              country: c.country,
              state: c.state,
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch cities:', err);
          setCitiesError('Failed to load cities');
          setAllCities([]);
        }
      } finally {
        if (!cancelled) {
          setCitiesLoading(false);
        }
      }
    }, 400); // 400ms debounce

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  const filteredCities = allCities;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Search bar */}
      <div className="relative">
        <MagnifyingGlass
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400"
        />
        <input
          type="text"
          placeholder="Search cities..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onBlur={() => {
            // Delay to allow click on results
            setTimeout(() => setShowResults(false), 200);
          }}
          disabled={citiesLoading}
          className="w-full rounded-xl border border-sand-200 bg-white py-3 pl-11 pr-4 text-sm text-charcoal-800 placeholder:text-charcoal-300 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-100 disabled:opacity-50"
        />
      </div>

      {/* Loading state */}
      {citiesLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-sand-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error state */}
      {citiesError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
        >
          {citiesError}
        </motion.div>
      )}

      {/* All cities */}
      {!citiesLoading && !citiesError && (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-charcoal-700">
            All Cities ({filteredCities.length})
          </h3>
          <p className="text-xs text-charcoal-400">
            Click a city to add it to your trip
          </p>
        </div>

        {showResults && search.trim().length > 0 && filteredCities.length === 0 ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm text-charcoal-600">
              No cities found matching "{search}"
            </div>
            <button
              type="button"
              onClick={() => {
                const customCity: CityResult = {
                  id: `custom_${Date.now()}`,
                  name: search.trim(),
                  country: '',
                };
                onAddCity(customCity);
                setSearch('');
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ember-300 bg-ember-50 px-4 py-3 text-sm font-medium text-ember-600 transition-colors hover:border-ember-400 hover:bg-ember-100"
            >
              <span>✨ Add "{search.trim()}" as a custom city</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filteredCities.map((city) => {
                const alreadyAdded = cities.some((c) => c.id === city.id);
                return (
                  <motion.button
                    key={city.id}
                    layout
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => {
                      onAddCity(city);
                      setSearch('');
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                      alreadyAdded
                        ? 'cursor-not-allowed border-sand-200 bg-sand-50 opacity-50'
                        : 'border-sand-200 bg-white hover:border-ember-300 hover:bg-sand-50'
                    )}
                  >
                    <MapPin size={16} className="shrink-0 text-ember-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-charcoal-800">{city.name}</p>
                      <p className="text-xs text-charcoal-400">
                        {city.state ? `${city.state}, ` : ""}{city.country}
                      </p>
                    </div>
                    {alreadyAdded && (
                      <span className="text-xs text-charcoal-400">Added</span>
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      )}

      {/* Added cities as chips + date pickers */}
      {cities.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-charcoal-700">
            Added Cities ({cities.length})
          </h3>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {cities.map((city) => (
                <motion.div
                  key={city.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-xl border border-sand-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-ember-500" />
                      <span className="text-sm font-semibold text-charcoal-800">
                        {city.name}
                      </span>
                      <span className="text-xs text-charcoal-400">
                        {city.state ? `${city.state}, ` : ""}{city.country}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveCity(city.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-charcoal-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label
                        className="text-xs font-medium text-charcoal-500"
                        htmlFor={`arrival-${city.id}`}
                      >
                        Arrival
                      </label>
                      <input
                        id={`arrival-${city.id}`}
                        type="date"
                        value={city.arrivalDate}
                        onChange={(e) =>
                          onUpdateCity(city.id, 'arrivalDate', e.target.value)
                        }
                        className="w-full rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-sm text-charcoal-800 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        className="text-xs font-medium text-charcoal-500"
                        htmlFor={`departure-${city.id}`}
                      >
                        Departure
                      </label>
                      <input
                        id={`departure-${city.id}`}
                        type="date"
                        value={city.departureDate}
                        onChange={(e) =>
                          onUpdateCity(city.id, 'departureDate', e.target.value)
                        }
                        className="w-full rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-sm text-charcoal-800 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-100"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 - Review
// ---------------------------------------------------------------------------

function StepReview({
  form,
  cities,
  budget,
  visibility,
  onBudgetChange,
  onVisibilityChange,
}: {
  form: ReturnType<typeof useForm<Step1Data>>;
  cities: AddedCity[];
  budget: string;
  visibility: TripVisibility;
  onBudgetChange: (value: string) => void;
  onVisibilityChange: (value: TripVisibility) => void;
}) {
  const watch = form.watch();

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Summary card */}
      <div className="warm-card overflow-hidden">
        {/* Cover preview */}
        {watch.coverUrl && (
          <div className="relative h-[140px] w-full overflow-hidden">
            <Image
              src={watch.coverUrl}
              alt="Cover preview"
              fill
              className="object-cover"
              sizes="600px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 to-transparent" />
            <h2 className="absolute bottom-4 left-4 font-display text-2xl font-bold text-white">
              {watch.name || 'Untitled Trip'}
            </h2>
          </div>
        )}

        <div className="space-y-4 p-5">
          {/* Trip name (if no cover) */}
          {!watch.coverUrl && (
            <h2 className="font-display text-2xl font-bold text-charcoal-800">
              {watch.name || 'Untitled Trip'}
            </h2>
          )}

          {/* Description */}
          {watch.description && (
            <p className="text-sm text-charcoal-600">{watch.description}</p>
          )}

          {/* Date range */}
          {watch.startDate && watch.endDate && (
            <div className="flex items-center gap-2 text-sm text-charcoal-600">
              <CalendarBlank size={16} className="text-charcoal-400" />
              <span>{formatDateRange(watch.startDate, watch.endDate)}</span>
            </div>
          )}

          {/* Cities */}
          <div className="flex items-center gap-2 text-sm text-charcoal-600">
            <MapPin size={16} className="text-charcoal-400" />
            <span>
              {cities.length} {cities.length === 1 ? 'city' : 'cities'}
            </span>
          </div>

          {/* City chips */}
          {cities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <span
                  key={city.id}
                  className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-charcoal-700"
                >
                  <MapPin size={12} className="text-ember-500" />
                  {city.name}{city.state ? `, ${city.state}` : ""}
                </span>
              ))}
            </div>
          )}

          {/* Currency */}
          <div className="flex items-center gap-2 text-sm text-charcoal-600">
            <CurrencyInr size={16} className="text-charcoal-400" />
            <span>{watch.currency}</span>
          </div>
        </div>
      </div>

      {/* Total budget input */}
      <div className="space-y-2">
        <label htmlFor="budget" className="flex items-center gap-2 text-sm font-medium text-charcoal-700">
          <CurrencyInr size={16} className="text-charcoal-400" />
          Total Budget
        </label>
        <input
          id="budget"
          type="number"
          min="0"
          placeholder="Enter your total budget"
          value={budget}
          onChange={(e) => onBudgetChange(e.target.value)}
          className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-charcoal-800 placeholder:text-charcoal-300 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-100"
        />
        {budget && watch.currency && (
          <p className="text-sm text-charcoal-500">
            {formatCurrency(Number(budget), watch.currency)}
          </p>
        )}
      </div>

      {/* Visibility toggle */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-charcoal-700">Visibility</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onVisibilityChange('public')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-all duration-200',
              visibility === 'public'
                ? 'border-forest-500 bg-forest-50 text-forest-700'
                : 'border-sand-200 bg-white text-charcoal-400 hover:border-sand-300'
            )}
          >
            <Globe size={18} />
            Public
          </button>
          <button
            type="button"
            onClick={() => onVisibilityChange('private')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-all duration-200',
              visibility === 'private'
                ? 'border-ember-500 bg-ember-50 text-ember-700'
                : 'border-sand-200 bg-white text-charcoal-400 hover:border-sand-300'
            )}
          >
            <Lock size={18} />
            Private
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// CreateTripPage
// ---------------------------------------------------------------------------

export default function CreateTripPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [cities, setCities] = useState<AddedCity[]>([]);
  const [budget, setBudget] = useState('');
  const [visibility, setVisibility] = useState<TripVisibility>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      coverUrl: '',
      currency: 'INR',
    },
    mode: 'onChange',
  });

  // Simulate page load completion
  React.useEffect(() => {
    setIsLoading(false);
  }, []);

  // Step validation
  const isStep1Valid = form.formState.isValid;

  // City handlers
  function handleAddCity(city: CityResult) {
    if (cities.some((c) => c.id === city.id)) return;
    setCities((prev) => [
      ...prev,
      {
        id: city.id,
        name: city.name,
        country: city.country,
        state: city.state,
        arrivalDate: '',
        departureDate: '',
      },
    ]);
  }

  function handleRemoveCity(cityId: string) {
    setCities((prev) => prev.filter((c) => c.id !== cityId));
  }

  function handleUpdateCity(
    cityId: string,
    field: 'arrivalDate' | 'departureDate',
    value: string
  ) {
    setCities((prev) =>
      prev.map((c) => (c.id === cityId ? { ...c, [field]: value } : c))
    );
  }

  // Navigation
  function handleNext() {
    if (step === 0) {
      form.handleSubmit(() => {
        setStep(1);
      })();
    } else if (step === 1) {
      setStep(2);
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  // Submit
  async function handleSubmit() {
    setIsSubmitting(true);
    const data = form.getValues();

    try {
      // Create trip with snake_case fields
      const tripRes = await api.post('/api/trips', {
        name: data.name,
        description: data.description || null,
        cover_photo_url: data.coverUrl || null,
        start_date: data.startDate,
        end_date: data.endDate,
        currency: data.currency,
        total_budget: budget ? Number(budget) : null,
        is_public: visibility === 'public',
      });

      const tripId = tripRes.data.trip.id;

      // Add cities as stops
      for (const city of cities) {
        const cityId = city.id.startsWith('custom_') ? null : parseInt(city.id);
        
        // Only add stop if it's a real city (not custom)
        if (cityId) {
          const stopPayload: any = {
            city_id: cityId,
          };
          
          // Only include dates if they're provided
          if (city.arrivalDate) {
            stopPayload.arrival_date = city.arrivalDate;
          }
          if (city.departureDate) {
            stopPayload.departure_date = city.departureDate;
          }
          
          try {
            await api.post(`/api/trips/${tripId}/stops`, stopPayload);
          } catch (stopErr) {
            console.error(`Failed to add stop for city ${city.name}:`, stopErr);
            // Continue with other cities even if one fails
          }
        }
      }

      toast.success('Trip created successfully!');
      router.push(`/trips/${tripId}/view`);
    } catch (err) {
      console.error('Trip creation error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Keyboard navigation - Ctrl+Enter to submit, Esc to go back
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        if (step < 2) {
          handleNext();
        } else {
          handleSubmit();
        }
      } else if (e.key === 'Escape' && step > 0) {
        handleBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, isStep1Valid, isSubmitting]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {isLoading && (
        <div className="space-y-4">
          <div className="h-8 bg-sand-100 rounded animate-pulse w-1/3" />
          <div className="h-4 bg-sand-100 rounded animate-pulse w-1/4" />
          <div className="mt-8 space-y-4">
            <div className="h-12 bg-sand-100 rounded-xl animate-pulse" />
            <div className="h-24 bg-sand-100 rounded-xl animate-pulse" />
            <div className="h-12 bg-sand-100 rounded-xl animate-pulse" />
          </div>
        </div>
      )}
      
      {!isLoading && (
        <>
          {/* Page header */}
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold text-charcoal-800">
              Create a New Trip
            </h1>
            <p className="mt-1 text-sm text-charcoal-500">
              Fill in the details to plan your next adventure
            </p>
          </div>

          {/* Step indicator */}
          <StepIndicator currentStep={step} />

          {/* Step content */}
          <AnimatePresence mode="wait">
            {step === 0 && <StepBasicInfo key="step1" form={form} />}
            {step === 1 && (
              <StepAddCities
                key="step2"
                cities={cities}
                onAddCity={handleAddCity}
                onRemoveCity={handleRemoveCity}
                onUpdateCity={handleUpdateCity}
              />
            )}
            {step === 2 && (
              <StepReview
                key="step3"
                form={form}
                cities={cities}
                budget={budget}
                visibility={visibility}
                onBudgetChange={setBudget}
                onVisibilityChange={setVisibility}
              />
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-sand-100 pt-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 0}
              className={cn(
                'pill-button inline-flex items-center gap-2 border border-sand-200 bg-white text-charcoal-600 transition-colors hover:bg-sand-50',
                step === 0 && 'cursor-not-allowed opacity-40'
              )}
            >
              <ArrowLeft size={18} />
              Back
            </button>

            {step < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={step === 0 && !isStep1Valid}
                className={cn(
                  'pill-button inline-flex items-center gap-2 bg-ember-500 text-white transition-colors hover:bg-ember-600',
                  step === 0 && !isStep1Valid && 'cursor-not-allowed opacity-50'
                )}
              >
                Next
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={cn(
                  'pill-button inline-flex items-center gap-2 bg-forest-500 text-white transition-colors hover:bg-forest-600',
                  isSubmitting && 'cursor-not-allowed opacity-70'
                )}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <Check size={18} weight="bold" />
                    Create Trip
                  </>
                )}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
