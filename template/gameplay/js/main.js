document.addEventListener('DOMContentLoaded', () => {
  const engine = new GameEngine();

  const activeSlot = SaveManager.getActiveSlot();
  if (activeSlot !== null) {
    const loaded = engine.loadFromSlot(activeSlot);
    if (loaded) {
      engine._paused = false;
      engine._startQueue();
    } else {
      engine.start();
    }
  } else {
    engine.start();
  }

  requestAnimationFrame(() => {
    const savedName = localStorage.getItem('playerName');
    const byId    = document.getElementById('playerName');
    const byClass = document.querySelector('.score-label');
    if (byId)    byId.textContent    = savedName ? savedName.toUpperCase() : 'PLAYER';
    if (byClass) byClass.textContent = savedName ? savedName.toUpperCase() : 'TALA';
  });

  // Audio
  audioManager.resumeBGM();
  document.addEventListener('click', () => audioManager.playBGM(), { once: true });
  document.getElementById('tileGrid').addEventListener('click', () => audioManager.playSFX());
  document.querySelectorAll('.action-btn, .ol-btn').forEach(btn => {
    btn.addEventListener('click', () => audioManager.playSFX());
  });

  /* - Settings modal - */
  var gpOverlay = document.getElementById('gpSettingsModal');
  var gpClose   = document.getElementById('gpModalClose');
  var gpOpenBtn = document.getElementById('btnTopSettings');
  audioManager.syncUI();
  audioManager.bindSettingsControls();

  var fsEl = document.getElementById('toggleFullscreen');
  if (fsEl) fsEl.addEventListener('change', function() {
    if (this.checked) { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); }
    else { if (document.exitFullscreen) document.exitFullscreen(); }
  });

  gpOpenBtn.addEventListener('click', function() {
    audioManager.syncUI(); gpOverlay.classList.remove('hidden'); engine.pause();
  });
  document.addEventListener('openGameSettings', function() {
    audioManager.syncUI(); gpOverlay.classList.remove('hidden');
  });
  gpClose.addEventListener('click', function() {
    gpOverlay.classList.add('hidden'); engine.resume();
  });
  gpOverlay.addEventListener('click', function(e) {
    if (e.target === gpOverlay) { gpOverlay.classList.add('hidden'); engine.resume(); }
  });

  /* - Save slots - */
  var saveSlotModal    = document.getElementById('saveSlotModal');
  var saveSlotClose    = document.getElementById('saveSlotClose');
  var saveConfirmModal = document.getElementById('saveConfirmModal');
  var saveConfirmMsg   = document.getElementById('saveConfirmMsg');
  var saveConfirmYes   = document.getElementById('saveConfirmYes');
  var saveConfirmNo    = document.getElementById('saveConfirmNo');
  var pendingSaveSlot  = null;

  function escHtml(str) {
    return String(str).replace(/[&<>"']/g, function(c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function renderSaveSlots() {
    var container = document.getElementById('saveSlots');
    container.innerHTML = '';
    SaveManager.allSlots().forEach(function(slotObj) {
      var index = slotObj.index;
      var data  = slotObj.data;
      var card  = document.createElement('div');
      card.className = 'save-card ' + (data ? 'save-card--filled' : 'save-card--empty');
      if (data) {
        card.innerHTML =
          '<div class="save-card__slot">SLOT ' + (index+1) + '</div>' +
          '<div class="save-card__name">' + escHtml(data.playerName||'Unknown') + '</div>' +
          '<div class="save-card__stats"><span>Score: ' + (data.score||0).toLocaleString() + '</span><span>Streak: ' + (data.bestStreak||0) + '</span></div>' +
          '<div class="save-card__info"><span>Ch.' + ((data.chapterIdx||0)+1) + ' Lv.' + (data.levelNum||1) + '</span><span>' + (data.hintsLeft!==undefined?data.hintsLeft:3) + ' hints</span></div>' +
          '<div class="save-card__date">' + SaveManager.formatDate(data.savedAt) + '</div>';
      } else {
        card.innerHTML = '<div class="save-card__slot">SLOT ' + (index+1) + '</div><div class="save-card__empty-label">-- Empty --</div>';
      }
      (function(i, d) {
        card.addEventListener('click', function() {
          pendingSaveSlot = i;
          saveConfirmMsg.textContent = d
            ? 'Overwrite Slot ' + (i+1) + ' (' + escHtml(d.playerName||'') + ')? Cannot be undone.'
            : 'Save to Slot ' + (i+1) + '?';
          saveSlotModal.classList.add('hidden');
          saveConfirmModal.classList.remove('hidden');
        });
      }(index, data));
      container.appendChild(card);
    });
  }

  document.getElementById('btnSaveGame').addEventListener('click', function() {
    document.getElementById('pauseOverlay').classList.add('hidden');
    renderSaveSlots();
    saveSlotModal.classList.remove('hidden');
  });
  saveSlotClose.addEventListener('click', function() {
    saveSlotModal.classList.add('hidden');
    document.getElementById('pauseOverlay').classList.remove('hidden');
  });
  saveConfirmYes.addEventListener('click', function() {
    if (pendingSaveSlot !== null) {
      engine.saveToSlot(pendingSaveSlot);
      pendingSaveSlot = null;
    }
    saveConfirmModal.classList.add('hidden');
    document.getElementById('pauseOverlay').classList.remove('hidden');
    engine._feedback('Game Saved!', 'correct');
    engine.resume();
  });
  saveConfirmNo.addEventListener('click', function() {
    pendingSaveSlot = null;
    saveConfirmModal.classList.add('hidden');
    renderSaveSlots();
    saveSlotModal.classList.remove('hidden');
  });
});