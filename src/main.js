import './style.css';
import { Minesweeper } from './minesweeper.js';
import { DIFFICULTIES } from './config.js';

const CELL_SIZE = 30;
let game = new Minesweeper(DIFFICULTIES.EASY.width, DIFFICULTIES.EASY.height, DIFFICULTIES.EASY.mines);
let timer = null;
let startTime = null;
let timerDisplay = null;

function createUI() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  
  const container = document.createElement('div');
  container.className = 'game-container';
  
  // Header
  const header = document.createElement('h1');
  header.textContent = 'Minesweeper';
  container.appendChild(header);
  
  // Difficulty selector
  const difficultyContainer = document.createElement('div');
  difficultyContainer.className = 'difficulty-selector';
  
  const difficultySelect = document.createElement('select');
  difficultySelect.className = 'difficulty-select';
  
  Object.values(DIFFICULTIES).forEach(difficulty => {
    const option = document.createElement('option');
    option.value = difficulty.name;
    option.textContent = difficulty.name;
    difficultySelect.appendChild(option);
  });
  
  difficultySelect.addEventListener('change', (e) => {
    const selectedDifficulty = Object.values(DIFFICULTIES).find(d => d.name === e.target.value);
    game = new Minesweeper(selectedDifficulty.width, selectedDifficulty.height, selectedDifficulty.mines);
    createBoard();
    updateBoard();
  });
  
  difficultyContainer.appendChild(difficultySelect);
  
  // Reset button
  const resetButton = document.createElement('button');
  resetButton.textContent = 'New Game';
  resetButton.className = 'reset-button';
  resetButton.addEventListener('click', () => {
    const selectedDifficulty = Object.values(DIFFICULTIES).find(d => d.name === difficultySelect.value);
    game = new Minesweeper(selectedDifficulty.width, selectedDifficulty.height, selectedDifficulty.mines);
    createBoard();
    updateBoard();
  });
  
  const controls = document.createElement('div');
  controls.className = 'controls';
  controls.appendChild(difficultyContainer);
  controls.appendChild(resetButton);

  // Timer
  timerDisplay = document.createElement('div');
  timerDisplay.className = 'timer';
  timerDisplay.textContent = '0:00';
  controls.appendChild(timerDisplay);
  
  container.appendChild(controls);

  
  // Game board
  const board = document.createElement('div');
  board.className = 'board';
  board.style.display = 'grid';
  board.style.gridTemplateColumns = `repeat(${game.width}, ${CELL_SIZE}px)`;
  
  for (let y = 0; y < game.height; y++) {
    for (let x = 0; x < game.width; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x;
      cell.dataset.y = y;
      board.appendChild(cell);
    }
  }

  board.addEventListener('click', handleClick);
  board.addEventListener('contextmenu', handleRightClick);
  
  container.appendChild(board);
  app.appendChild(container);
}

function updateBoard() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
    
    cell.className = 'cell';
    if (game.revealed[y][x]) {
      cell.classList.add('revealed');
      const value = game.board[y][x];
      if (value === -1) {
        cell.classList.add('mine');
        cell.textContent = '💣';
      } else if (value > 0) {
        cell.textContent = value;
        cell.classList.add(`number-${value}`);
      }
    } else if (game.flagged[y][x]) {
      cell.textContent = '🚩';
    } else {
      cell.textContent = '';
    }
  });

  if (game.gameOver) {
    if (game.won) {
      timerDisplay.textContent = 'You Won!';
      timerDisplay.style.color = '#2ecc71';
    } else {
      timerDisplay.textContent = 'Game Over!';
      timerDisplay.style.color = '#e74c3c';
    }
  }
}

function handleClick(event) {
  const cell = event.target;
  if (!cell.classList.contains('cell')) return;
  
  const x = parseInt(cell.dataset.x);
  const y = parseInt(cell.dataset.y);

  if (!timer && !game.gameOver) {
    startTime = Date.now();
    timer = setInterval(updateTimer, 1000);
  }
  
  game.reveal(x, y);
  updateBoard();
}

function handleRightClick(event) {
  event.preventDefault();
  const cell = event.target;
  if (!cell.classList.contains('cell')) return;
  
  const x = parseInt(cell.dataset.x);
  const y = parseInt(cell.dataset.y);
  
  game.toggleFlag(x, y);
  updateBoard();
}

function updateTimer() {
  if (game.gameOver) {
    clearInterval(timer);
    timer = null;
    return;
  }
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  timerDisplay.style.removeProperty('color');
}

function createBoard() {
  const board = document.querySelector('.board');
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${game.width}, ${CELL_SIZE}px)`;
  
  for (let y = 0; y < game.height; y++) {
    for (let x = 0; x < game.width; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x;
      cell.dataset.y = y;
      board.appendChild(cell);
    }
  }
  
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  startTime = null;
  timerDisplay.textContent = '0:00';
  timerDisplay.style.removeProperty('color');
}

// Initialize the game
createUI();
updateBoard();