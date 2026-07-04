// blockblast.js - Block Blast Game Logic for Mini Game Hub

class BlockBlastApp {
    constructor() {
        this.boardSize = 8;
        this.board = [];
        this.score = 0;
        this.highScore = localStorage.getItem('bb_highscore') || 0;
        
        this.shapes = [
            [[1]], // 1x1
            [[1,1],[1,1]], // 2x2
            [[1,1,1],[1,1,1],[1,1,1]], // 3x3
            [[1,1]], // 1x2 H
            [[1],[1]], // 1x2 V
            [[1,1,1]], // 1x3 H
            [[1],[1],[1]], // 1x3 V
            [[1,1,1,1]], // 1x4 H
            [[1],[1],[1],[1]], // 1x4 V
            [[1,0],[1,1]], // L1
            [[0,1],[1,1]], // L2
            [[1,1],[1,0]], // L3
            [[1,1],[0,1]], // L4
            [[1,0,0],[1,0,0],[1,1,1]], // Big L1
            [[1,1,1],[0,0,1],[0,0,1]]  // Big L2
        ];
        
        this.currentShapes = [];
        this.draggedShape = null;
        this.draggedShapeIndex = -1;
        this.ghostEl = null;
        this.dragOffset = { x: 0, y: 0 };
        this.hoveredCell = null;
        
        // DOM Elements
        this.boardEl = document.getElementById('bb-board');
        this.shapesContainer = document.getElementById('bb-shapes');
        this.scoreEl = document.getElementById('bb-score');
        this.highScoreEl = document.getElementById('bb-highscore');
        this.gameoverModal = document.getElementById('bb-gameover');
        this.finalScoreEl = document.getElementById('bb-final-score');
        
        document.getElementById('bb-restart-btn').addEventListener('click', () => this.init());
        
        // Pointer events for window
        window.addEventListener('pointermove', (e) => this.handleDrag(e));
        window.addEventListener('pointerup', (e) => this.handleDrop(e));
        
        this.setupBoardUI();
    }
    
