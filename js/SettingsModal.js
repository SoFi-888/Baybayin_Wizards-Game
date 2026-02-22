class SettingsModal {
  constructor() {
    this.overlay  = document.getElementById('settingsModal');
    this.closeBtn = document.getElementById('modalClose');

    this._bindEvents();
  }

  /** Opens the settings modal */
  open() {
    this.overlay.classList.add('is-open');
  }

  /** Closes the settings modal */
  close() {
    this.overlay.classList.remove('is-open');
  }

  /** Returns whether the modal is currently open */
  isOpen() {
    return this.overlay.classList.contains('is-open');
  }

  /** Binds all modal interaction events */
  _bindEvents() {
    // Close button
    this.closeBtn.addEventListener('click', () => this.close());

    // Click outside modal box to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Escape key to close
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

    // Volume slider — update gradient fill to reflect value
    const slider = document.getElementById('volumeSlider');
    slider.addEventListener('input', function () {
      this.style.background =
        `linear-gradient(90deg, var(--gold) ${this.value}%, #2a1505 ${this.value}%)`;
    });
  }
}