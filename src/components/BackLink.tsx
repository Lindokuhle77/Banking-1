import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from './AppText';
import { colors } from '../theme/tokens';

export function BackLink({ label = 'Back' }: { label?: string }) {
  const router = useRouter();
  return (
    <Pressable accessibilityRole="button" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={12}>
      <AppText variant="label" color={colors.link}>‹ {label}</AppText>
    </Pressable>
  );
}
