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
    const overlay = document.getElementById('nameModal');
    const input   = document.getElementById('playerNameInput');
    const confirm = document.getElementById('btnConfirmName');
    const error   = document.getElementById('nameError');

    const saved = localStorage.getItem('playerName');
    if (saved) input.value = saved;

    // Open modal
    overlay.classList.add('is-open');
    setTimeout(() => input.focus(), 100);

    const onConfirm = () => {
      const name = input.value.trim();
      if (!name) {
        error.classList.remove('hidden');
        input.focus();
        return;
      }
      error.classList.add('hidden');
      localStorage.setItem('playerName', name);
      overlay.classList.remove('is-open');
      window.location.href = '/gameplay/index.html';
    };

    const onKeydown = (e) => {
      if (e.key === 'Enter') onConfirm();
    };

    confirm.addEventListener('click', onConfirm,  { once: true });
    input.addEventListener('keydown', onKeydown);
  }
}