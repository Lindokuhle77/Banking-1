import { buildConnectionData, demoUser, institutions as INSTITUTIONS, SCOPES } from '../../shared/mockData';
import { storage } from '../lib/storage';
import type { Account, Transaction } from '../data/mock';

export type Institution = { id: string; name: string };
export type Connection = { id: string; institutionId: string; institutionName: string; linkedAt: string };
export type LinkOffer = { consentId: string; institutionId: string; institutionName: string; scopes: string[]; expiresInDays: number };
export type ConnectionData = { accounts: Account[]; transactions: Transaction[] };
export type SignInResult = 'ok' | 'invalid' | 'limited' | 'unavailable';

// Set EXPO_PUBLIC_API_URL to use the mock server in /server. Otherwise the built-in demo provider is used.
const API = process.env.EXPO_PUBLIC_API_URL ? process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '') : '';
export const apiMode: 'server' | 'built-in' = API ? 'server' : 'built-in';

const pause = (ms: number) => new Promise<void>(r => setTimeout(r, process.env.JEST_WORKER_ID ? 0 : ms));
const safe = {
  async get(k: string) { try { return await storage.get(k); } catch { return null; } },
  async set(k: string, v: string) { try { await storage.set(k, v); } catch { /* storage unavailable */ } },
  async remove(k: string) { try { await storage.remove(k); } catch { /* storage unavailable */ } },
};
const UNREACHABLE = 'Could not reach the demo server. Check that it is running, or remove EXPO_PUBLIC_API_URL to use the built-in demo.';

const tag = (c: Connection, d: ReturnType<typeof buildConnectionData>): ConnectionData => ({
  accounts: d.accounts.map(a => ({ ...a, institutionId: c.institutionId, institutionName: c.institutionName, connectionId: c.id })),
  transactions: d.transactions as Transaction[],
});

// ================= built-in demo provider (no server needed) =================
const consents = new Map<string, Institution>();
let counter = 0;
const CONN_KEY = 'khaya.connections';

async function savedConnections(): Promise<Connection[]> {
  try { return JSON.parse((await safe.get(CONN_KEY)) ?? '[]'); } catch { return []; }
}

const local = {
  async listInstitutions(): Promise<Institution[]> { await pause(300); return INSTITUTIONS; },
  async listConnections(): Promise<Connection[]> { return savedConnections(); },
  async startLink(institutionId: string): Promise<LinkOffer> {
    await pause(400);
    const inst = INSTITUTIONS.find(i => i.id === institutionId);
    if (!inst) throw new Error('We do not support that bank yet.');
    const consentId = 'consent_' + ++counter;
    consents.set(consentId, inst);
    return { consentId, institutionId: inst.id, institutionName: inst.name, scopes: SCOPES, expiresInDays: 90 };
  },
  async approveLink(consentId: string): Promise<{ connection: Connection; data: ConnectionData }> {
    await pause(800);
    const inst = consents.get(consentId);
    if (!inst) throw new Error('This request has expired. Start again.');
    consents.delete(consentId);
    const connection = { id: 'conn_' + Date.now().toString(36) + ++counter, institutionId: inst.id, institutionName: inst.name, linkedAt: new Date().toISOString() };
    await safe.set(CONN_KEY, JSON.stringify([...(await savedConnections()), connection]));
    return { connection, data: tag(connection, buildConnectionData(inst.id)) };
  },
  async fetchData(c: Connection): Promise<ConnectionData> { await pause(600); return tag(c, buildConnectionData(c.institutionId)); },
  async revoke(id: string): Promise<void> {
    await pause(300);
    await safe.set(CONN_KEY, JSON.stringify((await savedConnections()).filter(c => c.id !== id)));
  },
};

// ================= HTTP provider (talks to server/index.js) =================
let token: string | null = null;
const getToken = async () => (token === null ? (token = (await safe.get('khaya.token')) ?? '') : token);

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const t = await getToken();
  let res: Response;
  try {
    res = await fetch(API + path, { ...init, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) } });
  } catch {
    throw new Error(UNREACHABLE);
  }
  if (res.status === 401) throw new Error('Your session has expired. Sign out and sign in again.');
  if (!res.ok) {
    const body = await res.json().catch(() => ({} as { error?: string }));
    throw new Error(body.error ?? `Request failed (${res.status}). Try again.`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const remote: typeof local = {
  listInstitutions: () => http<Institution[]>('/institutions'),
  listConnections: () => http<Connection[]>('/connections'),
  startLink: institutionId => http<LinkOffer>('/links', { method: 'POST', body: JSON.stringify({ institutionId }) }),
  async approveLink(consentId) {
    const r = await http<{ connection: Connection; data: ReturnType<typeof buildConnectionData> }>(`/links/${consentId}/approve`, { method: 'POST' });
    return { connection: r.connection, data: tag(r.connection, r.data) };
  },
  async fetchData(c) { return tag(c, await http(`/connections/${c.id}/data`)); },
  revoke: id => http<void>(`/connections/${id}`, { method: 'DELETE' }),
};

export const aggregator = API ? remote : local;

// ================= sign-in / sign-out =================
export async function signIn(username: string, password: string): Promise<SignInResult> {
  if (!API) return username === demoUser.username && password === demoUser.password ? 'ok' : 'invalid';
  try {
    const res = await fetch(API + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    if (res.status === 401) return 'invalid';
    if (res.status === 429) return 'limited';
    if (!res.ok) return 'unavailable';
    token = (await res.json()).token as string;
    await safe.set('khaya.token', token);
    return 'ok';
  } catch {
    return 'unavailable';
  }
}

export async function signOutSession(): Promise<void> {
  if (!API) { await safe.remove(CONN_KEY); return; }
  try { await http<void>('/auth/logout', { method: 'POST' }); } catch { /* already expired or unreachable */ }
  token = null;
  await safe.remove('khaya.token');
}
