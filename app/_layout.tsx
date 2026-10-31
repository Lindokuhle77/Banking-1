import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../src/auth/AuthContext';
import { BankProvider } from '../src/bank/BankContext';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';

const TARGET = { signedOut: '/login', needsPin: '/set-pin', locked: '/unlock', unlocked: '/' } as const;
const SEGMENT = { signedOut: 'login', needsPin: 'set-pin', locked: 'unlock', unlocked: '(tabs)' } as const;

function Guard() {
  const { status, touch } = useAuth();
  const { scheme } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (status === 'loading') return;
    const seg = segments[0] as string | undefined;
    const authScreens = ['login', 'set-pin', 'unlock'];
    const ok = status === 'unlocked' ? !authScreens.includes(seg ?? '') : seg === SEGMENT[status];
    if (!ok) router.replace(TARGET[status]);
  }, [status, segments]);

  if (status === 'loading') return null;
  return (
    <View style={{ flex: 1 }} onStartShouldSetResponderCapture={() => { touch(); return false; }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

export default function RootLayout() {
  return <ThemeProvider><AuthProvider><BankProvider><Guard /></BankProvider></AuthProvider></ThemeProvider>;
}
