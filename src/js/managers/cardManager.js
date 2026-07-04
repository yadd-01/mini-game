// =============================================================
// cardManager.js — Monopoli Nusantara
// Eksekusi semua efek kartu Kesempatan dan Dana Nusantara
// =============================================================
"use strict";

const CardManager = {

  drawAndExecute(playerIndex, type) {
    const card = type === "chance"
      ? GameState.drawChanceCard()
      : GameState.drawCommunityCard();

    const typeName = type === "chance" ? "Kesempatan" : "Dana Nusantara";
    GameState.addLog(`${GameState.players[playerIndex].name} ambil kartu ${typeName}: "${card.name}"`);

    UIManager.showCardPopup(card, () => {
      this._execute(playerIndex, card);
    });
  },

  _execute(playerIndex, card) {
    const player = GameState.players[playerIndex];

    switch (card.effectType) {

      case "receiveBank":
        player.balance += card.value;
        player.totalEarned += card.value;
        GameState.addLog(`${player.name} terima ${formatRp(card.value)} dari Bank`);
        EventBus.emit("notification", `Terima ${formatRp(card.value)} dari Bank 🎉`, "success");
        TurnManager.endTurn();
        break;

      case "payBank":
        if (player.balance >= card.value) {
          player.balance -= card.value;
          player.totalSpent += card.value;
          GameState.addLog(`${player.name} bayar ${formatRp(card.value)} ke Bank`);
          EventBus.emit("notification", `Bayar ${formatRp(card.value)} ke Bank`, "warning");
          TurnManager.endTurn();
        } else {
          BankruptManager.declareBankrupt(playerIndex, -1, () => {});
        }
        break;

      case "receiveAll":
        this._receiveFromAll(playerIndex, card.value);
        TurnManager.endTurn();
        break;

      case "payAll":
        this._payToAll(playerIndex, card.value, () => TurnManager.endTurn());
        break;

      case "moveToTile":
        BoardManager.teleportToken(playerIndex, card.value, true, () => {
          GameManager.resolveTile(playerIndex);
        });
        break;

      case "moveToStart":
        BoardManager.teleportToken(playerIndex, CONSTANTS.TILE_START, true, () => {
          GameManager.givePassStartBonus(playerIndex);
          TurnManager.endTurn();
        });
        break;

      case "moveToNearest":
        this._moveToNearestUnowned(playerIndex);
        break;

      case "moveBack":
        BoardManager.moveBack(playerIndex, card.value, () => {
          GameManager.resolveTile(playerIndex);
        });
        break;

      case "goToJail":
        if (card.value > 0 && player.balance >= card.value) {
          player.balance   -= card.value;
          player.totalSpent += card.value;
        }
        GameManager.sendToJail(playerIndex);
        break;

      case "getOutOfJail":
        player.heldCards.push(card.id);
        UIManager.refreshPlayerPanel(playerIndex);
        GameState.addLog(`${player.name} menyimpan Kartu Bebas Penjara`);
        EventBus.emit("notification", "Kartu Bebas Penjara disimpan! 🔑", "success");
        TurnManager.endTurn();
        break;

      case "payPerBuilding": {
        let total = 0;
        Object.values(GameState.propertyStates).forEach(s => {
          if (s.ownerIndex !== playerIndex) return;
          const propSO = getPropByTile(s.tileIndex);
          if (!propSO) return;
          total += s.houseCount * (card.perHouse || 0);
          if (s.hasHotel) total += (card.perHotel || 0);
        });
        if (total === 0) { TurnManager.endTurn(); return; }
        if (player.balance >= total) {
          player.balance -= total;
          player.totalSpent += total;
          GameState.addLog(`${player.name} bayar renovasi ${formatRp(total)}`);
          TurnManager.endTurn();
        } else {
          BankruptManager.declareBankrupt(playerIndex, -1, () => {});
        }
        break;
      }

      default:
        TurnManager.endTurn();
    }
  },

  _receiveFromAll(receiverIndex, amount) {
    const receiver = GameState.players[receiverIndex];
    GameState.players.forEach((p, i) => {
      if (i === receiverIndex || p.isBankrupt) return;
      const actual = Math.min(p.balance, amount);
      p.balance      -= actual;
      p.totalSpent   += actual;
      receiver.balance += actual;
      receiver.totalEarned += actual;
      GameState.addLog(`${p.name} bayar ${formatRp(actual)} ke ${receiver.name}`);
    });
    EventBus.emit("notification", `Terima ${formatRp(amount)} dari setiap pemain 🎉`, "success");
  },

  _payToAll(payerIndex, amount, onDone) {
    const payer = GameState.players[payerIndex];
    GameState.players.forEach((p, i) => {
      if (i === payerIndex || p.isBankrupt) return;
      if (payer.balance >= amount) {
        payer.balance    -= amount;
        payer.totalSpent += amount;
        p.balance        += amount;
        p.totalEarned    += amount;
        GameState.addLog(`${payer.name} bayar ${formatRp(amount)} ke ${p.name}`);
      }
    });
    EventBus.emit("notification", `Bayar ${formatRp(amount)} ke setiap pemain`, "warning");
    onDone && onDone();
  },

  _moveToNearestUnowned(playerIndex) {
    const pos = GameState.players[playerIndex].position;
    for (let i = 1; i < CONSTANTS.TOTAL_TILES; i++) {
      const tile = (pos + i) % CONSTANTS.TOTAL_TILES;
      const td   = getTileData(tile);
      if (!td) continue;
      if (td.type !== "property" && td.type !== "transport") continue;
      const state = PropertyManager.getState(tile);
      if (state && state.ownerIndex < 0) {
        BoardManager.teleportToken(playerIndex, tile, true, () => {
          GameManager.resolveTile(playerIndex);
        });
        return;
      }
    }
    TurnManager.endTurn();
  },
};
