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
import { useBank } from '../../src/bank/BankContext';
import { BANKS } from '../../src/data/mock';

export default function NewBeneficiary() {
  useTheme();
  const router = useRouter();
  const { addBeneficiary } = useBank();
  const [name, setName] = useState('');
  const [bank, setBank] = useState(BANKS[0]);
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');

  const save = () => {
    if (name.trim().length < 2) return setError('Enter the beneficiary name.');
    if (number.length < 9 || number.length > 11) return setError('Account numbers have 9 to 11 digits. Check the number and try again.');
    const id = addBeneficiary(name, bank, number);
    router.replace(`/payments/beneficiary/${id}`);
  };

  return (
    <Screen>
      <BackLink label="Pay" />
      <AppText variant="title">Add beneficiary</AppText>
      <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
      <ChipGroup label="Bank" options={BANKS.map(b => ({ key: b, label: b }))} value={bank} onChange={setBank} />
      <Field label="Account number" value={number} onChangeText={t => setNumber(t.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={11} />
      {error ? <AppText color={colors.negative}>{error}</AppText> : null}
      <Button label="Save and pay" onPress={save} />
    </Screen>
  );
}
