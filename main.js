// main.js - DOM Manipulation & Integration 4-Player

const game = new DominoGame();

// Hub Integration
window.dominoApp = {
    showMenu: function() {
        document.getElementById('menu-modal').classList.remove('hidden');
        document.getElementById('gameover-modal').classList.add('hidden');
    },
    reset: function() {
        game.clearTimer();
        game.state = GameState.MENU;
    }
};

// UI Elements
const menuModal = document.getElementById('menu-modal');
const gameoverModal = document.getElementById('gameover-modal');

const btnStart = document.getElementById('btn-start');
const btnRestart = document.getElementById('btn-restart');
const btnPass = document.getElementById('btn-pass');

const modeSelect = document.getElementById('mode-select');
const diffSelect = document.getElementById('diff-select');
const diffGroup = document.getElementById('difficulty-group');

const turnIndicator = document.getElementById('turn-indicator');
const boardContainer = document.getElementById('board');
const shuffleArea = document.getElementById('shuffle-area');
const deckPile = document.getElementById('deck-pile');

// Timer UI
const timerContainer = document.getElementById('timer-container');
const timerBar = document.getElementById('timer-bar');
const timerText = document.getElementById('timer-text');

// Player Hand UI bindings
const p0Name = document.getElementById('p0-name');
const p0Count = document.getElementById('p0-count');
const playerHandContainer = document.getElementById('player-hand');

const p1Container = document.getElementById('player-1-container');
const p1Name = document.getElementById('p1-name');
const p1Count = document.getElementById('p1-count');
const p1Cards = document.getElementById('p1-cards');

const p2Container = document.getElementById('player-2-container');
const p2Name = document.getElementById('p2-name');
const p2Count = document.getElementById('p2-count');
const p2Cards = document.getElementById('p2-cards');

const p3Container = document.getElementById('player-3-container');
const p3Name = document.getElementById('p3-name');
const p3Count = document.getElementById('p3-count');
const p3Cards = document.getElementById('p3-cards');

// Menu interactions
modeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'bot') {
        diffGroup.style.display = 'block';
    } else {
        diffGroup.style.display = 'none';
    }
});

btnStart.addEventListener('click', () => {
    if(window.AudioSys) AudioSys.init();
    menuModal.classList.add('hidden');
    game.start(modeSelect.value, diffSelect.value);
});

btnRestart.addEventListener('click', () => {
    gameoverModal.classList.add('hidden');
    game.start(modeSelect.value, diffSelect.value);
});

btnPass.addEventListener('click', () => {
    if (game.state === GameState.TURN && !game.players[game.turnIndex].isBot) {
        if(window.AudioSys) AudioSys.playPass();
        game.passTurn();
    }
});

// Setup Game Callbacks
game.onTimerTick = (timeLeft) => {
    const total = 15; // Berdasarkan TURN_TIME_SECONDS di game.js
    const percentage = (timeLeft / total) * 100;
    
    timerBar.style.width = `${percentage}%`;
    timerText.textContent = `${timeLeft}s`;

    if (timeLeft <= 5) {
        timerBar.classList.add('timer-warning');
        timerText.classList.add('warning');
    } else {
        timerBar.classList.remove('timer-warning');
        timerText.classList.remove('warning');
    }
};

let isDealingAnimation = false;

