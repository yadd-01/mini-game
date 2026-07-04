// =============================================================
// constants.js — Monopoli Nusantara
// Semua konstanta numerik dan konfigurasi permainan
// =============================================================
"use strict";

const CONSTANTS = {
  // ── Papan ─────────────────────────────────────────────────
  TOTAL_TILES:        40,
  TILE_START:          0,
  TILE_JAIL:          10,
  TILE_FREE_PARKING:  20,
  TILE_GO_TO_JAIL:    30,

  // ── Uang ──────────────────────────────────────────────────
  STARTING_MONEY:      15_000_000,
  PASS_START_BONUS:     2_000_000,
  JAIL_FINE:              500_000,
  INCOME_TAX:           2_000_000,
  LUXURY_TAX:             750_000,

  // ── Dadu ──────────────────────────────────────────────────
  DICE_MIN: 1,
  DICE_MAX: 6,
  MAX_CONSECUTIVE_DOUBLES: 3,
  MAX_JAIL_TURNS:           3,

  // ── Bangunan ──────────────────────────────────────────────
  MAX_HOUSES: 4,
  MAX_HOTELS: 1,
  SELL_RATIO:     0.5,
  MORTGAGE_RATIO: 0.5,
  REDEEM_RATIO:   0.55,

  // ── AI Bot ────────────────────────────────────────────────
  BOT_BUY_RATIO:    0.5,
  BOT_MIN_RESERVE:  2_000_000,
  BOT_BUILD_RESERVE:1_500_000,
  BOT_THINK_MS:     1200,  // ms jeda "berpikir"

  // ── Transportasi Sewa (indeks = jumlah yang dimiliki) ─────
  TRANSPORT_RENT: [0, 250_000, 500_000, 1_000_000, 2_000_000, 2_500_000],

  // ── Animasi ───────────────────────────────────────────────
  TOKEN_STEP_MS:   200,   // ms per tile
  DICE_ANIM_MS:   1200,
  CARD_FLIP_MS:    400,
  BUILD_ANIM_MS:   500,
  POPUP_FADE_MS:   300,
  NOTIFICATION_MS: 2500,

  // ── Warna Grup Properti ───────────────────────────────────
  GROUP_COLOR: {
    Brown:    "#8B4513",
    LightBlue:"#87CEEB",
    Pink:     "#FF69B4",
    Orange:   "#FF8C00",
    Red:      "#DC143C",
    Yellow:   "#FFD700",
    Green:    "#228B22",
    DarkBlue: "#00008B"
  },

  // ── Warna Token Pemain ────────────────────────────────────
  PLAYER_COLORS: ["#E74C3C", "#3498DB", "#2ECC71", "#F39C12"],

  // ── Nama Bot Default ─────────────────────────────────────
  BOT_NAMES: ["Bot Soekarno", "Bot Hatta", "Bot Kartini", "Bot Diponegoro"],
  BOT_AVATARS: ["👑", "🎓", "🌺", "⚔️"],
  HUMAN_AVATARS: ["🧑", "👩", "🧔", "👧"],
};

Object.freeze(CONSTANTS);
