import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  accounts as seedAccounts, transactions as seedTx, beneficiaries as seedBen,
  cards as seedCards, notifications as seedNotes,
  Account, Beneficiary, Transaction, BankCard, AppNotification,
} from '../data/mock';
import { formatZAR } from '../lib/format';
import { aggregator } from '../aggregator/client';
import type { Connection, ConnectionData } from '../aggregator/client';
import { useAuth } from '../auth/AuthContext';

const sortDesc = (list: Transaction[]) => [...list].sort((a, b) => b.date.localeCompare(a.date));

export const PAYMENT_LIMIT = 10000;

export type Pending =
  | { kind: 'pay'; fromId: string; beneficiaryId: string; amount: number; reference: string }
  | { kind: 'transfer'; fromId: string; toId: string; amount: number };
export type Receipt = { title: string; amount: number; rows: { label: string; value: string }[] };

export function describe(p: Pending, accounts: Account[], bens: Beneficiary[]) {
  const from = accounts.find(a => a.id === p.fromId);
  const rows = [{ label: 'From', value: from ? `${from.name} ${from.number}` : '' }];
  if (p.kind === 'pay') {
    const b = bens.find(x => x.id === p.beneficiaryId);
    rows.push({ label: 'To', value: b ? `${b.name}, ${b.bank} ${b.accountNumber}` : '' });
    rows.push({ label: 'Amount', value: formatZAR(p.amount) });
    rows.push({ label: 'Reference', value: p.reference });
  } else {
    const to = accounts.find(a => a.id === p.toId);
    rows.push({ label: 'To', value: to ? `${to.name} ${to.number}` : '' });
    rows.push({ label: 'Amount', value: formatZAR(p.amount) });
  }
  return rows;
}

type Ctx = {
  accounts: Account[]; transactions: Transaction[]; beneficiaries: Beneficiary[];
  pending: Pending | null; receipt: Receipt | null;
  cards: BankCard[]; notifications: AppNotification[]; unreadCount: number;
  toggleCard: (id: string, key: 'frozen' | 'online' | 'international') => void;
  markAllRead: () => void;
  connections: Connection[];
  addConnection: (c: Connection, data: ConnectionData) => void;
  replaceConnectionData: (connectionId: string, data: ConnectionData) => void;
  removeConnection: (connectionId: string) => void;
  setPending: (p: Pending | null) => void;
  addBeneficiary: (name: string, bank: string, accountNumber: string) => string;
  execute: () => { ok: boolean; error?: string };
};
const BankCtx = createContext<Ctx>(null as unknown as Ctx);
export const useBank = () => useContext(BankCtx);