game.onStateChange = (state, data) => {
    if (state === GameState.SHUFFLING) {
        p1Container.classList.add('hidden');
        p2Container.classList.add('hidden');
        p3Container.classList.add('hidden');
        playerHandContainer.innerHTML = '';
        
        turnIndicator.textContent = "Mengocok Kartu...";
        turnIndicator.className = "turn-indicator turn-waiting";
        btnPass.classList.add('hidden');
        timerContainer.classList.remove('active');
        
        shuffleArea.classList.remove('hidden');
        deckPile.innerHTML = `
            <div class="shuffle-card"></div>
            <div class="shuffle-card"></div>
            <div class="shuffle-card"></div>
        `;
        if(window.AudioSys) AudioSys.playShuffle();

    } else if (state === GameState.DEALING) {
        shuffleArea.classList.add('hidden');
        turnIndicator.textContent = "Membagikan Kartu...";
        
        isDealingAnimation = true;
        updateOpponentLayout(); // Memicu render dengan animasi
        
        // Reset state animasi setelah selesai (7 kartu * 0.3s delay)
        setTimeout(() => {
            isDealingAnimation = false;
        }, 3000);

    } else if (state === GameState.TURN) {
        const activePlayer = data.player;
        shuffleArea.classList.add('hidden');
        timerContainer.classList.add('active'); // Tampilkan timer

        updateOpponentLayout();

        if (!activePlayer.isBot) {
            turnIndicator.textContent = "Giliranmu!";
            turnIndicator.className = "turn-indicator turn-active";
            
            // Kita harus mengecek game.canPlay dengan tangan pemain aktif
            if (!game.canPlay(activePlayer.hand)) {
                btnPass.classList.remove('hidden');
            } else {
                btnPass.classList.add('hidden');
            }
        } else {
            turnIndicator.innerHTML = `${activePlayer.name} Berpikir <span class='dots'>...</span>`;
            turnIndicator.className = "turn-indicator turn-waiting";
            btnPass.classList.add('hidden');
        }

    } else if (state === GameState.GAME_OVER) {
        document.getElementById('gameover-title').textContent = data.title;
        document.getElementById('gameover-message').innerText = data.message;
        gameoverModal.classList.remove('hidden');
        btnPass.classList.add('hidden');
        timerContainer.classList.remove('active');
    }
};

game.onHandUpdate = (players) => {
    if(game.state === GameState.DEALING) return;
    updateOpponentLayout();
};

game.onBoardUpdate = (boardArray) => {
    renderBoard(boardArray);
};

// Menentukan player mana yang dirender di posisi bawah
let bottomIdx = 0;

function updateOpponentLayout() {
    // Jika mode bot, Player (Human) SELALU di bawah agar kartunya tidak hilang.
    // Jika mode multiplayer, kita putar layarnya agar player yang aktif selalu di bawah.
    if (game.mode === 'bot') {
        bottomIdx = 0;
    } else {
        bottomIdx = game.turnIndex; 
    }

    const leftIdx = (bottomIdx + 1) % 4;
    const topIdx = (bottomIdx + 2) % 4;
    const rightIdx = (bottomIdx + 3) % 4;

    const bottomPlayer = game.players[bottomIdx];
    const leftPlayer = game.players[leftIdx];
    const topPlayer = game.players[topIdx];
    const rightPlayer = game.players[rightIdx];

    // Bottom info update
    p0Name.textContent = bottomPlayer.name;
    p0Count.textContent = bottomPlayer.hand.length;

    // Left
    p1Container.classList.remove('hidden');
    p1Name.textContent = leftPlayer.name;
    p1Count.textContent = `${leftPlayer.hand.length} Kartu`;
    renderMiniCards(p1Cards, leftPlayer.hand.length, 1);

    // Top
    p2Container.classList.remove('hidden');
    p2Name.textContent = topPlayer.name;
    p2Count.textContent = `${topPlayer.hand.length} Kartu`;
    renderMiniCards(p2Cards, topPlayer.hand.length, 2);

    // Right
    p3Container.classList.remove('hidden');
    p3Name.textContent = rightPlayer.name;
    p3Count.textContent = `${rightPlayer.hand.length} Kartu`;
    renderMiniCards(p3Cards, rightPlayer.hand.length, 3);
    
    // Render the bottom hand cards
    renderPlayerHand(bottomPlayer.hand);
}

