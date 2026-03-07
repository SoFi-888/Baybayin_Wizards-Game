class GameEngine {
  static HINTS_MAX     = 3;
  static SCRAMBLES_MAX = 3;
  static WORDS_PER_ENEMY = 4;

  constructor() {
    this.hud     = new HUD();
    this.grid    = new TileGrid('tileGrid', (d, i) => this._onTileClick(d, i));
    this.builder = new WordBuilder('wordTilesRow');
    this.enemy   = new EnemyManager();

    this._paused     = false;
    this._hintsLeft  = GameEngine.HINTS_MAX;
    this._scrambLeft = GameEngine.SCRAMBLES_MAX;
    this._wordsFound = 0;
    this._wordQueue  = [];
    this._current    = null;

    this._feedLayer = document.getElementById('feedbackLayer');

    this._setupEnemyCallbacks();
    this._bindUI();
  }

  /* PUBLIC */
  start() {
    this._paused     = false;
    this._hintsLeft  = GameEngine.HINTS_MAX;
    this._scrambLeft = GameEngine.SCRAMBLES_MAX;
    this._wordsFound = 0;

    this.hud.reset();
    this.grid.reset();
    this.enemy.reset();

    this._refreshAuxUI();
    this._startQueue();
  }

  reset() {
    this.builder.clear().forEach(s => this.grid.deselectTile(s.tileIndex));
    this._setHeroImg('img/Tala.png');
    this._resetItems();
    this.start();
  }

  pause()  { this._paused = true; }
  resume() { this._paused = false; }

  get wordsFound() { return this._wordsFound; }

  /* WORD QUEUE */
  _startQueue() {
    this._wordQueue = [...DATA.words].sort(() => Math.random() - 0.5);
    this._loadNextWord();
  }

  _loadNextWord() {
    if (!this._wordQueue.length) {
      this._wordQueue = [...DATA.words].sort(() => Math.random() - 0.5);
    }
    this._current = this._wordQueue.shift();
    const promptRomanMain = document.getElementById('promptRomanMain');
    if (promptRomanMain) promptRomanMain.textContent = this._current.roman;
    document.getElementById('promptRoman').textContent    = this._current.roman;
    document.getElementById('promptMeaning').textContent  = `"${this._current.meaning}"`;


    const wiBaybayin = document.getElementById('wiBaybayin');
    if (wiBaybayin) wiBaybayin.textContent = '';
    document.getElementById('wiRoman').textContent    = this._current.roman;
    document.getElementById('wiMeaning').textContent  = this._current.meaning;
    document.getElementById('wiPoints').textContent   = `+${this._current.points} pts`;

    const old = this.builder.clear();
    old.forEach(s => this.grid.deselectTile(s.tileIndex));

    this.grid.ensureChars(this._current.baybayin);
  }

  /* TILE CLICK */
  _onTileClick(data, index) {
    if (this._paused) return;
    this.grid.selectTile(index);
    this.builder.addChar(data.char, data.roman, index);
  }

  /* ATTACK/SUBMIT */
  _attack() {
    if (this._paused || !this._current || this.builder.length === 0) return;

    const built  = this.builder.currentChars;
    const target = this._current.baybayin;

    if (this._arrEqual(built, target)) {
      this._onCorrect();
    } else {
      this._onWrong();
    }
  }

  _onCorrect() {
    this._wordsFound++;
    this.hud.incrementCombo();
    const earned = this.hud.addScore(
      this._current.points + (this._current.bonus ? 60 : 0)
    );

    document.getElementById('heroChar').classList.remove('attack');
    void document.getElementById('heroChar').offsetWidth;
    document.getElementById('heroChar').classList.add('attack');
    document.getElementById('heroChar').addEventListener('animationend', () =>
    document.getElementById('heroChar').classList.remove('attack'), { once:true });
    document.getElementById('tileGrid').classList.remove('show-roman');
    this.grid.setRomanVisible(false);

    setTimeout(() => this.enemy.damageEnemy(1), 250);

    this.builder.flashCorrect(() => {
      const indices = this.builder.tileIndices;
      this.grid.clearAndRefill(indices).then(() => {
        this.builder.clear();
        this._loadNextWord();
      });
    });

    const msgs = ['Mahusay!','Tama!','Galing!','Perpekto!','Kahanga-hanga!'];
    this._feedback(msgs[Math.floor(Math.random() * msgs.length)], 'correct');
    if (this._current.bonus) this._feedback(`BONUS! +${earned}`, 'bonus', 300);
    if (this.hud.combo > 2)  this._feedback(`x${this.hud.combo} COMBO!`, 'combo', 500);

    this._saveProgress();
    this._setHeroImg('img/Tala_badass.png');
    setTimeout(() => {
      if (this.hud.lives <= 1) this._setHeroImg('img/Tala_lowhealth.png');
      else this._setHeroImg('img/Tala.png');
    }, 1000);
  }

  _onWrong() {
    this.builder.flashWrong(() => {});
    this.hud.resetCombo();

    this.enemy.triggerEnemyAttack();
    document.getElementById('heroChar').classList.remove('hit');
    void document.getElementById('heroChar').offsetWidth;
    document.getElementById('heroChar').classList.add('hit');
    document.getElementById('heroChar').addEventListener('animationend', () =>
      document.getElementById('heroChar').classList.remove('hit'), { once:true });

    const alive = this.hud.loseLife();
    this._feedback('Mali yarn…', 'wrong');

    if (!alive) {
      setTimeout(() => this._gameOver(), 700);
    } else {
      if (this.hud.lives <= 1) setTimeout(() => this._setHeroImg('img/Tala_lowhealth.png'), 100);
      setTimeout(() => {
        const old = this.builder.clear();
        old.forEach(s => this.grid.deselectTile(s.tileIndex));
      }, 500);
    }
  }

  /* SCRAMBLE */
  _scramble() {
    if (this._paused || this._scrambLeft <= 0) return;
    this._scrambLeft--;
    const old = this.builder.clear();
    old.forEach(s => this.grid.deselectTile(s.tileIndex));
    this.grid.scramble(this._current ? this._current.baybayin : []);
    this._refreshAuxUI();
    this._feedback('Shuffled!', 'points');
  }

  /* HINT */
  _useHint() {
    if (this._paused || this._hintsLeft <= 0) return;
    this._hintsLeft--;
    this._refreshAuxUI();
    document.getElementById('promptRoman').classList.remove('hidden');
    const romanEl = document.getElementById('hintRoman');
    romanEl.textContent = this._current.roman;
    romanEl.classList.remove('hidden');
    setTimeout(() => romanEl.classList.add('hidden'), 3000);
    const nextChar = this._current.baybayin[this.builder.length];
    if (nextChar) this.grid.highlightChar(nextChar);

    document.getElementById('tileGrid').classList.add('show-roman');
    this.grid.setRomanVisible(true);
  }

  /* ENEMY CALLBACKS */
  _setupEnemyCallbacks() {
    this.enemy.onDefeat((defeated) => {
      this._feedback(`${defeated.name} defeated!`, 'combo');
    });

    this.enemy.onChapterEnd(() => {
      const isLastChapter = this.enemy.chapterIdx >= DATA.chapters.length;
      if (isLastChapter) {
        document.getElementById('endingScore').textContent = this.hud.score.toLocaleString();
        document.getElementById('endingOverlay').classList.remove('hidden');
      } else {
        document.getElementById('victoryScore').textContent = this.hud.score.toLocaleString();
        document.getElementById('victoryOverlay').classList.remove('hidden');
      }
      this.pause();
    });

    this.enemy.onPlayerHit(() => {
      if (this._paused) return;
      document.getElementById('heroChar').classList.remove('hit');
      void document.getElementById('heroChar').offsetWidth;
      document.getElementById('heroChar').classList.add('hit');
      document.getElementById('heroChar').addEventListener('animationend', () =>
        document.getElementById('heroChar').classList.remove('hit'), { once:true });
      const alive = this.hud.loseLife();
      this._feedback('Enemy attacks!', 'wrong');
      if (!alive) setTimeout(() => this._gameOver(), 700);
    });
  }

  /* GAME OVER/VICTORY */
  _gameOver() {
    this.pause();
    this._setHeroImg('img/youdied.png');
    document.getElementById('finalScore').textContent = this.hud.score.toLocaleString();
    document.getElementById('finalWords').textContent = this._wordsFound;
    document.getElementById('finalCombo').textContent = `x${this.hud.bestCombo}`;
    document.getElementById('gameOverOverlay').classList.remove('hidden');
    this._clearSave();
  }

  /* UI BINDINGS */
  _bindUI() {
    document.getElementById('btnAttack').addEventListener('click',   () => this._attack());
    document.getElementById('btnScramble').addEventListener('click', () => this._scramble());
    document.getElementById('btnHint').addEventListener('click',     () => this._useHint());
    document.getElementById('btnMenu').addEventListener('click',     () => this._openPause());

    // Pause
    document.getElementById('btnResumePause').addEventListener('click', () => this._closePause());
    document.getElementById('btnRestartPause').addEventListener('click', () => { this._closePause(); this.reset(); });
    document.getElementById('btnBackMenu').addEventListener('click', () => window.location.href = '../index.html');

    document.getElementById('btnClosePause').addEventListener('click',    () => this._closePause());
    document.getElementById('btnCloseGameOver').addEventListener('click', () => document.getElementById('gameOverOverlay').classList.add('hidden'));
    document.getElementById('btnCloseVictory').addEventListener('click',  () => document.getElementById('victoryOverlay').classList.add('hidden'));

    document.getElementById('btnOpenSettings').addEventListener('click', () => {
      document.getElementById('pauseOverlay').classList.add('hidden');
      document.dispatchEvent(new CustomEvent('openGameSettings'));
    });

    // Game Over
    document.getElementById('btnPlayAgain').addEventListener('click', () => {
      document.getElementById('gameOverOverlay').classList.add('hidden');
      this.reset();
    });
    document.getElementById('btnBackMenu2').addEventListener('click', () => window.location.href = '../index.html');

    // Victory
    document.getElementById('btnNextChapter').addEventListener('click', () => {
      document.getElementById('victoryOverlay').classList.add('hidden');
      this._hintsLeft  = GameEngine.HINTS_MAX;
      this._scrambLeft = GameEngine.SCRAMBLES_MAX;
      this.hud._lives  = HUD.MAX_LIVES;
      this.hud._renderHeroHP();
      this._setHeroImg('img/Tala.png');
      this._resetItems();
      this._refreshAuxUI();
      this.enemy.loadCurrent();
      this.resume();
      this._startQueue();
    });
    document.getElementById('btnBackMenu3').addEventListener('click', () => window.location.href = '../index.html');
    document.getElementById('btnEndingMenu').addEventListener('click', () => window.location.href = '../index.html');

    this.builder.onSlotClick((slot) => {
      if (this._paused) return;
      const r = this.builder.removeByTileIndex(slot.tileIndex);
      if (r) this.grid.deselectTile(r.tileIndex);
    });
    this._items = [
      { el: document.getElementById('item0'), type: 'heal',     used: false },
      { el: document.getElementById('item1'), type: 'strength', used: false },
    ];
    this._items.forEach(item => {
      if (item.el) item.el.addEventListener('click', () => this._useItem(item));
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter')     this._attack();
      if (e.key === 'Backspace') {
        const last = this.builder.removeLast();
        if (last) this.grid.deselectTile(last.tileIndex);
      }
      if (e.key === 'h' || e.key === 'H') this._useHint();
      if (e.key === 's' || e.key === 'S') this._scramble();
      if (e.key === 'Escape') this._openPause();
    });
  }

  _openPause() {
    this.pause();
    document.getElementById('pauseOverlay').classList.remove('hidden');
  }
  _closePause() {
    this.resume();
    document.getElementById('pauseOverlay').classList.add('hidden');
  }

  /* AUXILIARY UI UPDATE */
  _refreshAuxUI() {
    document.getElementById('hintCount').textContent =
      `${this._hintsLeft} hint${this._hintsLeft !== 1 ? 's' : ''} left`;
    document.getElementById('btnHint').disabled    = this._hintsLeft <= 0;
    document.getElementById('btnScramble').textContent =
      `Scramble (${this._scrambLeft})`;
    document.getElementById('btnScramble').disabled = this._scrambLeft <= 0;
  }

  /* FEEDBACK */
  _feedback(text, type = 'correct', delay = 0) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className   = `feedback-msg ${type}`;
      el.textContent = text;

      const battleMid = 80 + Math.random() * 100;
      el.style.left = '50%';
      el.style.transform = 'translateX(-50%)';
      el.style.top = battleMid + 'px';

      this._feedLayer.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }, delay);
  }
  /* SAVE/LOAD */
