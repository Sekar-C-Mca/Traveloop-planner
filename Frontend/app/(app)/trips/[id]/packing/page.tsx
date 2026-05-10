'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  Trash,
  Check,
  Package,
  CoatHanger,
  FileText,
  DeviceMobile,
  Drop,
  Pill,
  DotsThree,
  SpinnerGap,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PackingCategory =
  | 'all'
  | 'clothing'
  | 'documents'
  | 'electronics'
  | 'toiletries'
  | 'medicines'
  | 'other';

interface PackingItem {
  id: string;
  item_name: string;           // backend field
  category: Exclude<PackingCategory, 'all'> | null;
  is_packed: boolean;          // backend field
}

// ---------------------------------------------------------------------------
// Category config
// ---------------------------------------------------------------------------

interface CategoryMeta {
  label: string;
  icon: React.ElementType;
  color: string;
}

const CATEGORY_META: Record<Exclude<PackingCategory, 'all'>, CategoryMeta> = {
  clothing:    { label: 'Clothing',     icon: CoatHanger,    color: 'bg-ember-100 text-ember-700'    },
  documents:   { label: 'Documents',    icon: FileText,      color: 'bg-sand-200 text-sand-700'      },
  electronics: { label: 'Electronics', icon: DeviceMobile,  color: 'bg-forest-100 text-forest-700'  },
  toiletries:  { label: 'Toiletries',  icon: Drop,          color: 'bg-charcoal-100 text-charcoal-700' },
  medicines:   { label: 'Medicines',   icon: Pill,          color: 'bg-ember-50 text-ember-600'     },
  other:       { label: 'Other',       icon: DotsThree,     color: 'bg-sand-100 text-charcoal-600'  },
};

const CATEGORY_TABS: { id: PackingCategory; label: string }[] = [
  { id: 'all',         label: 'All'         },
  { id: 'clothing',    label: 'Clothing'    },
  { id: 'documents',   label: 'Documents'   },
  { id: 'electronics', label: 'Electronics' },
  { id: 'toiletries',  label: 'Toiletries'  },
  { id: 'medicines',   label: 'Medicines'   },
  { id: 'other',       label: 'Other'       },
];

// ---------------------------------------------------------------------------
// CategoryBadge
// ---------------------------------------------------------------------------

