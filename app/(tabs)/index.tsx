import { useTheme } from '../../src/theme/ThemeContext';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { AppText } from '../../src/components/AppText';
import { Button } from '../../src/components/Button';
import { AccountCard } from '../../src/components/AccountCard';
import { TransactionRow } from '../../src/components/TransactionRow';
import { colors, spacing } from '../../src/theme/tokens';
import { formatZAR } from '../../src/lib/format';
import { useBank } from '../../src/bank/BankContext';

export default function Home() {
  useTheme();
  const router = useRouter();
  const { accounts, transactions, unreadCount } = useBank();
  const net = accounts.reduce((sum, a) => sum + a.balance, 0);
  const recent = transactions.slice(0, 5);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText variant="title">Hi, Lindo</AppText>
        <Pressable accessibilityRole="button" accessibilityLabel={`Notifications, ${unreadCount} unread`} onPress={() => router.push('/notifications')} hitSlop={10}>
          <Ionicons name="notifications-outline" size={26} color={colors.link} />
          {unreadCount > 0 && (
            <View style={{ position: 'absolute', top: -4, right: -6, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.marigold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
              <AppText variant="small" color="#1B1F4B" style={{ fontWeight: '700' }}>{unreadCount}</AppText>
            </View>
          )}
        </Pressable>
      </View>
      <Card style={{ backgroundColor: colors.ink, borderColor: colors.ink, gap: spacing.sm }}>
        <AppText variant="label" color="#C9CCE8">Net balance across accounts</AppText>
        <AppText variant="display" color="#FFFFFF">{formatZAR(net)}</AppText>
        <View style={{ height: 3, width: 40, backgroundColor: colors.marigold }} />
      </Card>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}><Button label="Pay someone" onPress={() => router.push('/pay')} /></View>
        <View style={{ flex: 1 }}><Button label="Transfer" variant="secondary" onPress={() => router.push('/payments/transfer')} /></View>
      </View>

      <AppText variant="title">Accounts</AppText>
      {accounts.map(a => <AccountCard key={a.id} account={a} onPress={() => router.push(`/account/${a.id}`)} />)}

      <AppText variant="title">Recent activity</AppText>
      <Card style={{ paddingVertical: spacing.xs }}>
        {recent.map(t => <TransactionRow key={t.id} tx={t} onPress={() => router.push(`/transaction/${t.id}`)} />)}
      </Card>
    </Screen>
  );
}
