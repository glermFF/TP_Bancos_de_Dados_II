import { Platform } from 'react-native';

const memory = new Map<string, string>();
const hasLocalStorage = () => Platform.OS === 'web' && typeof localStorage !== 'undefined';

export function getItem(key: string): string | null {
  return hasLocalStorage() ? localStorage.getItem(key) : memory.get(key) ?? null;
}

export function setItem(key: string, value: string): void {
  if (hasLocalStorage()) localStorage.setItem(key, value);
  else memory.set(key, value);
}

export function removeItem(key: string): void {
  if (hasLocalStorage()) localStorage.removeItem(key);
  else memory.delete(key);
}
