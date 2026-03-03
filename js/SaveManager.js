class SaveManager {
  static SLOTS      = 3;
  static KEY_PREFIX = 'bw_save_slot_';

  /* ─ Read / Write ─ */
  static getSlot(n) {
    try {
      const raw = localStorage.getItem(SaveManager.KEY_PREFIX + n);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  static writeSlot(n, data) {
    localStorage.setItem(SaveManager.KEY_PREFIX + n, JSON.stringify({
      ...data,
      savedAt: Date.now(),
    }));
  }

  static clearSlot(n) {
    localStorage.removeItem(SaveManager.KEY_PREFIX + n);
  }

  static allSlots() {
    return [0, 1, 2].map(n => ({ index: n, data: SaveManager.getSlot(n) }));
  }

  static hasAnySave() {
    return SaveManager.allSlots().some(s => s.data !== null);
  }

  /* ─ Active slot ─ */
  static setActiveSlot(n)  { sessionStorage.setItem('bw_active_slot', String(n)); }
  static getActiveSlot()   {
    const v = sessionStorage.getItem('bw_active_slot');
    return v !== null ? parseInt(v, 10) : null;
  }
  static clearActiveSlot() { sessionStorage.removeItem('bw_active_slot'); }

  /* ─ Helpers ─ */
  static formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
         + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
}