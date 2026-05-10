'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Backpack,
  Check,
  Package,
  PlusCircle,
  MagnifyingGlass,
  CoatHanger,
  FileText,
  DeviceMobile,
  Drop,
  Pill,
  DotsThree,
  SpinnerGap,
  ArrowRight,
  CalendarBlank,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { formatDateRange } from '@/lib/utils';
import api from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PackingCategory = 'clothing' | 'documents' | 'electronics' | 'toiletries' | 'medicines' | 'other';

interface ChecklistItem {
  id: string;
  item_name: string;
  category: PackingCategory | null;
  is_packed: boolean;
}

interface TripWithChecklist {
  id: string;
  name: string;
  cover_photo_url: string | null;
  start_date: string;
  end_date: string;
  items: ChecklistItem[];
  stats: { total: number; packed: number; percentage: number };
  loadingItems: boolean;
}

// ---------------------------------------------------------------------------
// Category config
// ---------------------------------------------------------------------------

const CATEGORY_ICONS: Record<PackingCategory, React.ElementType> = {
  clothing:    CoatHanger,
  documents:   FileText,
  electronics: DeviceMobile,
  toiletries:  Drop,
  medicines:   Pill,
  other:       DotsThree,
};

const CATEGORY_COLORS: Record<PackingCategory, string> = {
  clothing:    'bg-ember-100 text-ember-700',
  documents:   'bg-sand-200 text-sand-700',
  electronics: 'bg-forest-100 text-forest-700',
  toiletries:  'bg-charcoal-100 text-charcoal-700',
  medicines:   'bg-ember-50 text-ember-600',
  other:       'bg-sand-100 text-charcoal-600',
};

// ---------------------------------------------------------------------------
// TripPackingCard
// ---------------------------------------------------------------------------

