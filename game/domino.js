// domino.js - Logika entitas Domino & Deck

class Domino {
    constructor(left, right) {
        this.left = left;
        this.right = right;
        this.id = `${left}-${right}`;
        this.isDouble = left === right;
        this.total = left + right;
    }
}

class Deck {
    constructor() {
        this.cards = [];
        this.generate();
    }

    generate() {
        this.cards = [];
        for (let i = 0; i <= 6; i++) {
            for (let j = i; j <= 6; j++) {
                this.cards.push(new Domino(i, j));
            }
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal(numCards) {
        return this.cards.splice(0, numCards);
    }
}
