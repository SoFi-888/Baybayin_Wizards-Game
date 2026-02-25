document.addEventListener('DOMContentLoaded', () => {

  const settingsModal = new SettingsModal();

  new ResumeButton('btnResume');

  document.getElementById('btnSettings').addEventListener('click', () => {
    settingsModal.open();
  });

});