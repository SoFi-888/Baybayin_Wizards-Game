document.addEventListener('DOMContentLoaded', () => {

  const settingsModal = new SettingsModal();

  new ResumeButton('btnResume');

  new StartButton('btnStart');

  document.getElementById('btnSettings').addEventListener('click', () => {
    settingsModal.open();
  });
});