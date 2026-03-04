class CreditsModal {
  constructor() {
    this.overlay  = document.getElementById('creditsModal');
    this.closeBtn = document.getElementById('creditsModalClose');

    this._bindEvents();
  }

  /* Open Credits */
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
    this.closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) this.close();
    });
  }
}
