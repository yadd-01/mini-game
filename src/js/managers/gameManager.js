// =============================================================
// gameManager.js — Monopoli Nusantara
// Central coordinator — mengorkestrasi semua manager
// =============================================================
"use strict";

const GameManager = {

  // ── Start Game Baru ───────────────────────────────────────
  startNewGame(playerConfigs) {
    EventBus.clear();
    UIManager.bindEvents();

    GameState.init(playerConfigs);
    UIManager.buildBoard();
    UIManager.buildPlayerPanels();
    UIManager.refreshAll();
    TurnManager.start();
  },

  // ── Resolve Tile ──────────────────────────────────────────
  resolveTile(playerIndex) {
    GameState.setPhase(GamePhase.RESOLVE_TILE);
    const player = GameState.players[playerIndex];
    const tile   = getTileData(player.position);
    if (!tile) { TurnManager.endTurn(); return; }

    switch (tile.type) {
      case "start":
        TurnManager.endTurn();
        break;

      case "property":
      case "transport":
        this._handleBuyable(playerIndex, tile);
        break;

      case "tax":
        this._handleTax(playerIndex, tile);
        break;

      case "chance":
        GameState.setPhase(GamePhase.DRAWING_CARD);
        CardManager.drawAndExecute(playerIndex, "chance");
        break;

      case "community":
        GameState.setPhase(GamePhase.DRAWING_CARD);
        CardManager.drawAndExecute(playerIndex, "community");
        break;

      case "gotojail":
        this.sendToJail(playerIndex);
        break;

      case "freeparking":
        EventBus.emit("notification", "🅿️ Parkir Bebas — Istirahat sebentar!", "info");
        TurnManager.endTurn();
        break;

      case "jail":
        TurnManager.endTurn();
        break;

      default:
        TurnManager.endTurn();
    }
  },

  // ── Handler Tile Buyable ──────────────────────────────────
  _handleBuyable(playerIndex, tile) {
    const state = PropertyManager.getState(tile.index);
    if (!state) { TurnManager.endTurn(); return; }

    const player = GameState.players[playerIndex];

    if (state.ownerIndex < 0) {
      // Belum dimiliki
      GameState.setPhase(GamePhase.BUYING);
      if (player.isBot) {
        BotManager.decidePurchase(playerIndex, tile.index);
      } else {
        UIManager.showBuyPopup(playerIndex, tile.index);
      }
    } else if (state.ownerIndex === playerIndex) {
      EventBus.emit("notification", "Ini properti milik Anda.", "info");
      TurnManager.endTurn();
    } else if (state.isMortgaged) {
      EventBus.emit("notification", "Properti sedang dihipotek. Bebas sewa.", "info");
      TurnManager.endTurn();
    } else {
      GameState.setPhase(GamePhase.PAYING_RENT);
      PropertyManager.chargeRent(playerIndex, tile.index, () => TurnManager.endTurn());
    }
  },

  // ── Handler Pajak ─────────────────────────────────────────
  _handleTax(playerIndex, tile) {
    const amount = tile.taxType === "income"
      ? CONSTANTS.INCOME_TAX
      : CONSTANTS.LUXURY_TAX;
    const player = GameState.players[playerIndex];
    const label  = tile.taxType === "income" ? "Pajak Penghasilan" : "Pajak Kemewahan";

    if (player.balance >= amount) {
      player.balance   -= amount;
      player.totalSpent += amount;
      GameState.addLog(`${player.name} bayar ${label} ${formatRp(amount)}`);
      EventBus.emit("notification", `Bayar ${label} ${formatRp(amount)} 💰`, "warning");
      UIManager.refreshAll();
      TurnManager.endTurn();
    } else {
      BankruptManager.declareBankrupt(playerIndex, -1, () => {});
    }
  },

  // ── Penjara ───────────────────────────────────────────────
  sendToJail(playerIndex) {
    const player = GameState.players[playerIndex];
    player.position          = CONSTANTS.TILE_JAIL;
    player.isInJail          = true;
    player.jailTurns         = 0;
    player.consecutiveDoubles= 0;

    UIManager.updateTokenPosition(playerIndex, CONSTANTS.TILE_JAIL);
    GameState.addLog(`${player.name} masuk Penjara!`);
    EventBus.emit("notification", `⛓️ ${player.name} masuk Penjara!`, "error");
    UIManager.refreshAll();
    TurnManager.endTurn();
  },

  releaseFromJail(playerIndex) {
    const player   = GameState.players[playerIndex];
    player.isInJail  = false;
    player.jailTurns = 0;
  },

  // ── Bayar Denda Penjara (dari UI button) ──────────────────
  payJailFine(playerIndex) {
    const player = GameState.players[playerIndex];
    if (player.balance < CONSTANTS.JAIL_FINE) {
      EventBus.emit("notification", "Saldo tidak cukup untuk bayar denda!", "error");
      return;
    }
    player.balance   -= CONSTANTS.JAIL_FINE;
    player.totalSpent += CONSTANTS.JAIL_FINE;
    this.releaseFromJail(playerIndex);
    GameState.addLog(`${player.name} bayar denda penjara ${formatRp(CONSTANTS.JAIL_FINE)}`);
    UIManager.hideJailOptions();
    UIManager.refreshAll();
    DiceManager.roll(playerIndex);
  },

  // ── Gunakan Kartu Bebas Penjara ───────────────────────────
  useJailCard(playerIndex) {
    const player = GameState.players[playerIndex];
    if (player.heldCards.length === 0) return;
    player.heldCards.shift();
    this.releaseFromJail(playerIndex);
    GameState.addLog(`${player.name} gunakan Kartu Bebas Penjara`);
    UIManager.hideJailOptions();
    UIManager.refreshPlayerPanel(playerIndex);
    UIManager.refreshAll();
    DiceManager.roll(playerIndex);
  },

  // ── Bonus Melewati Start ──────────────────────────────────
  givePassStartBonus(playerIndex) {
    const player = GameState.players[playerIndex];
    player.balance += CONSTANTS.PASS_START_BONUS;
    player.totalEarned += CONSTANTS.PASS_START_BONUS;
    GameState.addLog(`${player.name} melewati Start +${formatRp(CONSTANTS.PASS_START_BONUS)}`);
    EventBus.emit("notification", `🏁 Melewati Start! +${formatRp(CONSTANTS.PASS_START_BONUS)}`, "success");
    UIManager.refreshPlayerPanel(playerIndex);
  },

  // ── Win Check ─────────────────────────────────────────────
  checkWin() {
    const alive = GameState.activePlayers();
    if (alive.length <= 1) {
      const winner = alive[0] || null;
      GameState.setPhase(GamePhase.GAME_OVER);
      GameState.addLog(`Permainan selesai! Pemenang: ${winner ? winner.name : "Tidak ada"}`);
      EventBus.emit("gameOver", winner ? winner.index : -1);
      UIManager.showWinnerScreen(winner);
    }
  },
};
