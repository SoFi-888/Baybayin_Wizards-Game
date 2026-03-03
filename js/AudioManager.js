class AudioManager {
  constructor() {
    // Proper singleton via window property (survives script re-execution)
    if (window.__audioManager) return window.__audioManager;
    window.__audioManager = this;

    // Absolute paths — work from any subdirectory (start screen or gameplay/)
    this.bgm      = new Audio('/music/music_bgm.mp3');
    this.bgm.loop = true;
    this._sfxSrc  = '/music/music_sfx_click.mp3';

    // Persisted settings
    this._volume  = parseFloat(localStorage.getItem('aud_volume') ?? '0.7');
    this._musicOn = (localStorage.getItem('aud_music') ?? 'true') === 'true';
    this._sfxOn   = (localStorage.getItem('aud_sfx')   ?? 'true') === 'true';

    this._applyVolume();
  }

  /** Start BGM on first user interaction */
  playBGM() {
    if (!this._musicOn) return;
    if (this.bgm.paused) {
      this.bgm.play()
        .then(() => sessionStorage.setItem('bgm_started', '1'))
        .catch(() => {});
    }
  }

  /** Resume BGM when navigating to a new page (no new interaction needed) */
  resumeBGM() {
    if (sessionStorage.getItem('bgm_started') === '1') {
      this.playBGM();
    }
  }

  stopBGM() { this.bgm.pause(); this.bgm.currentTime = 0; }

  playSFX() {
    if (!this._sfxOn) return;
    const sfx = new Audio(this._sfxSrc);
    // boost all sound effects relative to master volume
    // (most audio assets are recorded fairly quiet)
    sfx.volume = Math.min(1, this._volume * 10);
    sfx.play().catch(() => {});
  }

  setVolume(v) {
    this._volume = Math.max(0, Math.min(1, v));
    localStorage.setItem('aud_volume', this._volume);
    this._applyVolume();
  }

  setMusicOn(on) {
    this._musicOn = on;
    localStorage.setItem('aud_music', on);
    on ? this.playBGM() : this.bgm.pause();
  }

  setSFXOn(on) {
    this._sfxOn = on;
    localStorage.setItem('aud_sfx', on);
  }

  syncUI() {
    const sfxEl    = document.getElementById('toggleSfx');
    const musicEl  = document.getElementById('toggleMusic');
    const sliderEl = document.getElementById('volumeSlider');
    if (sfxEl)    sfxEl.checked   = this._sfxOn;
    if (musicEl)  musicEl.checked  = this._musicOn;
    if (sliderEl) {
      sliderEl.value = Math.round(this._volume * 100);
      this._updateSliderGradient(sliderEl);
    }
  }

  bindSettingsControls() {
    const sfxEl    = document.getElementById('toggleSfx');
    const musicEl  = document.getElementById('toggleMusic');
    const sliderEl = document.getElementById('volumeSlider');
    if (sfxEl)    sfxEl.addEventListener('change',  e => this.setSFXOn(e.target.checked));
    if (musicEl)  musicEl.addEventListener('change', e => this.setMusicOn(e.target.checked));
    if (sliderEl) sliderEl.addEventListener('input', e => {
      this.setVolume(e.target.value / 100);
      this._updateSliderGradient(e.target);
    });
  }

  _applyVolume() { this.bgm.volume = this._musicOn ? this._volume : 0; }

  _updateSliderGradient(slider) {
    slider.style.background =
      `linear-gradient(90deg, var(--gold) ${slider.value}%, #2a1505 ${slider.value}%)`;
  }
}

const audioManager = window.__audioManager || new AudioManager();