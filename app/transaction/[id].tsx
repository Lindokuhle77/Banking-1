import { useTheme } from '../../src/theme/ThemeContext';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { AppText } from '../../src/components/AppText';
import { BackLink } from '../../src/components/BackLink';
import { colors, spacing } from '../../src/theme/tokens';
import { formatSigned, fullDate } from '../../src/lib/format';
import { useBank } from '../../src/bank/BankContext';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, gap: spacing.md }}>
      <AppText color={colors.muted}>{label}</AppText>
      <AppText style={{ flexShrink: 1, textAlign: 'right' }}>{value}</AppText>
    </View>
  );
}

export default function TransactionDetail() {
  useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accounts, transactions } = useBank();
  const tx = transactions.find(t => t.id === id);
  if (!tx) return <Screen><BackLink /><AppText>We could not find that transaction. Go back and try again.</AppText></Screen>;
  const account = accounts.find(a => a.id === tx.accountId);

  return (
    <Screen>
      <BackLink />
      <AppText variant="label" color={colors.muted}>{tx.description}</AppText>
      <AppText variant="display" color={tx.amount > 0 ? colors.positive : colors.text}>{formatSigned(tx.amount)}</AppText>
      <Card style={{ paddingVertical: spacing.xs }}>
        <Row label="Date" value={fullDate(tx.date)} />
        <Row label="Category" value={tx.category} />
        <Row label="Account" value={account ? `${account.name} ${account.number}` : ''} />
        <Row label="Reference" value={`KHY-${tx.id.toUpperCase()}`} />
      </Card>
    </Screen>
  );
}
