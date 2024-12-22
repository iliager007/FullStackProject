export class Minesweeper {
  constructor(width = 10, height = 10, mines = 10) {
    this.width = width;
    this.height = height;
    this.mines = mines;
    this.board = [];
    this.revealed = [];
    this.flagged = [];
    this.gameOver = false;
    this.won = false;
    this.initialized = false;
    this.initializeEmptyBoard();
  }

  initializeEmptyBoard() {
    for (let y = 0; y < this.height; y++) {
      this.board[y] = Array(this.width).fill(0);
      this.revealed[y] = Array(this.width).fill(false);
      this.flagged[y] = Array(this.width).fill(false);
    }
  }

  initialize(firstX, firstY) {
    if (this.initialized) return;
    
    const safeCells = this.getSafeCells(firstX, firstY);
    this.placeMines(safeCells);
    this.calculateNumbers();
    this.initialized = true;
  }

  placeMines(safeCells) {
    let minesPlaced = 0;
    while (minesPlaced < this.mines) {
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * this.height);
      
      if (this.board[y][x] !== -1 && !safeCells.some(cell => cell.x === x && cell.y === y)) {
        this.board[y][x] = -1;
        minesPlaced++;
      }
    }
  }

  calculateNumbers() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.board[y][x] !== -1) {
          this.board[y][x] = this.countAdjacentMines(x, y);
        }
      }
    }
  }

  getSafeCells(x, y) {
    const safeCells = [];
    this.forEachNeighbor(x, y, (nx, ny) => {
      safeCells.push({ x: nx, y: ny });
    });
    return safeCells;
  }

  countAdjacentMines(x, y) {
    let count = 0;
    this.forEachNeighbor(x, y, (nx, ny) => {
      if (this.board[ny][nx] === -1) count++;
    });
    return count;
  }

  forEachNeighbor(x, y, callback) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const ny = y + dy;
        const nx = x + dx;
        if (this.isValidCell(nx, ny)) {
          callback(nx, ny);
        }
      }
    }
  }

  isValidCell(x, y) {
    return y >= 0 && y < this.height && x >= 0 && x < this.width;
  }

  reveal(x, y) {
    if (this.gameOver || this.flagged[y][x]) return false;

    if (!this.initialized) {
      this.initialize(x, y);
    }

    if (this.board[y][x] === -1) {
      this.gameOver = true;
      return false;
    }

    if (!this.revealed[y][x]) {
      this.revealed[y][x] = true;
      
      if (this.board[y][x] === 0) {
        this.forEachNeighbor(x, y, (nx, ny) => {
          this.reveal(nx, ny);
        });
      }
    }

    this.checkWin();
    return true;
  }

  toggleFlag(x, y) {
    if (!this.revealed[y][x] && !this.gameOver) {
      this.flagged[y][x] = !this.flagged[y][x];
    }
  }

  checkWin() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.board[y][x] !== -1 && !this.revealed[y][x]) return;
      }
    }
    this.won = true;
    this.gameOver = true;
  }
}