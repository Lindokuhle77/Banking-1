import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeContext';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { AppText } from '../../src/components/AppText';
import { Button } from '../../src/components/Button';
import { BackLink } from '../../src/components/BackLink';
import { colors, spacing } from '../../src/theme/tokens';
import { useBank } from '../../src/bank/BankContext';
import { aggregator, LinkOffer } from '../../src/aggregator/client';

export default function Consent() {
  useTheme();
  const { institutionId } = useLocalSearchParams<{ institutionId: string }>();
  const router = useRouter();
  const { addConnection } = useBank();
  const [offer, setOffer] = useState<LinkOffer | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    aggregator.startLink(String(institutionId)).then(setOffer).catch(e => setError(e instanceof Error ? e.message : 'Could not start linking.'));
  }, [institutionId]);

  const approve = async () => {
    if (!offer) return;
    setWorking(true); setError('');
    try {
      const { connection, data } = await aggregator.approveLink(offer.consentId);
      addConnection(connection, data);
      router.replace('/linked');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not link this bank. Try again.');
      setWorking(false);
    }
  };

  return (
    <Screen>
      <BackLink label="Banks" />
      {!offer && !error ? (
        <AppText color={colors.muted}>Contacting the bank...</AppText>
      ) : offer ? (
        <>
          <AppText variant="title">Allow Khaya Bank to view your {offer.institutionName} accounts?</AppText>
          <Card style={{ gap: spacing.sm }}>
            {offer.scopes.map(s => (
              <View key={s} style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
                <Ionicons name="checkmark-circle" size={20} color={colors.positive} />
                <AppText style={{ flex: 1 }}>{s}</AppText>
              </View>
            ))}
            <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
              <Ionicons name="close-circle" size={20} color={colors.negative} />
              <AppText style={{ flex: 1 }}>Make payments or change anything on these accounts</AppText>
            </View>
          </Card>
          <AppText color={colors.muted}>Access lasts {offer.expiresInDays} days. You can disconnect at any time in Linked banks.</AppText>
          <Card style={{ backgroundColor: colors.paper }}>
            <AppText variant="small" color={colors.muted}>
              Demo mode: in a real app you would be sent to {offer.institutionName}'s own sign-in page to approve this, so Khaya Bank never sees your bank password.
            </AppText>
          </Card>
        </>
      ) : null}
      {error ? <AppText color={colors.negative}>{error}</AppText> : null}
      {offer && <Button label={working ? 'Linking...' : 'Allow access'} onPress={approve} disabled={working} />}
      <Button label="Cancel" variant="secondary" onPress={() => router.replace('/linked')} disabled={working} />
    </Screen>
  );
}
