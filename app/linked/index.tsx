import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { AppText } from '../../src/components/AppText';
import { Button } from '../../src/components/Button';
import { BackLink } from '../../src/components/BackLink';
import { colors, spacing } from '../../src/theme/tokens';
import { formatZAR } from '../../src/lib/format';
import { useBank } from '../../src/bank/BankContext';
import { aggregator, apiMode, Connection } from '../../src/aggregator/client';

export default function LinkedBanks() {
  useTheme();
  const router = useRouter();
  const { connections, accounts, removeConnection, replaceConnectionData } = useBank();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fail = (e: unknown) => setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');

  const refresh = async (c: Connection) => {
    setBusy(c.id); setError('');
    try { replaceConnectionData(c.id, await aggregator.fetchData(c)); } catch (e) { fail(e); } finally { setBusy(null); }
  };

  const disconnect = async (c: Connection) => {
    if (confirmId !== c.id) { setConfirmId(c.id); return; }
    setBusy(c.id); setError('');
    try { await aggregator.revoke(c.id); removeConnection(c.id); } catch (e) { fail(e); } finally { setBusy(null); setConfirmId(null); }
  };

  return (
    <Screen>
      <BackLink label="More" />
      <AppText variant="title">Linked banks</AppText>
      <Card style={{ gap: spacing.xs }}>
        <AppText variant="label">{apiMode === 'server' ? 'Data source: demo server' : 'Data source: built-in demo'}</AppText>
        <AppText variant="small" color={colors.muted}>Concept only. No real bank is contacted, and linked accounts are view-only: payments always come from your Khaya accounts.</AppText>
      </Card>
      {error ? <AppText color={colors.negative}>{error}</AppText> : null}

      {connections.length === 0 ? (
        <AppText color={colors.muted}>No banks linked yet. Link one to see all your accounts in one place.</AppText>
      ) : (
        connections.map(c => {
          const accs = accounts.filter(a => a.connectionId === c.id);
          const total = accs.reduce((s, a) => s + a.balance, 0);
          const isBusy = busy === c.id;
          return (
            <Card key={c.id} style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <AppText variant="label">{c.institutionName}</AppText>
                <AppText variant="label">{formatZAR(total)}</AppText>
              </View>
              <AppText variant="small" color={colors.muted}>
                {accs.length} accounts, linked {new Date(c.linkedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}. Access lasts 90 days.
              </AppText>
              <Button label={isBusy ? 'Working...' : 'Refresh data'} variant="secondary" disabled={!!busy} onPress={() => refresh(c)} />
              <Button label={confirmId === c.id ? 'Tap again to disconnect' : 'Disconnect'} variant="secondary" disabled={!!busy} onPress={() => disconnect(c)} />
            </Card>
          );
        })
      )}
      <Button label="Link a bank" onPress={() => router.push('/linked/choose')} />
    </Screen>
  );
}
