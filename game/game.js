// game.js - Logika state dan aturan game 4-Player

const GameState = {
    MENU: 'MENU',
    SHUFFLING: 'SHUFFLING',
    DEALING: 'DEALING',
    TURN: 'TURN',
    GAME_OVER: 'GAME_OVER'
};

const TURN_TIME_SECONDS = 15; // Waktu per giliran 15 detik

class DominoGame {
    constructor() {
        this.state = GameState.MENU;
        this.mode = 'bot'; 
        this.difficulty = 'medium';
        
        this.players = []; 
        this.board = [];
        this.boardLeftValue = null;
        this.boardRightValue = null;
        
        this.turnIndex = 0;
        this.consecutivePasses = 0;

        // Timer
        this.turnTimer = null;
        this.timeLeft = 0;
        this.timerInterval = null;

        // Callbacks
        this.onStateChange = null;
        this.onBoardUpdate = null;
        this.onHandUpdate = null;
        this.onTimerTick = null;
    }

    start(mode, difficulty) {
        this.mode = mode;
        this.difficulty = difficulty;
        this.players = [];
        this.board = [];
        this.boardLeftValue = null;
        this.boardRightValue = null;
        this.consecutivePasses = 0;
        this.clearTimer();

        const deck = new Deck();
        deck.shuffle();

        for(let i=0; i<4; i++) {
            let isBot = (mode === 'bot' && i > 0);
            this.players.push({
                id: i,
                name: isBot ? `Bot ${i}` : (mode === 'bot' ? 'Kamu' : `Player ${i+1}`),
                isBot: isBot,
                hand: deck.deal(7),
                finalPips: 0
            });
        }

        this.turnIndex = this.getStartingPlayerIndex();

        this.setState(GameState.SHUFFLING);
        setTimeout(() => {
            this.setState(GameState.DEALING);
            setTimeout(() => {
                this.updateHands();
                this.prepareTurn();
            }, 2500); 
        }, 1500); 
    }

    getStartingPlayerIndex() {
        let maxDouble = -1;
        let maxTotal = -1;
        let startIndex = 0;

        for (let i = 0; i < 4; i++) {
            for (const card of this.players[i].hand) {
                if (card.isDouble && card.total > maxDouble) {
                    maxDouble = card.total;
                    startIndex = i;
                } else if (card.total > maxTotal && maxDouble === -1) {
                    maxTotal = card.total;
                    startIndex = i;
                }
            }
        }
        return startIndex;
    }

    setState(newState, data) {
        this.state = newState;
        if (this.onStateChange) this.onStateChange(this.state, data);
    }

    prepareTurn() {
        this.clearTimer();
        const activePlayer = this.players[this.turnIndex];
        
        this.setState(GameState.TURN, { player: activePlayer });
        this.startTimer();

        if (activePlayer.isBot) {
            this.triggerBot();
        }
    }

