import { TextInput, TextInputProps, View } from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../theme/tokens';

export function Field({ label, ...rest }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: spacing.xs }}>
      <AppText variant="label" color={colors.muted}>{label}</AppText>
      <TextInput
        {...rest}
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={{
          backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md,
          paddingHorizontal: spacing.md, paddingVertical: 14, fontSize: 16, color: colors.text,
        }}
      />
    </View>
  );
}
