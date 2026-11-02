// Deterministic fake bank data. Used by the in-app demo provider and by server/index.js.
const institutions = [
  { id: 'capitec', name: 'Capitec' },
  { id: 'absa', name: 'Absa' },
  { id: 'standardbank', name: 'Standard Bank' },
  { id: 'nedbank', name: 'Nedbank' },
  { id: 'fnb', name: 'FNB' },
];

// Demo sign-in only. A real bank never ships credentials like this.
const demoUser = { username: 'demo', password: 'Khaya@2026' };

const SCOPES = ['See your account names and numbers', 'See your balances', 'See your recent transactions'];

const MERCHANTS = [
  ['Pick n Pay', 'groceries', 150, 900], ['Checkers', 'groceries', 120, 800], ['Engen', 'fuel', 400, 900],
  ['Uber', 'transport', 50, 200], ['Netflix', 'entertainment', 99, 199], ['Vodacom airtime', 'airtime', 50, 300],
  ['Dis-Chem', 'shopping', 100, 600], ['Mugg & Bean', 'dining', 90, 300], ['Prepaid electricity', 'utilities', 200, 600],
  ['Takealot', 'shopping', 200, 1500],
];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const money = x => Math.round(x * 100) / 100;

function buildConnectionData(institutionId, now = Date.now()) {
  const rand = rng(hash(institutionId));
  const between = (a, b) => a + rand() * (b - a);
  const dateAgo = days => { const d = new Date(now); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - days); return d.toISOString(); };
  const num = () => '•••• ' + (1000 + Math.floor(rand() * 9000));

  const accounts = [
    { id: `${institutionId}-chq`, name: 'Cheque account', type: 'cheque', number: num(), balance: money(between(3000, 30000)) },
    { id: `${institutionId}-sav`, name: 'Savings account', type: 'savings', number: num(), balance: money(between(5000, 80000)) },
  ];
  if (hash(institutionId) % 2 === 0) {
    accounts.push({ id: `${institutionId}-crd`, name: 'Credit card', type: 'credit', number: num(), balance: -money(between(500, 6000)) });
  }

  const transactions = [];
  for (const acc of accounts) {
    const key = acc.id;
    let i = 0;
    const push = (days, description, category, amount) =>
      transactions.push({ id: `${key}-${i++}`, accountId: acc.id, date: dateAgo(days), description, category, amount: money(amount) });
    if (acc.type === 'cheque') push(3 + Math.floor(rand() * 3), 'Salary', 'income', between(15000, 30000));
    if (acc.type === 'savings') {
      push(Math.floor(between(18, 24)), 'Interest earned', 'income', between(80, 300));
      push(Math.floor(between(5, 12)), 'Transfer in', 'transfer', between(500, 2500));
    } else {
      const count = 10 + Math.floor(rand() * 5);
      for (let k = 0; k < count; k++) {
        const [name, category, lo, hi] = MERCHANTS[Math.floor(rand() * MERCHANTS.length)];
        push(Math.floor(rand() * 28), name, category, -between(lo, hi));
      }
    }
  }
  transactions.sort((a, b) => b.date.localeCompare(a.date));
  return { accounts, transactions };
}

module.exports = { institutions, SCOPES, buildConnectionData, demoUser };
