import type { SessionStorageValues } from '../types/SessionStorage.js';
import { getSessionItem, removeSessionItem, setSessionItem } from '../utils/storage.js';

export function useSessionStorage<Key extends keyof SessionStorageValues>(key: Key) {
  return {
    set(value: SessionStorageValues[Key]) {
      setSessionItem(key, value);
    },
    get(): SessionStorageValues[Key] | null {
      return getSessionItem(key);
    },
    clear() {
      removeSessionItem(key);
    },
  };
}