function renderMiniCards(container, count, playerIndex) {
    container.innerHTML = '';
    for(let i=0; i<count; i++) {
        const el = document.createElement('div');
        el.className = 'mini-card';
        if (isDealingAnimation) {
            const delay = (playerIndex * 0.1) + (i * 0.3);
            el.style.animation = `dealAnim 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s both`;
            setTimeout(() => {
                if (window.AudioSys) AudioSys.playPlaceCard();
            }, delay * 1000);
            
            setTimeout(() => {
                el.style.animation = ''; 
            }, (delay * 1000) + 400); 
        }
        container.appendChild(el);
    }
}

function createDominoElement(card, isHorizontal = false, isReversed = false) {
    const el = document.createElement('div');
    el.className = `domino-card ${isHorizontal ? 'horizontal' : 'vertical'}`;
    if (card.isDouble) el.classList.add('double');

    let leftFace = card.left;
    let rightFace = card.right;

    if (isReversed) {
        [leftFace, rightFace] = [rightFace, leftFace];
    }

    const half1 = document.createElement('div');
    half1.className = `domino-half face-${leftFace}`;
    for(let i=0; i<leftFace; i++) {
        const pip = document.createElement('span');
        pip.className = 'pip';
        half1.appendChild(pip);
    }

    const divider = document.createElement('div');
    divider.className = 'divider';

    const half2 = document.createElement('div');
    half2.className = `domino-half face-${rightFace}`;
    for(let i=0; i<rightFace; i++) {
        const pip = document.createElement('span');
        pip.className = 'pip';
        half2.appendChild(pip);
    }

    el.appendChild(half1);
    el.appendChild(divider);
    el.appendChild(half2);

    return el;
}

function renderPlayerHand(hand) {
    playerHandContainer.innerHTML = '';
    const bottomPlayer = game.players[bottomIdx];
    const isHumanTurn = (game.state === GameState.TURN && game.turnIndex === bottomIdx && !bottomPlayer.isBot);
    
    const validMoves = isHumanTurn ? game.getValidMoves(hand) : [];
    const playableIndices = validMoves.map(m => m.cardIndex);

    hand.forEach((card, index) => {
        const el = createDominoElement(card, false, false);
        
        if (isDealingAnimation) {
            const delay = (0 * 0.1) + (index * 0.3); // Player 0 is bottom
            el.style.animation = `dealAnim 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s both`;
            setTimeout(() => {
                if (window.AudioSys) AudioSys.playPlaceCard();
            }, delay * 1000);
            
            setTimeout(() => {
                el.style.animation = ''; 
            }, (delay * 1000) + 400); 
        }

        if (isHumanTurn) {
            if (playableIndices.includes(index)) {
                el.classList.add('playable');
                el.addEventListener('click', () => {
                    const movesForCard = validMoves.filter(m => m.cardIndex === index);
                    if (movesForCard.length > 0) {
                        const move = movesForCard[0];
                        if (window.AudioSys) window.AudioSys.playPlaceCard();
                        game.playCard(move.cardIndex, move.side, move.reverse);
                    }
                });
            } else {
                el.classList.add('disabled');
            }
        }
        
        playerHandContainer.appendChild(el);
    });
}

function renderBoard(boardArray) {
    boardContainer.innerHTML = '';
    
    boardArray.forEach(item => {
        const isHorizontal = !item.card.isDouble; 
        const el = createDominoElement(item.card, isHorizontal, item.isReversed);
        boardContainer.appendChild(el);
    });
    
    // Scale board if it's too wide
    boardContainer.style.transform = 'scale(1)';
    const containerEl = document.getElementById('board-container');
    
    // Tunggu sebentar agar elemen di-render ke DOM
    setTimeout(() => {
        const boardWidth = boardContainer.scrollWidth;
        const maxAllowedWidth = containerEl.clientWidth - 80; // Margin
        
        if (boardWidth > maxAllowedWidth && maxAllowedWidth > 0) {
            const scale = maxAllowedWidth / boardWidth;
            boardContainer.style.transform = `scale(${scale})`;
        }
    }, 10);
}
