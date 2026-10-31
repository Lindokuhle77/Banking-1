import { useTheme } from '../src/theme/ThemeContext';
import { useMemo, useState } from 'react';
import { Platform, Share, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { Card } from '../src/components/Card';
import { AppText } from '../src/components/AppText';
import { Button } from '../src/components/Button';
import { BackLink } from '../src/components/BackLink';
import { ChipGroup } from '../src/components/ChipGroup';
import { TransactionRow } from '../src/components/TransactionRow';
import { colors, spacing } from '../src/theme/tokens';
import { formatSigned, formatZAR, groupByDay, monthKey, monthLabel } from '../src/lib/format';
import { useBank } from '../src/bank/BankContext';

export default function Statements() {
  useTheme();
  const router = useRouter();
  const { accounts, transactions } = useBank();
  const [accountId, setAccountId] = useState(accounts[0].id);
  const months = useMemo(() => Array.from(new Set(transactions.map(t => monthKey(t.date)))).sort().reverse(), [transactions]);
  const [month, setMonth] = useState(months[0]);

  const account = accounts.find(a => a.id === accountId)!;
  const list = transactions.filter(t => t.accountId === accountId && monthKey(t.date) === month);
  const moneyIn = list.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const moneyOut = list.filter(t => t.amount < 0).reduce((s, t) => s + -t.amount, 0);

  const share = async () => {
    const lines = list.map(t => `${new Date(t.date).toLocaleDateString('en-ZA')}  ${t.description}  ${formatSigned(t.amount)}`);
    const message = [`Khaya Bank statement (concept)`, `${account.name} ${account.number}`, monthLabel(month), '', ...lines, '', `Money in: ${formatZAR(moneyIn)}`, `Money out: ${formatZAR(moneyOut)}`].join('\n');
    try { await Share.share({ message }); } catch {}
  };

  return (
    <Screen>
      <BackLink label="More" />
      <AppText variant="title">Statements</AppText>
      <ChipGroup label="Account" options={accounts.map(a => ({ key: a.id, label: a.name }))} value={accountId} onChange={setAccountId} />
      <ChipGroup label="Month" options={months.map(m => ({ key: m, label: monthLabel(m) }))} value={month} onChange={setMonth} />
      <Card style={{ gap: spacing.xs }}>
        <AppText variant="label" color={colors.muted}>{account.name} {account.number}</AppText>
        <AppText variant="small" color={colors.positive}>Money in: {formatZAR(moneyIn)}</AppText>
        <AppText variant="small" color={colors.muted}>Money out: {formatZAR(moneyOut)}</AppText>
        <AppText variant="small" color={colors.muted}>{list.length} transaction{list.length === 1 ? '' : 's'}</AppText>
      </Card>
      {Platform.OS !== 'web' && list.length > 0 && <Button label="Share statement" variant="secondary" onPress={share} />}
      {list.length === 0 ? (
        <AppText color={colors.muted}>No transactions on this account in this month. Choose another account or month.</AppText>
      ) : (
        groupByDay(list).map(g => (
          <View key={g.label}>
            <AppText variant="label" color={colors.muted}>{g.label}</AppText>
            <Card style={{ paddingVertical: spacing.xs, marginTop: spacing.xs }}>
              {g.items.map(t => <TransactionRow key={t.id} tx={t} onPress={() => router.push(`/transaction/${t.id}`)} />)}
            </Card>
          </View>
        ))
      )}
    </Screen>
  );
}
