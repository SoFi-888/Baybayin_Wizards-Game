document.addEventListener('DOMContentLoaded', () => {
  const engine = new GameEngine();
  engine.start();

  requestAnimationFrame(() => {
    const savedName = localStorage.getItem('playerName');
    const byId    = document.getElementById('playerName');
    const byClass = document.querySelector('.score-label');
    if (byId)    byId.textContent    = savedName ? savedName.toUpperCase() : 'PLAYER';
    if (byClass) byClass.textContent = savedName ? savedName.toUpperCase() : 'TALA';
  });

  document.addEventListener('click', () => audioManager.playBGM(), { once: true });
  document.getElementById('tileGrid').addEventListener('click', () => audioManager.playSFX());
  document.querySelectorAll('.action-btn, .ol-btn').forEach(btn => {
    btn.addEventListener('click', () => audioManager.playSFX());
  });

  const gpOverlay = document.getElementById('gpSettingsModal');
  const gpClose   = document.getElementById('gpModalClose');
  const gpOpenBtn = document.getElementById('btnTopSettings');

  audioManager.syncUI();
  audioManager.bindSettingsControls();

  const fsEl = document.getElementById('toggleFullscreen');
  if (fsEl) fsEl.addEventListener('change', function () {
    if (this.checked) document.documentElement.requestFullscreen?.();
    else              document.exitFullscreen?.();
  });

  gpOpenBtn.addEventListener('click', () => {
    audioManager.syncUI();
    gpOverlay.classList.remove('hidden');
    engine.pause();
  });

  document.addEventListener('openGameSettings', () => {
    audioManager.syncUI();
    gpOverlay.classList.remove('hidden');
  });
  
  gpClose.addEventListener('click', () => {
    gpOverlay.classList.add('hidden');
    engine.resume();
  });
  gpOverlay.addEventListener('click', (e) => {
    if (e.target === gpOverlay) {
      gpOverlay.classList.add('hidden');
      engine.resume();
    }
  });
});