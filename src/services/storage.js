const mem = new Map();
export function setItem(key, value){ try{ localStorage.setItem(key, JSON.stringify(value)); } catch { mem.set(key, value); } }
export function getItem(key, fallback=null){ try{ const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return mem.has(key) ? mem.get(key) : fallback; } }
export function removeItem(key){ try{ localStorage.removeItem(key); } catch { mem.delete(key); } }
