import { buildConnectionData } from '../shared/mockData';
import { aggregator } from '../src/aggregator/client';

describe('mock bank data', () => {
  it('is the same every time for the same bank', () => {
    const now = Date.UTC(2026, 9, 31);
    expect(buildConnectionData('capitec', now)).toEqual(buildConnectionData('capitec', now));
  });
  it('gives each account a unique id and links every transaction to an account', () => {
    const { accounts, transactions } = buildConnectionData('absa');
    const ids = accounts.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(transactions.every(t => ids.includes(t.accountId))).toBe(true);
  });
});

describe('built-in aggregator', () => {
  it('lists banks', async () => {
    expect((await aggregator.listInstitutions()).length).toBeGreaterThanOrEqual(4);
  });
  it('links a bank after consent and tags the accounts with the bank', async () => {
    const offer = await aggregator.startLink('nedbank');
    expect(offer.scopes.length).toBeGreaterThan(0);
    const { connection, data } = await aggregator.approveLink(offer.consentId);
    expect(connection.institutionName).toBe('Nedbank');
    expect(data.accounts.every(a => a.institutionId === 'nedbank' && a.connectionId === connection.id)).toBe(true);
  });
  it('rejects an unknown bank and a reused consent', async () => {
    await expect(aggregator.startLink('nope')).rejects.toThrow();
    const offer = await aggregator.startLink('fnb');
    await aggregator.approveLink(offer.consentId);
    await expect(aggregator.approveLink(offer.consentId)).rejects.toThrow();
  });
});

describe('sessions', () => {
  it('signs in with the demo user and rejects a wrong password', async () => {
    const { signIn } = await import('../src/aggregator/client');
    expect(await signIn('demo', 'Khaya@2026')).toBe('ok');
    expect(await signIn('demo', 'wrong')).toBe('invalid');
  });
  it('returns a list of saved connections', async () => {
    expect(Array.isArray(await aggregator.listConnections())).toBe(true);
  });
});
