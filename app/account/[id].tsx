import { useTheme } from '../../src/theme/ThemeContext';
import { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { AppText } from '../../src/components/AppText';
import { BackLink } from '../../src/components/BackLink';
import { TransactionRow } from '../../src/components/TransactionRow';
import { colors, radius, spacing } from '../../src/theme/tokens';
import { formatZAR, groupByDay } from '../../src/lib/format';
import { useBank } from '../../src/bank/BankContext';

type Filter = 'all' | 'in' | 'out';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' }, { key: 'in', label: 'Money in' }, { key: 'out', label: 'Money out' },
];

export default function AccountDetail() {
  useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { accounts, transactions } = useBank();
  const account = accounts.find(a => a.id === id);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter(t =>
      t.accountId === id &&
      (filter === 'all' || (filter === 'in' ? t.amount > 0 : t.amount < 0)) &&
      (!q || t.description.toLowerCase().includes(q) || t.category.includes(q)));
  }, [id, query, filter, transactions]);

  if (!account) {
    return <Screen><BackLink /><AppText>We could not find that account. Go back and choose another.</AppText></Screen>;
  }

  const moneyIn = list.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const moneyOut = list.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);

  return (
    <Screen>
      <BackLink label="Accounts" />
      <View>
        <AppText variant="title">{account.name}</AppText>
        <AppText color={colors.muted}>{account.institutionName ? `${account.institutionName} ${account.number}` : account.number}</AppText>
      </View>
      <Card style={{ backgroundColor: colors.ink, borderColor: colors.ink, gap: spacing.xs }}>
        <AppText variant="label" color="#C9CCE8">{account.type === 'credit' ? 'Amount owed' : 'Available balance'}</AppText>
        <AppText variant="display" color="#FFFFFF">{formatZAR(Math.abs(account.balance))}</AppText>
      </Card>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search transactions"
        placeholderTextColor={colors.muted}
        accessibilityLabel="Search transactions"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: 16, color: colors.text }}
      />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {FILTERS.map(f => (
          <Pressable
            key={f.key}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === f.key }}
            onPress={() => setFilter(f.key)}
            style={{ paddingVertical: 12, paddingHorizontal: spacing.md, borderRadius: 999, backgroundColor: filter === f.key ? colors.ink : colors.surface, borderWidth: 1, borderColor: filter === f.key ? colors.ink : colors.line }}
          >
            <AppText variant="label" color={filter === f.key ? '#FFFFFF' : colors.text}>{f.label}</AppText>
          </Pressable>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <AppText variant="small" color={colors.positive}>In: {formatZAR(moneyIn)}</AppText>
        <AppText variant="small" color={colors.muted}>Out: {formatZAR(Math.abs(moneyOut))}</AppText>
      </View>

      {list.length === 0 ? (
        <AppText color={colors.muted}>No transactions match. Clear the search or choose All.</AppText>
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
