import { View } from 'react-native';
import { Card } from './Card';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../theme/tokens';
import { formatZAR } from '../lib/format';
import type { Account } from '../data/mock';

export function BankBreakdown({ accounts }: { accounts: Account[] }) {
  const totals = new Map<string, number>();
  for (const a of accounts) {
    const bank = a.institutionName ?? 'Khaya Bank';
    totals.set(bank, (totals.get(bank) ?? 0) + a.balance);
  }
  const rows = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...rows.map(r => Math.max(0, r[1])));
  return (
    <>
      <AppText variant="title">Across your banks</AppText>
      <Card style={{ gap: spacing.md }}>
        {rows.map(([bank, total]) => (
          <View key={bank} style={{ gap: 6 }} accessibilityLabel={`${bank}, ${formatZAR(total)}`}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText variant="label">{bank}</AppText>
              <AppText variant="label">{formatZAR(total)}</AppText>
            </View>
            <View style={{ height: 10, borderRadius: radius.sm, backgroundColor: colors.paper }}>
              <View style={{ height: 10, borderRadius: radius.sm, width: `${Math.max(2, (Math.max(0, total) / max) * 100)}%`, backgroundColor: colors.ink }} />
            </View>
          </View>
        ))}
      </Card>
    </>
  );
}
