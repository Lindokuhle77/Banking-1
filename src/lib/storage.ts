import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Native: encrypted device storage. Web: localStorage (concept project only).
export const storage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try { return localStorage.getItem(key); } catch { return null; }
    }
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string) {
    if (Platform.OS === 'web') { try { localStorage.setItem(key, value); } catch {} return; }
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string) {
    if (Platform.OS === 'web') { try { localStorage.removeItem(key); } catch {} return; }
    await SecureStore.deleteItemAsync(key);
  },
};
