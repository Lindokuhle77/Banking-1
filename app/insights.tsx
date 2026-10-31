import { useTheme } from '../src/theme/ThemeContext';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Screen } from '../src/components/Screen';
import { Card } from '../src/components/Card';
import { AppText } from '../src/components/AppText';
import { BackLink } from '../src/components/BackLink';
import { ChipGroup } from '../src/components/ChipGroup';
import { colors, radius, spacing } from '../src/theme/tokens';
import { formatZAR, monthKey, monthLabel } from '../src/lib/format';
import { useBank } from '../src/bank/BankContext';

export default function Insights() {
  useTheme();
  const { transactions } = useBank();
  const months = useMemo(() => Array.from(new Set(transactions.map(t => monthKey(t.date)))).sort().reverse(), [transactions]);
  const [month, setMonth] = useState(months[0]);

  const { rows, spent, income } = useMemo(() => {
    const inMonth = transactions.filter(t => monthKey(t.date) === month);
    const totals: Record<string, number> = {};
    for (const t of inMonth) if (t.amount < 0 && t.category !== 'transfer') totals[t.category] = (totals[t.category] ?? 0) + -t.amount;
    const rows = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    return {
      rows,
      spent: rows.reduce((s, [, v]) => s + v, 0),
      income: inMonth.filter(t => t.amount > 0 && t.category === 'income').reduce((s, t) => s + t.amount, 0),
    };
  }, [transactions, month]);

  return (
    <Screen>
      <BackLink label="More" />
      <AppText variant="title">Spending insights</AppText>
      <ChipGroup label="Month" options={months.map(m => ({ key: m, label: monthLabel(m) }))} value={month} onChange={setMonth} />
      <Card style={{ gap: spacing.xs }}>
        <AppText variant="label" color={colors.muted}>Spent this month</AppText>
        <AppText variant="display">{formatZAR(spent)}</AppText>
        <AppText variant="small" color={colors.positive}>Income: {formatZAR(income)}</AppText>
      </Card>
      {rows.length === 0 ? (
        <AppText color={colors.muted}>No spending in this month yet.</AppText>
      ) : (
        <Card style={{ gap: spacing.md }}>
          {rows.map(([cat, amt], i) => (
            <View key={cat} style={{ gap: 6 }} accessibilityLabel={`${cat}, ${formatZAR(amt)}, ${Math.round((amt / spent) * 100)} percent`}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <AppText variant="label">{cat}</AppText>
                <AppText variant="label">{formatZAR(amt)}</AppText>
              </View>
              <View style={{ height: 10, borderRadius: radius.sm, backgroundColor: colors.paper }}>
                <View style={{ height: 10, borderRadius: radius.sm, width: `${Math.max(4, (amt / rows[0][1]) * 100)}%`, backgroundColor: i === 0 ? colors.marigold : colors.ink }} />
              </View>
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}
