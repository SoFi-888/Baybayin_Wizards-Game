class TileGrid {
  static COLS = 4;
  static ROWS = 4;
  static SIZE = TileGrid.COLS * TileGrid.ROWS;

  constructor(containerId, onTileClick) {
    this.container   = document.getElementById(containerId);
    this.onTileClick = onTileClick;
    this.tiles       = [];
    this.showRoman   = false;
    this._build();
  }

  /* ── Build grid ─────────────────────────────────────────── */
  _build() {
    this.container.innerHTML = '';
    this.tiles = [];
    for (let i = 0; i < TileGrid.SIZE; i++) {
      const d  = this._rndData();
      const el = this._makeEl(d, i);
      d.el = el; d.index = i;
      this.tiles.push(d);
      this.container.appendChild(el);
    }
  }

  _makeEl(data, idx) {
    const el = document.createElement('div');
    el.className = 'tile tile--spawning';
    el.style.animationDelay = (idx * 0.04) + 's';

    const cs = document.createElement('span');
    cs.className = 'tile-char';
    cs.textContent = data.char;

    const rs = document.createElement('span');
    rs.className = 'tile-roman';
    rs.textContent = data.roman;
    rs.style.display = this.showRoman ? '' : 'none';

    el.appendChild(cs);
    el.appendChild(rs);

    el.addEventListener('click', () => {
      if (!data.used && !data.selected) this.onTileClick(data, idx);
    });

    if (data.bonus) el.classList.add('tile--bonus');
    return el;
  }

  /* ── Random tile data ──────────────────────────────────── */
  _rndData() {
    const pool   = DATA.tilePool;
    const common = DATA.commonChars;
    let picked;
    if (Math.random() < 0.65) {
      const cp = pool.filter(t => common.includes(t.char));
      picked = cp[Math.floor(Math.random() * cp.length)];
    } else {
      picked = pool[Math.floor(Math.random() * pool.length)];
    }
    const bonus = Math.random() < 0.06; // 6% bonus tile
    return { char: picked.char, roman: picked.roman, selected: false, used: false, bonus, el: null };
  }

  /* ── Selection ─────────────────────────────────────────── */
  selectTile(idx) {
    const t = this.tiles[idx];
    t.selected = true;
    t.el.classList.add('tile--selected');
  }

  deselectTile(idx) {
    const t = this.tiles[idx];
    t.selected = false;
    t.el.classList.remove('tile--selected');
  }

  deselectAll() {
    this.tiles.forEach(t => {
      if (t.selected) { t.selected = false; t.el.classList.remove('tile--selected'); }
    });
  }

  /* ── Clear & refill ────────────────────────────────────── */
  clearAndRefill(indices, delay = 380) {
    return new Promise(resolve => {
      indices.forEach(i => {
        this.tiles[i].used = true;
        this.tiles[i].el.classList.remove('tile--selected');
        this.tiles[i].el.classList.add('tile--clearing');
      });
      setTimeout(() => {
        indices.forEach(i => {
          const nd  = this._rndData();
          const nel = this._makeEl(nd, i);
          nd.el = nel; nd.index = i;
          this.container.replaceChild(nel, this.tiles[i].el);
          this.tiles[i] = nd;
        });
        resolve();
      }, delay);
    });
  }

  /* ── Scramble all non-selected, non-used tiles ─────────── */
  scramble() {
    this.tiles.forEach(t => {
      if (!t.used && !t.selected) {
        const d = this._rndData();
        t.char  = d.char;
        t.roman = d.roman;
        t.bonus = d.bonus;
        t.el.querySelector('.tile-char').textContent  = d.char;
        t.el.querySelector('.tile-roman').textContent = d.roman;
        t.el.classList.toggle('tile--bonus', d.bonus);
        t.el.classList.add('tile--spawning');
        t.el.addEventListener('animationend', () =>
          t.el.classList.remove('tile--spawning'), { once:true });
      }
    });
  }

  /* ── Ensure certain chars exist ────────────────────────── */
  ensureChars(chars) {
    chars.forEach(char => {
      const exists = this.tiles.some(t => t.char === char && !t.used);
      if (!exists) {
        const candidates = this.tiles.filter(t => !t.used && !t.selected);
        if (!candidates.length) return;
        const target = candidates[Math.floor(Math.random() * candidates.length)];
        const pool   = DATA.tilePool.find(p => p.char === char);
        if (!pool) return;
        target.char  = pool.char;
        target.roman = pool.roman;
        target.el.querySelector('.tile-char').textContent  = pool.char;
        target.el.querySelector('.tile-roman').textContent = pool.roman;
      }
    });
  }

  /* ── Highlight hint tiles ──────────────────────────────── */
  highlightChar(char) {
    this.tiles.forEach(t => {
      if (t.char === char && !t.used && !t.selected) {
        t.el.style.outline      = '3px solid #f0c040';
        t.el.style.outlineOffset= '2px';
        t.el.style.transform    = 'translateY(-4px) scale(1.1)';
        setTimeout(() => {
          t.el.style.outline      = '';
          t.el.style.outlineOffset= '';
          t.el.style.transform    = '';
        }, 1600);
      }
    });
  }

  setRomanVisible(v) {
    this.showRoman = v;
    this.tiles.forEach(t => {
      const s = t.el.querySelector('.tile-roman');
      if (s) s.style.display = v ? '' : 'none';
    });
  }

  reset() { this._build(); }
}