type StorageValue = string | number | boolean | object | null;

export const storage = {
  get<T = unknown>(key: string): T | null {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  set(key: string, value: StorageValue) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore write error
    }
  },

  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },

  clear() {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
  },
};