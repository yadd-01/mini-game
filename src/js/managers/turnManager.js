// =============================================================
// turnManager.js — Monopoli Nusantara
// State Machine giliran: IDLE → ROLLING → MOVING → RESOLVE → ...
// =============================================================
"use strict";

const TurnManager = {
  _waitingDouble: false,

  start() {
    this._waitingDouble = false;
    GameState.currentPlayerIndex = 0;
    this._beginTurn();
  },

  _beginTurn() {
    const player = GameState.currentPlayer;

    // Lewati pemain bangkrut
    if (player.isBankrupt) { this._advance(); return; }

    GameState.setPhase(GamePhase.IDLE);
    GameState.addLog(`— Giliran ${player.name} —`);
    EventBus.emit("turnStart", GameState.currentPlayerIndex);

    if (player.isBot) {
      setTimeout(() => BotManager.executeTurn(GameState.currentPlayerIndex),
                 CONSTANTS.BOT_THINK_MS);
    } else {
      UIManager.setDiceEnabled(true);
      if (player.isInJail) UIManager.showJailOptions(GameState.currentPlayerIndex);
    }
  },

  endTurn() {
    UIManager.setDiceEnabled(false);
    const idx    = GameState.currentPlayerIndex;
    const player = GameState.players[idx];

    EventBus.emit("turnEnd", idx);
    SaveManager.autoSave();
    UIManager.refreshAll();

    // Giliran tambahan karena double
    if (this._waitingDouble && !player.isInJail) {
      this._waitingDouble = false;
      GameState.addLog(`${player.name} giliran tambahan (Double)!`);
      setTimeout(() => this._beginTurn(), 600);
      return;
    }

    this._waitingDouble = false;
    player.consecutiveDoubles = 0;
    this._advance();
  },

  _advance() {
    const total = GameState.players.length;
    let next    = (GameState.currentPlayerIndex + 1) % total;
    let checked = 0;
    while (GameState.players[next].isBankrupt && checked < total) {
      next = (next + 1) % total;
      checked++;
    }
    GameState.currentPlayerIndex = next;
    GameState.turnNumber++;
    setTimeout(() => this._beginTurn(), 400);
  },

  registerDouble() { this._waitingDouble = true; },

  registerTripleDouble() {
    this._waitingDouble = false;
    GameManager.sendToJail(GameState.currentPlayerIndex);
  },

  incrementJailTurns(pidx) { GameState.players[pidx].jailTurns++; },
  getJailTurns(pidx)       { return GameState.players[pidx].jailTurns; },
};
