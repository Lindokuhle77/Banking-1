import { useTheme } from '../../src/theme/ThemeContext';
import { Switch, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { AppText } from '../../src/components/AppText';
import { colors, radius, spacing } from '../../src/theme/tokens';
import { useBank } from '../../src/bank/BankContext';
import type { BankCard } from '../../src/data/mock';

function Plastic({ card }: { card: BankCard }) {
  return (
    <View style={{ backgroundColor: card.frozen ? '#5B5F7E' : colors.ink, borderRadius: radius.lg, padding: spacing.lg, height: 170, justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText variant="label" color="#FFFFFF">Khaya Bank</AppText>
        <AppText variant="label" color={card.frozen ? '#FFFFFF' : colors.marigold}>{card.frozen ? 'Frozen' : card.type === 'debit' ? 'Debit' : 'Credit'}</AppText>
      </View>
      <View style={{ gap: spacing.xs }}>
        <AppText variant="title" color="#FFFFFF" style={{ letterSpacing: 2 }}>•••• •••• •••• {card.last4}</AppText>
        <AppText variant="small" color="#C9CCE8">{card.name}</AppText>
      </View>
    </View>
  );
}

function ToggleRow({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 10 }}>
      <View style={{ flex: 1 }}>
        <AppText variant="label">{label}</AppText>
        <AppText variant="small" color={colors.muted}>{hint}</AppText>
      </View>
      <Switch accessibilityLabel={label} value={value} onValueChange={onChange} trackColor={{ false: colors.line, true: colors.ink }} thumbColor="#FFFFFF" />
    </View>
  );
}

export default function Cards() {
  useTheme();
  const { cards, toggleCard } = useBank();
  return (
    <Screen>
      <AppText variant="title">Cards</AppText>
      {cards.map(c => (
        <View key={c.id} style={{ gap: spacing.sm }}>
          <Plastic card={c} />
          <Card style={{ paddingVertical: spacing.xs }}>
            <ToggleRow label="Freeze card" hint="Blocks all payments and withdrawals until you unfreeze it." value={c.frozen} onChange={() => toggleCard(c.id, 'frozen')} />
            <ToggleRow label="Online purchases" hint="Allow this card on websites and apps." value={c.online} onChange={() => toggleCard(c.id, 'online')} />
            <ToggleRow label="International use" hint="Allow payments and withdrawals outside South Africa." value={c.international} onChange={() => toggleCard(c.id, 'international')} />
          </Card>
        </View>
      ))}
    </Screen>
  );
}
