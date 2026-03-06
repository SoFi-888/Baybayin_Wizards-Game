class StartButton {
  constructor(buttonId) {
    this.btn = document.getElementById(buttonId);
    this._bindEvents();
  }

  _bindEvents() {
    if (this.btn) {
      this.btn.addEventListener('click', (e) => this._onClick(e));
    }
  }

  _onClick(event) {
    this._transitionToGame();
  }

  _transitionToGame() {
    const overlay = document.getElementById('nameModal');
    const input   = document.getElementById('playerNameInput');
    const confirm = document.getElementById('btnConfirmName');
    const error   = document.getElementById('nameError');
    const comic   = document.getElementById('cutsceneOverlay');

    const saved = localStorage.getItem('playerName');
    if (saved) input.value = saved;

    // Open name entry modal
    overlay.classList.add('is-open');
    setTimeout(() => input.focus(), 100);

    const onConfirm = () => {
      const name = input.value.trim();
      if (!name) {
        if (error) error.classList.remove('hidden');
        input.focus();
        return;
      }
      if (error) error.classList.add('hidden');
      
      // Save name to local storage
      localStorage.setItem('playerName', name);
      
      // Close name modal
      overlay.classList.remove('is-open');

      // ── SHOW COMIC OVERLAY ──
      if (comic) {
        comic.classList.remove('hidden');
        
        // Make the comic clickable to reach the game screen
        comic.onclick = () => {
          window.location.href = 'gameplay/index.html';
        };
      } else {
        // Fallback if comic element is missing
        window.location.href = 'gameplay/index.html';
      }
    };

    const onKeydown = (e) => {
      if (e.key === 'Enter') {
        // Remove listener to prevent double-firing
        input.removeEventListener('keydown', onKeydown);
        onConfirm();
      }
    };

    // Use a standard click listener instead of {once: true} to ensure 
    // it doesn't get lost if the user clicks and fails validation
    confirm.onclick = () => {
      onConfirm();
    };
    
    input.addEventListener('keydown', onKeydown);
  }
}