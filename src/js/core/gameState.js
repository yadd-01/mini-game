// =============================================================
// gameState.js — Monopoli Nusantara
// State global permainan dan Player Data
// =============================================================
"use strict";

// ── State Machine Enum ────────────────────────────────────────
const GamePhase = {
  IDLE:         "IDLE",
  ROLLING:      "ROLLING",
  MOVING:       "MOVING",
  RESOLVE_TILE: "RESOLVE_TILE",
  BUYING:       "BUYING",
  PAYING_RENT:  "PAYING_RENT",
  DRAWING_CARD: "DRAWING_CARD",
  IN_JAIL:      "IN_JAIL",
  GAME_OVER:    "GAME_OVER",
};

// ── Buat Data Pemain ──────────────────────────────────────────
function createPlayer(index, name, isBot, avatarEmoji, colorHex) {
  return {
    index,
    name,
    isBot,
    avatar:    avatarEmoji,
    color:     colorHex,
    balance:   CONSTANTS.STARTING_MONEY,
    position:  0,
    isInJail:  false,
    jailTurns: 0,
    consecutiveDoubles: 0,
    isBankrupt: false,
    heldCards:  [],        // kartu bebas penjara
    ownedTiles: [],        // tile index properti/transport yang dimiliki
    // Statistik
    totalEarned: CONSTANTS.STARTING_MONEY,
    totalSpent:  0,
  };
}

// ── State Properti Per Tile ────────────────────────────────────
function createPropertyState(tileIndex) {
  return {
    tileIndex,
    ownerIndex:  -1,    // -1 = tidak dimiliki
    houseCount:  0,
    hasHotel:    false,
    isMortgaged: false,
  };
}

// ── State Global ──────────────────────────────────────────────
const GameState = {
  phase:              GamePhase.IDLE,
  players:            [],
  propertyStates:     {},  // key: tileIndex, value: propertyState object
  currentPlayerIndex: 0,
  turnNumber:         1,
  chanceOrder:        [],
  chanceIndex:        0,
  communityOrder:     [],
  communityIndex:     0,
  log:                [],  // riwayat aksi

  // ── Init ─────────────────────────────────────────────────────
  init(playerConfigs) {
    this.players = playerConfigs.map((cfg, i) =>
      createPlayer(i, cfg.name, cfg.isBot, cfg.avatar, cfg.color)
    );
    this.propertyStates = {};
    BOARD_TILES.forEach(tile => {
      if (tile.type === "property" || tile.type === "transport")
        this.propertyStates[tile.index] = createPropertyState(tile.index);
    });
    this.currentPlayerIndex = 0;
    this.turnNumber = 1;
    this.chanceOrder    = shuffleArray([...Array(CHANCE_CARDS.length).keys()]);
    this.communityOrder = shuffleArray([...Array(COMMUNITY_CARDS.length).keys()]);
    this.chanceIndex    = 0;
    this.communityIndex = 0;
    this.log = [];
    this.phase = GamePhase.IDLE;
  },

  setPhase(p) {
    this.phase = p;
    EventBus.emit("phaseChanged", p);
  },

  // ── Pemain Aktif ─────────────────────────────────────────────
  get currentPlayer() { return this.players[this.currentPlayerIndex]; },

  activePlayers() { return this.players.filter(p => !p.isBankrupt); },

  // ── Log ───────────────────────────────────────────────────────
  addLog(msg) {
    const entry = `[Giliran ${this.turnNumber}] ${msg}`;
    this.log.unshift(entry);
    if (this.log.length > 60) this.log.pop();
    EventBus.emit("logUpdated", entry);
  },

  // ── Ambil Kartu ──────────────────────────────────────────────
  drawChanceCard() {
    if (this.chanceIndex >= this.chanceOrder.length) {
      this.chanceOrder = shuffleArray([...Array(CHANCE_CARDS.length).keys()]);
      this.chanceIndex = 0;
    }
    return CHANCE_CARDS[this.chanceOrder[this.chanceIndex++]];
  },

  drawCommunityCard() {
    if (this.communityIndex >= this.communityOrder.length) {
      this.communityOrder = shuffleArray([...Array(COMMUNITY_CARDS.length).keys()]);
      this.communityIndex = 0;
    }
    return COMMUNITY_CARDS[this.communityOrder[this.communityIndex++]];
  },

  // ── Save / Load JSON ──────────────────────────────────────────
  toSaveData() {
    return JSON.stringify({
      version: "1.0",
      timestamp: new Date().toISOString(),
      phase: this.phase,
      currentPlayerIndex: this.currentPlayerIndex,
      turnNumber: this.turnNumber,
      players: this.players,
      propertyStates: this.propertyStates,
      chanceOrder: this.chanceOrder,
      chanceIndex: this.chanceIndex,
      communityOrder: this.communityOrder,
      communityIndex: this.communityIndex,
    }, null, 2);
  },

  loadFromSaveData(json) {
    try {
      const d = JSON.parse(json);
      if (d.version !== "1.0") throw new Error("Versi tidak cocok");
      this.phase              = d.phase;
      this.currentPlayerIndex = d.currentPlayerIndex;
      this.turnNumber         = d.turnNumber;
      this.players            = d.players;
      this.propertyStates     = d.propertyStates;
      this.chanceOrder        = d.chanceOrder;
      this.chanceIndex        = d.chanceIndex;
      this.communityOrder     = d.communityOrder;
      this.communityIndex     = d.communityIndex;
      return true;
    } catch(e) {
      console.error("[Save] Load gagal:", e);
      return false;
    }
  },
};

// ── Utility ───────────────────────────────────────────────────
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatRp(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}
