import { useTheme } from '../../src/theme/ThemeContext';
import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { AppText } from '../../src/components/AppText';
import { Field } from '../../src/components/Field';
import { Button } from '../../src/components/Button';
import { BackLink } from '../../src/components/BackLink';
import { colors, spacing } from '../../src/theme/tokens';
import { formatZAR } from '../../src/lib/format';
import { describe, useBank } from '../../src/bank/BankContext';

const newCode = () => String(Math.floor(100000 + Math.random() * 900000));

export default function Confirm() {
  useTheme();
  const router = useRouter();
  const { pending, setPending, accounts, beneficiaries, execute } = useBank();
  const [code, setCode] = useState(newCode);
  const [entry, setEntry] = useState('');
  const [tries, setTries] = useState(0);
  const [error, setError] = useState('');

  if (!pending) {
    return <Screen><BackLink label="Pay" /><AppText>There is no payment to confirm. Start again from the Pay tab.</AppText></Screen>;
  }

  const confirm = () => {
    if (entry !== code) {
      const used = tries + 1;
      if (used >= 3) {
        setPending(null);
        router.replace('/pay');
        return;
      }
      setTries(used);
      setEntry('');
      return setError(`That one-time PIN is incorrect. ${3 - used} attempt${3 - used === 1 ? '' : 's'} left.`);
    }
    const r = execute();
    if (r.ok) router.replace('/payments/success');
    else setError(r.error ?? 'Something went wrong. Try again.');
  };

  const resend = () => { setCode(newCode()); setEntry(''); setTries(0); setError(''); };

  return (
    <Screen>
      <BackLink label="Edit" />
      <AppText variant="title">Review and confirm</AppText>
      <AppText variant="display">{formatZAR(pending.amount)}</AppText>
      <Card style={{ paddingVertical: spacing.xs }}>
        {describe(pending, accounts, beneficiaries).map(r => (
          <View key={r.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, gap: spacing.md }}>
            <AppText color={colors.muted}>{r.label}</AppText>
            <AppText style={{ flexShrink: 1, textAlign: 'right' }}>{r.value}</AppText>
          </View>
        ))}
      </Card>
      <Card style={{ backgroundColor: colors.paper, gap: spacing.xs }}>
        <AppText variant="label">Demo mode</AppText>
        <AppText variant="small" color={colors.muted}>A real bank sends this one-time PIN by SMS or app notification. Your demo PIN is {code}.</AppText>
      </Card>
      <Field label="One-time PIN" value={entry} onChangeText={t => setEntry(t.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={6} />
      {error ? <AppText color={colors.negative}>{error}</AppText> : null}
      <Button label="Confirm" onPress={confirm} disabled={entry.length !== 6} />
      <Button label="Send a new PIN" variant="secondary" onPress={resend} />
    </Screen>
  );
}