export function BankProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState(seedAccounts);
  const [transactions, setTransactions] = useState(seedTx);
  const [beneficiaries, setBeneficiaries] = useState(seedBen);
  const [pending, setPending] = useState<Pending | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [cards, setCards] = useState(seedCards);
  const [notifications, setNotifications] = useState(seedNotes);
  const [connections, setConnections] = useState<Connection[]>([]);
  const { status } = useAuth();
  const restored = useRef(false);

  useEffect(() => {
    if (status === 'signedOut') {
      restored.current = false;
      setAccounts(seedAccounts); setTransactions(seedTx); setBeneficiaries(seedBen); setCards(seedCards);
      setNotifications(seedNotes); setConnections([]); setPending(null); setReceipt(null);
      return;
    }
    if (status !== 'unlocked' || restored.current) return;
    restored.current = true;
    (async () => {
      try {
        const list = await aggregator.listConnections();
        const loaded = await Promise.all(list.map(async c => ({ c, data: await aggregator.fetchData(c) })));
        if (loaded.length === 0) return;
        setConnections(loaded.map(x => x.c));
        setAccounts(a => [...a.filter(x => !x.connectionId), ...loaded.flatMap(x => x.data.accounts)]);
        setTransactions(t => sortDesc([...loaded.flatMap(x => x.data.transactions), ...t.filter(x => !loaded.some(l => l.data.accounts.some(a => a.id === x.accountId)))]));
      } catch { /* the app stays usable without linked banks */ }
    })();
  }, [status]);

  const value = useMemo<Ctx>(() => ({
    accounts, transactions, beneficiaries, pending, receipt, setPending, cards, notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    connections,
    addConnection(c, data) {
      setConnections(list => [...list.filter(x => x.id !== c.id), c]);
      setAccounts(list => [...list.filter(a => a.connectionId !== c.id), ...data.accounts]);
      setTransactions(list => sortDesc([...data.transactions, ...list]));
      setNotifications(n => [{ id: 'n' + Date.now(), title: `${c.institutionName} linked`, body: `${data.accounts.length} accounts added`, date: new Date().toISOString(), read: false }, ...n]);
    },
    replaceConnectionData(connectionId, data) {
      const old = new Set(accounts.filter(a => a.connectionId === connectionId).map(a => a.id));
      setAccounts(list => [...list.filter(a => a.connectionId !== connectionId), ...data.accounts]);
      setTransactions(list => sortDesc([...data.transactions, ...list.filter(t => !old.has(t.accountId))]));
    },
    removeConnection(connectionId) {
      const c = connections.find(x => x.id === connectionId);
      const old = new Set(accounts.filter(a => a.connectionId === connectionId).map(a => a.id));
      setConnections(list => list.filter(x => x.id !== connectionId));
      setAccounts(list => list.filter(a => a.connectionId !== connectionId));
      setTransactions(list => list.filter(t => !old.has(t.accountId)));
      if (c) setNotifications(n => [{ id: 'n' + Date.now(), title: `${c.institutionName} disconnected`, body: 'Its accounts and transactions were removed from this app.', date: new Date().toISOString(), read: false }, ...n]);
    },
    markAllRead() { setNotifications(list => (list.some(n => !n.read) ? list.map(n => ({ ...n, read: true })) : list)); },
    toggleCard(id, key) {
      const card = cards.find(c => c.id === id);
      if (!card) return;
      const on = !card[key];
      const title = key === 'frozen' ? (on ? 'Card frozen' : 'Card unfrozen')
        : key === 'online' ? `Online purchases ${on ? 'on' : 'off'}` : `International use ${on ? 'on' : 'off'}`;
      setCards(list => list.map(c => (c.id === id ? { ...c, [key]: on } : c)));
      setNotifications(n => [{ id: 'n' + Date.now(), title, body: `${card.name} •••• ${card.last4}`, date: new Date().toISOString(), read: false }, ...n]);
    },
    addBeneficiary(name, bank, accountNumber) {
      const id = 'b' + Date.now();
      setBeneficiaries(list => [...list, { id, name: name.trim(), bank, accountNumber }]);
      return id;
    },
    execute() {
      if (!pending) return { ok: false, error: 'There is nothing to confirm. Start again from the Pay tab.' };
      const from = accounts.find(a => a.id === pending.fromId);
      if (!from || from.balance < pending.amount) return { ok: false, error: 'Your available balance is too low for this payment.' };
      const next = accounts.map(a => ({ ...a }));
      const adjust = (id: string, delta: number) => {
        const a = next.find(x => x.id === id)!;
        a.balance = Math.round((a.balance + delta) * 100) / 100;
      };
      const now = new Date().toISOString();
      const stamp = Date.now();
      let created: Transaction[];
      let title: string;
      adjust(from.id, -pending.amount);
      if (pending.kind === 'pay') {
        const b = beneficiaries.find(x => x.id === pending.beneficiaryId)!;
        title = 'Payment sent';
        created = [{ id: `t${stamp}`, accountId: from.id, date: now, description: `Payment to ${b.name}`, category: 'transfer', amount: -pending.amount }];
      } else {
        const to = accounts.find(x => x.id === pending.toId)!;
        adjust(to.id, pending.amount);
        title = 'Transfer complete';
        created = [
          { id: `t${stamp}a`, accountId: from.id, date: now, description: `Transfer to ${to.name}`, category: 'transfer', amount: -pending.amount },
          { id: `t${stamp}b`, accountId: to.id, date: now, description: `Transfer from ${from.name}`, category: 'transfer', amount: pending.amount },
        ];
      }
      setReceipt({ title, amount: pending.amount, rows: describe(pending, accounts, beneficiaries) });
      setNotifications(n => [{ id: 'n' + stamp, title, body: `${formatZAR(pending.amount)} from ${from.name}`, date: now, read: false }, ...n]);
      setAccounts(next);
      setTransactions(t => [...created, ...t]);
      setPending(null);
      return { ok: true };
    },
  }), [accounts, transactions, beneficiaries, pending, receipt, cards, notifications, connections]);

  return <BankCtx.Provider value={value}>{children}</BankCtx.Provider>;
}
