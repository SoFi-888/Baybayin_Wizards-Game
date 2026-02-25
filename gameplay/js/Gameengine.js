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
    this.start();
  }

  pause()  { this._paused = true; }
  resume() { this._paused = false; }

  get wordsFound() { return this._wordsFound; }

  _startQueue() {
    this._wordQueue = [...DATA.words].sort(() => Math.random() - 0.5);
    this._loadNextWord();
  }

  _loadNextWord() {
    if (!this._wordQueue.length) {
      this._wordQueue = [...DATA.words].sort(() => Math.random() - 0.5);
    }
    this._current = this._wordQueue.shift();

    // Update prompts
    document.getElementById('promptBaybayin').textContent = this._current.baybayin.join('');
    document.getElementById('promptRoman').textContent    = this._current.roman;
    document.getElementById('promptMeaning').textContent  = `"${this._current.meaning}"`;
    document.getElementById('wiBaybayin').textContent = this._current.baybayin.join('');
    document.getElementById('wiRoman').textContent    = this._current.roman;
    document.getElementById('wiMeaning').textContent  = this._current.meaning;
    document.getElementById('wiPoints').textContent   = `+${this._current.points} pts`;

    const old = this.builder.clear();
    old.forEach(s => this.grid.deselectTile(s.tileIndex));
    this.grid.ensureChars(this._current.baybayin);
  }
  // Tile clicked
  _onTileClick(data, index) {
    if (this._paused) return;
    this.grid.selectTile(index);
    this.builder.addChar(data.char, data.roman, index);
  }
  // Attack function
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

    // Hero attack animation
    document.getElementById('heroChar').classList.remove('attack');
    void document.getElementById('heroChar').offsetWidth;
    document.getElementById('heroChar').classList.add('attack');
    document.getElementById('heroChar').addEventListener('animationend', () =>
      document.getElementById('heroChar').classList.remove('attack'), { once:true });

    // Damage enemy
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
  }

  _onWrong() {
    this.builder.flashWrong(() => {});
    this.hud.resetCombo();

    // Enemy hits player
    this.enemy.triggerEnemyAttack();
    document.getElementById('heroChar').classList.remove('hit');
    void document.getElementById('heroChar').offsetWidth;
    document.getElementById('heroChar').classList.add('hit');
    document.getElementById('heroChar').addEventListener('animationend', () =>
      document.getElementById('heroChar').classList.remove('hit'), { once:true });

    const alive = this.hud.loseLife();
    this._feedback('Wrong yun...', 'wrong');

    if (!alive) {
      setTimeout(() => this._gameOver(), 700);
    } else {
      setTimeout(() => {
        const old = this.builder.clear();
        old.forEach(s => this.grid.deselectTile(s.tileIndex));
      }, 500);
    }
  }
  // Scramble words
  _scramble() {
    if (this._paused || this._scrambLeft <= 0) return;
    this._scrambLeft--;
    const old = this.builder.clear();
    old.forEach(s => this.grid.deselectTile(s.tileIndex));
    this.grid.scramble(this._current ? this._current.baybayin : []);
    this._refreshAuxUI();
    this._feedback('Shuffled!', 'points');
  }
  
  // Hint function
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
  }

  _setupEnemyCallbacks() {
    this.enemy.onDefeat((defeated) => {
      this._feedback(`${defeated.name} defeated!`, 'combo');
    });

    this.enemy.onChapterEnd(() => {
      document.getElementById('victoryScore').textContent = this.hud.score.toLocaleString();
      document.getElementById('victoryOverlay').classList.remove('hidden');
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
  // Game status
  _gameOver() {
    this.pause();
    document.getElementById('finalScore').textContent = this.hud.score.toLocaleString();
    document.getElementById('finalWords').textContent = this._wordsFound;
    document.getElementById('finalCombo').textContent = `x${this.hud.bestCombo}`;
    document.getElementById('gameOverOverlay').classList.remove('hidden');
    this._clearSave();
  }

  _bindUI() {
    document.getElementById('btnAttack').addEventListener('click',   () => this._attack());
    document.getElementById('btnScramble').addEventListener('click', () => this._scramble());
    document.getElementById('btnHint').addEventListener('click',     () => this._useHint());
    document.getElementById('btnMenu').addEventListener('click',     () => this._openPause());

    // Pause overlay
    document.getElementById('btnResumePause').addEventListener('click', () => this._closePause());
    document.getElementById('btnRestartPause').addEventListener('click', () => { this._closePause(); this.reset(); });
    document.getElementById('btnBackMenu').addEventListener('click', () => window.location.href = '/template/index.html');
    document.getElementById('btnClosePause').addEventListener('click',    () => this._closePause());
    document.getElementById('btnCloseGameOver').addEventListener('click', () => document.getElementById('gameOverOverlay').classList.add('hidden'));
    document.getElementById('btnCloseVictory').addEventListener('click',  () => document.getElementById('victoryOverlay').classList.add('hidden'));

    // Game Over overlay
    document.getElementById('btnPlayAgain').addEventListener('click', () => {
      document.getElementById('gameOverOverlay').classList.add('hidden');
      this.reset();
    });
    document.getElementById('btnBackMenu2').addEventListener('click', () => window.location.href = '/template/index.html');

    // Victory overlay
    document.getElementById('btnNextChapter').addEventListener('click', () => {
      document.getElementById('victoryOverlay').classList.add('hidden');
      this.resume();
      this._startQueue();
    });
    document.getElementById('btnBackMenu3').addEventListener('click', () => window.location.href = '/template/index.html');

    this.builder.onSlotClick((slot) => {
      if (this._paused) return;
      const r = this.builder.removeByTileIndex(slot.tileIndex);
      if (r) this.grid.deselectTile(r.tileIndex);
    });

    document.querySelectorAll('.item-use-btn').forEach(btn => {
      btn.addEventListener('click', () => {
      });
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

  _refreshAuxUI() {
    document.getElementById('hintCount').textContent =
      `${this._hintsLeft} hint${this._hintsLeft !== 1 ? 's' : ''} left`;
    document.getElementById('btnHint').disabled    = this._hintsLeft <= 0;
    document.getElementById('btnScramble').textContent =
      `Scramble (${this._scrambLeft})`;
    document.getElementById('btnScramble').disabled = this._scrambLeft <= 0;
  }

 _feedback(text, type = 'correct', delay = 0) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className   = `feedback-msg ${type}`;
      el.textContent = text;

      if (type === 'correct' || type === 'bonus' || type === 'points') {
        el.style.left = (5 + Math.random() * 15) + '%';
      } else if (type === 'wrong') {
        el.style.left = (72 + Math.random() * 15) + '%';
      } else {
        el.style.left = (38 + Math.random() * 10) + '%';
      }
      el.style.top = (8 + Math.random() * 12) + '%';

      this._feedLayer.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }, delay);
  }

  // Save/Load Progress
  _saveProgress() {
    localStorage.setItem('baybayinSave', JSON.stringify({
      score: this.hud.score, lives: this.hud.lives,
      wordsFound: this._wordsFound, bestCombo: this.hud.bestCombo,
    }));
  }
  _clearSave() { localStorage.removeItem('baybayinSave'); }
  _arrEqual(a, b) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }

  _arrEqual(a, b) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }
}