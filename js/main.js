document.addEventListener('DOMContentLoaded', () => {
  const engine = new GameEngine();
  engine.start();

  const savedName = localStorage.getItem('playerName');
  if (savedName) {
    const label = document.querySelector('.score-label');
    if (label) label.textContent = savedName.toUpperCase();
  }
});