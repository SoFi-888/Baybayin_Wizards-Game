/* ═══════════════════════════════════════════════════════════
   js/WordBuilder.js  —  Word tile strip at the top of the screen
   Manages the selected letter sequence display
   ═══════════════════════════════════════════════════════════ */
class WordBuilder {
  constructor(rowId) {
    this.rowEl   = document.getElementById(rowId);
    this.slots   = [];   // [{ char, roman, tileIndex }]
    this.maxSlots = 10;
    this._slotClickCb = null;
    this._render();
  }

  addChar(char, roman, tileIndex) {
    if (this.slots.length >= this.maxSlots) return false;
    this.slots.push({ char, roman, tileIndex });
    this._render();
    return true;
  }

  removeLast() {
    if (!this.slots.length) return null;
    const r = this.slots.pop();
    this._render();
    return r;
  }

  removeByTileIndex(idx) {
    const i = this.slots.findIndex(s => s.tileIndex === idx);
    if (i === -1) return null;
    const r = this.slots.splice(i, 1)[0];
    this._render();
    return r;
  }

  clear() {
    const old = [...this.slots];
    this.slots = [];
    this._render();
    return old;
  }

  get currentChars() { return this.slots.map(s => s.char); }
  get tileIndices()  { return this.slots.map(s => s.tileIndex); }
  get length()       { return this.slots.length; }

  onSlotClick(cb) { this._slotClickCb = cb; }

  flashCorrect(cb) {
    this.rowEl.querySelectorAll('.wt-tile').forEach(el => el.classList.add('correct'));
    setTimeout(cb, 500);
  }

  flashWrong(cb) {
    this.rowEl.querySelectorAll('.wt-tile').forEach(el => el.classList.add('wrong'));
    setTimeout(() => {
      this.rowEl.querySelectorAll('.wt-tile').forEach(el => el.classList.remove('wrong'));
      cb();
    }, 500);
  }

  _render() {
    this.rowEl.innerHTML = '';
    if (!this.slots.length) return;

    this.slots.forEach((slot, i) => {
      const el  = document.createElement('div');
      el.className = 'wt-tile';
      el.title  = `Click to remove "${slot.roman}"`;

      const cs  = document.createElement('span');
      cs.textContent = slot.char;

      const rs  = document.createElement('span');
      rs.className  = 'wt-roman';
      rs.textContent = slot.roman;

      el.appendChild(cs);
      el.appendChild(rs);
      el.addEventListener('click', () => {
        if (this._slotClickCb) this._slotClickCb(slot, i);
      });
      this.rowEl.appendChild(el);
    });
  }
}