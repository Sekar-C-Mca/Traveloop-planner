'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Van,
  House,
  Ticket,
  ForkKnife,
  DotsThree,
  CurrencyInr,
  WarningCircle,
  TrendUp,
  PencilSimple,
  Check,
  SpinnerGap,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BudgetCategory = 'transport' | 'stay' | 'activities' | 'meals' | 'misc';

interface BudgetEntry {
  id: BudgetCategory;
  label: string;
  icon: React.ElementType;
  budgeted: number;
  estimated: number;
  color: string;
}

// ---------------------------------------------------------------------------
// Category config
// ---------------------------------------------------------------------------

const CATEGORY_CONFIG: Omit<BudgetEntry, 'budgeted' | 'estimated'>[] = [
  { id: 'transport',  label: 'Transport',      icon: Van,       color: '#E05520' },
  { id: 'stay',       label: 'Stay',           icon: House,     color: '#368236' },
  { id: 'activities', label: 'Activities',     icon: Ticket,    color: '#C9A05A' },
  { id: 'meals',      label: 'Meals',          icon: ForkKnife, color: '#8C847A' },
  { id: 'misc',       label: 'Miscellaneous',  icon: DotsThree, color: '#FFC09E' },
];

// Map backend fields → BudgetEntry ids
const BACKEND_KEY_MAP: Record<BudgetCategory, string> = {
  transport:  'transport_budget',
  stay:       'stay_budget',
  activities: 'activity_budget',
  meals:      'meal_budget',
  misc:       'misc_budget',
};

// ---------------------------------------------------------------------------
// EditableValue
// ---------------------------------------------------------------------------

interface EditableValueProps {
  value: number;
  onSave: (value: number) => void;
  currency?: string;
}

