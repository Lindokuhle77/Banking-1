import { useTheme } from '../src/theme/ThemeContext';
import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { Screen } from '../src/components/Screen';
import { AppText } from '../src/components/AppText';
import { PinPad } from '../src/components/PinPad';
import { Button } from '../src/components/Button';
import { colors, spacing } from '../src/theme/tokens';
import { useAuth } from '../src/auth/AuthContext';

export default function Unlock() {
  useTheme();
  const { unlockWithPin, unlockWithBiometrics, logout } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => { unlockWithBiometrics(); }, []);

  const check = async (pin: string) => {
    const r = await unlockWithPin(pin);
    if (r === 'wrong') setError('Incorrect PIN. After 3 wrong attempts you will be signed out.');
  };

  return (
    <Screen>
      <View style={{ gap: spacing.lg, alignItems: 'center', paddingTop: spacing.xl }}>
        <AppText variant="title">Enter your PIN</AppText>
        {error ? <AppText color={colors.negative}>{error}</AppText> : null}
        <PinPad onComplete={check} />
        {Platform.OS !== 'web' && <Button label="Use Face ID or fingerprint" variant="secondary" onPress={unlockWithBiometrics} />}
        <Button label="Sign out" variant="secondary" onPress={logout} />
      </View>
    </Screen>
  );
}
