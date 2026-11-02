import { Pressable, View } from 'react-native';
import { Card } from './Card';
import { AppText } from './AppText';
import { colors, spacing } from '../theme/tokens';
import { formatZAR } from '../lib/format';
import type { Account } from '../data/mock';

export function AccountCard({ account, onPress }: { account: Account; onPress: () => void }) {
  const owed = account.type === 'credit';
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${account.name}, ${formatZAR(Math.abs(account.balance))}`} onPress={onPress}>
      <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: spacing.xs }}>
          <AppText variant="label">{account.name}</AppText>
          <AppText variant="small" color={colors.muted}>{account.institutionName ? `${account.institutionName} ${account.number}` : account.number}</AppText>
        </View>
        <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
          <AppText variant="title">{formatZAR(Math.abs(account.balance))}</AppText>
          <AppText variant="small" color={colors.muted}>{owed ? 'Amount owed' : 'Available'}</AppText>
        </View>
      </Card>
    </Pressable>
  );
}
