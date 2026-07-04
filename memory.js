// memory.js - Memory Match Game Logic

class MemoryApp {
    constructor() {
        this.boardEl = document.getElementById('memory-board');
        this.movesEl = document.getElementById('memory-moves');
        this.gameoverModal = document.getElementById('memory-gameover');
        this.finalMovesEl = document.getElementById('memory-final-moves');
        
        this.emojis = ['♠️', '♥️', '♣️', '♦️', '🃏', '🎲', '🎰', '🎯'];
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.isLocked = false;
        
        document.getElementById('memory-start-btn').addEventListener('click', () => this.init());
    }
    
    init() {
        this.moves = 0;
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.isLocked = false;
        this.movesEl.textContent = '0';
        this.gameoverModal.classList.add('hidden');
        
        // Prepare cards (duplicate and shuffle)
        this.cards = [...this.emojis, ...this.emojis];
        this.cards.sort(() => Math.random() - 0.5);
        
        this.renderBoard();
        
        if (window.AudioSys) window.AudioSys.playShuffle();
    }
    
    renderBoard() {
        this.boardEl.innerHTML = '';
        
        this.cards.forEach((emoji, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'memory-card';
            cardEl.dataset.index = index;
            cardEl.dataset.value = emoji;
            
            cardEl.innerHTML = `
                <div class="memory-card-inner">
                    <div class="memory-card-front"></div>
                    <div class="memory-card-back">${emoji}</div>
                </div>
            `;
            
            cardEl.addEventListener('click', () => this.flipCard(cardEl));
            this.boardEl.appendChild(cardEl);
        });
    }
    
    flipCard(cardEl) {
        if (this.isLocked) return;
        if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;
        
        cardEl.classList.add('flipped');
        this.flippedCards.push(cardEl);
        
        if (window.AudioSys) window.AudioSys.playPlaceCard();
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.movesEl.textContent = this.moves;
            this.checkMatch();
        }
    }
    
    checkMatch() {
        this.isLocked = true;
        const [card1, card2] = this.flippedCards;
        
        if (card1.dataset.value === card2.dataset.value) {
            // Match
            setTimeout(() => {
                card1.classList.add('matched');
                card2.classList.add('matched');
                this.matchedPairs++;
                
                if (this.matchedPairs === this.emojis.length) {
                    this.gameoverModal.classList.remove('hidden');
                    this.finalMovesEl.textContent = this.moves;
                    if (window.AudioSys) window.AudioSys.playShuffle();
                }
                
                this.resetBoard();
            }, 500);
        } else {
            // No match
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                this.resetBoard();
            }, 1000);
        }
    }
    
    resetBoard() {
        this.flippedCards = [];
        this.isLocked = false;
    }
}

window.memoryApp = new MemoryApp();
