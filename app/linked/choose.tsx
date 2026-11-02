import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { AppText } from '../../src/components/AppText';
import { Button } from '../../src/components/Button';
import { BackLink } from '../../src/components/BackLink';
import { colors, radius, spacing } from '../../src/theme/tokens';
import { useBank } from '../../src/bank/BankContext';
import { aggregator, Institution } from '../../src/aggregator/client';

export default function ChooseBank() {
  useTheme();
  const router = useRouter();
  const { connections } = useBank();
  const [list, setList] = useState<Institution[] | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    setError(''); setList(null);
    aggregator.listInstitutions().then(setList).catch(e => setError(e instanceof Error ? e.message : 'Could not load banks.'));
  };
  useEffect(load, []);

  return (
    <Screen>
      <BackLink label="Linked banks" />
      <AppText variant="title">Choose a bank</AppText>
      {error ? (
        <>
          <AppText color={colors.negative}>{error}</AppText>
          <Button label="Try again" variant="secondary" onPress={load} />
        </>
      ) : !list ? (
        <AppText color={colors.muted}>Loading banks...</AppText>
      ) : (
        <Card style={{ paddingVertical: spacing.xs }}>
          {list.map(i => {
            const linked = connections.some(c => c.institutionId === i.id);
            return (
              <Pressable
                key={i.id}
                accessibilityRole="button"
                accessibilityState={{ disabled: linked }}
                accessibilityLabel={linked ? `${i.name}, already linked` : `Link ${i.name}`}
                disabled={linked}
                onPress={() => router.push(`/linked/consent?institutionId=${i.id}`)}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 14, opacity: linked ? 0.5 : pressed ? 0.7 : 1 })}
              >
                <View style={{ width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' }}>
                  <AppText variant="label" color={colors.link}>{i.name[0]}</AppText>
                </View>
                <View style={{ flex: 1 }}><AppText>{i.name}</AppText></View>
                <AppText variant="small" color={colors.muted}>{linked ? 'Linked' : 'Link'}</AppText>
              </Pressable>
            );
          })}
        </Card>
      )}
    </Screen>
  );
}
