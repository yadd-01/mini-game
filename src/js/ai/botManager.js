// =============================================================
// botManager.js — Monopoli Nusantara
// Rule-Based AI Decision Tree — BUKAN ML / API AI
// =============================================================
"use strict";

const BotManager = {

  executeTurn(botIndex) {
    const bot = GameState.players[botIndex];
    if (!bot.isBot || bot.isBankrupt) return;

    if (bot.isInJail) {
      this._decideJail(botIndex);
    } else {
      DiceManager.roll(botIndex);
    }
  },

  // ── Decision Tree Penjara ─────────────────────────────────
  _decideJail(botIndex) {
    const bot      = GameState.players[botIndex];
    const jailTurns= TurnManager.getJailTurns(botIndex);

    // 1. Punya kartu bebas → gunakan
    if (bot.heldCards.length > 0) {
      GameManager.useJailCard(botIndex);
      return;
    }

    // 2. Jika percobaan terakhir ATAU saldo > 1.5jt → bayar denda
    if (jailTurns >= CONSTANTS.MAX_JAIL_TURNS - 1 || bot.balance > CONSTANTS.BOT_BUILD_RESERVE) {
      if (bot.balance >= CONSTANTS.JAIL_FINE) {
        GameManager.payJailFine(botIndex);
      } else {
        BankruptManager.declareBankrupt(botIndex, -1, () => {});
      }
      return;
    }

    // 3. Lempar dadu harap double
    DiceManager.rollForJail(botIndex);
  },

  // ── Decision Tree Pembelian Properti ─────────────────────
  decidePurchase(botIndex, tileIndex) {
    const bot   = GameState.players[botIndex];
    const price = (getPropByTile(tileIndex) || getTransByTile(tileIndex))?.price || 0;
    const propSO= getPropByTile(tileIndex);

    let shouldBuy = false;

    // Aturan 1: harga <= 50% saldo
    if (price > 0 && price <= bot.balance * CONSTANTS.BOT_BUY_RATIO)
      shouldBuy = true;

    // Aturan 2: jangan beli jika saldo sisa < minimum reserve
    if (bot.balance - price < CONSTANTS.BOT_MIN_RESERVE)
      shouldBuy = false;

    // Aturan 3: override beli jika sudah punya properti dalam grup yang sama
    if (propSO) {
      const owned = GROUP_TILES[propSO.group]?.filter(t => {
        const s = PropertyManager.getState(t);
        return s && s.ownerIndex === botIndex;
      }).length || 0;
      if (owned > 0 && bot.balance - price >= CONSTANTS.BOT_MIN_RESERVE)
        shouldBuy = true;
    }

    if (shouldBuy) {
      PropertyManager.buy(botIndex, tileIndex);
      this._tryBuild(botIndex);
    } else {
      const name = propSO?.city || getTransByTile(tileIndex)?.name || "";
      GameState.addLog(`[BOT] ${bot.name} melewati pembelian ${name}`);
    }

    setTimeout(() => TurnManager.endTurn(), 500);
  },

  // ── Decision Tree Pembangunan ─────────────────────────────
  _tryBuild(botIndex) {
    const bot = GameState.players[botIndex];

    // Coba bangun hotel dulu, lalu rumah
    for (const state of Object.values(GameState.propertyStates)) {
      if (state.ownerIndex !== botIndex) continue;
      const propSO = getPropByTile(state.tileIndex);
      if (!propSO) continue;

      if (PropertyManager.canBuildHotel(botIndex, state.tileIndex)) {
        if (bot.balance >= propSO.hotelCost * 2 + CONSTANTS.BOT_BUILD_RESERVE) {
          PropertyManager.buildHotel(botIndex, state.tileIndex);
          return;
        }
      }

      if (PropertyManager.canBuildHouse(botIndex, state.tileIndex)) {
        if (bot.balance >= propSO.houseCost * 2 + CONSTANTS.BOT_BUILD_RESERVE) {
          PropertyManager.buildHouse(botIndex, state.tileIndex);
          return;
        }
      }
    }
  },
};
