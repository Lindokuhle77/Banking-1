import { Pressable } from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../theme/tokens';

type Props = { label: string; onPress: () => void; variant?: 'primary' | 'secondary'; disabled?: boolean };

export function Button({ label, onPress, variant = 'primary', disabled }: Props) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: primary ? colors.ink : 'transparent',
        borderWidth: primary ? 0 : 1.5,
        borderColor: primary ? colors.ink : colors.link,
        borderRadius: radius.md,
        paddingVertical: 14,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
      })}
    >
      <AppText variant="label" color={primary ? '#FFFFFF' : colors.link}>{label}</AppText>
    </Pressable>
  );
}
