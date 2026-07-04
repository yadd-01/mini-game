// =============================================================
// propertyManager.js — Monopoli Nusantara
// Mengelola kepemilikan, sewa, bangunan, hipotek, bangkrut
// =============================================================
"use strict";

const PropertyManager = {

  getState(tileIndex) {
    return GameState.propertyStates[tileIndex] || null;
  },

  // ── Pembelian ─────────────────────────────────────────────
  buy(playerIndex, tileIndex) {
    const state  = this.getState(tileIndex);
    const player = GameState.players[playerIndex];
    const price  = this._getPrice(tileIndex);
    if (!state || state.ownerIndex >= 0 || price <= 0) return false;
    if (player.balance < price) return false;

    player.balance -= price;
    player.totalSpent += price;
    state.ownerIndex = playerIndex;
    player.ownedTiles.push(tileIndex);

    const name = this._getName(tileIndex);
    GameState.addLog(`${player.name} membeli ${name} — ${formatRp(price)}`);
    EventBus.emit("propertyBought", { playerIndex, tileIndex, price });
    this._checkMonopoly(playerIndex);
    return true;
  },

  // ── Sewa Properti ─────────────────────────────────────────
  calculateRent(tileIndex) {
    const state  = this.getState(tileIndex);
    const propSO = getPropByTile(tileIndex);
    if (!propSO || !state || state.ownerIndex < 0) return 0;
    if (state.isMortgaged) return 0;

    const level = state.hasHotel ? 5 : state.houseCount;
    if (level > 0) return propSO.rent[level];

    // Cek monopoli
    if (this.hasMonopoly(state.ownerIndex, propSO.group))
      return propSO.rent[0] * 2;

    return propSO.rent[0];
  },

  // ── Sewa Transportasi ─────────────────────────────────────
  calculateTransportRent(tileIndex) {
    const state = this.getState(tileIndex);
    if (!state || state.ownerIndex < 0 || state.isMortgaged) return 0;
    const count = this._countTransportOwned(state.ownerIndex);
    return CONSTANTS.TRANSPORT_RENT[count] || 0;
  },

  chargeRent(payerIndex, tileIndex, onDone) {
    const state = this.getState(tileIndex);
    if (!state || state.ownerIndex < 0) { onDone && onDone(); return; }

    const isTrans = !!getTransByTile(tileIndex);
    const rent    = isTrans
      ? this.calculateTransportRent(tileIndex)
      : this.calculateRent(tileIndex);

    if (rent <= 0) { onDone && onDone(); return; }

    const payer    = GameState.players[payerIndex];
    const receiver = GameState.players[state.ownerIndex];
    const name     = this._getName(tileIndex);

    if (payer.balance >= rent) {
      payer.balance   -= rent;
      payer.totalSpent += rent;
      receiver.balance += rent;
      receiver.totalEarned += rent;
      GameState.addLog(`${payer.name} bayar sewa ${formatRp(rent)} ke ${receiver.name} (${name})`);
      EventBus.emit("rentPaid", { payerIndex, receiverIndex: state.ownerIndex, rent, tileIndex });
      EventBus.emit("notification", `Bayar sewa ${formatRp(rent)} ke ${receiver.name}`, "warning");
      onDone && onDone();
    } else {
      // Tidak cukup — bangkrut
      const paid = payer.balance;
      payer.balance    = 0;
      receiver.balance += paid;
      GameState.addLog(`${payer.name} tidak mampu bayar sewa — bangkrut!`);
      BankruptManager.declareBankrupt(payerIndex, state.ownerIndex, onDone);
    }
  },

  // ── Monopoli ──────────────────────────────────────────────
  hasMonopoly(playerIndex, group) {
    const tiles = GROUP_TILES[group];
    if (!tiles) return false;
    return tiles.every(t => {
      const s = this.getState(t);
      return s && s.ownerIndex === playerIndex;
    });
  },

  _checkMonopoly(playerIndex) {
    Object.keys(GROUP_TILES).forEach(group => {
      if (this.hasMonopoly(playerIndex, group)) {
        const pName = GameState.players[playerIndex].name;
        GameState.addLog(`${pName} meraih MONOPOLI grup ${group}!`);
        EventBus.emit("monopolyAchieved", { playerIndex, group });
        EventBus.emit("notification", `🏆 MONOPOLI! ${pName} kuasai grup ${group}!`, "success");
      }
    });
  },

  // ── Bangunan ──────────────────────────────────────────────
  canBuildHouse(playerIndex, tileIndex) {
    const propSO = getPropByTile(tileIndex);
    if (!propSO) return false;
    if (!this.hasMonopoly(playerIndex, propSO.group)) return false;
    const state  = this.getState(tileIndex);
    if (!state || state.isMortgaged || state.hasHotel) return false;
    if (state.houseCount >= CONSTANTS.MAX_HOUSES) return false;
    if (!this._passesEvenBuild(playerIndex, tileIndex, false)) return false;
    return GameState.players[playerIndex].balance >= propSO.houseCost;
  },

  canBuildHotel(playerIndex, tileIndex) {
    const propSO = getPropByTile(tileIndex);
    if (!propSO) return false;
    if (!this.hasMonopoly(playerIndex, propSO.group)) return false;
    const state = this.getState(tileIndex);
    if (!state || state.isMortgaged || state.hasHotel) return false;
    if (state.houseCount < CONSTANTS.MAX_HOUSES) return false;
    return GameState.players[playerIndex].balance >= propSO.hotelCost;
  },

  buildHouse(playerIndex, tileIndex) {
    if (!this.canBuildHouse(playerIndex, tileIndex)) return false;
    const propSO = getPropByTile(tileIndex);
    const state  = this.getState(tileIndex);
    const player = GameState.players[playerIndex];
    player.balance   -= propSO.houseCost;
    player.totalSpent += propSO.houseCost;
    state.houseCount++;
    GameState.addLog(`${player.name} bangun Rumah di ${propSO.city} (Total: ${state.houseCount})`);
    EventBus.emit("houseBuilt", { playerIndex, tileIndex, houseCount: state.houseCount });
    return true;
  },

  buildHotel(playerIndex, tileIndex) {
    if (!this.canBuildHotel(playerIndex, tileIndex)) return false;
    const propSO = getPropByTile(tileIndex);
    const state  = this.getState(tileIndex);
    const player = GameState.players[playerIndex];
    player.balance   -= propSO.hotelCost;
    player.totalSpent += propSO.hotelCost;
    state.houseCount = 0;
    state.hasHotel   = true;
    GameState.addLog(`${player.name} bangun Hotel di ${propSO.city}!`);
    EventBus.emit("hotelBuilt", { playerIndex, tileIndex });
    return true;
  },

  sellBuilding(playerIndex, tileIndex) {
    const propSO = getPropByTile(tileIndex);
    const state  = this.getState(tileIndex);
    if (!propSO || !state || state.ownerIndex !== playerIndex) return false;
    if (!state.hasHotel && state.houseCount === 0) return false;

    let refund;
    if (state.hasHotel) {
      refund = Math.floor(propSO.hotelCost * CONSTANTS.SELL_RATIO);
      state.hasHotel = false;
    } else {
      refund = Math.floor(propSO.houseCost * CONSTANTS.SELL_RATIO);
      state.houseCount--;
    }
    const player = GameState.players[playerIndex];
    player.balance += refund;
    player.totalEarned += refund;
    GameState.addLog(`${player.name} jual bangunan di ${propSO.city} +${formatRp(refund)}`);
    EventBus.emit("buildingSold", { playerIndex, tileIndex });
    return true;
  },

  // ── Hipotek ───────────────────────────────────────────────
  mortgage(playerIndex, tileIndex) {
    const state = this.getState(tileIndex);
    if (!state || state.ownerIndex !== playerIndex || state.isMortgaged) return false;
    if (state.houseCount > 0 || state.hasHotel) return false;

    const propSO  = getPropByTile(tileIndex);
    const transSO = getTransByTile(tileIndex);
    const price   = (propSO || transSO)?.price || 0;
    const value   = Math.floor(price * CONSTANTS.MORTGAGE_RATIO);

    state.isMortgaged = true;
    const player = GameState.players[playerIndex];
    player.balance += value;
    player.totalEarned += value;
    GameState.addLog(`${player.name} hipotek ${this._getName(tileIndex)} +${formatRp(value)}`);
    EventBus.emit("propertyMortgaged", { playerIndex, tileIndex });
    return true;
  },

  redeemMortgage(playerIndex, tileIndex) {
    const state = this.getState(tileIndex);
    if (!state || state.ownerIndex !== playerIndex || !state.isMortgaged) return false;

    const propSO  = getPropByTile(tileIndex);
    const transSO = getTransByTile(tileIndex);
    const price   = (propSO || transSO)?.price || 0;
    const cost    = Math.floor(price * CONSTANTS.REDEEM_RATIO);

    const player = GameState.players[playerIndex];
    if (player.balance < cost) return false;

    state.isMortgaged = false;
    player.balance   -= cost;
    player.totalSpent += cost;
    GameState.addLog(`${player.name} tebus hipotek ${this._getName(tileIndex)} -${formatRp(cost)}`);
    EventBus.emit("propertyRedeemed", { playerIndex, tileIndex });
    return true;
  },

  // ── Bangkrut Helper ───────────────────────────────────────
  liquidateToBank(playerIndex) {
    Object.values(GameState.propertyStates).forEach(s => {
      if (s.ownerIndex === playerIndex) {
        s.ownerIndex  = -1;
        s.houseCount  = 0;
        s.hasHotel    = false;
        s.isMortgaged = false;
      }
    });
    GameState.players[playerIndex].ownedTiles = [];
  },

  transferAllTo(fromIndex, toIndex) {
    const to = GameState.players[toIndex];
    Object.values(GameState.propertyStates).forEach(s => {
      if (s.ownerIndex === fromIndex) {
        s.ownerIndex  = toIndex;
        s.isMortgaged = false;
        to.ownedTiles.push(s.tileIndex);
      }
    });
    GameState.players[fromIndex].ownedTiles = [];
    this._checkMonopoly(toIndex);
  },

  // ── Kekayaan Total ────────────────────────────────────────
  calculateWealth(playerIndex) {
    let wealth = GameState.players[playerIndex].balance;
    Object.values(GameState.propertyStates).forEach(s => {
      if (s.ownerIndex !== playerIndex) return;
      const propSO  = getPropByTile(s.tileIndex);
      const transSO = getTransByTile(s.tileIndex);
      const price   = (propSO || transSO)?.price || 0;
      wealth += price;
      if (propSO) {
        wealth += s.houseCount * Math.floor(propSO.houseCost * CONSTANTS.SELL_RATIO);
        if (s.hasHotel) wealth += Math.floor(propSO.hotelCost * CONSTANTS.SELL_RATIO);
      }
    });
    return wealth;
  },

  // ── Even Build Rule ───────────────────────────────────────
  _passesEvenBuild(playerIndex, tileIndex) {
    const propSO   = getPropByTile(tileIndex);
    const myState  = this.getState(tileIndex);
    const myLevel  = myState.hasHotel ? 5 : myState.houseCount;
    const siblings = GROUP_TILES[propSO.group].filter(t => t !== tileIndex);
    return siblings.every(t => {
      const s = this.getState(t);
      return s && (s.hasHotel ? 5 : s.houseCount) >= myLevel;
    });
  },

  // ── Private Helpers ───────────────────────────────────────
  _getPrice(tileIndex) {
    return (getPropByTile(tileIndex) || getTransByTile(tileIndex))?.price || 0;
  },

  _getName(tileIndex) {
    return getPropByTile(tileIndex)?.city
        || getTransByTile(tileIndex)?.name
        || `Tile ${tileIndex}`;
  },

  _countTransportOwned(playerIndex) {
    return TRANSPORT_DATA.filter(t => {
      const s = this.getState(t.tile);
      return s && s.ownerIndex === playerIndex;
    }).length;
  },
};
