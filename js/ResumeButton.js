class ResumeButton {
  static SAVE_KEY = 'baybayinSave';

  constructor(buttonId) {
    this.btn = document.getElementById(buttonId);
    this._checkSave();
  }

  /** Checks Save files */
  _checkSave() {
    const hasSave = localStorage.getItem(ResumeButton.SAVE_KEY);
    if (hasSave) {
      this.enable();
    }
  }

  enable() {
    this.btn.classList.remove('btn--disabled');
    this.btn.removeAttribute('disabled');
  }

  disable() {
    this.btn.classList.add('btn--disabled');
    this.btn.setAttribute('disabled', true);
  }

  static hasSave() {
    return Boolean(localStorage.getItem(ResumeButton.SAVE_KEY));
  }
}