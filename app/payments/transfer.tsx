import { useTheme } from '../../src/theme/ThemeContext';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { AppText } from '../../src/components/AppText';
import { Field } from '../../src/components/Field';
import { Button } from '../../src/components/Button';
import { BackLink } from '../../src/components/BackLink';
import { ChipGroup } from '../../src/components/ChipGroup';
import { colors } from '../../src/theme/tokens';
import { formatZAR } from '../../src/lib/format';
import { parseAmount } from '../../src/lib/amount';
import { PAYMENT_LIMIT, useBank } from '../../src/bank/BankContext';

export default function Transfer() {
  useTheme();
  const router = useRouter();
  const { accounts, setPending } = useBank();
  const sources = accounts.filter(a => a.type !== 'credit' && !a.institutionId);
  const [fromId, setFromId] = useState(sources[0].id);
  const [toPick, setToPick] = useState(sources[1].id);
  const [amountText, setAmountText] = useState('');
  const [error, setError] = useState('');

  const targets = accounts.filter(a => a.id !== fromId && !a.institutionId);
  const toId = targets.some(a => a.id === toPick) ? toPick : targets[0].id;

  const next = () => {
    const amount = parseAmount(amountText);
    const from = accounts.find(a => a.id === fromId)!;
    const to = accounts.find(a => a.id === toId)!;
    if (!(amount > 0)) return setError('Enter an amount greater than R 0.00.');
    if (amount > PAYMENT_LIMIT) return setError(`The limit is ${formatZAR(PAYMENT_LIMIT)} per transfer.`);
    if (amount > from.balance) return setError(`${from.name} has ${formatZAR(from.balance)} available. Enter a smaller amount.`);
    if (to.type === 'credit' && amount > Math.abs(to.balance)) return setError(`You only owe ${formatZAR(Math.abs(to.balance))} on this card. Enter that or less.`);
    setError('');
    setPending({ kind: 'transfer', fromId, toId, amount });
    router.push('/payments/confirm');
  };

  return (
    <Screen>
      <BackLink label="Pay" />
      <AppText variant="title">Transfer between my accounts</AppText>
      <ChipGroup label="From" options={sources.map(a => ({ key: a.id, label: `${a.name}: ${formatZAR(a.balance)}` }))} value={fromId} onChange={setFromId} />
      <ChipGroup label="To" options={targets.map(a => ({ key: a.id, label: a.name }))} value={toId} onChange={setToPick} />
      <Field label="Amount (R)" value={amountText} onChangeText={setAmountText} keyboardType="decimal-pad" placeholder="0.00" />
      {error ? <AppText color={colors.negative}>{error}</AppText> : null}
      <Button label="Review transfer" onPress={next} />
    </Screen>
  );
}
