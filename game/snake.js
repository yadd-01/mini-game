// snake.js - Snake Classic Game Logic

class SnakeApp {
    constructor() {
        this.canvas = document.getElementById('snake-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreEl = document.getElementById('snake-score');
        this.highScoreEl = document.getElementById('snake-highscore');
        this.overlay = document.getElementById('snake-overlay');
        this.msgEl = document.getElementById('snake-msg');
        
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.snake = [];
        this.apple = { x: 15, y: 15 };
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.highScore = localStorage.getItem('snake_highscore') || 0;
        
        this.particles = [];
        this.levelUpMessage = "";
        this.levelUpTimer = 0;
        
        this.gameLoop = null;
        this.speed = 250; // Start VERY slow
        this.isPlaying = false;
        
        this.highScoreEl.textContent = this.highScore;
        
        document.getElementById('snake-start-btn').addEventListener('click', () => this.startGame());
        this.overlay.addEventListener('click', () => {
            if (!this.isPlaying) this.startGame();
        });
        
        this.bindEvents();
        this.drawEmptyBoard();
    }
    
    init() {
        if (!this.isPlaying) {
            this.drawEmptyBoard();
            this.overlay.classList.remove('hidden');
            this.msgEl.textContent = "Tekan Mulai";
        }
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (!document.getElementById('game-snake').classList.contains('active')) return;
            if (!this.isPlaying) return;
            
            switch (e.key) {
                case 'ArrowUp': if (this.dy === 0) { this.dx = 0; this.dy = -1; } break;
                case 'ArrowDown': if (this.dy === 0) { this.dx = 0; this.dy = 1; } break;
                case 'ArrowLeft': if (this.dx === 0) { this.dx = -1; this.dy = 0; } break;
                case 'ArrowRight': if (this.dx === 0) { this.dx = 1; this.dy = 0; } break;
            }
        });
        
