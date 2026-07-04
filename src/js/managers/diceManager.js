// =============================================================
// diceManager.js — Monopoli Nusantara
// Logika lemparan dadu, animasi, deteksi double
// =============================================================
"use strict";

const DiceManager = {
  lastDie1: 0,
  lastDie2: 0,
  get lastTotal() { return this.lastDie1 + this.lastDie2; },
  get isDouble()  { return this.lastDie1 === this.lastDie2; },

  // ── Override untuk testing ────────────────────────────────
  _forceDie1: 0,
  _forceDie2: 0,
  setTestResult(d1, d2) { this._forceDie1 = d1; this._forceDie2 = d2; },

  // ── Lemparan Normal ───────────────────────────────────────
  roll(playerIndex) {
    GameState.setPhase(GamePhase.ROLLING);
    UIManager.setDiceEnabled(false);
    UIManager.startDiceAnim();

    setTimeout(() => {
      this._resolve(playerIndex, false);
    }, CONSTANTS.DICE_ANIM_MS);
  },

  // ── Lemparan Saat di Penjara ──────────────────────────────
  rollForJail(playerIndex) {
    GameState.setPhase(GamePhase.IN_JAIL);
    UIManager.setDiceEnabled(false);
    UIManager.startDiceAnim();

    setTimeout(() => {
      this._resolveJail(playerIndex);
    }, CONSTANTS.DICE_ANIM_MS);
  },

  _resolve(playerIndex, forJail) {
    if (this._forceDie1 > 0 && this._forceDie2 > 0) {
      this.lastDie1 = this._forceDie1;
      this.lastDie2 = this._forceDie2;
      this._forceDie1 = 0; this._forceDie2 = 0;
    } else {
      this.lastDie1 = Math.floor(Math.random() * 6) + 1;
      this.lastDie2 = Math.floor(Math.random() * 6) + 1;
    }

    UIManager.showDiceResult(this.lastDie1, this.lastDie2);
    GameState.addLog(`${GameState.players[playerIndex].name} melempar dadu: ${this.lastDie1} + ${this.lastDie2} = ${this.lastTotal}`);

    const player = GameState.players[playerIndex];

    if (this.isDouble) {
      player.consecutiveDoubles++;
      GameState.addLog(`Double! (${player.consecutiveDoubles}x berturut)`);
      if (player.consecutiveDoubles >= CONSTANTS.MAX_CONSECUTIVE_DOUBLES) {
        TurnManager.registerTripleDouble();
        return;
      }
      TurnManager.registerDouble();
    } else {
      player.consecutiveDoubles = 0;
    }

    // Gerak token
    GameState.setPhase(GamePhase.MOVING);
    BoardManager.moveToken(playerIndex, this.lastTotal, () => {
      GameManager.resolveTile(playerIndex);
    });
  },

  _resolveJail(playerIndex) {
    this.lastDie1 = Math.floor(Math.random() * 6) + 1;
    this.lastDie2 = Math.floor(Math.random() * 6) + 1;
    UIManager.showDiceResult(this.lastDie1, this.lastDie2);
    GameState.addLog(`Dadu penjara: ${this.lastDie1} + ${this.lastDie2} = ${this.lastTotal}`);

    const player = GameState.players[playerIndex];

    if (this.isDouble) {
      GameManager.releaseFromJail(playerIndex);
      GameState.addLog(`${player.name} keluar penjara dengan Double!`);
      player.consecutiveDoubles = 0; // Double ini tidak beri giliran tambahan
      GameState.setPhase(GamePhase.MOVING);
      BoardManager.moveToken(playerIndex, this.lastTotal, () => {
        GameManager.resolveTile(playerIndex);
      });
    } else {
      TurnManager.incrementJailTurns(playerIndex);
      const jt = TurnManager.getJailTurns(playerIndex);
      GameState.addLog(`${player.name} gagal keluar penjara (${jt}/${CONSTANTS.MAX_JAIL_TURNS})`);

      if (jt >= CONSTANTS.MAX_JAIL_TURNS) {
        // Paksa bayar denda
        if (player.balance >= CONSTANTS.JAIL_FINE) {
          player.balance -= CONSTANTS.JAIL_FINE;
          GameManager.releaseFromJail(playerIndex);
          GameState.addLog(`${player.name} dipaksa bayar denda penjara ${formatRp(CONSTANTS.JAIL_FINE)}`);
          GameState.setPhase(GamePhase.MOVING);
          BoardManager.moveToken(playerIndex, this.lastTotal, () => {
            GameManager.resolveTile(playerIndex);
          });
        } else {
          BankruptManager.declareBankrupt(playerIndex, -1, () => {});
        }
      } else {
        TurnManager.endTurn();
      }
    }
  },
};