_buildSaveData() {
    return {
      playerName:  localStorage.getItem('playerName') || 'Player',
      score:       this.hud.score,
      bestStreak:  this.hud.bestStreak,
      bestCombo:   this.hud.bestCombo,
      lives:       this.hud.lives,
      wordsFound:  this._wordsFound,
      hintsLeft:   this._hintsLeft,
      scrambLeft:  this._scrambLeft,
      chapterIdx:  this.enemy.chapterIdx,
      enemyIdx:    this.enemy.enemyIdx,
      enemyHP:     this.enemy.currentHP,
      levelNum:    parseInt(document.getElementById('levelNum')?.textContent || '1', 10),
    };
  }
  saveToSlot(slotIndex) {
    SaveManager.writeSlot(slotIndex, this._buildSaveData());
    SaveManager.setActiveSlot(slotIndex);
  }

  loadFromSlot(slotIndex) {
    const data = SaveManager.getSlot(slotIndex);
    if (!data) return false;
    this.hud._score      = data.score      || 0;
    this.hud._lives      = data.lives      || 5;
    this.hud._bestStreak = data.bestStreak || 0;
    this.hud._bestCombo  = data.bestCombo  || 1;
    this.hud._wordsFound = data.wordsFound || 0;
    this.hud.scoreEl.textContent = this.hud._score.toLocaleString();
    this.hud._renderHeroHP();
    this.hud._updateCombo();
    const streakEl = document.getElementById('streakVal');
    if (streakEl) streakEl.textContent = this.hud._bestStreak;
    this._wordsFound = data.wordsFound || 0;
    this._hintsLeft  = data.hintsLeft !== undefined ? data.hintsLeft : 3;
    this._scrambLeft = data.scrambLeft !== undefined ? data.scrambLeft : 3;

    this.enemy._chapterIdx = data.chapterIdx || 0;
    this.enemy._enemyIdx   = data.enemyIdx   || 0;
    this.enemy.loadCurrent();
    if (data.enemyHP !== undefined) {
      this.enemy._currentHP = data.enemyHP;
      this.enemy._renderEnemyHP();
    }

    this._refreshAuxUI();
    return true;
  }

  _saveProgress() {
    const slot = SaveManager.getActiveSlot();
    if (slot !== null) {
      SaveManager.writeSlot(slot, this._buildSaveData());
    }
  }

  _clearSave() {
    const slot = SaveManager.getActiveSlot();
    if (slot !== null) SaveManager.clearSlot(slot);
    SaveManager.clearActiveSlot();
  }
  /* HELPERS */
  _resetItems() {
    const defs = [
      { id:'item0', src:'img/health_potion.png',   alt:'Health Potion'   },
      { id:'item1', src:'img/strength_potion.png', alt:'Strength Potion' },
    ];
    if (!this._items) return;
    this._items.forEach((item, i) => {
      item.used = false;
      if (item.el) {
        item.el.classList.remove('item-slot--empty');
        item.el.innerHTML = `<img class="item-img" src="${defs[i].src}" alt="${defs[i].alt}" />`;
        item.el.onclick = () => this._useItem(item);
      }
    });
  }

  /* ITEMS */
  _useItem(item) {
    if (this._paused || item.used) return;
    item.used = true;

    if (item.type === 'heal') {
      const healed = Math.min(this.hud._lives + 3, HUD.MAX_LIVES);
      this.hud._lives = healed;
      this.hud._renderHeroHP();
      this._feedback('+3 HP Restored!', 'correct');
      if (this.hud._lives > 1) this._setHeroImg('img/Tala.png');
    } else if (item.type === 'strength') {
      this.enemy.damageEnemy(1);
      this._feedback('Power Strike! -1 Enemy HP!', 'bonus');
    }

    // Empty the slot
    if (item.el) {
      item.el.innerHTML = '<div class="item-name" style="font-size:0.7rem;color:#5a3a10;text-align:center;">empty</div>';
      item.el.classList.add('item-slot--empty');
      item.el.onclick = null;
    }
  }
  
  _setHeroImg(src) {
    const img = document.querySelector('#heroChar .hero-img');
    if (img) img.src = src;
  }

  _arrEqual(a, b) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }
}