import { Pressable, View } from 'react-native';
import { AppText } from './AppText';
import { colors, spacing } from '../theme/tokens';

export function ChipGroup<T extends string>({ label, options, value, onChange }: {
  label: string; options: { key: T; label: string }[]; value: T; onChange: (k: T) => void;
}) {
  return (
    <View style={{ gap: spacing.xs }}>
      <AppText variant="label" color={colors.muted}>{label}</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {options.map(o => {
          const on = o.key === value;
          return (
            <Pressable
              key={o.key}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => onChange(o.key)}
              style={{ paddingVertical: 12, paddingHorizontal: spacing.md, borderRadius: 999, backgroundColor: on ? colors.ink : colors.surface, borderWidth: 1, borderColor: on ? colors.ink : colors.line }}
            >
              <AppText variant="label" color={on ? '#FFFFFF' : colors.text}>{o.label}</AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
