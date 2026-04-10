class BlackjackGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.gameOver = false;
        this.dealerRevealed = false;
        this.currentBet = 0;
        this.bankroll = 1000;
        this.startingBankroll = 1000;
        this.gameActive = false;

        // DOM elements
        this.playerCardsDiv = document.getElementById('player-cards');
        this.dealerCardsDiv = document.getElementById('dealer-cards');
        this.playerScoreDiv = document.getElementById('player-score');
        this.dealerScoreDiv = document.getElementById('dealer-score');
        this.messageDiv = document.getElementById('message');
        this.bankrollChip = document.getElementById('bankroll-chip');
        this.currentBetChip = document.getElementById('current-bet-chip');

        this.hitBtn = document.getElementById('hit-btn');
        this.standBtn = document.getElementById('stand-btn');
        this.betBtn = document.getElementById('bet-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.gameControls = document.getElementById('game-controls');
        this.chipButtons = document.querySelectorAll('.chip-btn');
        this.cashoutBtn = document.getElementById('cashout-btn');
        this.newGameBtn = document.getElementById('new-game-btn');

        this.setupEventListeners();
        this.updateBankrollDisplay();
    }

    setupEventListeners() {
        this.hitBtn.addEventListener('click', () => this.hit());
        this.standBtn.addEventListener('click', () => this.stand());
        this.betBtn.addEventListener('click', () => this.placeBet());
        this.clearBtn.addEventListener('click', () => this.clearBet());
        this.cashoutBtn.addEventListener('click', () => this.cashOut());
        this.newGameBtn.addEventListener('click', () => this.newGame());

        this.chipButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseInt(e.currentTarget.dataset.amount);
                this.addToBet(amount);
            });
        });
    }

    addToBet(amount) {
        if (this.gameActive) return;
        if (this.currentBet + amount > this.bankroll) {
            this.messageDiv.textContent = 'Insufficient funds!';
            return;
        }
        this.currentBet += amount;
        this.currentBetChip.textContent = this.currentBet;
    }

    clearBet() {
        if (this.gameActive) return;
        this.currentBet = 0;
        this.currentBetChip.textContent = '0';
        this.messageDiv.textContent = 'Place your bet!';
    }

    cashOut() {
        const earnings = this.bankroll - this.startingBankroll;
        const result = earnings >= 0 ? `+${earnings}` : `${earnings}`;
        
        this.messageDiv.textContent = `Session ended! You ${earnings > 0 ? 'earned' : 'lost'} ${Math.abs(earnings)} $! Total: ${this.bankroll} $`;
        
        this.currentBet = 0;
        this.currentBetChip.textContent = '0';
        
        // Disable betting controls
        this.chipButtons.forEach(btn => btn.disabled = true);
        this.betBtn.disabled = true;
        this.clearBtn.disabled = true;
        this.gameActive = false;
        this.gameControls.style.display = 'none';
        
        // Show new game button
        this.newGameBtn.style.display = 'inline-block';
        
        // Clear cards
        this.playerCardsDiv.innerHTML = '';
        this.dealerCardsDiv.innerHTML = '';
        this.playerScoreDiv.textContent = 'Score: 0';
        this.dealerScoreDiv.textContent = 'Score: 0';
    }

    newGame() {
        // Reset everything
        this.bankroll = this.startingBankroll;
        this.currentBet = 0;
        this.currentBetChip.textContent = '0';
        this.updateBankrollDisplay();
        this.messageDiv.textContent = 'Place your bet!';
        
        // Clear cards
        this.playerCardsDiv.innerHTML = '';
        this.dealerCardsDiv.innerHTML = '';
        this.playerScoreDiv.textContent = 'Score: 0';
        this.dealerScoreDiv.textContent = 'Score: 0';
        
        // Enable betting controls
        this.chipButtons.forEach(btn => btn.disabled = false);
        this.betBtn.disabled = false;
        this.clearBtn.disabled = false;
        this.gameControls.style.display = 'none';
        
        // Hide new game button
        this.newGameBtn.style.display = 'none';
    }

    placeBet() {
        if (this.currentBet === 0) {
            this.messageDiv.textContent = 'Minimum bet is $10!';
            return;
        }

        this.gameActive = true;
        this.bankroll -= this.currentBet;
        this.updateBankrollDisplay();

        // Disable chip buttons
        this.chipButtons.forEach(btn => btn.disabled = true);
        this.betBtn.disabled = true;
        this.clearBtn.disabled = true;

        // Enable and show game controls
        this.hitBtn.disabled = false;
        this.standBtn.disabled = false;
        this.gameControls.style.display = 'flex';

        this.startGame();
    }

    startGame() {
        this.createDeck();
        this.shuffleDeck();
        this.dealInitialCards();
        this.updateDisplay();
    }

    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        this.deck = [];
        for (let suit of suits) {
            for (let rank of ranks) {
                this.deck.push({ rank, suit });
            }
        }
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealInitialCards() {
        this.playerHand = [];
        this.dealerHand = [];
        this.gameOver = false;
        this.dealerRevealed = false;

        this.playerHand.push(this.deck.pop());
        this.dealerHand.push(this.deck.pop());
        this.playerHand.push(this.deck.pop());
        this.dealerHand.push(this.deck.pop());

        const playerScore = this.calculateScore(this.playerHand);
        const dealerScore = this.calculateScore(this.dealerHand);
        
        if (playerScore === 21 && dealerScore === 21) {
            this.messageDiv.textContent = "It's a TIE! Blackjack!";
            this.gameOver = true;
            this.dealerRevealed = true;
            this.updateDisplay();
            this.bankroll += this.currentBet;
            this.endRound();
        } else if (playerScore === 21) {
            this.messageDiv.textContent = 'BLACKJACK! You WIN!';
            this.gameOver = true;
            this.dealerRevealed = true;
            this.updateDisplay();
            this.bankroll += this.currentBet * 2;
            this.endRound();
        } else {
            this.messageDiv.textContent = 'Your turn!';
        }
    }

    getCardValue(card) {
        if (card.rank === 'A') return 11;
        if (['J', 'Q', 'K'].includes(card.rank)) return 10;
        return parseInt(card.rank);
    }

    calculateScore(hand) {
        let score = hand.reduce((sum, card) => sum + this.getCardValue(card), 0);
        let aces = hand.filter(card => card.rank === 'A').length;

        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }

        return score;
    }

    hit() {
        if (this.gameOver) return;

        this.playerHand.push(this.deck.pop());
        const playerScore = this.calculateScore(this.playerHand);

        if (playerScore > 21) {
            this.endRound('BUST! You lose!');
        } else {
            this.updateDisplay();
        }
    }

    stand() {
        if (this.gameOver) return;

        this.gameOver = true;
        this.dealerRevealed = true;
        this.dealerTurn();
        this.updateDisplay();
        this.determineWinner();
    }

    dealerTurn() {
        while (this.calculateScore(this.dealerHand) < 17) {
            this.dealerHand.push(this.deck.pop());
        }
    }

    determineWinner() {
        const playerScore = this.calculateScore(this.playerHand);
        const dealerScore = this.calculateScore(this.dealerHand);
        let winnings = 0;
        let message = '';

        if (dealerScore > 21) {
            message = 'Dealer BUST! You WIN!';
            winnings = this.currentBet * 2;
        } else if (playerScore > dealerScore) {
            message = 'You WIN!';
            winnings = this.currentBet * 2;
        } else if (dealerScore > playerScore) {
            message = 'Dealer WINS!';
            winnings = 0;
        } else {
            message = "It's a TIE!";
            winnings = this.currentBet;
        }

        this.bankroll += winnings;
        this.endRound(message);
    }

    endRound(message = '') {
        this.gameActive = false;
        this.hitBtn.disabled = true;
        this.standBtn.disabled = true;
        this.gameControls.style.display = 'none';

        // Re-enable betting
        this.chipButtons.forEach(btn => btn.disabled = false);
        this.betBtn.disabled = false;
        this.clearBtn.disabled = false;

        this.currentBet = 0;
        this.currentBetChip.textContent = '0';
        this.updateBankrollDisplay();

        if (this.bankroll === 0) {
            this.messageDiv.textContent = 'Game Over! You are bankrupt!';
            this.chipButtons.forEach(btn => btn.disabled = true);
            this.betBtn.disabled = true;
            this.clearBtn.disabled = true;
            this.newGameBtn.style.display = 'inline-block';
        } else if (message !== '') {
            this.messageDiv.textContent = message;
        } else {
            this.messageDiv.textContent = 'Place your next bet!';
        }
    }

    updateDisplay() {
        this.displayCards();
        this.updateScores();
    }

    displayCards() {
        this.playerCardsDiv.innerHTML = '';
        this.dealerCardsDiv.innerHTML = '';

        this.playerHand.forEach(card => {
            this.playerCardsDiv.appendChild(this.createCardElement(card));
        });

        this.dealerHand.forEach((card, index) => {
            if (index === 1 && !this.dealerRevealed) {
                this.dealerCardsDiv.appendChild(this.createHiddenCardElement());
            } else {
                this.dealerCardsDiv.appendChild(this.createCardElement(card));
            }
        });
    }

    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';

        const isRed = card.suit === '♥' || card.suit === '♦';
        cardDiv.classList.add(isRed ? 'red' : 'black');

        cardDiv.innerHTML = `<div>${card.rank}<br>${card.suit}</div>`;
        return cardDiv;
    }

    createHiddenCardElement() {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card hidden';
        cardDiv.textContent = '?';
        return cardDiv;
    }

    updateScores() {
        const playerScore = this.calculateScore(this.playerHand);
        this.playerScoreDiv.textContent = `Score: ${playerScore}`;

        if (this.dealerRevealed) {
            const dealerScore = this.calculateScore(this.dealerHand);
            this.dealerScoreDiv.textContent = `Score: ${dealerScore}`;
        } else {
            this.dealerScoreDiv.textContent = `Score: ?`;
        }
    }

    updateBankrollDisplay() {
        this.bankrollChip.textContent = this.bankroll;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BlackjackGame();
});
