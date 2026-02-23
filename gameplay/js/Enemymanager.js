/* ═══════════════════════════════════════════════════════════
   js/EnemyManager.js  —  Enemy HP, defeat animation,
   progression through enemies per chapter
   ═══════════════════════════════════════════════════════════ */
class EnemyManager {
  constructor() {
    this._enemies      = DATA.enemies;
    this._chapterIdx   = 0;
    this._enemyIdx     = 0;
    this._currentHP    = 0;
    this._maxHP        = 0;
    this._onDefeat     = null;
    this._onChapterEnd = null;
    this._onPlayerHit  = null;

    this._nameEl    = document.getElementById('enemyName');
    this._livesEl   = document.getElementById('enemyLives');
    this._enemyChar = document.getElementById('enemyChar');
    this._descName  = document.getElementById('enemyDesc')?.querySelector('.enemy-desc__name');
    this._descLore  = document.getElementById('enemyDesc')?.querySelector('.enemy-desc__lore');
    this._descMoves = document.getElementById('enemyDesc')?.querySelector('.enemy-moves');
    this._chapterEl = document.getElementById('chapterTitle');
  }

  /* ── Callbacks ────────────────────────────────────────── */
  onDefeat(cb)     { this._onDefeat = cb; }
  onChapterEnd(cb) { this._onChapterEnd = cb; }
  onPlayerHit(cb)  { this._onPlayerHit = cb; }

  /* ── Current enemy data ─────────────────────────────── */
  get current() {
    return this._getCurrentChapterEnemies()[this._enemyIdx] || null;
  }

  _getCurrentChapterEnemies() {
    const chapter = DATA.chapters[this._chapterIdx];
    if (!chapter) return [];
    return chapter.enemyIndices.map(i => DATA.enemies[i]);
  }

  /* ── Load an enemy ──────────────────────────────────── */
  loadCurrent() {
    const enemy = this.current;
    if (!enemy) return;

    this._maxHP     = enemy.maxHP;
    this._currentHP = enemy.maxHP;

    // Update chapter banner
    if (this._chapterEl) {
      this._chapterEl.textContent = DATA.chapters[this._chapterIdx]?.title || '';
    }

    // Update name
    this._nameEl.textContent = enemy.name;

    // Update description panel
    if (this._descName)  this._descName.textContent  = enemy.name;
    if (this._descLore)  this._descLore.textContent  = enemy.lore;
    if (this._descMoves) {
      this._descMoves.innerHTML = enemy.moves.map(m =>
        `<li class="move"><span class="move-icon">⚔</span><span class="move-name">${m}</span></li>`
      ).join('');
    }

    this._renderEnemyHP();
    this._enemyChar.classList.remove('dead');
  }

  /* ── Deal damage to enemy ───────────────────────────── */
  damageEnemy(dmg = 1) {
    this._currentHP = Math.max(0, this._currentHP - dmg);
    this._renderEnemyHP();

    // Hit animation
    this._enemyChar.classList.remove('hit');
    void this._enemyChar.offsetWidth;
    this._enemyChar.classList.add('hit');
    this._enemyChar.addEventListener('animationend', () =>
      this._enemyChar.classList.remove('hit'), { once:true });

    if (this._currentHP <= 0) {
      this._defeatEnemy();
    } else {
      // Enemy counter-attacks occasionally
      if (Math.random() < 0.3) {
        setTimeout(() => {
          if (this._onPlayerHit) this._onPlayerHit();
        }, 600);
      }
    }
  }

  _defeatEnemy() {
    this._enemyChar.classList.add('dead');
    setTimeout(() => {
      if (this._onDefeat) this._onDefeat(this.current);
      this._nextEnemy();
    }, 900);
  }

  _nextEnemy() {
    const chapterEnemies = this._getCurrentChapterEnemies();
    this._enemyIdx++;
    if (this._enemyIdx >= chapterEnemies.length) {
      // Chapter complete
      this._enemyIdx = 0;
      this._chapterIdx++;
      if (this._chapterIdx >= DATA.chapters.length) {
        this._chapterIdx = 0; // loop chapters
      }
      if (this._onChapterEnd) this._onChapterEnd();
    } else {
      setTimeout(() => this.loadCurrent(), 400);
    }
  }

  /* ── Render enemy HP as hearts ──────────────────────── */
  _renderEnemyHP() {
    this._livesEl.innerHTML = '';
    for (let i = 0; i < this._maxHP; i++) {
      const h = document.createElement('span');
      h.className   = 'heart' + (i >= this._currentHP ? ' lost' : '');
      h.textContent = '❤';
      this._livesEl.appendChild(h);
    }
  }

  /* ── Attack hero animation ──────────────────────────── */
  triggerEnemyAttack() {
    // Brief visual flash on the enemy (like winding up)
    this._enemyChar.style.filter = 'brightness(1.8) drop-shadow(0 0 12px red)';
    setTimeout(() => { this._enemyChar.style.filter = ''; }, 300);
  }

  reset() {
    this._chapterIdx = 0;
    this._enemyIdx   = 0;
    this.loadCurrent();
  }

  get chapterIdx() { return this._chapterIdx; }
  get enemyIdx()   { return this._enemyIdx; }
}