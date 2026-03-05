class HUD {
  static MAX_LIVES = 5;
  static MAX_COMBO = 10;

  constructor() {
    this.scoreEl    = document.getElementById('scoreDisplay');
    this.comboEl    = document.getElementById('comboText');
    this.comboWrap  = document.getElementById('comboDisplay');
    this.livesEl    = document.getElementById('playerLives');

    // HP bar elements
    this._heroFill  = document.getElementById('heroHpFill');
    this._heroText  = document.getElementById('heroHpText');

    this._score      = 0;
    this._combo      = 1;
    this._lives      = HUD.MAX_LIVES;
    this._bestCombo  = 1;
    this._bestStreak = 0;
    this._streak     = 0;

    this._renderHeroHP();
    this._updateCombo();
  }

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
    this.scoreEl.addEventListener('animationend',
      () => this.scoreEl.classList.remove('bump'), { once: true });
    return earned;
  }

  incrementCombo() {
    this._combo = Math.min(this._combo + 1, HUD.MAX_COMBO);
    this._streak++;
    if (this._combo  > this._bestCombo)  this._bestCombo  = this._combo;
    if (this._streak > this._bestStreak) this._bestStreak = this._streak;
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
    this.comboWrap.classList.toggle('active', this._combo > 1);
  }

  loseLife() {
    if (this._lives <= 0) return false;
    this._lives--;
    this._renderHeroHP();
    return this._lives > 0;
  }

  _renderHeroHP() {
    if (!this._heroFill) return;
    const pct = (this._lives / HUD.MAX_LIVES) * 100;
    this._heroFill.style.width = pct + '%';
    this._heroFill.classList.toggle('low', pct <= 40);
    if (this._heroText) {
      this._heroText.textContent = `${this._lives} / ${HUD.MAX_LIVES}`;
    }
  }

  reset() {
    this._score      = 0;
    this._combo      = 1;
    this._lives      = HUD.MAX_LIVES;
    this._bestCombo  = 1;
    this._bestStreak = 0;
    this._streak     = 0;
    this.scoreEl.textContent = '0';
    this._updateCombo();
    this._renderHeroHP();
    document.getElementById('streakVal').textContent = '0';
  }
}