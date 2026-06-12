import { Platform } from 'react-native';

// localStorage on web; in-memory on native (swap for AsyncStorage to persist).
const memory = new Map<string, string>();

export function getItem(key: string): string | null {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }
  return memory.get(key) ?? null;
}

export function setItem(key: string, value: string): void {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
    return;
  }
  memory.set(key, value);
}

export function removeItem(key: string): void {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    localStorage.removeItem(key);
    return;
  }
  memory.delete(key);
}
