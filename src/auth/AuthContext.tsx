import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { storage } from '../lib/storage';
import { demoUser } from '../../shared/mockData';
import { signIn, signOutSession, SignInResult } from '../aggregator/client';

export type Status = 'loading' | 'signedOut' | 'needsPin' | 'locked' | 'unlocked';
export const DEMO = demoUser; // mock credentials
const IDLE_MS = 2 * 60 * 1000;     // lock after 2 minutes without touch
const BACKGROUND_MS = 30 * 1000;   // lock if app was backgrounded for 30 seconds
const MAX_TRIES = 3;

type Ctx = {
  status: Status;
  login: (u: string, p: string) => Promise<SignInResult>;
  setPin: (pin: string) => Promise<void>;
  unlockWithPin: (pin: string) => Promise<'ok' | 'wrong' | 'locked_out'>;
  unlockWithBiometrics: () => Promise<boolean>;
  lock: () => void;
  logout: () => Promise<void>;
  touch: () => void;
};
const AuthCtx = createContext<Ctx>({ status: 'loading' } as unknown as Ctx);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const tries = useRef(0);
  const idle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hiddenAt = useRef(0);

  useEffect(() => {
    (async () => {
      const [user, pin] = await Promise.all([storage.get('khaya.user'), storage.get('khaya.pin')]);
      setStatus(user && pin ? 'locked' : 'signedOut');
    })();
  }, []);

  const lock = useCallback(() => setStatus(s => (s === 'unlocked' ? 'locked' : s)), []);
  const touch = useCallback(() => {
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(lock, IDLE_MS);
  }, [lock]);

  useEffect(() => {
    if (status === 'unlocked') touch();
    else if (idle.current) clearTimeout(idle.current);
  }, [status, touch]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') {
        if (hiddenAt.current && Date.now() - hiddenAt.current > BACKGROUND_MS) lock();
        hiddenAt.current = 0;
      } else if (!hiddenAt.current) hiddenAt.current = Date.now();
    });
    return () => sub.remove();
  }, [lock]);

  const value = useMemo<Ctx>(() => ({
    status,
    async login(u, p) {
      const result = await signIn(u.trim().toLowerCase(), p);
      if (result !== 'ok') return result;
      await storage.set('khaya.user', DEMO.username);
      tries.current = 0;
      setStatus((await storage.get('khaya.pin')) ? 'unlocked' : 'needsPin');
      return 'ok';
    },
    async setPin(pin) {
      await storage.set('khaya.pin', pin);
      setStatus('unlocked');
    },
    async unlockWithPin(pin) {
      if (pin === (await storage.get('khaya.pin'))) { tries.current = 0; setStatus('unlocked'); return 'ok'; }
      tries.current += 1;
      if (tries.current >= MAX_TRIES) {
        await storage.remove('khaya.user'); await storage.remove('khaya.pin'); await signOutSession();
        tries.current = 0; setStatus('signedOut');
        return 'locked_out';
      }
      return 'wrong';
    },
    async unlockWithBiometrics() {
      if (Platform.OS === 'web') return false;
      const ready = (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
      if (!ready) return false;
      const r = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock Khaya Bank' });
      if (r.success) { tries.current = 0; setStatus('unlocked'); }
      return r.success;
    },
    lock,
    async logout() {
      await storage.remove('khaya.user'); await storage.remove('khaya.pin'); await signOutSession();
      setStatus('signedOut');
    },
    touch,
  }), [status, lock, touch]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
