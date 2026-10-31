import { View, ViewProps } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

export function Card({ style, ...rest }: ViewProps) {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: colors.line,
        },
        style,
      ]}
    />
  );
}
