class ResumeButton {
  static SAVE_KEY = 'baybayinSave';

  constructor(buttonId) {
    this.btn = document.getElementById(buttonId);
    this._checkSave();
  }

  /** Enables the button if a save file exists in localStorage */
  _checkSave() {
    const hasSave = localStorage.getItem(ResumeButton.SAVE_KEY);
    if (hasSave) {
      this.enable();
    }
  }

  /** Enables the Resume button */
  enable() {
    this.btn.classList.remove('btn--disabled');
    this.btn.removeAttribute('disabled');
  }

  /** Disables the Resume button */
  disable() {
    this.btn.classList.add('btn--disabled');
    this.btn.setAttribute('disabled', true);
  }

  /** Returns whether a save file currently exists */
  static hasSave() {
    return Boolean(localStorage.getItem(ResumeButton.SAVE_KEY));
  }
}