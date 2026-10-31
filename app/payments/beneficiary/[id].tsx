import { useTheme } from '../../../src/theme/ThemeContext';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../src/components/Screen';
import { AppText } from '../../../src/components/AppText';
import { Field } from '../../../src/components/Field';
import { Button } from '../../../src/components/Button';
import { BackLink } from '../../../src/components/BackLink';
import { ChipGroup } from '../../../src/components/ChipGroup';
import { colors } from '../../../src/theme/tokens';
import { formatZAR } from '../../../src/lib/format';
import { parseAmount } from '../../../src/lib/amount';
import { PAYMENT_LIMIT, useBank } from '../../../src/bank/BankContext';

export default function PayBeneficiary() {
  useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { accounts, beneficiaries, setPending } = useBank();
  const ben = beneficiaries.find(b => b.id === id);
  const payFrom = accounts.filter(a => a.type !== 'credit');
  const [fromId, setFromId] = useState(payFrom[0].id);
  const [amountText, setAmountText] = useState('');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  if (!ben) return <Screen><BackLink label="Pay" /><AppText>We could not find that beneficiary. Go back and choose another.</AppText></Screen>;

  const next = () => {
    const amount = parseAmount(amountText);
    const from = accounts.find(a => a.id === fromId)!;
    if (!(amount > 0)) return setError('Enter an amount greater than R 0.00.');
    if (amount > PAYMENT_LIMIT) return setError(`The limit is ${formatZAR(PAYMENT_LIMIT)} per payment.`);
    if (amount > from.balance) return setError(`${from.name} has ${formatZAR(from.balance)} available. Enter a smaller amount or pick another account.`);
    setError('');
    setPending({ kind: 'pay', fromId, beneficiaryId: ben.id, amount, reference: reference.trim() || 'Payment' });
    router.push('/payments/confirm');
  };

  return (
    <Screen>
      <BackLink label="Pay" />
      <AppText variant="title">Pay {ben.name}</AppText>
      <AppText color={colors.muted}>{ben.bank} •••• {ben.accountNumber.slice(-4)}</AppText>
      <ChipGroup label="Pay from" options={payFrom.map(a => ({ key: a.id, label: `${a.name}: ${formatZAR(a.balance)}` }))} value={fromId} onChange={setFromId} />
      <Field label="Amount (R)" value={amountText} onChangeText={setAmountText} keyboardType="decimal-pad" placeholder="0.00" />
      <Field label="Reference" value={reference} onChangeText={setReference} maxLength={30} placeholder="Shown on their statement" />
      {error ? <AppText color={colors.negative}>{error}</AppText> : null}
      <Button label="Review payment" onPress={next} />
    </Screen>
  );
}
