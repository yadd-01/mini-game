// sudoku.js - Sudoku Logic for Mini Game Hub

class SudokuApp {
    constructor() {
        this.boardEl = document.getElementById('sudoku-board');
        this.numpadBtns = document.querySelectorAll('.numpad-btn');
        this.startBtn = document.getElementById('sudoku-start-btn');
        this.diffSelect = document.getElementById('sudoku-diff');
        this.gameoverModal = document.getElementById('sudoku-gameover');
        
        this.selectedCell = null;
        this.solution = [];
        this.currentBoard = [];
        this.initialBoard = [];
        
        // Hardcoded boards for Hackathon (Easy, Medium, Hard)
        this.puzzles = {
            easy: {
                start: [
                    [5,3,0,0,7,0,0,0,0],
                    [6,0,0,1,9,5,0,0,0],
                    [0,9,8,0,0,0,0,6,0],
                    [8,0,0,0,6,0,0,0,3],
                    [4,0,0,8,0,3,0,0,1],
                    [7,0,0,0,2,0,0,0,6],
                    [0,6,0,0,0,0,2,8,0],
                    [0,0,0,4,1,9,0,0,5],
                    [0,0,0,0,8,0,0,7,9]
                ],
                solved: [
                    [5,3,4,6,7,8,9,1,2],
                    [6,7,2,1,9,5,3,4,8],
                    [1,9,8,3,4,2,5,6,7],
                    [8,5,9,7,6,1,4,2,3],
                    [4,2,6,8,5,3,7,9,1],
                    [7,1,3,9,2,4,8,5,6],
                    [9,6,1,5,3,7,2,8,4],
                    [2,8,7,4,1,9,6,3,5],
                    [3,4,5,2,8,6,1,7,9]
                ]
            },
            medium: {
                start: [
                    [0,0,0,2,6,0,7,0,1],
                    [6,8,0,0,7,0,0,9,0],
                    [1,9,0,0,0,4,5,0,0],
                    [8,2,0,1,0,0,0,4,0],
                    [0,0,4,6,0,2,9,0,0],
                    [0,5,0,0,0,3,0,2,8],
                    [0,0,9,3,0,0,0,7,4],
                    [0,4,0,0,5,0,0,3,6],
                    [7,0,3,0,1,8,0,0,0]
                ],
                solved: [
                    [4,3,5,2,6,9,7,8,1],
                    [6,8,2,5,7,1,4,9,3],
                    [1,9,7,8,3,4,5,6,2],
                    [8,2,6,1,9,5,3,4,7],
                    [3,7,4,6,8,2,9,1,5],
                    [9,5,1,7,4,3,6,2,8],
                    [5,1,9,3,2,6,8,7,4],
                    [2,4,8,9,5,7,1,3,6],
                    [7,6,3,4,1,8,2,5,9]
                ]
            },
            hard: {
                start: [
                    [0,0,0,6,0,0,4,0,0],
                    [7,0,0,0,0,3,6,0,0],
                    [0,0,0,0,9,1,0,8,0],
                    [0,0,0,0,0,0,0,0,0],
                    [0,5,0,1,8,0,0,0,3],
                    [0,0,0,3,0,6,0,4,5],
                    [0,4,0,2,0,0,0,6,0],
                    [9,0,3,0,0,0,0,0,0],
                    [0,2,0,0,0,0,1,0,0]
                ],
                solved: [
                    [5,8,1,6,7,2,4,3,9],
                    [7,9,2,8,4,3,6,5,1],
                    [3,6,4,5,9,1,2,8,7],
                    [4,3,8,9,5,7,2,1,6],
                    [2,5,6,1,8,4,9,7,3],
                    [1,7,9,3,2,6,8,4,5],
                    [8,4,5,2,1,9,3,6,7],
                    [9,1,3,7,6,8,5,2,4],
                    [6,2,7,4,3,5,1,9,8]
                ]
            }
        };
        
        this.bindEvents();
    }
    
    init() {
        const diff = this.diffSelect.value;
        const puzzle = this.puzzles[diff];
        
        // Deep copy
        this.initialBoard = JSON.parse(JSON.stringify(puzzle.start));
        this.currentBoard = JSON.parse(JSON.stringify(puzzle.start));
        this.solution = JSON.parse(JSON.stringify(puzzle.solved));
        
        this.selectedCell = null;
        this.gameoverModal.classList.add('hidden');
        
        this.renderBoard();
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.init());
        this.diffSelect.addEventListener('change', () => this.init());
        
        this.numpadBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const val = parseInt(e.target.getAttribute('data-val'));
                this.handleNumberInput(val);
            });
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (!document.getElementById('game-sudoku').classList.contains('active')) return;
            
            if (e.key >= '1' && e.key <= '9') {
                this.handleNumberInput(parseInt(e.key));
            } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
                this.handleNumberInput(0);
            }
        });
    }
    
    renderBoard() {
        this.boardEl.innerHTML = '';
        
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                
                const val = this.currentBoard[r][c];
                if (val !== 0) {
                    cell.textContent = val;
                }
                
                if (this.initialBoard[r][c] !== 0) {
                    cell.classList.add('fixed');
                }
                
                cell.addEventListener('click', () => this.selectCell(r, c));
                this.boardEl.appendChild(cell);
            }
        }
    }
    
    selectCell(r, c) {
        if (this.initialBoard[r][c] !== 0) return; // Can't select fixed cells
        
        this.selectedCell = { r, c };
        this.updateHighlights();
    }
    
    updateHighlights() {
        const cells = this.boardEl.querySelectorAll('.sudoku-cell');
        cells.forEach(cell => {
            cell.classList.remove('selected', 'highlight', 'error');
            
            const cr = parseInt(cell.dataset.r);
            const cc = parseInt(cell.dataset.c);
            
            if (this.selectedCell) {
                if (cr === this.selectedCell.r && cc === this.selectedCell.c) {
                    cell.classList.add('selected');
                } else if (cr === this.selectedCell.r || cc === this.selectedCell.c) {
                    cell.classList.add('highlight'); // Highlight row/col
                }
            }
            
            // Check for errors against solution
            const val = this.currentBoard[cr][cc];
            if (val !== 0 && this.initialBoard[cr][cc] === 0) {
                if (val !== this.solution[cr][cc]) {
                    cell.classList.add('error');
                }
            }
        });
    }
    
    handleNumberInput(val) {
        if (!this.selectedCell) return;
        
        const { r, c } = this.selectedCell;
        this.currentBoard[r][c] = val;
        
        const cell = this.getCellEl(r, c);
        cell.textContent = val === 0 ? '' : val;
        
        if (window.AudioSys && val !== 0) {
            window.AudioSys.playPlaceCard(); // Tap sound
        }
        
        this.updateHighlights();
        this.checkWin();
    }
    
    getCellEl(r, c) {
        return this.boardEl.querySelector(`[data-r="${r}"][data-c="${c}"]`);
    }
    
    checkWin() {
        let isWin = true;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.currentBoard[r][c] !== this.solution[r][c]) {
                    isWin = false;
                    break;
                }
            }
        }
        
        if (isWin) {
            this.gameoverModal.classList.remove('hidden');
            if (window.AudioSys) window.AudioSys.playShuffle(); 
        }
    }
}

// Instantiate globally
window.sudokuApp = new SudokuApp();
