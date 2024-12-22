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
    if (!app) return;

    app.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = 'auth-container';
    
    const header = document.createElement('h1');
    header.textContent = 'Minesweeper';
    container.appendChild(header);

    const loginForm = createLoginForm();
    const registerForm = createRegisterForm();

    container.appendChild(loginForm);
    container.appendChild(registerForm);
    app.appendChild(container);

    setupAuthEventListeners(loginForm, registerForm);
}

function createLoginForm() {
    const form = document.createElement('form');
    form.className = 'auth-form';
    form.innerHTML = `
        <h2>Login</h2>
        <input type="text" placeholder="Username" id="loginUsername" required>
        <input type="password" placeholder="Password" id="loginPassword" required>
        <button type="submit">Login</button>
        <p>Don't have an account? <a href="#" id="showRegister">Register</a></p>
    `;
    return form;
}

function createRegisterForm() {
    const form = document.createElement('form');
    form.className = 'auth-form hidden';
    form.innerHTML = `
        <h2>Register</h2>
        <input type="text" placeholder="Username" id="registerUsername" required>
        <input type="password" placeholder="Password" id="registerPassword" required>
        <button type="submit">Register</button>
        <p>Already have an account? <a href="#" id="showLogin">Login</a></p>
    `;
    return form;
}

function setupAuthEventListeners(loginForm, registerForm) {
    setTimeout(() => {
        const showRegisterLink = document.getElementById('showRegister');
        const showLoginLink = document.getElementById('showLogin');

        if (!showRegisterLink || !showLoginLink) return;

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

        setupFormSubmitHandlers(loginForm, registerForm);
    }, 0);
}

function setupFormSubmitHandlers(loginForm, registerForm) {
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
    
    addUserInfo(container);
    addGameControls(container);
    addGameBoard(container);

    showGameHistory();
    app.appendChild(container);

    setupLogoutHandler();
}

function addUserInfo(container) {
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `
        <span>Welcome, ${currentUsername}!</span>
        <button id="logoutBtn">Logout</button>
    `;
    container.appendChild(userInfo);

    const header = document.createElement('h1');
    header.textContent = 'Minesweeper';
    container.appendChild(header);
}

function addGameControls(container) {
    const controls = document.createElement('div');
    controls.className = 'controls';
    
    const difficultyContainer = createDifficultySelector();
    const resetButton = createResetButton();
    
    controls.appendChild(difficultyContainer);
    controls.appendChild(resetButton);

    timerDisplay = document.createElement('div');
    timerDisplay.className = 'timer';
    timerDisplay.textContent = '0:00';
    controls.appendChild(timerDisplay);
    
    container.appendChild(controls);
}

function createDifficultySelector() {
    const container = document.createElement('div');
    container.className = 'difficulty-selector';
    
    const select = document.createElement('select');
    select.className = 'difficulty-select';
    
    Object.values(DIFFICULTIES).forEach(difficulty => {
        const option = document.createElement('option');
        option.value = difficulty.name;
        option.textContent = difficulty.name;
        select.appendChild(option);
    });
    
    select.addEventListener('change', (e) => {
        const selectedDifficulty = Object.values(DIFFICULTIES).find(d => d.name === e.target.value);
        game = new Minesweeper(selectedDifficulty.width, selectedDifficulty.height, selectedDifficulty.mines);
        createBoard();
        updateBoard();
    });
    
    container.appendChild(select);
    return container;
}

function createResetButton() {
    const button = document.createElement('button');
    button.textContent = 'New Game';
    button.className = 'reset-button';
    button.addEventListener('click', () => {
        const difficulty = document.querySelector('.difficulty-select').value;
        const selectedDifficulty = Object.values(DIFFICULTIES).find(d => d.name === difficulty);
        game = new Minesweeper(selectedDifficulty.width, selectedDifficulty.height, selectedDifficulty.mines);
        createBoard();
        updateBoard();
    });
    return button;
}

function addGameBoard(container) {
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
}

function setupLogoutHandler() {
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await authService.logout();
        isAuthenticated = false;
        currentUsername = null;
        createUI();
    });
}

function updateBoard() {
    updateCells();
    handleGameOver();
}

function updateCells() {
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
}

function handleGameOver() {
    if (!game.gameOver) return;

    if (timer) {
        clearInterval(timer);
        timer = null;
        
        saveGameResult();
    }

    updateGameOverDisplay();
    setTimeout(showGameHistory, 1000);
}

function saveGameResult() {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const difficulty = document.querySelector('.difficulty-select').value;
    
    fetch('http://84.201.154.208:8000/api/result/save/', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            difficulty,
            timeTaken,
            won: game.won
        })
    }).catch(error => console.error('Error saving result:', error));
}

function updateGameOverDisplay() {
    if (game.won) {
        timerDisplay.textContent = 'You Won!';
        timerDisplay.style.color = '#2ecc71';
    } else {
        timerDisplay.textContent = 'Game Over!';
        timerDisplay.style.color = '#e74c3c';
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
    
    resetTimer();
}

function resetTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    startTime = null;
    timerDisplay.textContent = '0:00';
    timerDisplay.style.removeProperty('color');
}

async function showGameHistory() {
    try {
        const data = await fetchGameHistory();
        updateGameHistoryDisplay(data);
    } catch (error) {
        console.error('Error fetching game history:', error);
    }
}

async function fetchGameHistory() {
    const response = await fetch('http://84.201.154.208:8000/api/result/results/', {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    });
    return await response.json();
}

function updateGameHistoryDisplay(data) {
    const existingHistory = document.querySelector('.game-history');
    if (existingHistory) {
        existingHistory.remove();
    }
    
    const historyDiv = document.createElement('div');
    historyDiv.className = 'game-history';
    historyDiv.innerHTML = `
        <h2>Recent Games</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Difficulty</th>
                    <th>Time</th>
                    <th>Result</th>
                </tr>
            </thead>
            <tbody>
                ${data.results.map(result => `
                    <tr>
                        <td>${result.date}</td>
                        <td>${result.difficulty}</td>
                        <td>${Math.floor(result.timeTaken / 60)}:${(result.timeTaken % 60).toString().padStart(2, '0')}</td>
                        <td>${result.won ? '🏆 Won' : '❌ Lost'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    const container = document.querySelector('.game-container');
    container.appendChild(historyDiv);
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});