class AudioManager {
  constructor() {
    if (AudioManager._instance) return AudioManager._instance;
    AudioManager._instance = this;

    this.bgm = new Audio('/music/music_bgm.mp3');
    this.bgm.loop   = true;
    this.bgm.volume = 0.5;
    this._sfxSrc = '/music/music_sfx_click.mp3';
    this._volume   = parseFloat(localStorage.getItem('aud_volume')  ?? '0.7');
    this._musicOn  = (localStorage.getItem('aud_music')  ?? 'true') === 'true';
    this._sfxOn    = (localStorage.getItem('aud_sfx')    ?? 'true') === 'true';

    this._applyVolume();
  }
  playBGM() {
    if (!this._musicOn) return;
    this.bgm.play().catch(() => {/* autoplay blocked — ok */});
  }

  stopBGM() { this.bgm.pause(); this.bgm.currentTime = 0; }
  playSFX() {
    if (!this._sfxOn) return;
    const sfx = new Audio(this._sfxSrc);
    sfx.volume = this._volume;
    sfx.play().catch(() => {});
  }

  /** Volume */
  setVolume(v) {
    this._volume = Math.max(0, Math.min(1, v));
    localStorage.setItem('aud_volume', this._volume);
    this._applyVolume();
  }

  /** Toggle music */
  setMusicOn(on) {
    this._musicOn = on;
    localStorage.setItem('aud_music', on);
    on ? this.playBGM() : this.bgm.pause();
  }

  /** Toggle SFX */
  setSFXOn(on) {
    this._sfxOn = on;
    localStorage.setItem('aud_sfx', on);
  }

  syncUI() {
    const sfxEl      = document.getElementById('toggleSfx');
    const musicEl    = document.getElementById('toggleMusic');
    const sliderEl   = document.getElementById('volumeSlider');

    if (sfxEl)    sfxEl.checked    = this._sfxOn;
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

    if (sfxEl) sfxEl.addEventListener('change', (e) => {
      this.setSFXOn(e.target.checked);
    });

    if (musicEl) musicEl.addEventListener('change', (e) => {
      this.setMusicOn(e.target.checked);
    });

    if (sliderEl) sliderEl.addEventListener('input', (e) => {
      this.setVolume(e.target.value / 100);
      this._updateSliderGradient(e.target);
    });
  }

  _applyVolume() {
    this.bgm.volume = this._musicOn ? this._volume : 0;
  }

  _updateSliderGradient(slider) {
    slider.style.background =
      `linear-gradient(90deg, var(--gold) ${slider.value}%, #2a1505 ${slider.value}%)`;
  }
}
const audioManager = new AudioManager();