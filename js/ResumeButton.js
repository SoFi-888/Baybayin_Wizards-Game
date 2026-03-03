class ResumeButton {
  constructor(buttonId) {
    this.btn     = document.getElementById(buttonId);
    this.overlay = document.getElementById('resumeModal');
    this.slotsEl = document.getElementById('resumeSlots');

    this._refresh();
    this._bind();
  }

  _refresh() {
    if (SaveManager.hasAnySave()) {
      this.btn.classList.remove('btn--disabled');
      this.btn.removeAttribute('disabled');
    } else {
      this.btn.classList.add('btn--disabled');
      this.btn.setAttribute('disabled', true);
    }
  }

  _bind() {
    this.btn.addEventListener('click', () => {
      if (this.btn.disabled) return;
      this._renderSlots();
      this.overlay.classList.add('is-open');
    });
    document.getElementById('resumeModalClose').addEventListener('click', () => {
      this.overlay.classList.remove('is-open');
    });
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.overlay.classList.remove('is-open');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.overlay.classList.remove('is-open');
    });
  }

  _renderSlots() {
    const slots = SaveManager.allSlots();
    this.slotsEl.innerHTML = '';
    slots.forEach(({ index, data }) => {
      const card = document.createElement('div');
      card.className = 'save-card ' + (data ? 'save-card--filled' : 'save-card--empty');
      if (data) {
        card.innerHTML =
          '<div class="save-card__slot">SLOT ' + (index + 1) + '</div>' +
          '<div class="save-card__name">' + this._esc(data.playerName || 'Unknown') + '</div>' +
          '<div class="save-card__stats">' +
            '<span>\u2B50 ' + (data.score || 0).toLocaleString() + '</span>' +
            '<span>\uD83D\uDD25 ' + (data.bestStreak || 0) + ' streak</span>' +
          '</div>' +
          '<div class="save-card__info">' +
            '<span>Ch.' + ((data.chapterIdx || 0) + 1) + ' \u00B7 Lv.' + (data.levelNum || 1) + '</span>' +
            '<span>' + (data.hintsLeft !== undefined ? data.hintsLeft : 3) + ' hints left</span>' +
          '</div>' +
          '<div class="save-card__date">' + SaveManager.formatDate(data.savedAt) + '</div>';
        card.addEventListener('click', () => this._loadSlot(index));
      } else {
        card.innerHTML =
          '<div class="save-card__slot">SLOT ' + (index + 1) + '</div>' +
          '<div class="save-card__empty-label">\u2014 Empty \u2014</div>';
      }
      this.slotsEl.appendChild(card);
    });
  }

  _loadSlot(index) {
    SaveManager.setActiveSlot(index);
    this.overlay.classList.remove('is-open');
    window.location.href = 'gameplay/index.html';
  }

  _esc(str) {
    return str.replace(/[&<>"']/g, function(c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  static hasSave() { return SaveManager.hasAnySave(); }
}