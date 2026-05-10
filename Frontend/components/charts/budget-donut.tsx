'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface BudgetDonutDataItem {
  name: string;
  value: number;
  color: string;
}

interface BudgetDonutProps {
  data: BudgetDonutDataItem[];
  total: number;
  currency?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: BudgetDonutDataItem;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  return (
    <div className="rounded-lg border border-sand-100 bg-white px-3 py-2 shadow-warm">
      <div className="flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: item.payload.color }}
        />
        <span className="text-sm font-medium text-charcoal-800">{item.name}</span>
      </div>
      <p className="mt-1 text-sm text-charcoal-600 pl-[18px]">
        {formatCurrency(item.value)}
      </p>
    </div>
  );
}

export function BudgetDonut({ data, total, currency = 'INR' }: BudgetDonutProps) {
  return (
    <div className="relative w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xs text-charcoal-500 uppercase tracking-wide">Total</span>
        <span className="text-lg font-semibold text-charcoal-800">
          {formatCurrency(total, currency)}
        </span>
      </div>
    </div>
  );
}
