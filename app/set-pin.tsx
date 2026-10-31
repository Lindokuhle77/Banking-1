import { useTheme } from '../src/theme/ThemeContext';
import { useState } from 'react';
import { View } from 'react-native';
import { Screen } from '../src/components/Screen';
import { AppText } from '../src/components/AppText';
import { PinPad } from '../src/components/PinPad';
import { colors, spacing } from '../src/theme/tokens';
import { useAuth } from '../src/auth/AuthContext';

export default function SetPin() {
  useTheme();
  const { setPin } = useAuth();
  const [first, setFirst] = useState<string | null>(null);
  const [error, setError] = useState('');

  const done = (pin: string) => {
    if (!first) { setFirst(pin); setError(''); return; }
    if (pin === first) setPin(pin);
    else { setFirst(null); setError('The PINs did not match. Enter a new PIN to start again.'); }
  };

  return (
    <Screen>
      <View style={{ gap: spacing.lg, alignItems: 'center', paddingTop: spacing.xl }}>
        <AppText variant="title">{first ? 'Confirm your PIN' : 'Create a 4-digit PIN'}</AppText>
        <AppText color={colors.muted}>You will use it to unlock the app.</AppText>
        {error ? <AppText color={colors.negative}>{error}</AppText> : null}
        <PinPad key={first ?? 'first'} onComplete={done} />
      </View>
    </Screen>
  );
}
