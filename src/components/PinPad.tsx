import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../theme/tokens';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export function PinPad({ onComplete, length = 4 }: { onComplete: (pin: string) => void; length?: number }) {
  const [value, setValue] = useState('');
  const press = (k: string) => {
    if (k === 'del') return setValue(v => v.slice(0, -1));
    if (!k || value.length >= length) return;
    const next = value + k;
    if (next.length === length) { setValue(''); onComplete(next); } else setValue(next);
  };
  return (
    <View style={{ gap: spacing.lg, alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', gap: spacing.md }} accessibilityLabel={`${value.length} of ${length} digits entered`}>
        {Array.from({ length }).map((_, i) => (
          <View key={i} style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: i < value.length ? colors.ink : colors.line }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 270, gap: spacing.sm }}>
        {KEYS.map((k, i) =>
          k ? (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={k === 'del' ? 'Delete' : k}
              onPress={() => press(k)}
              style={({ pressed }) => ({
                width: 82, height: 62, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
                backgroundColor: pressed ? colors.line : colors.surface, borderWidth: 1, borderColor: colors.line,
              })}
            >
              <AppText variant="title">{k === 'del' ? '⌫' : k}</AppText>
            </Pressable>
          ) : (
            <View key={i} style={{ width: 82, height: 62 }} />
          )
        )}
      </View>
    </View>
  );
}
