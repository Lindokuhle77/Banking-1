import type { Transaction } from '../data/mock';

export const formatZAR = (amount: number) =>
  'R ' + amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatSigned = (amount: number) => (amount > 0 ? '+' : amount < 0 ? '-' : '') + formatZAR(Math.abs(amount));

const dayKey = (iso: string) => new Date(iso).toDateString();

export function dayLabel(iso: string) {
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  if (dayKey(iso) === today.toDateString()) return 'Today';
  if (dayKey(iso) === yesterday.toDateString()) return 'Yesterday';
  return new Date(iso).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function fullDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function groupByDay(list: Transaction[]) {
  const groups: { label: string; items: Transaction[] }[] = [];
  for (const t of list) {
    const label = dayLabel(t.date);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(t);
    else groups.push({ label, items: [t] });
  }
  return groups;
}

export const monthKey = (iso: string) => iso.slice(0, 7);
export const monthLabel = (key: string) =>
  new Date(key + '-15T12:00:00').toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
