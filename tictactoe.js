// tictactoe.js - Tic Tac Toe Logic for Mini Game Hub

class TicTacToeApp {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X'; // X or O
        this.isActive = false;
        this.mode = 'pve'; // pve or pvp
        
        // DOM Elements
        this.cells = document.querySelectorAll('.ttt-cell');
        this.statusEl = document.getElementById('ttt-status');
        this.modeSelect = document.getElementById('ttt-mode');
        this.startBtn = document.getElementById('ttt-start-btn');
        
        this.bindEvents();
    }
    
    init() {
        this.mode = this.modeSelect.value;
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.isActive = true;
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'win', 'occupied');
        });
        
        this.updateStatus();
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.init());
        this.modeSelect.addEventListener('change', () => this.init());
        
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
    }
    
    handleCellClick(e) {
        if (!this.isActive) return;
        
        const cell = e.target;
        const index = parseInt(cell.getAttribute('data-index'));
        
        if (this.board[index] !== null) return;
        
        this.makeMove(index, this.currentPlayer);
        
        if (this.isActive && this.mode === 'pve' && this.currentPlayer === 'O') {
            this.makeAiMove();
        }
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        const cell = this.cells[index];
        cell.textContent = player;
        cell.classList.add(player.toLowerCase(), 'occupied');
        
        if (window.AudioSys) window.AudioSys.playPlaceCard(); // Reuse domino sound
        
        if (this.checkWin(player)) {
            this.endGame(`${player} Menang! 🎉`);
            this.highlightWin(player);
        } else if (this.board.every(cell => cell !== null)) {
            this.endGame("Seri! 🤝");
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateStatus();
        }
    }
    
    makeAiMove() {
        this.isActive = false;
        this.statusEl.textContent = "AI Berpikir...";
        
        setTimeout(() => {
            let move = this.getBestMove();
            if (move === -1) {
                // Fallback to random
                const available = this.board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
                if (available.length > 0) {
                    move = available[Math.floor(Math.random() * available.length)];
                }
            }
            
            if (move !== -1) {
                this.isActive = true;
                this.makeMove(move, 'O');
            }
        }, 500 + Math.random() * 500);
    }
    
    // Very simple AI: check if can win, then block, then random
    getBestMove() {
        // Can AI win?
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'O';
                if (this.checkWin('O', true)) {
                    this.board[i] = null;
                    return i;
                }
                this.board[i] = null;
            }
        }
        
        // Block player win?
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'X';
                if (this.checkWin('X', true)) {
                    this.board[i] = null;
                    return i;
                }
                this.board[i] = null;
            }
        }
        
        // Take center
        if (this.board[4] === null) return 4;
        
        return -1;
    }
    
    checkWin(player, ignoreHighlight = false) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        
        for (let pattern of winPatterns) {
            if (this.board[pattern[0]] === player && 
                this.board[pattern[1]] === player && 
                this.board[pattern[2]] === player) {
                
                if (!ignoreHighlight) {
                    this.winPattern = pattern;
                }
                return true;
            }
        }
        return false;
    }
    
    highlightWin(player) {
        if (this.winPattern) {
            this.winPattern.forEach(index => {
                this.cells[index].classList.add('win');
            });
        }
    }
    
    updateStatus() {
        this.statusEl.textContent = `Giliran: ${this.currentPlayer}`;
        if (this.currentPlayer === 'O') {
            this.statusEl.style.color = '#3b82f6';
        } else {
            this.statusEl.style.color = 'var(--accent)';
        }
    }
    
    endGame(message) {
        this.isActive = false;
        this.statusEl.textContent = message;
        this.statusEl.style.color = 'white';
    }
}

// Instantiate and expose globally for hub
window.tttApp = new TicTacToeApp();
