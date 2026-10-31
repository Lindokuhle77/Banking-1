import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { BankProvider, useBank } from '../src/bank/BankContext';

const wrapper = ({ children }: { children: ReactNode }) => <BankProvider>{children}</BankProvider>;
const balance = (r: ReturnType<typeof useBank>, id: string) => r.accounts.find(a => a.id === id)!.balance;

describe('payments', () => {
  it('pays a beneficiary, lowers the balance and records a transaction', () => {
    const { result } = renderHook(() => useBank(), { wrapper });
    act(() => result.current.setPending({ kind: 'pay', fromId: 'chq', beneficiaryId: 'b1', amount: 100, reference: 'Test' }));
    let res: { ok: boolean } = { ok: false };
    act(() => { res = result.current.execute(); });
    expect(res.ok).toBe(true);
    expect(balance(result.current, 'chq')).toBe(24480.5);
    expect(result.current.transactions[0].description).toBe('Payment to Thabo Ndlovu');
    expect(result.current.pending).toBeNull();
  });

  it('refuses a payment above the available balance', () => {
    const { result } = renderHook(() => useBank(), { wrapper });
    act(() => result.current.setPending({ kind: 'pay', fromId: 'chq', beneficiaryId: 'b1', amount: 999999, reference: 'Too much' }));
    let res: { ok: boolean } = { ok: true };
    act(() => { res = result.current.execute(); });
    expect(res.ok).toBe(false);
    expect(balance(result.current, 'chq')).toBe(24580.5);
  });

  it('moves money between accounts', () => {
    const { result } = renderHook(() => useBank(), { wrapper });
    act(() => result.current.setPending({ kind: 'transfer', fromId: 'chq', toId: 'sav', amount: 500 }));
    act(() => { result.current.execute(); });
    expect(balance(result.current, 'chq')).toBe(24080.5);
    expect(balance(result.current, 'sav')).toBe(61750);
  });
});

describe('cards and notifications', () => {
  it('freezing a card adds an unread notification', () => {
    const { result } = renderHook(() => useBank(), { wrapper });
    const before = result.current.unreadCount;
    act(() => result.current.toggleCard('c1', 'frozen'));
    expect(result.current.cards[0].frozen).toBe(true);
    expect(result.current.unreadCount).toBe(before + 1);
  });
});