        let touchStartX = 0;
        let touchStartY = 0;
        const container = document.querySelector('.snake-board-wrapper');
        
        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            e.preventDefault();
        }, { passive: false });
        
        container.addEventListener('touchend', (e) => {
            if (!this.isPlaying) return;
            let touchEndX = e.changedTouches[0].screenX;
            let touchEndY = e.changedTouches[0].screenY;
            
            let dx = touchEndX - touchStartX;
            let dy = touchEndY - touchStartY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 30 && this.dx === 0) { this.dx = 1; this.dy = 0; }
                else if (dx < -30 && this.dx === 0) { this.dx = -1; this.dy = 0; }
            } else {
                if (dy > 30 && this.dy === 0) { this.dx = 0; this.dy = 1; }
                else if (dy < -30 && this.dy === 0) { this.dx = 0; this.dy = -1; }
            }
        });
    }
    
    startGame() {
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.dx = 1;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.speed = 250; // Reset to VERY slow
        this.isPlaying = true;
        this.particles = [];
        this.levelUpMessage = "";
        
        this.scoreEl.textContent = this.score;
        document.getElementById('active-game-title').textContent = `Snake (Lv. ${this.level})`;
        this.overlay.classList.add('hidden');
        
        this.placeApple();
        
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }
    
    gameOver() {
        this.isPlaying = false;
        clearInterval(this.gameLoop);
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snake_highscore', this.highScore);
            this.highScoreEl.textContent = this.highScore;
        }
        
        this.msgEl.textContent = `Game Over! Skor: ${this.score}`;
        this.overlay.classList.remove('hidden');
        document.getElementById('active-game-title').textContent = 'Snake';
        
        if (window.AudioSys) window.AudioSys.playPlaceCard();
        
        let frames = 0;
        const animateEnd = setInterval(() => {
            this.draw();
            frames++;
            if (frames > 20) clearInterval(animateEnd);
        }, 50);
    }
    
    createParticles(x, y) {
        for(let i=0; i<10; i++) {
            this.particles.push({
                x: x * this.gridSize + this.gridSize/2,
                y: y * this.gridSize + this.gridSize/2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1.0
            });
        }
    }
    
    updateParticles() {
        for(let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.1;
            if(p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    checkLevel() {
        let newLevel = this.level;
        if (this.score >= 150) newLevel = 4;
        else if (this.score >= 100) newLevel = 3;
        else if (this.score >= 50) newLevel = 2;
        
        if (newLevel !== this.level) {
            this.level = newLevel;
            this.levelUpMessage = `Level ${this.level}!`;
            this.levelUpTimer = 30; // display for 30 frames
            document.getElementById('active-game-title').textContent = `Snake (Lv. ${this.level})`;
            if (window.AudioSys) window.AudioSys.playShuffle();
        }
    }
    
    update() {
        this.updateParticles();
        
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            return this.gameOver();
        }
        
        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
                return this.gameOver();
            }
        }
        
        this.snake.unshift(head);
        
        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.score += 10;
            this.scoreEl.textContent = this.score;
            
            this.createParticles(this.apple.x, this.apple.y);
            this.placeApple();
            this.checkLevel();
            
            if (window.AudioSys) window.AudioSys.playPlaceCard(); 
            
            if (this.speed > 60) {
                this.speed -= 10; // Semakin cepat 10ms setiap makan apel
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.speed);
            }
        } else {
            this.snake.pop(); 
        }
        
        if (this.levelUpTimer > 0) this.levelUpTimer--;
        
        this.draw();
    }
    
    placeApple() {
        this.apple = {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };
        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].x === this.apple.x && this.snake[i].y === this.apple.y) {
                return this.placeApple();
            }
        }
    }
    
    drawEmptyBoard() {
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;
        for(let i=0; i<this.canvas.width; i+=this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
    }
    
    draw() {
        this.drawEmptyBoard();
        
        // Draw particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = `rgba(239, 68, 68, ${p.life})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw apple with glow
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#ef4444';
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(
            this.apple.x * this.gridSize + this.gridSize/2, 
            this.apple.y * this.gridSize + this.gridSize/2, 
            this.gridSize/2.5, 0, Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.shadowBlur = 0; // Reset
        
        // Draw snake
        for (let i = 0; i < this.snake.length; i++) {
            this.ctx.fillStyle = i === 0 ? '#10b981' : '#34d399';
            this.ctx.fillRect(
                this.snake[i].x * this.gridSize + 1, 
                this.snake[i].y * this.gridSize + 1, 
                this.gridSize - 2, this.gridSize - 2
            );
            
            // Draw eyes on head
            if (i === 0) {
                this.ctx.fillStyle = 'white';
                let eye1X, eye1Y, eye2X, eye2Y;
                const offset = 4;
                const px = this.snake[i].x * this.gridSize;
                const py = this.snake[i].y * this.gridSize;
                const size = this.gridSize;
                
                if (this.dx === 1) { // Right
                    eye1X = px + size - 6; eye1Y = py + offset;
                    eye2X = px + size - 6; eye2Y = py + size - offset - 3;
                } else if (this.dx === -1) { // Left
                    eye1X = px + 4; eye1Y = py + offset;
                    eye2X = px + 4; eye2Y = py + size - offset - 3;
                } else if (this.dy === 1) { // Down
                    eye1X = px + offset; eye1Y = py + size - 6;
                    eye2X = px + size - offset - 3; eye2Y = py + size - 6;
                } else { // Up
                    eye1X = px + offset; eye1Y = py + 4;
                    eye2X = px + size - offset - 3; eye2Y = py + 4;
                }
                
                this.ctx.fillRect(eye1X, eye1Y, 3, 3);
                this.ctx.fillRect(eye2X, eye2Y, 3, 3);
            }
        }
        
        // Draw Level Up Message
        if (this.levelUpTimer > 0) {
            this.ctx.fillStyle = `rgba(255, 215, 0, ${this.levelUpTimer / 30})`;
            this.ctx.font = 'bold 30px Outfit, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.levelUpMessage, this.canvas.width/2, this.canvas.height/2);
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
        }
    }
}

window.snakeApp = new SnakeApp();
