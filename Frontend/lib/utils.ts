import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateRange(start: string, end: string): string {
  const s = parseISO(start);
  const e = parseISO(end);
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();

  if (sameMonth) {
    return `${format(s, 'd')} – ${format(e, 'd MMM yyyy')}`;
  }
  if (sameYear) {
    return `${format(s, 'd MMM')} – ${format(e, 'd MMM yyyy')}`;
  }
  return `${format(s, 'd MMM yyyy')} – ${format(e, 'd MMM yyyy')}`;
}

export function formatRelativeTime(date: string): string {
  return formatDistanceToNow(parseISO(date), { addSuffix: true });
}

export function getTripStatus(start: string, end: string): 'upcoming' | 'ongoing' | 'completed' {
  const now = new Date();
  const s = parseISO(start);
  const e = parseISO(end);
  if (isBefore(now, s)) return 'upcoming';
  if (isAfter(now, e)) return 'completed';
  return 'ongoing';
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function costIndexLabel(index?: number): string {
  if (!index) return '$$';
  if (index <= 1) return '$';
  if (index <= 2) return '$$';
  return '$$$';
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}
