import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../theme/tokens';
import { formatSigned } from '../lib/format';
import type { Category, Transaction } from '../data/mock';

export const categoryIcon: Record<Category, keyof typeof Ionicons.glyphMap> = {
  groceries: 'cart', fuel: 'car', transport: 'car-sport', entertainment: 'film', utilities: 'flash',
  income: 'cash', shopping: 'bag', transfer: 'swap-horizontal', airtime: 'phone-portrait', dining: 'restaurant',
};

export function TransactionRow({ tx, onPress }: { tx: Transaction; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${tx.description}, ${formatSigned(tx.amount)}`}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 12, opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={categoryIcon[tx.category]} size={20} color={colors.link} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText numberOfLines={1}>{tx.description}</AppText>
        <AppText variant="small" color={colors.muted}>{tx.category}</AppText>
      </View>
      <AppText variant="label" color={tx.amount > 0 ? colors.positive : colors.text}>{formatSigned(tx.amount)}</AppText>
    </Pressable>
  );
}