    setupBoardUI() {
        this.boardEl.innerHTML = '';
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                const cell = document.createElement('div');
                cell.className = 'bb-cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                this.boardEl.appendChild(cell);
            }
        }
    }
    
    init() {
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(0));
        this.score = 0;
        this.gameoverModal.classList.add('hidden');
        
        this.updateScoreUI();
        this.renderBoard();
        this.generateShapes();
    }
    
    generateShapes() {
        this.currentShapes = [];
        this.shapesContainer.innerHTML = '';
        
        for (let i = 0; i < 3; i++) {
            const randomShape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
            this.currentShapes.push(randomShape);
            this.renderShapeOption(randomShape, i);
        }
        
        this.checkGameOver();
    }
    
    renderShapeOption(shapeMatrix, index) {
        const wrapper = document.createElement('div');
        wrapper.className = 'bb-shape-wrapper';
        wrapper.dataset.index = index;
        
        const shapeEl = document.createElement('div');
        shapeEl.className = 'bb-shape';
        shapeEl.style.gridTemplateColumns = `repeat(${shapeMatrix[0].length}, 1fr)`;
        
        shapeMatrix.forEach(row => {
            row.forEach(val => {
                const cell = document.createElement('div');
                cell.className = `bb-shape-cell ${val ? '' : 'empty'}`;
                shapeEl.appendChild(cell);
            });
        });
        
        wrapper.appendChild(shapeEl);
        
        // Setup Drag Start
        wrapper.addEventListener('pointerdown', (e) => {
            if (wrapper.classList.contains('disabled')) return;
            this.startDrag(e, index, shapeEl, shapeMatrix, wrapper);
        });
        
        this.shapesContainer.appendChild(wrapper);
    }
    
    startDrag(e, index, shapeEl, shapeMatrix, wrapper) {
        e.preventDefault();
        this.draggedShapeIndex = index;
        this.draggedShape = shapeMatrix;
        
        wrapper.classList.add('dragging-orig');
        
        // Create ghost element following cursor
        this.ghostEl = shapeEl.cloneNode(true);
        this.ghostEl.className = 'bb-shape ghost';
        
        // Match cell size to board cell size
        const sampleCell = this.boardEl.querySelector('.bb-cell');
        const cellSize = sampleCell ? sampleCell.getBoundingClientRect().width : 30;
        
        // Force ghost cells to match board size so it looks exactly like placing it
        const ghostCells = this.ghostEl.querySelectorAll('.bb-shape-cell');
        ghostCells.forEach(gc => {
            gc.style.width = `${cellSize}px`;
            gc.style.height = `${cellSize}px`;
        });
        
        this.ghostEl.style.position = 'fixed';
        this.ghostEl.style.pointerEvents = 'none';
        this.ghostEl.style.zIndex = '1000';
        document.body.appendChild(this.ghostEl);
        
        // Calculate offset (center the shape on cursor)
        const cols = shapeMatrix[0].length;
        const rows = shapeMatrix.length;
        this.dragOffset = {
            x: (cols * cellSize) / 2,
            y: (rows * cellSize) / 2
        };
        
        this.updateGhostPosition(e.clientX, e.clientY);
    }
    
    updateGhostPosition(x, y) {
        if (this.ghostEl) {
            // Place the ghost slightly above cursor so finger doesn't block it on mobile
            this.ghostEl.style.left = `${x - this.dragOffset.x}px`;
            this.ghostEl.style.top = `${y - this.dragOffset.y - 40}px`;
        }
    }
    
    handleDrag(e) {
        if (!this.ghostEl) return;
        this.updateGhostPosition(e.clientX, e.clientY);
        
        // Find which cell we are hovering over
        // We use the top-left cell of the ghost
        const ghostRect = this.ghostEl.getBoundingClientRect();
        
        // Find element under the top-left corner of the ghost (or center of first cell)
        const sampleCell = this.boardEl.querySelector('.bb-cell');
        const cellSize = sampleCell ? sampleCell.getBoundingClientRect().width : 30;
        
        const targetX = ghostRect.left + (cellSize / 2);
        const targetY = ghostRect.top + (cellSize / 2);
        
        const elementsUnder = document.elementsFromPoint(targetX, targetY);
        const boardCell = elementsUnder.find(el => el.classList.contains('bb-cell'));
        
        this.clearHover();
        this.hoveredCell = null;
        
        if (boardCell) {
            const r = parseInt(boardCell.dataset.r);
            const c = parseInt(boardCell.dataset.c);
            
            const isValid = this.isValidPlacement(this.draggedShape, r, c);
            
            if (isValid) {
                this.hoveredCell = { r, c };
                this.draggedShape.forEach((rArr, rIdx) => {
                    rArr.forEach((val, cIdx) => {
                        if (val) {
                            const targetR = r + rIdx;
                            const targetC = c + cIdx;
                            const cell = this.getCellEl(targetR, targetC);
                            if (cell) {
                                cell.classList.add('hover-valid');
                            }
                        }
                    });
                });
            } else {
                this.hoveredCell = null;
            }
        }
    }
    
    handleDrop(e) {
        if (!this.ghostEl) return;
        
        const originalWrapper = this.shapesContainer.querySelector(`[data-index="${this.draggedShapeIndex}"]`);
        originalWrapper.classList.remove('dragging-orig');
        
        this.ghostEl.remove();
        this.ghostEl = null;
        this.clearHover();
        
        if (this.hoveredCell) {
            const { r, c } = this.hoveredCell;
            if (this.isValidPlacement(this.draggedShape, r, c)) {
                this.placeShape(r, c);
            }
        }
        
        this.draggedShape = null;
        this.draggedShapeIndex = -1;
        this.hoveredCell = null;
    }
    
    clearHover() {
        const cells = this.boardEl.querySelectorAll('.bb-cell');
        cells.forEach(c => {
            c.classList.remove('hover-valid', 'hover-invalid');
        });
    }
    
    isValidPlacement(shape, row, col) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[0].length; c++) {
                if (shape[r][c]) {
                    const targetR = row + r;
                    const targetC = col + c;
                    if (targetR >= this.boardSize || targetC >= this.boardSize) return false;
                    if (this.board[targetR][targetC]) return false;
                }
            }
        }
        return true;
    }
    
    placeShape(row, col) {
        const shape = this.draggedShape;
        const index = this.draggedShapeIndex;
        
        shape.forEach((rArr, rIdx) => {
            rArr.forEach((val, cIdx) => {
                if (val) {
                    this.board[row + rIdx][col + cIdx] = 1;
                }
            });
        });
        
        if (window.AudioSys) window.AudioSys.playPlaceCard();
        
        let blocksPlaced = shape.flat().filter(v => v === 1).length;
        this.score += blocksPlaced * 10;
        
        this.currentShapes[index] = null;
        const wrapper = this.shapesContainer.querySelector(`[data-index="${index}"]`);
        wrapper.classList.add('disabled', 'hidden');
        wrapper.style.visibility = 'hidden'; // Ensure it's hidden but keeps space layout maybe? Actually just display none is fine via hidden class.
        
        this.renderBoard();
        this.checkLines();
        
        if (this.currentShapes.every(s => s === null)) {
            setTimeout(() => this.generateShapes(), 300);
        } else {
            this.checkGameOver();
        }
    }
    
    checkLines() {
        let rowsToClear = [];
        let colsToClear = [];
        
        for (let r = 0; r < this.boardSize; r++) {
            if (this.board[r].every(val => val === 1)) rowsToClear.push(r);
        }
        for (let c = 0; c < this.boardSize; c++) {
            let colFull = true;
            for (let r = 0; r < this.boardSize; r++) {
                if (this.board[r][c] === 0) { colFull = false; break; }
            }
            if (colFull) colsToClear.push(c);
        }
        
        if (rowsToClear.length > 0 || colsToClear.length > 0) {
            let linesCleared = rowsToClear.length + colsToClear.length;
            this.score += linesCleared * 100;
            
            if (window.AudioSys && window.AudioSys.playBreak) {
                window.AudioSys.playBreak();
            } else if (window.AudioSys) {
                window.AudioSys.playShuffle(); 
            }
            
            this.showComboText(linesCleared);
            
            rowsToClear.forEach(r => {
                for (let c = 0; c < this.boardSize; c++) this.board[r][c] = 0;
            });
            colsToClear.forEach(c => {
                for (let r = 0; r < this.boardSize; r++) this.board[r][c] = 0;
            });
            
            setTimeout(() => {
                this.renderBoard();
                this.updateScoreUI();
                this.checkGameOver();
            }, 300);
        }
        
        this.updateScoreUI();
    }
    
    showComboText(linesCount) {
        let text = "GOOD!";
        if (linesCount === 2) text = "GREAT!";
        else if (linesCount === 3) text = "AMAZING!";
        else if (linesCount >= 4) text = "EXCELLENT!";
        
        const textEl = document.createElement('div');
        textEl.className = 'bb-combo-text';
        textEl.textContent = text;
        document.body.appendChild(textEl);
        
        // Remove after animation finishes
        setTimeout(() => {
            if (textEl.parentNode) textEl.remove();
        }, 1200);
    }
    
    renderBoard() {
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                const cell = this.getCellEl(r, c);
                if (this.board[r][c]) {
                    cell.classList.add('filled');
                } else {
                    cell.classList.remove('filled');
                }
            }
        }
    }
    
    getCellEl(r, c) {
        return this.boardEl.querySelector(`[data-r="${r}"][data-c="${c}"]`);
    }
    
    updateScoreUI() {
        this.scoreEl.textContent = this.score;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('bb_highscore', this.highScore);
        }
        this.highScoreEl.textContent = this.highScore;
    }
    
    checkGameOver() {
        let canPlaceAny = false;
        
        for (let i = 0; i < this.currentShapes.length; i++) {
            const shape = this.currentShapes[i];
            if (!shape) continue;
            
            for (let r = 0; r < this.boardSize; r++) {
                for (let c = 0; c < this.boardSize; c++) {
                    if (this.isValidPlacement(shape, r, c)) {
                        canPlaceAny = true;
                        break;
                    }
                }
                if (canPlaceAny) break;
            }
            if (canPlaceAny) break;
        }
        
        if (!canPlaceAny && this.currentShapes.some(s => s !== null)) {
            this.finalScoreEl.textContent = this.score;
            this.gameoverModal.classList.remove('hidden');
        }
    }
}

// Instantiate globally
window.bbApp = new BlockBlastApp();
