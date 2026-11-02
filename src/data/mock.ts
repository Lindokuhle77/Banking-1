export type Category = 'groceries' | 'fuel' | 'transport' | 'entertainment' | 'utilities' | 'income' | 'shopping' | 'transfer' | 'airtime' | 'dining';
export type Account = {
  id: string; name: string; type: 'cheque' | 'savings' | 'credit'; number: string; balance: number;
  institutionId?: string; institutionName?: string; connectionId?: string; // set for accounts linked from other banks
};
export type Transaction = { id: string; accountId: string; date: string; description: string; category: Category; amount: number };

export const accounts: Account[] = [
  { id: 'chq', name: 'Cheque account', type: 'cheque', number: '•••• 4821', balance: 24580.5 },
  { id: 'sav', name: 'Savings pocket', type: 'savings', number: '•••• 9037', balance: 61250.0 },
  { id: 'crd', name: 'Credit card', type: 'credit', number: '•••• 7714', balance: -3420.75 },
];

// [accountId, daysAgo, description, category, amount (negative = money out)]
const seed: [string, number, string, Category, number][] = [
  ['chq', 0, 'Woolworths Food', 'groceries', -412.35],
  ['chq', 0, 'Engen Garage', 'fuel', -850.0],
  ['chq', 1, 'Uber trip', 'transport', -96.5],
  ['chq', 1, 'Netflix', 'entertainment', -199.0],
  ['chq', 2, 'Vodacom airtime', 'airtime', -100.0],
  ['chq', 3, 'Checkers', 'groceries', -689.9],
  ['chq', 4, 'Salary: Acme Holdings', 'income', 28500.0],
  ['chq', 5, 'Prepaid electricity', 'utilities', -300.0],
  ['chq', 6, 'Spur Steak Ranches', 'dining', -348.0],
  ['chq', 8, 'Takealot order', 'shopping', -1299.0],
  ['chq', 9, 'Transfer to Savings pocket', 'transfer', -2000.0],
  ['chq', 11, 'Shoprite', 'groceries', -534.2],
  ['chq', 13, 'Bolt ride', 'transport', -74.0],
  ['chq', 15, 'Refund: Takealot', 'shopping', 249.0],
  ['sav', 9, 'Transfer from Cheque account', 'transfer', 2000.0],
  ['sav', 20, 'Interest earned', 'income', 214.4],
  ['sav', 31, 'Transfer from Cheque account', 'transfer', 2000.0],
  ['crd', 0, 'Mugg & Bean', 'dining', -186.5],
  ['crd', 2, 'Dis-Chem', 'shopping', -421.75],
  ['crd', 5, 'Showmax', 'entertainment', -99.0],
  ['crd', 7, 'Pick n Pay', 'groceries', -1103.0],
  ['crd', 12, 'Payment received', 'transfer', 1500.0],
];

export const transactions: Transaction[] = seed
  .map(([accountId, daysAgo, description, category, amount], i) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - daysAgo);
    return { id: 't' + (i + 1), accountId, date: d.toISOString(), description, category, amount };
  })
  .sort((a, b) => b.date.localeCompare(a.date));

export type Beneficiary = { id: string; name: string; bank: string; accountNumber: string };
export const BANKS = ['Capitec', 'Absa', 'Standard Bank', 'Nedbank', 'FNB'];
export const beneficiaries: Beneficiary[] = [
  { id: 'b1', name: 'Thabo Ndlovu', bank: 'Capitec', accountNumber: '1470258369' },
  { id: 'b2', name: 'Palesa Molefe', bank: 'Nedbank', accountNumber: '1159263748' },
  { id: 'b3', name: 'Mkhize Properties (rent)', bank: 'Absa', accountNumber: '4087712356' },
];

export type BankCard = { id: string; name: string; type: 'debit' | 'credit'; last4: string; frozen: boolean; online: boolean; international: boolean };
export const cards: BankCard[] = [
  { id: 'c1', name: 'Cheque debit card', type: 'debit', last4: '4821', frozen: false, online: true, international: false },
  { id: 'c2', name: 'Credit card', type: 'credit', last4: '7714', frozen: false, online: true, international: true },
];

export type AppNotification = { id: string; title: string; body: string; date: string; read: boolean };
export const notifications: AppNotification[] = [
  { id: 'n0', title: 'Welcome to Khaya Bank', body: 'This is a concept app. All data is mocked.', date: new Date().toISOString(), read: false },
];
