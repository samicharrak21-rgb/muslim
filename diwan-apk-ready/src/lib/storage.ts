// تخزين محلي مع typed helpers
export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(`diwan:${key}`);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set<T>(key: string, value: T) {
    try { localStorage.setItem(`diwan:${key}`, JSON.stringify(value)); } catch {}
  },
  remove(key: string) {
    try { localStorage.removeItem(`diwan:${key}`); } catch {}
  }
};
