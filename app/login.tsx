import { useTheme } from '../src/theme/ThemeContext';
import { useState } from 'react';
import { View } from 'react-native';
import { Screen } from '../src/components/Screen';
import { AppText } from '../src/components/AppText';
import { Field } from '../src/components/Field';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { colors, spacing } from '../src/theme/tokens';
import { DEMO, useAuth } from '../src/auth/AuthContext';

export default function Login() {
  useTheme();
  const { login } = useAuth();
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    const r = await login(u, p);
    if (r === 'invalid') setError('Username or password is incorrect. Check them and try again.');
    else if (r === 'limited') setError('Too many attempts. Wait a minute and try again.');
    else if (r === 'unavailable') setError('Could not reach the sign-in server. Check that it is running, or remove EXPO_PUBLIC_API_URL to use the built-in demo.');
  };

  return (
    <Screen>
      <View style={{ height: spacing.xl }} />
      <AppText variant="display" color={colors.link}>Khaya Bank</AppText>
      <AppText color={colors.muted}>Sign in to your accounts</AppText>
      <Field label="Username" value={u} onChangeText={setU} autoCapitalize="none" autoCorrect={false} />
      <Field label="Password" value={p} onChangeText={setP} secureTextEntry onSubmitEditing={submit} />
      {error ? <AppText color={colors.negative}>{error}</AppText> : null}
      <Button label="Sign in" onPress={submit} disabled={!u || !p} />
      <Card>
        <AppText variant="small" color={colors.muted}>
          Concept project with mocked data. Demo login: {DEMO.username} / {DEMO.password}
        </AppText>
      </Card>
    </Screen>
  );
}
