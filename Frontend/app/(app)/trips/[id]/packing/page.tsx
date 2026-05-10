'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

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
  name: string;
  category: Exclude<PackingCategory, 'all'>;
  checked: boolean;
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
  clothing: {
    label: 'Clothing',
    icon: CoatHanger,
    color: 'bg-ember-100 text-ember-700',
  },
  documents: {
    label: 'Documents',
    icon: FileText,
    color: 'bg-sand-200 text-sand-700',
  },
  electronics: {
    label: 'Electronics',
    icon: DeviceMobile,
    color: 'bg-forest-100 text-forest-700',
  },
  toiletries: {
    label: 'Toiletries',
    icon: Drop,
    color: 'bg-charcoal-100 text-charcoal-700',
  },
  medicines: {
    label: 'Medicines',
    icon: Pill,
    color: 'bg-ember-50 text-ember-600',
  },
  other: {
    label: 'Other',
    icon: DotsThree,
    color: 'bg-sand-100 text-charcoal-600',
  },
};

const CATEGORY_TABS: { id: PackingCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'clothing', label: 'Clothing' },
  { id: 'documents', label: 'Documents' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'toiletries', label: 'Toiletries' },
  { id: 'medicines', label: 'Medicines' },
  { id: 'other', label: 'Other' },
];

// ---------------------------------------------------------------------------
// Mock data: 15 items across categories, some checked
// ---------------------------------------------------------------------------

