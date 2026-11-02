export type MockInstitution = { id: string; name: string };
export type MockAccount = { id: string; name: string; type: 'cheque' | 'savings' | 'credit'; number: string; balance: number };
export type MockTransaction = { id: string; accountId: string; date: string; description: string; category: string; amount: number };
export const institutions: MockInstitution[];
export const SCOPES: string[];
export const demoUser: { username: string; password: string };
export function buildConnectionData(institutionId: string, now?: number): { accounts: MockAccount[]; transactions: MockTransaction[] };
