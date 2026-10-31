import { formatSigned, formatZAR, groupByDay } from '../src/lib/format';
import { parseAmount } from '../src/lib/amount';
import type { Transaction } from '../src/data/mock';

const tx = (id: string, daysAgo: number): Transaction => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return { id, accountId: 'chq', date: d.toISOString(), description: 'Test', category: 'groceries', amount: -10 };
};

describe('formatting', () => {
  it('formats rand amounts with two decimals', () => {
    expect(formatZAR(24580.5)).toMatch(/^R 24\s?580[.,]50$/);
  });
  it('adds a sign to amounts', () => {
    expect(formatSigned(-50)).toMatch(/^-R 50[.,]00$/);
    expect(formatSigned(50)).toMatch(/^\+R 50[.,]00$/);
  });
  it('groups transactions by day with Today and Yesterday labels', () => {
    const groups = groupByDay([tx('a', 0), tx('b', 0), tx('c', 1)]);
    expect(groups.map(g => g.label)).toEqual(['Today', 'Yesterday']);
    expect(groups[0].items).toHaveLength(2);
  });
});

describe('parseAmount', () => {
  it('accepts a dot or a comma as the decimal separator', () => {
    expect(parseAmount('12.5')).toBe(12.5);
    expect(parseAmount('12,5')).toBe(12.5);
  });
  it('rounds to cents and rejects text', () => {
    expect(parseAmount('10.005')).toBeCloseTo(10.01, 2);
    expect(parseAmount('abc')).toBeNaN();
  });
});