function EditableValue({ value, onSave, currency = 'INR' }: EditableValueProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const handleClick = useCallback(() => { setDraft(String(value)); setIsEditing(true); }, [value]);
  const handleBlur  = useCallback(() => {
    const parsed = parseInt(draft, 10);
    if (!isNaN(parsed) && parsed >= 0) onSave(parsed);
    setIsEditing(false);
  }, [draft, onSave]);
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleBlur();
    else if (e.key === 'Escape') setIsEditing(false);
  }, [handleBlur]);

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-charcoal-400"><CurrencyInr size={12} /></span>
        <input
          type="number" value={draft} autoFocus min={0}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur} onKeyDown={handleKeyDown}
          className="w-24 rounded-md border border-ember-300 bg-sand-50 px-2 py-1 text-sm font-semibold text-charcoal-800 focus:border-ember-500 focus:outline-none focus:ring-1 focus:ring-ember-100"
        />
      </div>
    );
  }
  return (
    <button onClick={handleClick} className="group inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold text-charcoal-800 transition-colors hover:bg-sand-50">
      <CurrencyInr size={14} className="text-charcoal-400" />
      <span>{formatCurrency(value, currency)}</span>
      <PencilSimple size={14} className="text-charcoal-300 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

// ---------------------------------------------------------------------------
// CustomTooltip
// ---------------------------------------------------------------------------

function CustomTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-sand-200 bg-white px-3 py-2 shadow-warm">
      <p className="text-xs font-semibold text-charcoal-800">{item.name}</p>
      <p className="text-sm font-bold text-charcoal-700">{formatCurrency(item.value, 'INR')}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BudgetPage
// ---------------------------------------------------------------------------

export default function BudgetPage() {
  const params = useParams();
  const tripId = params.id as string;

  const [budget, setBudget] = useState<BudgetEntry[]>([]);
  const [tripTotalBudget, setTripTotalBudget] = useState(0);
  const [tripDays, setTripDays] = useState(1);
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load budget from API
  useEffect(() => {
    if (!tripId) return;
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        // Fetch trip for total_budget + days
        const [budgetRes, tripRes] = await Promise.all([
          api.get(`/api/trips/${tripId}/budget`),
          api.get(`/api/trips/${tripId}`),
        ]);
        if (cancelled) return;

        const b = budgetRes.data.budget ?? {};
        const summary = budgetRes.data.summary ?? {};
        const trip = tripRes.data.trip ?? {};

        // Compute trip days
        if (trip.start_date && trip.end_date) {
          const diff = Math.ceil(
            (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)
          );
          setTripDays(Math.max(1, diff));
        }
        setTripTotalBudget(Number(trip.total_budget) || 0);
        setCurrency(trip.currency || 'INR');

        // Estimated comes from summary (stop costs + activities)
        const estimatedByCategory: Record<BudgetCategory, number> = {
          transport:  summary.actual_stay_transport ? summary.actual_stay_transport / 2 : 0,
          stay:       summary.actual_stay_transport ? summary.actual_stay_transport / 2 : 0,
          activities: summary.actual_activity_cost ?? 0,
          meals:      0,
          misc:       0,
        };

        setBudget(
          CATEGORY_CONFIG.map((cfg) => ({
            ...cfg,
            budgeted: Number(b[BACKEND_KEY_MAP[cfg.id]]) || 0,
            estimated: estimatedByCategory[cfg.id] ?? 0,
          }))
        );
      } catch {
        if (!cancelled) setBudget(CATEGORY_CONFIG.map((cfg) => ({ ...cfg, budgeted: 0, estimated: 0 })));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [tripId]);

  // Save budgeted amount to backend on change
  const persistBudget = useCallback(async (updated: BudgetEntry[]) => {
    setSaving(true);
    const payload: Record<string, number> = {};
    updated.forEach((e) => { payload[BACKEND_KEY_MAP[e.id]] = e.budgeted; });
    try {
      await api.put(`/api/trips/${tripId}/budget`, payload);
    } catch { /* silent */ } finally {
      setSaving(false);
    }
  }, [tripId]);

  const handleBudgetedChange = useCallback((id: BudgetCategory, value: number) => {
    setBudget((prev) => {
      const updated = prev.map((b) => b.id === id ? { ...b, budgeted: value } : b);
      persistBudget(updated);
      return updated;
    });
  }, [persistBudget]);

  const handleEstimatedChange = useCallback((id: BudgetCategory, value: number) => {
    setBudget((prev) => prev.map((b) => b.id === id ? { ...b, estimated: value } : b));
  }, []);

  const totalBudgeted  = useMemo(() => budget.reduce((s, b) => s + b.budgeted, 0), [budget]);
  const totalEstimated = useMemo(() => budget.reduce((s, b) => s + b.estimated, 0), [budget]);
  const isOverBudget   = totalEstimated > tripTotalBudget;
  const perDayAverage  = useMemo(() => Math.round(totalEstimated / tripDays), [totalEstimated, tripDays]);

  const chartData = useMemo(() => budget.map((b) => ({ name: b.label, value: b.estimated, fill: b.color })), [budget]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <SpinnerGap size={32} className="animate-spin text-ember-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl font-bold text-charcoal-800">Trip Budget</h1>
          {saving && <SpinnerGap size={18} className="animate-spin text-ember-400" />}
        </div>
        <p className="mt-1 text-sm text-charcoal-500">
          {tripDays} days &middot; {formatCurrency(tripTotalBudget, currency)} total budget
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left: Budget table */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="warm-card p-6">
          <h2 className="mb-1 font-display text-xl font-bold text-charcoal-800">Budget Allocation</h2>
          <p className="mb-6 text-sm text-charcoal-400">Click any value to edit. Changes auto-save.</p>

          <div className="space-y-1">
            <div className="mb-3 grid grid-cols-[1fr_auto_auto] items-center gap-4 px-2 text-xs font-semibold uppercase tracking-wider text-charcoal-400">
              <span>Category</span><span>Budgeted</span><span>Estimated</span>
            </div>

            {budget.map((entry, index) => {
              const Icon = entry.icon;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-lg border border-sand-100 bg-white px-4 py-3 transition-colors hover:border-sand-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: entry.color + '18' }}>
                      <Icon size={20} weight="fill" style={{ color: entry.color }} />
                    </div>
                    <span className="text-sm font-semibold text-charcoal-800">{entry.label}</span>
                  </div>
                  <EditableValue value={entry.budgeted}  onSave={(v) => handleBudgetedChange(entry.id, v)} currency={currency} />
                  <EditableValue value={entry.estimated} onSave={(v) => handleEstimatedChange(entry.id, v)} currency={currency} />
                </motion.div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-sand-200 px-4 pt-4">
            <span className="text-sm font-bold text-charcoal-800">Total</span>
            <div className="flex items-center gap-6">
              <span className="text-sm font-bold text-charcoal-800">{formatCurrency(totalBudgeted, currency)}</span>
              <span className="text-sm font-bold text-charcoal-800">{formatCurrency(totalEstimated, currency)}</span>
            </div>
          </div>
        </motion.div>

        {/* Right: Charts */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
          {/* Donut */}
          <div className="warm-card p-6">
            <h2 className="mb-4 font-display text-xl font-bold text-charcoal-800">Spending Breakdown</h2>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={72} outerRadius={110} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <text x="50%" y="48%" textAnchor="middle" dominantBaseline="central" fill="#282119" fontSize={22} fontWeight={700}>
                    {formatCurrency(totalEstimated, currency)}
                  </text>
                  <text x="50%" y="62%" textAnchor="middle" dominantBaseline="central" fill="#8C847A" fontSize={12}>
                    Est. Spend
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
              {budget.map((entry) => (
                <div key={entry.id} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-charcoal-500">{entry.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Budget vs Estimated */}
          <div className="warm-card p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-charcoal-800">Budget vs Estimated Spend</h3>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-charcoal-500">
                  <span>Total Budget</span>
                  <span className="font-semibold text-charcoal-700">{formatCurrency(tripTotalBudget, currency)}</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-sand-100">
                  <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.8, delay: 0.3 }} className="h-full rounded-full bg-sand-300" />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-charcoal-500">
                  <span>Estimated Spend</span>
                  <span className={cn('font-semibold', isOverBudget ? 'text-red-600' : 'text-charcoal-700')}>
                    {formatCurrency(totalEstimated, currency)}
                  </span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-sand-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((totalEstimated / (tripTotalBudget || 1)) * 100, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className={cn('h-full rounded-full', isOverBudget ? 'bg-red-500' : 'bg-ember-500')}
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isOverBudget && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden">
                  <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <WarningCircle size={20} weight="fill" className="shrink-0 text-red-500" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">Over Budget!</p>
                      <p className="text-xs text-red-600">
                        Estimated spend exceeds your budget by {formatCurrency(totalEstimated - tripTotalBudget, currency)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full bg-forest-50 px-4 py-2">
                <TrendUp size={18} weight="fill" className="text-forest-500" />
                <span className="text-sm font-semibold text-forest-700">{formatCurrency(perDayAverage, currency)}/day</span>
              </div>
            </div>
          </div>

          {/* Cost breakdown table */}
          <div className="warm-card overflow-hidden p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-charcoal-800">Cost Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sand-100 text-xs font-semibold uppercase tracking-wider text-charcoal-400">
                    <th className="pb-3 text-left">Category</th>
                    <th className="pb-3 text-right">Budgeted</th>
                    <th className="pb-3 text-right">Estimated</th>
                    <th className="pb-3 text-right">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {budget.map((entry, index) => {
                    const diff = entry.budgeted - entry.estimated;
                    const isUnder = diff >= 0;
                    const Icon = entry.icon;
                    return (
                      <motion.tr key={entry.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.05 }} className="border-b border-sand-50 last:border-0">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Icon size={16} weight="fill" style={{ color: entry.color }} />
                            <span className="font-medium text-charcoal-800">{entry.label}</span>
                          </div>
                        </td>
                        <td className="py-3 text-right text-charcoal-600">{formatCurrency(entry.budgeted, currency)}</td>
                        <td className="py-3 text-right text-charcoal-600">{formatCurrency(entry.estimated, currency)}</td>
                        <td className="py-3 text-right">
                          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', isUnder ? 'bg-forest-50 text-forest-700' : 'bg-red-50 text-red-700')}>
                            {isUnder ? <Check size={12} weight="bold" /> : <WarningCircle size={12} weight="bold" />}
                            {isUnder ? '-' : '+'}{formatCurrency(Math.abs(diff), currency)}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-sand-200">
                    <td className="pt-3 font-bold text-charcoal-800">Total</td>
                    <td className="pt-3 text-right font-bold text-charcoal-800">{formatCurrency(totalBudgeted, currency)}</td>
                    <td className="pt-3 text-right font-bold text-charcoal-800">{formatCurrency(totalEstimated, currency)}</td>
                    <td className="pt-3 text-right">
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold', totalBudgeted - totalEstimated >= 0 ? 'bg-forest-50 text-forest-700' : 'bg-red-50 text-red-700')}>
                        {totalBudgeted - totalEstimated >= 0 ? '-' : '+'}
                        {formatCurrency(Math.abs(totalBudgeted - totalEstimated), currency)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
