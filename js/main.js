document.addEventListener('DOMContentLoaded', () => {
  const engine = new GameEngine();
  engine.start();

  requestAnimationFrame(() => {
    const savedName = localStorage.getItem('playerName');
    const label = document.querySelector('.score-label');
    if (label) label.textContent = savedName ? savedName.toUpperCase() : 'TALA';
  });
});