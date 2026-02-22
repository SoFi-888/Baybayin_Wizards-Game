class StartButton {
  constructor(buttonId) {
    this.btn = document.getElementById(buttonId);
    this._bindEvents();
  }

  _bindEvents() {
    this.btn.addEventListener('click', (e) => this._onClick(e));
  }

  _onClick(event) {
    this._transitionToGame();
  }

  _transitionToGame() {
    console.log('Starting new game…');
  }
}