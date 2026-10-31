import { Text, TextProps } from 'react-native';
import { colors, type } from '../theme/tokens';

type Props = TextProps & { variant?: keyof typeof type; color?: string };

export function AppText({ variant = 'body', color = colors.text, style, ...rest }: Props) {
  const isError = color === colors.negative;
  return (
    <Text
      {...rest}
      accessibilityRole={rest.accessibilityRole ?? (variant === 'title' ? 'header' : isError ? 'alert' : undefined)}
      accessibilityLiveRegion={isError ? 'polite' : undefined}
      style={[type[variant], { color }, style]}
    />
  );
}
