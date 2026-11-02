import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { BankProvider, useBank } from '../src/bank/BankContext';
import { aggregator } from '../src/aggregator/client';

const wrapper = ({ children }: { children: ReactNode }) => <BankProvider>{children}</BankProvider>;

async function link(result: { current: ReturnType<typeof useBank> }, id: string) {
  const offer = await aggregator.startLink(id);
  const { connection, data } = await aggregator.approveLink(offer.consentId);
  act(() => result.current.addConnection(connection, data));
  return connection;
}

describe('linked banks', () => {
  it('merges a linked bank into accounts and transactions', async () => {
    const { result } = renderHook(() => useBank(), { wrapper });
    const before = result.current.transactions.length;
    await link(result, 'capitec');
    expect(result.current.connections).toHaveLength(1);
    expect(result.current.accounts.some(a => a.institutionId === 'capitec')).toBe(true);
    expect(result.current.transactions.length).toBeGreaterThan(before);
  });

  it('removes all of a bank’s data when it is disconnected', async () => {
    const { result } = renderHook(() => useBank(), { wrapper });
    const accountsBefore = result.current.accounts.length;
    const txBefore = result.current.transactions.length;
    const c = await link(result, 'absa');
    act(() => result.current.removeConnection(c.id));
    expect(result.current.connections).toHaveLength(0);
    expect(result.current.accounts).toHaveLength(accountsBefore);
    expect(result.current.transactions).toHaveLength(txBefore);
  });
});
