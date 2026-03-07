document.addEventListener('DOMContentLoaded', function() {

  var engine = new GameEngine();
  var isNewGame = new URLSearchParams(window.location.search).get('newgame') === '1';
  var activeSlot = isNewGame ? null : SaveManager.getActiveSlot();
  if (activeSlot !== null) {
    var loaded = engine.loadFromSlot(activeSlot);
    if (loaded) { engine._paused = false; engine._startQueue(); }
    else { engine.start(); }
  } else { engine.start(); }

  requestAnimationFrame(function() {
    var n = localStorage.getItem('playerName');
    var el = document.querySelector('.score-label');
    if (el) el.textContent = n ? n.toUpperCase() : 'TALA';
  });

  audioManager.resumeBGM();
  document.addEventListener('click', function() { audioManager.playBGM(); }, { once: true });
  document.getElementById('tileGrid').addEventListener('click', function() { audioManager.playSFX(); });
  document.querySelectorAll('.action-btn, .ol-btn').forEach(function(b) {
    b.addEventListener('click', function() { audioManager.playSFX(); });
  });

  var gpOverlay = document.getElementById('gpSettingsModal');
  var gpClose   = document.getElementById('gpModalClose');
  audioManager.syncUI();
  audioManager.bindSettingsControls();

  var fsEl = document.getElementById('toggleFullscreen');
  if (fsEl) fsEl.addEventListener('change', function() {
    if (this.checked) { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); }
    else { if (document.exitFullscreen) document.exitFullscreen(); }
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

  var saveSlotModal    = document.getElementById('saveSlotModal');
  var saveSlotClose    = document.getElementById('saveSlotClose');
  var saveConfirmModal = document.getElementById('saveConfirmModal');
  var saveConfirmMsg   = document.getElementById('saveConfirmMsg');
  var saveConfirmYes   = document.getElementById('saveConfirmYes');
  var saveConfirmNo    = document.getElementById('saveConfirmNo');
  var pendingSaveSlot  = null;

  function escHtml(s) {
    var m={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}; m["'"]="&#39;";
    return String(s).replace(/[&<>"']/g, function(c){ return m[c]; });
  }

  function renderSaveSlots() {
    var c = document.getElementById('saveSlots');
    c.innerHTML = '';
    SaveManager.allSlots().forEach(function(o) {
      var idx = o.index; var d = o.data;
      var card = document.createElement('div');
      card.className = 'save-card ' + (d ? 'save-card--filled' : 'save-card--empty');
      if (d) {
        card.innerHTML =
          '<div class="save-card__slot">SLOT '+(idx+1)+'</div>'+
          '<div class="save-card__name">'+escHtml(d.playerName||'?')+'</div>'+
          '<div class="save-card__stats"><span>Score: '+(d.score||0).toLocaleString()+'</span><span>Streak: '+(d.bestStreak||0)+'</span></div>'+
          '<div class="save-card__info"><span>Ch.'+((d.chapterIdx||0)+1)+' Lv.'+(d.levelNum||1)+'</span><span>'+(d.hintsLeft!==undefined?d.hintsLeft:3)+' hints</span></div>'+
          '<div class="save-card__date">'+SaveManager.formatDate(d.savedAt)+'</div>';
      } else {
        card.innerHTML = '<div class="save-card__slot">SLOT '+(idx+1)+'</div><div class="save-card__empty-label">-- Empty --</div>';
      }
      (function(i,dd) {
        card.addEventListener('click', function() {
          pendingSaveSlot = i;
          saveConfirmMsg.textContent = dd
            ? 'Overwrite Slot '+(i+1)+' ('+escHtml(dd.playerName||'')+')? Cannot be undone.'
            : 'Save to Slot '+(i+1)+'?';
          saveSlotModal.classList.add('hidden');
          saveConfirmModal.classList.remove('hidden');
        });
      }(idx, d));
      c.appendChild(card);
    });
  }

  document.getElementById('btnSaveGame').addEventListener('click', function() {
    document.getElementById('pauseOverlay').classList.add('hidden');
    renderSaveSlots(); saveSlotModal.classList.remove('hidden');
  });
  saveSlotClose.addEventListener('click', function() {
    saveSlotModal.classList.add('hidden');
    document.getElementById('pauseOverlay').classList.remove('hidden');
  });
  saveConfirmYes.addEventListener('click', function() {
    if (pendingSaveSlot !== null) { engine.saveToSlot(pendingSaveSlot); pendingSaveSlot = null; }
    saveConfirmModal.classList.add('hidden');
    document.getElementById('pauseOverlay').classList.remove('hidden');
    engine._feedback('Game Saved!', 'correct'); engine.resume();
  });
  saveConfirmNo.addEventListener('click', function() {
    pendingSaveSlot = null; saveConfirmModal.classList.add('hidden');
    renderSaveSlots(); saveSlotModal.classList.remove('hidden');
  });

});