function CategoryBadge({ category }: { category: Exclude<PackingCategory, 'all'> | null }) {
  if (!category || !CATEGORY_META[category]) return null;
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', meta.color)}>
      <Icon size={10} />
      {meta.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// PackingItemRow
// ---------------------------------------------------------------------------

interface PackingItemRowProps {
  item: PackingItem;
  onToggle: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}

function PackingItemRow({ item, onToggle, onDelete }: PackingItemRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
      className="group flex items-center gap-3 rounded-lg border border-sand-100 bg-white px-4 py-3 transition-colors hover:border-sand-200"
    >
      {/* Custom checkbox */}
      <button
        onClick={() => onToggle(item.id, item.is_packed)}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-200',
          item.is_packed
            ? 'border-ember-500 bg-ember-500'
            : 'border-charcoal-300 bg-white hover:border-ember-400'
        )}
        aria-label={item.is_packed ? 'Unpack item' : 'Pack item'}
      >
        {item.is_packed && <Check size={13} weight="bold" className="text-white" />}
      </button>

      {/* Item name */}
      <span className={cn(
        'flex-1 text-sm font-medium transition-all duration-200',
        item.is_packed ? 'text-charcoal-300 line-through' : 'text-charcoal-800'
      )}>
        {item.item_name}
      </span>

      {/* Category badge */}
      <CategoryBadge category={item.category} />

      {/* Delete button */}
      <button
        onClick={() => onDelete(item.id)}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-charcoal-300 transition-colors hover:bg-red-50 hover:text-red-500"
        aria-label="Delete item"
      >
        <Trash size={16} />
      </button>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// PackingPage
// ---------------------------------------------------------------------------

export default function PackingPage() {
  const params = useParams();
  const tripId = params.id as string;

  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, packed: 0, percentage: 0 });
  const [activeCategory, setActiveCategory] = useState<PackingCategory>('all');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<Exclude<PackingCategory, 'all'>>('clothing');

  // Load checklist
  useEffect(() => {
    if (!tripId) return;
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/trips/${tripId}/checklist`);
        if (!cancelled) {
          setItems(data.items ?? []);
          setStats(data.stats ?? { total: 0, packed: 0, percentage: 0 });
        }
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [tripId]);

  // Derived
  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return items;
    return items.filter((i) => i.category === activeCategory);
  }, [items, activeCategory]);

  const checkedCount = stats.packed;
  const totalCount = stats.total;
  const progressPercent = stats.percentage;

  // Toggle (PATCH)
  const handleToggle = useCallback(async (id: string, current: boolean) => {
    const newVal = !current;
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, is_packed: newVal } : i));
    setStats((prev) => {
      const packed = newVal ? prev.packed + 1 : prev.packed - 1;
      return { ...prev, packed, percentage: prev.total ? Math.round((packed / prev.total) * 100) : 0 };
    });
    try {
      await api.patch(`/api/trips/${tripId}/checklist/${id}`, { is_packed: newVal });
    } catch {
      // revert
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, is_packed: current } : i));
    }
  }, [tripId]);

  // Delete
  const handleDelete = useCallback(async (id: string) => {
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setStats((prev) => {
      const total = prev.total - 1;
      const packed = item?.is_packed ? prev.packed - 1 : prev.packed;
      return { total, packed, percentage: total ? Math.round((packed / total) * 100) : 0 };
    });
    try {
      await api.delete(`/api/trips/${tripId}/checklist/${id}`);
    } catch {
      if (item) setItems((prev) => [...prev, item]);
    }
  }, [tripId, items]);

  // Add
  const handleAdd = useCallback(async () => {
    const name = newItemName.trim();
    if (!name) return;
    try {
      const { data } = await api.post(`/api/trips/${tripId}/checklist`, {
        item_name: name,
        category: newItemCategory,
      });
      const newItem = data.item;
      setItems((prev) => [...prev, newItem]);
      setStats((prev) => ({ ...prev, total: prev.total + 1 }));
      setNewItemName('');
    } catch {
      console.error('Failed to add item');
    }
  }, [tripId, newItemName, newItemCategory]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd();
  }, [handleAdd]);

  // Check all / Uncheck all / Reset
  const handleCheckAll = useCallback(async () => {
    setItems((prev) => prev.map((i) => ({ ...i, is_packed: true })));
    setStats((prev) => ({ ...prev, packed: prev.total, percentage: 100 }));
    try {
      await Promise.all(
        items.filter((i) => !i.is_packed).map((i) =>
          api.patch(`/api/trips/${tripId}/checklist/${i.id}`, { is_packed: true })
        )
      );
    } catch { /* silent */ }
  }, [tripId, items]);

  const handleUncheckAll = useCallback(async () => {
    setItems((prev) => prev.map((i) => ({ ...i, is_packed: false })));
    setStats((prev) => ({ ...prev, packed: 0, percentage: 0 }));
    try {
      await Promise.all(
        items.filter((i) => i.is_packed).map((i) =>
          api.patch(`/api/trips/${tripId}/checklist/${i.id}`, { is_packed: false })
        )
      );
    } catch { /* silent */ }
  }, [tripId, items]);

  const handleResetAll = useCallback(async () => {
    try {
      await Promise.all(items.map((i) => api.delete(`/api/trips/${tripId}/checklist/${i.id}`)));
      setItems([]);
      setStats({ total: 0, packed: 0, percentage: 0 });
    } catch { /* silent */ }
  }, [tripId, items]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <SpinnerGap size={32} className="animate-spin text-ember-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold text-charcoal-800">Packing Checklist</h1>
        <p className="mt-1 text-sm text-charcoal-500">Don&apos;t forget the essentials</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        {/* Category filter */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="warm-card p-4 lg:p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-charcoal-400">Categories</h2>
          <nav className="flex flex-row flex-wrap gap-2 lg:flex-col">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeCategory === tab.id;
              const count = tab.id === 'all' ? items.length : items.filter((i) => i.category === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 lg:w-full',
                    isActive ? 'bg-ember-500 text-white shadow-sm' : 'bg-sand-50 text-charcoal-600 hover:bg-sand-100'
                  )}
                >
                  {tab.id !== 'all' && (() => { const Icon = CATEGORY_META[tab.id].icon; return <Icon size={15} />; })()}
                  <span>{tab.label}</span>
                  <span className={cn('ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold', isActive ? 'bg-ember-400 text-white' : 'bg-sand-200 text-charcoal-500')}>
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </motion.div>

        {/* Checklist */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
          {/* Add item */}
          <div className="warm-card p-5">
            <h2 className="mb-3 font-display text-lg font-bold text-charcoal-800">Add Item</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Item name..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-sm text-charcoal-800 placeholder:text-charcoal-300 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-100"
              />
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as Exclude<PackingCategory, 'all'>)}
                className="rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-sm text-charcoal-700 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-100"
              >
                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.label}</option>
                ))}
              </select>
              <button
                onClick={handleAdd}
                disabled={!newItemName.trim()}
                className={cn(
                  'pill-button inline-flex items-center justify-center gap-2 transition-all duration-200',
                  newItemName.trim() ? 'bg-ember-500 text-white hover:bg-ember-600' : 'cursor-not-allowed bg-sand-100 text-charcoal-300'
                )}
              >
                <PlusCircle size={18} weight="fill" />
                Add
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="warm-card p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-charcoal-800">{checkedCount} of {totalCount} items packed</span>
              <span className="text-sm font-bold text-forest-600">{progressPercent}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-sand-100">
              <motion.div
                className="h-full rounded-full bg-forest-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Bulk actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleCheckAll} className="pill-button inline-flex items-center gap-2 border border-sand-200 bg-white text-charcoal-600 transition-all hover:bg-sand-50">
              <Check size={16} weight="bold" />Check All
            </button>
            <button onClick={handleUncheckAll} className="pill-button inline-flex items-center gap-2 border border-sand-200 bg-white text-charcoal-600 transition-all hover:bg-sand-50">
              Uncheck All
            </button>
            <button onClick={handleResetAll} className="pill-button inline-flex items-center gap-2 border border-red-200 bg-white text-red-600 transition-all hover:bg-red-50">
              <Trash size={16} />Reset All
            </button>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <PackingItemRow key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sand-100">
                    <Package size={32} weight="duotone" className="text-sand-400" />
                  </div>
                  <p className="mt-4 text-sm text-charcoal-400">
                    {activeCategory === 'all' ? 'No items yet. Add something above.' : `No items in ${CATEGORY_META[activeCategory]?.label ?? 'this category'}.`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
