import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { AppText } from '../../src/components/AppText';
import { Button } from '../../src/components/Button';
import { colors, spacing } from '../../src/theme/tokens';
import { useAuth } from '../../src/auth/AuthContext';
import { useBank } from '../../src/bank/BankContext';
import { ChipGroup } from '../../src/components/ChipGroup';
import { Pref, useTheme } from '../../src/theme/ThemeContext';

const THEME_OPTIONS: { key: Pref; label: string }[] = [
  { key: 'system', label: 'System' }, { key: 'light', label: 'Light' }, { key: 'dark', label: 'Dark' },
];

export default function More() {
  const router = useRouter();
  const { lock, logout } = useAuth();
  const { unreadCount } = useBank();
  const { pref, setPref } = useTheme();
  const items = [
    { label: 'Linked banks', icon: 'link-outline', to: '/linked' },
    { label: 'Statements', icon: 'document-text-outline', to: '/statements' },
    { label: 'Spending insights', icon: 'pie-chart-outline', to: '/insights' },
    { label: unreadCount ? `Notifications (${unreadCount} new)` : 'Notifications', icon: 'notifications-outline', to: '/notifications' },
  ] as const;
  return (
    <Screen>
      <AppText variant="title">More</AppText>
      <Card style={{ paddingVertical: spacing.xs }}>
        {items.map(i => (
          <Pressable key={i.to} accessibilityRole="button" onPress={() => router.push(i.to)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 14, opacity: pressed ? 0.7 : 1 })}>
            <Ionicons name={i.icon} size={22} color={colors.link} />
            <View style={{ flex: 1 }}><AppText>{i.label}</AppText></View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        ))}
      </Card>
      <ChipGroup label="Appearance" options={THEME_OPTIONS} value={pref} onChange={setPref} />
      <AppText variant="small" color={colors.muted}>The app locks itself after 2 minutes of inactivity.</AppText>
      <Button label="Lock app now" onPress={lock} />
      <Button label="Sign out" variant="secondary" onPress={logout} />
    </Screen>
  );
}
