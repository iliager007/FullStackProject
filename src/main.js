import './style.css';
import { Minesweeper } from './minesweeper.js';
import { DIFFICULTIES } from './config.js';
import { authService } from './services/auth.js';

const CELL_SIZE = 30;
let game = new Minesweeper(DIFFICULTIES.EASY.width, DIFFICULTIES.EASY.height, DIFFICULTIES.EASY.mines);
let timer = null;
let startTime = null;
let timerDisplay = null;

let isAuthenticated = false;
let currentUsername = null;

async function checkAuthStatus() {
    try {
        const response = await authService.checkAuth();
        isAuthenticated = response.isAuthenticated;
        currentUsername = response.username;
        createUI();
    } catch (error) {
        isAuthenticated = false;
        createUI();
    }
}

function createAuthUI() {
    const app = document.getElementById('app');

    if (!app) {
        return;
    }

    app.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = 'auth-container';
    
    const header = document.createElement('h1');
    header.textContent = 'Minesweeper';
    container.appendChild(header);

    // Login Form
    const loginForm = document.createElement('form');
    loginForm.className = 'auth-form';
    loginForm.innerHTML = `
        <h2>Login</h2>
        <input type="text" placeholder="Username" id="loginUsername" required>
        <input type="password" placeholder="Password" id="loginPassword" required>
        <button type="submit">Login</button>
        <p>Don't have an account? <a href="#" id="showRegister">Register</a></p>
    `;

    // Register Form
    const registerForm = document.createElement('form');
    registerForm.className = 'auth-form hidden';
    registerForm.innerHTML = `
        <h2>Register</h2>
        <input type="text" placeholder="Username" id="registerUsername" required>
        <input type="password" placeholder="Password" id="registerPassword" required>
        <button type="submit">Register</button>
        <p>Already have an account? <a href="#" id="showLogin">Login</a></p>
    `;

    container.appendChild(loginForm);
    container.appendChild(registerForm);
    app.appendChild(container);

    // Wait for elements to be in DOM before adding event listeners
    setTimeout(() => {
        const showRegisterLink = document.getElementById('showRegister');
        const showLoginLink = document.getElementById('showLogin');

        if (!showRegisterLink || !showLoginLink) {
            return;
        }

        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        });

        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        });

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const response = await authService.login(
                    document.getElementById('loginUsername').value,
                    document.getElementById('loginPassword').value
                );
                if (response.message === 'Login successful') {
                    checkAuthStatus();
                } else {
                    alert(response.error || 'Login failed');
                }
            } catch (error) {
                alert('Login failed');
            }
        });

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const response = await authService.register(
                    document.getElementById('registerUsername').value,
                    document.getElementById('registerPassword').value
                );
                if (response.message === 'User created successfully') {
                    alert('Registration successful! Please login.');
                    loginForm.classList.remove('hidden');
                    registerForm.classList.add('hidden');
                } else {
                    alert(response.error || 'Registration failed');
                }
            } catch (error) {
                alert('Registration failed');
            }
        });
    }, 0);
}

function createUI() {
    if (!isAuthenticated) {
        createAuthUI();
        return;
    }

    const app = document.getElementById('app');
    app.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = 'game-container';
    
    // Add user info and logout button
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `
        <span>Welcome, ${currentUsername}!</span>
        <button id="logoutBtn">Logout</button>
    `;
    container.appendChild(userInfo);

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

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await authService.logout();
        isAuthenticated = false;
        currentUsername = null;
        createUI();
    });
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

// Initialize the app after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});