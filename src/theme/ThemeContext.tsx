import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { applyPalette } from './tokens';
import { storage } from '../lib/storage';

export type Pref = 'system' | 'light' | 'dark';
type Ctx = { pref: Pref; scheme: 'light' | 'dark'; setPref: (p: Pref) => void };
const ThemeCtx = createContext<Ctx>({ pref: 'system', scheme: 'light', setPref: () => {} });
export const useTheme = () => useContext(ThemeCtx);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [pref, setPrefState] = useState<Pref>('system');

  useEffect(() => {
    storage.get('khaya.theme').then(v => { if (v === 'light' || v === 'dark' || v === 'system') setPrefState(v); });
  }, []);

  const scheme = pref === 'system' ? (system === 'dark' ? 'dark' : 'light') : pref;
  applyPalette(scheme);

  const value = useMemo<Ctx>(() => ({
    pref, scheme,
    setPref: (p: Pref) => { setPrefState(p); storage.set('khaya.theme', p); },
  }), [pref, scheme]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
