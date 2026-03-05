document.addEventListener('DOMContentLoaded', () => {

  const settingsModal = new SettingsModal();
  const creditsModal = new CreditsModal();

  new ResumeButton('btnResume');
  audioManager.resumeBGM();
  audioManager.playBGM();
  document.addEventListener('click', () => audioManager.playBGM(), { once: true });

  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => audioManager.playSFX());
  });

  document.getElementById('btnSettings').addEventListener('click', () => {
    settingsModal.open();
  });

  document.getElementById('btnCredits').addEventListener('click', () => {
    creditsModal.open();
  });

});