import { useTheme } from '../../src/theme/ThemeContext';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { AppText } from '../../src/components/AppText';
import { Button } from '../../src/components/Button';
import { colors, radius, spacing } from '../../src/theme/tokens';
import { useBank } from '../../src/bank/BankContext';

const initials = (name: string) => name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

export default function Pay() {
  useTheme();
  const router = useRouter();
  const { beneficiaries } = useBank();
  return (
    <Screen>
      <AppText variant="title">Pay</AppText>
      <Button label="Add beneficiary" onPress={() => router.push('/payments/new-beneficiary')} />
      <Button label="Transfer between my accounts" variant="secondary" onPress={() => router.push('/payments/transfer')} />
      <AppText variant="title">Beneficiaries</AppText>
      <Card style={{ paddingVertical: spacing.xs }}>
        {beneficiaries.map(b => (
          <Pressable
            key={b.id}
            accessibilityRole="button"
            accessibilityLabel={`Pay ${b.name}`}
            onPress={() => router.push(`/payments/beneficiary/${b.id}`)}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 12, opacity: pressed ? 0.7 : 1 })}
          >
            <View style={{ width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' }}>
              <AppText variant="label" color={colors.link}>{initials(b.name)}</AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText numberOfLines={1}>{b.name}</AppText>
              <AppText variant="small" color={colors.muted}>{b.bank} •••• {b.accountNumber.slice(-4)}</AppText>
            </View>
          </Pressable>
        ))}
      </Card>
    </Screen>
  );
}
