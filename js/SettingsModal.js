class SettingsModal {
  constructor() {
    this.overlay  = document.getElementById('settingsModal');
    this.closeBtn = document.getElementById('modalClose');

    this._bindEvents();
  }

  /** Open Settings */
  open() {
    this.overlay.classList.add('is-open');
  }

  close() {
    this.overlay.classList.remove('is-open');
  }

  isOpen() {
    return this.overlay.classList.contains('is-open');
  }

  _bindEvents() {
    // Close button
    this.closeBtn.addEventListener('click', () => this.close());

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) this.close();
    });

    // Fullscreen toggle
    document.getElementById('toggleFullscreen').addEventListener('change', function () {
      if (this.checked) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    });
    // Volume Slider
    const slider = document.getElementById('volumeSlider');
    slider.addEventListener('input', function () {
      this.style.background =
        `linear-gradient(90deg, var(--gold) ${this.value}%, #2a1505 ${this.value}%)`;
    });
  }
}