function TripPackingCard({ trip }: { trip: TripWithChecklist }) {
  const [localItems, setLocalItems] = useState<ChecklistItem[]>(trip.items);
  const [localStats, setLocalStats] = useState(trip.stats);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<PackingCategory>('clothing');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLocalItems(trip.items);
    setLocalStats(trip.stats);
  }, [trip.items, trip.stats]);

  const handleToggle = useCallback(async (item: ChecklistItem) => {
    const newVal = !item.is_packed;
    setLocalItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_packed: newVal } : i));
    setLocalStats((prev) => {
      const packed = newVal ? prev.packed + 1 : prev.packed - 1;
      return { ...prev, packed, percentage: prev.total ? Math.round((packed / prev.total) * 100) : 0 };
    });
    try {
      await api.patch(`/api/trips/${trip.id}/checklist/${item.id}`, { is_packed: newVal });
    } catch { /* silent */ }
  }, [trip.id]);

  const handleAdd = useCallback(async () => {
    const name = newItemName.trim();
    if (!name || adding) return;
    setAdding(true);
    try {
      const { data } = await api.post(`/api/trips/${trip.id}/checklist`, {
        item_name: name,
        category: newItemCategory,
      });
      setLocalItems((prev) => [...prev, data.item]);
      setLocalStats((prev) => ({ ...prev, total: prev.total + 1, percentage: prev.total + 1 ? Math.round((prev.packed / (prev.total + 1)) * 100) : 0 }));
      setNewItemName('');
    } catch { /* silent */ } finally {
      setAdding(false);
    }
  }, [trip.id, newItemName, newItemCategory, adding]);

  const unchecked = localItems.filter((i) => !i.is_packed);
  const checked   = localItems.filter((i) => i.is_packed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="warm-card overflow-hidden"
    >
      {/* Trip header */}
      <div className="relative h-28 w-full overflow-hidden bg-sand-100">
        {trip.cover_photo_url ? (
          <Image
            src={trip.cover_photo_url}
            alt={trip.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-ember-100 to-sand-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="font-display text-lg font-bold text-white leading-tight">{trip.name}</h2>
          <div className="flex items-center gap-1 text-white/70 text-xs mt-0.5">
            <CalendarBlank size={12} />
            <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
          </div>
        </div>
        <Link
          href={`/trips/${trip.id}/packing`}
          className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white hover:bg-white/30 transition-colors"
        >
          Open full list <ArrowRight size={12} />
        </Link>
      </div>

      {/* Progress bar */}
      {trip.loadingItems ? (
        <div className="px-4 py-3 flex items-center gap-3">
          <SpinnerGap size={18} className="animate-spin text-ember-400" />
          <span className="text-xs text-charcoal-400">Loading checklist…</span>
        </div>
      ) : (
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-charcoal-700">{localStats.packed} / {localStats.total} packed</span>
            <span className="text-xs font-bold text-forest-600">{localStats.percentage}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-sand-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-forest-500"
              initial={{ width: 0 }}
              animate={{ width: `${localStats.percentage}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Quick-add form */}
      {!trip.loadingItems && (
        <div className="px-4 py-3 flex gap-2 border-b border-sand-50">
          <input
            type="text"
            placeholder="Add item…"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            className="flex-1 min-w-0 rounded-lg border border-sand-200 bg-sand-50 px-3 py-1.5 text-xs text-charcoal-800 placeholder:text-charcoal-300 focus:border-ember-500 focus:outline-none focus:ring-1 focus:ring-ember-100"
          />
          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value as PackingCategory)}
            className="rounded-lg border border-sand-200 bg-sand-50 px-2 py-1.5 text-xs text-charcoal-700 focus:border-ember-500 focus:outline-none"
          >
            {Object.entries(CATEGORY_ICONS).map(([k]) => (
              <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!newItemName.trim() || adding}
            className={cn(
              'rounded-lg p-2 transition-colors',
              newItemName.trim() && !adding ? 'bg-ember-500 text-white hover:bg-ember-600' : 'bg-sand-100 text-charcoal-300 cursor-not-allowed'
            )}
          >
            {adding ? <SpinnerGap size={14} className="animate-spin" /> : <PlusCircle size={14} weight="fill" />}
          </button>
        </div>
      )}

      {/* Items list */}
      {!trip.loadingItems && localItems.length > 0 && (
        <div className="px-4 py-3 space-y-1.5 max-h-52 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {/* Unchecked first */}
            {unchecked.slice(0, 6).map((item) => {
              const cat = item.category as PackingCategory;
              const Icon = cat && CATEGORY_ICONS[cat] ? CATEGORY_ICONS[cat] : Package;
              const color = cat && CATEGORY_COLORS[cat] ? CATEGORY_COLORS[cat] : 'bg-sand-100 text-charcoal-600';
              return (
                <motion.div
                  key={item.id} layout
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -12 }}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-sand-50 transition-colors"
                >
                  <button
                    onClick={() => handleToggle(item)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-charcoal-300 bg-white hover:border-ember-400 transition-colors"
                  />
                  <span className="flex-1 text-xs text-charcoal-700 font-medium">{item.item_name}</span>
                  <span className={cn('inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold', color)}>
                    <Icon size={9} />{cat}
                  </span>
                </motion.div>
              );
            })}
            {/* Checked (dimmed) */}
            {checked.slice(0, 3).map((item) => (
              <motion.div
                key={item.id} layout
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-sand-50 transition-colors opacity-50"
              >
                <button
                  onClick={() => handleToggle(item)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-ember-500 bg-ember-500 transition-colors"
                >
                  <Check size={12} weight="bold" className="text-white" />
                </button>
                <span className="flex-1 text-xs text-charcoal-400 line-through">{item.item_name}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {localItems.length > 9 && (
            <Link
              href={`/trips/${trip.id}/packing`}
              className="block text-center text-xs text-ember-500 hover:text-ember-600 font-medium py-1"
            >
              +{localItems.length - 9} more items →
            </Link>
          )}
        </div>
      )}

      {!trip.loadingItems && localItems.length === 0 && (
        <div className="flex flex-col items-center py-8 text-center">
          <Package size={28} className="text-sand-300 mb-2" />
          <p className="text-xs text-charcoal-400">No items yet. Add one above.</p>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PackingListsPage() {
  const [trips, setTrips] = useState<TripWithChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const { data } = await api.get('/api/trips');
        const rawTrips = data.trips ?? [];

        if (cancelled) return;

        // Initialize trips with empty checklists, then load each
        const initial: TripWithChecklist[] = rawTrips.map((t: any) => ({
          id: String(t.id),
          name: t.name,
          cover_photo_url: t.cover_photo_url ?? null,
          start_date: t.start_date,
          end_date: t.end_date,
          items: [],
          stats: { total: 0, packed: 0, percentage: 0 },
          loadingItems: true,
        }));
        setTrips(initial);
        setLoading(false);

        // Load each trip's checklist in parallel
        await Promise.allSettled(
          initial.map(async (trip) => {
            try {
              const { data: cl } = await api.get(`/api/trips/${trip.id}/checklist`);
              if (cancelled) return;
              setTrips((prev) =>
                prev.map((t) =>
                  t.id === trip.id
                    ? { ...t, items: cl.items ?? [], stats: cl.stats ?? { total: 0, packed: 0, percentage: 0 }, loadingItems: false }
                    : t
                )
              );
            } catch {
              if (!cancelled) {
                setTrips((prev) =>
                  prev.map((t) => t.id === trip.id ? { ...t, loadingItems: false } : t)
                );
              }
            }
          })
        );
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredTrips = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return trips;
    return trips.filter((t) => t.name.toLowerCase().includes(q));
  }, [trips, search]);

  const totalPacked = useMemo(() => trips.reduce((s, t) => s + t.stats.packed, 0), [trips]);
  const totalItems  = useMemo(() => trips.reduce((s, t) => s + t.stats.total, 0), [trips]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-800">Packing Lists</h1>
          {!loading && trips.length > 0 && (
            <p className="mt-1 text-sm text-charcoal-500">
              {totalPacked} of {totalItems} items packed across {trips.length} {trips.length === 1 ? 'trip' : 'trips'}
            </p>
          )}
        </div>
        <Link
          href="/trips/new"
          className="inline-flex items-center gap-2 rounded-full bg-ember-500 px-4 py-2 text-sm font-medium text-white hover:bg-ember-600 transition-colors shadow-warm"
        >
          <PlusCircle size={18} weight="fill" />New Trip
        </Link>
      </motion.div>

      {/* Search */}
      {!loading && trips.length > 0 && (
        <div className="relative max-w-sm">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text" placeholder="Search trips…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-sand-200 bg-white py-2 pl-9 pr-4 text-sm text-charcoal-800 placeholder:text-charcoal-300 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-100"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="warm-card overflow-hidden animate-pulse">
              <div className="h-28 bg-sand-100" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-sand-100 rounded w-3/4" />
                <div className="h-2.5 bg-sand-100 rounded w-full" />
                <div className="h-2.5 bg-sand-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-sand-100 flex items-center justify-center mb-4">
            <Backpack size={32} className="text-sand-400" weight="duotone" />
          </div>
          <h2 className="font-display text-xl font-semibold text-charcoal-700 mb-2">No trips yet</h2>
          <p className="text-charcoal-400 text-sm max-w-xs mb-6">Create your first trip and start packing smarter.</p>
          <Link href="/trips/new" className="inline-flex items-center gap-2 rounded-full bg-ember-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-ember-600 transition-colors shadow-warm">
            <PlusCircle size={18} weight="fill" />Plan a Trip
          </Link>
        </motion.div>
      ) : filteredTrips.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <MagnifyingGlass size={28} className="text-sand-300 mb-2" />
          <p className="text-charcoal-400 text-sm">No trips match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredTrips.map((trip) => (
              <TripPackingCard key={trip.id} trip={trip} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