const INITIAL_ITEMS: PackingItem[] = [
  { id: 'p1', name: 'T-shirts (4)', category: 'clothing', checked: true },
  { id: 'p2', name: 'Jeans (2)', category: 'clothing', checked: true },
  { id: 'p3', name: 'Light jacket', category: 'clothing', checked: false },
  { id: 'p4', name: 'Sunglasses', category: 'clothing', checked: false },
  { id: 'p5', name: 'Passport', category: 'documents', checked: true },
  { id: 'p6', name: 'Travel insurance', category: 'documents', checked: true },
  { id: 'p7', name: 'Hotel bookings printout', category: 'documents', checked: false },
  { id: 'p8', name: 'Phone charger', category: 'electronics', checked: true },
  { id: 'p9', name: 'Power bank', category: 'electronics', checked: false },
  { id: 'p10', name: 'Camera', category: 'electronics', checked: false },
  { id: 'p11', name: 'Sunscreen SPF 50', category: 'toiletries', checked: true },
  { id: 'p12', name: 'Toothbrush kit', category: 'toiletries', checked: false },
  { id: 'p13', name: 'Paracetamol', category: 'medicines', checked: true },
  { id: 'p14', name: 'Motion sickness tablets', category: 'medicines', checked: false },
  { id: 'p15', name: 'Travel pillow', category: 'other', checked: false },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let nextId = 100;
function generateId(): string {
  return `p${nextId++}`;
}

// ---------------------------------------------------------------------------
// CategoryBadge
// ---------------------------------------------------------------------------

interface CategoryBadgeProps {
  category: Exclude<PackingCategory, 'all'>;
}

function CategoryBadge({ category }: CategoryBadgeProps) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
        meta.color
      )}
    >
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
  onToggle: (id: string) => void;
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
        onClick={() => onToggle(item.id)}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-200',
          item.checked
            ? 'border-ember-500 bg-ember-500'
            : 'border-charcoal-300 bg-white hover:border-ember-400'
        )}
        aria-label={item.checked ? 'Uncheck item' : 'Check item'}
      >
        {item.checked && (
          <Check size={13} weight="bold" className="text-forest-500" />
        )}
      </button>

      {/* Item name */}
      <span
        className={cn(
          'flex-1 text-sm font-medium transition-all duration-200',
          item.checked
            ? 'text-charcoal-300 line-through'
            : 'text-charcoal-800'
        )}
      >
        {item.name}
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
  const [items, setItems] = useState<PackingItem[]>(INITIAL_ITEMS);
  const [activeCategory, setActiveCategory] = useState<PackingCategory>('all');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<
    Exclude<PackingCategory, 'all'>
  >('clothing');

  // ---- Computed values ----

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return items;
    return items.filter((item) => item.category === activeCategory);
  }, [items, activeCategory]);

  const checkedCount = useMemo(
    () => items.filter((i) => i.checked).length,
    [items]
  );
  const totalCount = items.length;
  const progressPercent =
    totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  // ---- Handlers ----

  const handleToggle = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleAdd = useCallback(() => {
    const name = newItemName.trim();
    if (!name) return;
    const newItem: PackingItem = {
      id: generateId(),
      name,
      category: newItemCategory,
      checked: false,
    };
    setItems((prev) => [...prev, newItem]);
    setNewItemName('');
  }, [newItemName, newItemCategory]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleAdd();
      }
    },
    [handleAdd]
  );

  const handleCheckAll = useCallback(() => {
    setItems((prev) => prev.map((item) => ({ ...item, checked: true })));
  }, []);

  const handleUncheckAll = useCallback(() => {
    setItems((prev) => prev.map((item) => ({ ...item, checked: false })));
  }, []);

  const handleResetAll = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* ----------------------------------------------------------------- */}
      {/* Page header                                                       */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl font-bold text-charcoal-800">
          Packing Checklist
        </h1>
        <p className="mt-1 text-sm text-charcoal-500">
          Rajasthan Road Trip &middot; Don&apos;t forget the essentials
        </p>
      </motion.div>

      {/* ----------------------------------------------------------------- */}
      {/* Two-column layout: category tabs left, checklist right             */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        {/* =============================================================== */}
        {/* Left column: Category filter tabs                                */}
        {/* =============================================================== */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="warm-card p-4 lg:p-5"
        >
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-charcoal-400">
            Categories
          </h2>
          <nav className="flex flex-row flex-wrap gap-2 lg:flex-col">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeCategory === tab.id;
              const count =
                tab.id === 'all'
                  ? items.length
                  : items.filter((i) => i.category === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 lg:w-full',
                    isActive
                      ? 'bg-ember-500 text-white shadow-sm'
                      : 'bg-sand-50 text-charcoal-600 hover:bg-sand-100'
                  )}
                >
                  {tab.id !== 'all' &&
                    (() => {
                      const Icon = CATEGORY_META[tab.id].icon;
                      return <Icon size={15} />;
                    })()}
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                      isActive
                        ? 'bg-ember-400 text-white'
                        : 'bg-sand-200 text-charcoal-500'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </motion.div>

        {/* =============================================================== */}
        {/* Right column: Checklist                                          */}
        {/* =============================================================== */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Add item form */}
          <div className="warm-card p-5">
            <h2 className="mb-3 font-display text-lg font-bold text-charcoal-800">
              Add Item
            </h2>
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
                onChange={(e) =>
                  setNewItemCategory(
                    e.target.value as Exclude<PackingCategory, 'all'>
                  )
                }
                className="rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-sm text-charcoal-700 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-100"
              >
                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAdd}
                disabled={!newItemName.trim()}
                className={cn(
                  'pill-button inline-flex items-center justify-center gap-2 transition-all duration-200',
                  newItemName.trim()
                    ? 'bg-ember-500 text-white hover:bg-ember-600'
                    : 'cursor-not-allowed bg-sand-100 text-charcoal-300'
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
              <span className="text-sm font-semibold text-charcoal-800">
                {checkedCount} of {totalCount} items packed
              </span>
              <span className="text-sm font-bold text-forest-600">
                {progressPercent}%
              </span>
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
            <button
              onClick={handleCheckAll}
              className="pill-button inline-flex items-center gap-2 border border-sand-200 bg-white text-charcoal-600 transition-all hover:bg-sand-50"
            >
              <Check size={16} weight="bold" />
              Check All
            </button>
            <button
              onClick={handleUncheckAll}
              className="pill-button inline-flex items-center gap-2 border border-sand-200 bg-white text-charcoal-600 transition-all hover:bg-sand-50"
            >
              Uncheck All
            </button>
            <button
              onClick={handleResetAll}
              className="pill-button inline-flex items-center gap-2 border border-red-200 bg-white text-red-600 transition-all hover:bg-red-50"
            >
              <Trash size={16} />
              Reset All
            </button>
          </div>

          {/* Checklist items */}
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <PackingItemRow
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-12 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sand-100">
                    <Package
                      size={32}
                      weight="duotone"
                      className="text-sand-400"
                    />
                  </div>
                  <p className="mt-4 text-sm text-charcoal-400">
                    {activeCategory === 'all'
                      ? 'No items yet. Add something above.'
                      : `No items in ${CATEGORY_META[activeCategory]?.label ?? 'this category'}.`}
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