    startTimer() {
        this.timeLeft = TURN_TIME_SECONDS;
        if (this.onTimerTick) this.onTimerTick(this.timeLeft);
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            if (this.onTimerTick) this.onTimerTick(this.timeLeft);

            if (this.timeLeft <= 0) {
                this.clearTimer();
                this.handleTimeout();
            }
        }, 1000);
    }

    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    handleTimeout() {
        const player = this.players[this.turnIndex];
        const validMoves = this.getValidMoves(player.hand);
        
        // Auto play acak jika ada kartu valid, jika tidak otomatis pass
        if (validMoves.length > 0) {
            const move = validMoves[Math.floor(Math.random() * validMoves.length)];
            if (window.AudioSys) window.AudioSys.playPlaceCard();
            this.playCard(move.cardIndex, move.side, move.reverse);
        } else {
            if (window.AudioSys) window.AudioSys.playPass();
            this.passTurn();
        }
    }

    getValidMoves(hand) {
        if (this.board.length === 0) {
            return hand.map((card, index) => ({ cardIndex: index, side: 'first', reverse: false }));
        }

        const moves = [];
        for (let i = 0; i < hand.length; i++) {
            const card = hand[i];
            if (card.right === this.boardLeftValue) moves.push({ cardIndex: i, side: 'left', reverse: false }); 
            else if (card.left === this.boardLeftValue) moves.push({ cardIndex: i, side: 'left', reverse: true });  

            if (card.left === this.boardRightValue) moves.push({ cardIndex: i, side: 'right', reverse: false }); 
            else if (card.right === this.boardRightValue) moves.push({ cardIndex: i, side: 'right', reverse: true });  
        }
        return moves;
    }

    canPlay(hand) {
        return this.getValidMoves(hand).length > 0;
    }

    playCard(cardIndex, side, reverse) {
        this.clearTimer();
        const player = this.players[this.turnIndex];
        const card = player.hand.splice(cardIndex, 1)[0];

        if (this.board.length === 0) {
            this.board.push({ card, isReversed: false });
            this.boardLeftValue = card.left;
            this.boardRightValue = card.right;
        } else {
            if (side === 'left') {
                this.board.unshift({ card, isReversed: reverse });
                this.boardLeftValue = reverse ? card.right : card.left;
            } else {
                this.board.push({ card, isReversed: reverse });
                this.boardRightValue = reverse ? card.left : card.right;
            }
        }

        this.consecutivePasses = 0;
        this.updateHands();
        this.updateBoard();
        this.checkWinCondition();
    }

    passTurn() {
        this.clearTimer();
        this.consecutivePasses++;
        
        if (this.consecutivePasses >= 4) {
            this.handleBlocked();
        } else {
            this.nextTurn();
        }
    }

    nextTurn() {
        this.turnIndex = (this.turnIndex + 1) % 4;
        this.prepareTurn();
    }

    checkWinCondition() {
        const player = this.players[this.turnIndex];
        if (player.hand.length === 0) {
            this.endGame(`${player.name} Menang! 🎉`, `Berhasil menghabiskan semua kartu.`);
        } else {
            this.nextTurn();
        }
    }

    handleBlocked() {
        let minPips = Infinity;
        let winners = [];

        for (const p of this.players) {
            const pips = p.hand.reduce((sum, c) => sum + c.total, 0);
            p.finalPips = pips;
            if (pips < minPips) {
                minPips = pips;
                winners = [p];
            } else if (pips === minPips) {
                winners.push(p);
            }
        }

        const title = "Game CQ/Kurung! 🛑";
        const winnerNames = winners.map(w => w.name).join(' & ');
        
        let msg = `Pemenang: ${winnerNames} (${minPips} poin).\n\n`;
        this.players.forEach(p => {
            msg += `${p.name}: ${p.finalPips} poin\n`;
        });

        this.endGame(title, msg);
    }

    endGame(title, message) {
        this.clearTimer();
        this.state = GameState.GAME_OVER;
        if (this.onStateChange) this.onStateChange(this.state, {title, message});
    }

    triggerBot() {
        // Bot berpikir acak antara 1 sampai 3 detik (agar timer terlihat berjalan)
        const thinkTime = Math.floor(Math.random() * 2000) + 1000;
        setTimeout(() => {
            if (this.state !== GameState.TURN) return;
            const player = this.players[this.turnIndex];
            const validMoves = this.getValidMoves(player.hand);

            if (validMoves.length > 0) {
                let move = validMoves[0];

                if (this.difficulty === 'medium' || this.difficulty === 'hard' || this.difficulty === 'champion') {
                    let bestScore = -1;
                    for (const m of validMoves) {
                        const c = player.hand[m.cardIndex];
                        let score = c.total;
                        
                        if (this.difficulty === 'hard' || this.difficulty === 'champion') {
                            if (c.isDouble) score -= 50; 
                        }
                        
                        if (this.difficulty === 'champion') {
                            let matches = player.hand.filter(handCard => handCard.left === c.left || handCard.right === c.left || handCard.left === c.right || handCard.right === c.right).length;
                            score += matches * 10;
                        }

                        if (score > bestScore) {
                            bestScore = score;
                            move = m;
                        }
                    }
                } else {
                    move = validMoves[Math.floor(Math.random() * validMoves.length)];
                }

                if (window.AudioSys) window.AudioSys.playPlaceCard();
                this.playCard(move.cardIndex, move.side, move.reverse);
            } else {
                if (window.AudioSys) window.AudioSys.playPass();
                this.passTurn();
            }
        }, thinkTime); 
    }

    updateHands() {
        if (this.onHandUpdate) this.onHandUpdate(this.players);
    }
    
    updateBoard() {
        if (this.onBoardUpdate) this.onBoardUpdate(this.board);
    }
}
