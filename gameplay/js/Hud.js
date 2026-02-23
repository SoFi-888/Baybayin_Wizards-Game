class HUD {
  static MAX_LIVES = 5;
  static MAX_COMBO = 10;

  constructor() {
    this.scoreEl    = document.getElementById('scoreDisplay');
    this.comboEl    = document.getElementById('comboText');
    this.comboWrap  = document.getElementById('comboDisplay');
    this.livesEl    = document.getElementById('playerLives');

    this._score     = 0;
    this._combo     = 1;
    this._lives     = HUD.MAX_LIVES;
    this._bestCombo = 1;
    this._bestStreak= 0;
    this._streak    = 0;

    this._renderLives();
    this._updateCombo();
  }

  /* ── Score ────────────────────────────────────────────── */
  get score()      { return this._score; }
  get combo()      { return this._combo; }
  get lives()      { return this._lives; }
  get bestCombo()  { return this._bestCombo; }
  get bestStreak() { return this._bestStreak; }

  addScore(base) {
    const earned = base * this._combo;
    this._score += earned;
    this.scoreEl.textContent = this._score.toLocaleString();
    this.scoreEl.classList.remove('bump');
    void this.scoreEl.offsetWidth;
    this.scoreEl.classList.add('bump');
    this.scoreEl.addEventListener('animationend', () =>
      this.scoreEl.classList.remove('bump'), { once: true });
    return earned;
  }

  /* ── Combo ────────────────────────────────────────────── */
  incrementCombo() {
    this._combo = Math.min(this._combo + 1, HUD.MAX_COMBO);
    this._streak++;
    if (this._combo   > this._bestCombo)  this._bestCombo  = this._combo;
    if (this._streak  > this._bestStreak) this._bestStreak = this._streak;
    this._updateCombo();
    document.getElementById('streakVal').textContent = this._bestStreak;
  }

  resetCombo() {
    this._combo  = 1;
    this._streak = 0;
    this._updateCombo();
  }

  _updateCombo() {
    this.comboEl.textContent = `x${this._combo}`;
    if (this._combo > 1) {
      this.comboWrap.classList.add('active');
    } else {
      this.comboWrap.classList.remove('active');
    }
  }

  /* ── Lives ────────────────────────────────────────────── */
  loseLife() {
    if (this._lives <= 0) return false;
    this._lives--;
    this._renderLives();
    const hearts = this.livesEl.querySelectorAll('.heart');
    const lost   = hearts[this._lives];
    if (lost) {
      lost.classList.add('shake');
      lost.addEventListener('animationend', () => lost.classList.remove('shake'), { once:true });
    }
    return this._lives > 0;
  }

  _renderLives() {
    this.livesEl.innerHTML = '';
    for (let i = 0; i < HUD.MAX_LIVES; i++) {
      const h = document.createElement('span');
      h.className  = 'heart' + (i >= this._lives ? ' lost' : '');
      h.textContent = '❤';
      this.livesEl.appendChild(h);
    }
  }

  reset() {
    this._score  = 0;
    this._combo  = 1;
    this._lives  = HUD.MAX_LIVES;
    this._bestCombo = 1;
    this._bestStreak= 0;
    this._streak = 0;
    this.scoreEl.textContent = '0';
    this._updateCombo();
    this._renderLives();
    document.getElementById('streakVal').textContent = '0';
  }
}