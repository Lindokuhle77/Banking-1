import { useTheme } from '../src/theme/ThemeContext';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Screen } from '../src/components/Screen';
import { Card } from '../src/components/Card';
import { AppText } from '../src/components/AppText';
import { BackLink } from '../src/components/BackLink';
import { colors, spacing } from '../src/theme/tokens';
import { useBank } from '../src/bank/BankContext';

export default function Notifications() {
  useTheme();
  const { notifications, markAllRead } = useBank();
  const [fresh] = useState(() => new Set(notifications.filter(n => !n.read).map(n => n.id)));
  useEffect(() => { markAllRead(); }, []);

  return (
    <Screen>
      <BackLink label="Home" />
      <AppText variant="title">Notifications</AppText>
      {notifications.length === 0 ? (
        <AppText color={colors.muted}>Nothing yet. Payments and card changes will show up here.</AppText>
      ) : (
        <Card style={{ paddingVertical: spacing.xs }}>
          {notifications.map(n => (
            <View key={n.id} style={{ flexDirection: 'row', gap: spacing.sm, paddingVertical: 12 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, marginTop: 7, backgroundColor: fresh.has(n.id) ? colors.marigold : 'transparent' }} />
              <View style={{ flex: 1 }}>
                <AppText variant="label">{n.title}</AppText>
                <AppText color={colors.muted}>{n.body}</AppText>
                <AppText variant="small" color={colors.muted}>{new Date(n.date).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</AppText>
              </View>
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}
