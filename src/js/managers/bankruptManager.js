// =============================================================
// bankruptManager.js — Monopoli Nusantara
// Mengelola proses kebangkrutan dan likuidasi aset
// =============================================================
"use strict";

const BankruptManager = {

  declareBankrupt(playerIndex, creditorIndex, onDone) {
    const player = GameState.players[playerIndex];

    // Transfer atau likuidasi aset
    if (creditorIndex >= 0 && creditorIndex < GameState.players.length) {
      PropertyManager.transferAllTo(playerIndex, creditorIndex);
    } else {
      PropertyManager.liquidateToBank(playerIndex);
    }

    player.balance    = 0;
    player.isBankrupt = true;

    GameState.addLog(`💀 ${player.name} BANGKRUT!`);
    EventBus.emit("notification", `💀 ${player.name} bangkrut!`, "error");
    EventBus.emit("playerBankrupt", playerIndex);

    UIManager.refreshAll();
    UIManager.showBankruptNotice(player.name, () => {
      GameManager.checkWin();
      if (GameState.phase !== GamePhase.GAME_OVER) {
        TurnManager.endTurn();
      }
      onDone && onDone();
    });
  },
};
