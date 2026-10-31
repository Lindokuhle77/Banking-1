import { useTheme } from '../../src/theme/ThemeContext';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { AppText } from '../../src/components/AppText';
import { Button } from '../../src/components/Button';
import { colors, spacing } from '../../src/theme/tokens';
import { formatZAR } from '../../src/lib/format';
import { useBank } from '../../src/bank/BankContext';

export default function Success() {
  useTheme();
  const router = useRouter();
  const { receipt } = useBank();
  if (!receipt) return <Screen><Button label="Back to home" onPress={() => router.replace('/')} /></Screen>;
  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: spacing.sm, paddingTop: spacing.xl }}>
        <Ionicons name="checkmark-circle" size={64} color={colors.positive} />
        <AppText variant="title">{receipt.title}</AppText>
        <AppText variant="display">{formatZAR(receipt.amount)}</AppText>
      </View>
      <Card style={{ paddingVertical: spacing.xs }}>
        {receipt.rows.map(r => (
          <View key={r.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, gap: spacing.md }}>
            <AppText color={colors.muted}>{r.label}</AppText>
            <AppText style={{ flexShrink: 1, textAlign: 'right' }}>{r.value}</AppText>
          </View>
        ))}
      </Card>
      <Button label="Back to home" onPress={() => router.replace('/')} />
      <Button label="Make another payment" variant="secondary" onPress={() => router.replace('/pay')} />
    </Screen>
  );
}
