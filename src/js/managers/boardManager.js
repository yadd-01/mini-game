// =============================================================
// boardManager.js — Monopoli Nusantara
// Mengelola pergerakan token dan update posisi visual
// =============================================================
"use strict";

const BoardManager = {

  // ── Gerak Token ───────────────────────────────────────────
  moveToken(playerIndex, steps, onDone) {
    const player = GameState.players[playerIndex];
    let moved    = 0;

    const step = () => {
      if (moved >= steps) {
        // Cek berhenti tepat di Start
        if (player.position === CONSTANTS.TILE_START)
          GameManager.givePassStartBonus(playerIndex);

        EventBus.emit("tokenMoved", { playerIndex, tileIndex: player.position });
        UIManager.updateTokenPosition(playerIndex, player.position);
        onDone && onDone();
        return;
      }

      player.position = (player.position + 1) % CONSTANTS.TOTAL_TILES;
      moved++;

      // Cek melewati Start di tengah perjalanan
      if (player.position === CONSTANTS.TILE_START && moved < steps)
        GameManager.givePassStartBonus(playerIndex);

      UIManager.updateTokenPosition(playerIndex, player.position);
      EventBus.emit("tokenStepped", { playerIndex, tileIndex: player.position });

      setTimeout(step, CONSTANTS.TOKEN_STEP_MS);
    };

    step();
  },

  // ── Teleport Token (kartu/penjara) ────────────────────────
  teleportToken(playerIndex, targetTile, giveBonus, onDone) {
    const player = GameState.players[playerIndex];
    const from   = player.position;

    // Cek apakah melewati Start (hanya jika maju)
    if (giveBonus && targetTile !== CONSTANTS.TILE_JAIL) {
      if (targetTile < from)
        GameManager.givePassStartBonus(playerIndex);
    }

    player.position = targetTile;
    UIManager.updateTokenPosition(playerIndex, targetTile);
    EventBus.emit("tokenMoved", { playerIndex, tileIndex: targetTile });
    setTimeout(() => onDone && onDone(), 400);
  },

  // ── Mundur N Tile (efek kartu) ────────────────────────────
  moveBack(playerIndex, steps, onDone) {
    const player   = GameState.players[playerIndex];
    const target   = ((player.position - steps) % CONSTANTS.TOTAL_TILES
                      + CONSTANTS.TOTAL_TILES) % CONSTANTS.TOTAL_TILES;
    player.position = target;
    UIManager.updateTokenPosition(playerIndex, target);
    EventBus.emit("tokenMoved", { playerIndex, tileIndex: target });
    setTimeout(() => onDone && onDone(), 400);
  },
};
