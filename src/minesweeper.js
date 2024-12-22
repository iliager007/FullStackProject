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
    // Initialize empty board without mines
    for (let y = 0; y < this.height; y++) {
      this.board[y] = Array(this.width).fill(0);
      this.revealed[y] = Array(this.width).fill(false);
      this.flagged[y] = Array(this.width).fill(false);
    }
  }

  initialize(firstX, firstY) {
    if (this.initialized) return;
    
    // Get safe cells (first click and its neighbors)
    const safeCells = this.getSafeCells(firstX, firstY);
    
    // Place mines avoiding safe cells
    let minesPlaced = 0;
    while (minesPlaced < this.mines) {
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * this.height);
      
      // Check if position is safe to place a mine
      if (this.board[y][x] !== -1 && !safeCells.some(cell => cell.x === x && cell.y === y)) {
        this.board[y][x] = -1;
        minesPlaced++;
      }
    }

    // Calculate numbers
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.board[y][x] !== -1) {
          this.board[y][x] = this.countAdjacentMines(x, y);
        }
      }
    }

    this.initialized = true;
  }

  getSafeCells(x, y) {
    const safeCells = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const ny = y + dy;
        const nx = x + dx;
        if (ny >= 0 && ny < this.height && nx >= 0 && nx < this.width) {
          safeCells.push({ x: nx, y: ny });
        }
      }
    }
    return safeCells;
  }

  countAdjacentMines(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const ny = y + dy;
        const nx = x + dx;
        if (ny >= 0 && ny < this.height && nx >= 0 && nx < this.width) {
          if (this.board[ny][nx] === -1) count++;
        }
      }
    }
    return count;
  }

  reveal(x, y) {
    if (this.gameOver || this.flagged[y][x]) return false;

    // Initialize board on first click
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
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < this.height && nx >= 0 && nx < this.width) {
              this.reveal(nx, ny);
            }
          }
        }
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