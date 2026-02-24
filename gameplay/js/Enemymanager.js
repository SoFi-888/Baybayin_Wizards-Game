class EnemyManager {
  constructor() {
    this._chapterIdx   = 0;
    this._enemyIdx     = 0;
    this._currentHP    = 0;
    this._maxHP        = 0;
    this._onDefeat     = null;
    this._onChapterEnd = null;
    this._onPlayerHit  = null;

    this._nameEl    = document.getElementById('enemyName');
    // legacy compat — hidden
    this._livesEl   = document.getElementById('enemyLives');
    this._enemyChar = document.getElementById('enemyChar');
    this._chapterEl = document.getElementById('chapterTitle');

    // HP bar elements
    this._enemyFill = document.getElementById('enemyHpFill');
    this._enemyText = document.getElementById('enemyHpText');
    this._enemyHpName = document.getElementById('enemyHpName');

    // Right-panel desc elements
    this._descName  = document.getElementById('enemyDescName');
    this._descLore  = document.getElementById('enemyDescLore');
    this._descMoves = document.getElementById('enemyDescMoves');
  }

  onDefeat(cb)     { this._onDefeat = cb; }
  onChapterEnd(cb) { this._onChapterEnd = cb; }
  onPlayerHit(cb)  { this._onPlayerHit = cb; }

  get current() {
    return this._getCurrentChapterEnemies()[this._enemyIdx] || null;
  }

  _getCurrentChapterEnemies() {
    const chapter = DATA.chapters[this._chapterIdx];
    if (!chapter) return [];
    return chapter.enemyIndices.map(i => DATA.enemies[i]);
  }

  loadCurrent() {
    const enemy = this.current;
    if (!enemy) return;

    this._maxHP     = enemy.maxHP;
    this._currentHP = enemy.maxHP;

    // Chapter
    if (this._chapterEl) {
      this._chapterEl.textContent = DATA.chapters[this._chapterIdx]?.title || '';
    }

    // name badge
    if (this._nameEl) this._nameEl.textContent = enemy.name;

    // HP bar name
    if (this._enemyHpName) this._enemyHpName.textContent = enemy.name;

    // Swap enemy
    const enemyImg = this._enemyChar.querySelector('.enemy-img');
    if (enemyImg && enemy.image) {
      enemyImg.src = enemy.image;
      enemyImg.alt = enemy.name;
    }

    // Right-panel des
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

  damageEnemy(dmg = 1) {
    this._currentHP = Math.max(0, this._currentHP - dmg);
    this._renderEnemyHP();

    this._enemyChar.classList.remove('hit');
    void this._enemyChar.offsetWidth;
    this._enemyChar.classList.add('hit');
    this._enemyChar.addEventListener('animationend',
      () => this._enemyChar.classList.remove('hit'), { once: true });

    if (this._currentHP <= 0) {
      this._defeatEnemy();
    } else {
      if (Math.random() < 0.3) {
        setTimeout(() => { if (this._onPlayerHit) this._onPlayerHit(); }, 600);
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
      this._enemyIdx = 0;
      this._chapterIdx++;
      if (this._chapterIdx >= DATA.chapters.length) this._chapterIdx = 0;
      if (this._onChapterEnd) this._onChapterEnd();
    } else {
      setTimeout(() => this.loadCurrent(), 400);
    }
  }

  _renderEnemyHP() {
    if (!this._enemyFill) return;
    const pct = (this._currentHP / this._maxHP) * 100;
    this._enemyFill.style.width = pct + '%';
    this._enemyFill.classList.toggle('low', pct <= 40);
    if (this._enemyText) {
      this._enemyText.textContent = `${this._currentHP} / ${this._maxHP}`;
    }
  }

  triggerEnemyAttack() {
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