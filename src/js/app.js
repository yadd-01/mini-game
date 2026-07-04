// =============================================================
// app.js — Monopoli Nusantara
// Entry point: inisialisasi menu, setup pemain, mulai game
// =============================================================
"use strict";

// ── Konfigurasi Slot Pemain ────────────────────────────────
const slotConfig = [
  { name: "Pemain 1",       isBot: false, avatar: "🧑" },
  { name: "Bot Soekarno",   isBot: true,  avatar: "👑" },
  { name: "Bot Hatta",      isBot: true,  avatar: "🎓" },
  { name: "Bot Kartini",    isBot: true,  avatar: "🌺" },
];

const playerColors = CONSTANTS.PLAYER_COLORS;

// ── DOM Ready ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initMainMenu();
  initSettings();
  checkSaveFile();
});

// ── Main Menu Buttons ──────────────────────────────────────
function initMainMenu() {
  document.getElementById("btn-menu-play")
    .addEventListener("click", openPlayerSetup);

  document.getElementById("btn-menu-continue")
    .addEventListener("click", continueGame);

  document.getElementById("btn-menu-settings")
    .addEventListener("click", () => UIManager.showPopup("settings-popup"));

  document.getElementById("btn-menu-about")
    .addEventListener("click", () => UIManager.showPopup("about-popup"));

  document.getElementById("about-close-btn")
    .addEventListener("click", () => UIManager.hidePopup("about-popup"));

  document.getElementById("btn-main-menu-from-winner")
    .addEventListener("click", () => {
      document.getElementById("winner-screen").classList.remove("active");
      SaveManager.deleteSave();
      showMainMenu();
    });
}

function checkSaveFile() {
  const btn = document.getElementById("btn-menu-continue");
  if (btn) btn.disabled = !SaveManager.hasSave();
}

// ── Player Setup ───────────────────────────────────────────
function openPlayerSetup() {
  showScreen("player-setup");
  buildSetupGrid();

  document.getElementById("btn-setup-back").onclick = () => showMainMenu();
  document.getElementById("btn-setup-start").onclick = () => startNewGame();
}

function buildSetupGrid() {
  const grid = document.getElementById("setup-grid");
  grid.innerHTML = "";

  slotConfig.forEach((slot, i) => {
    const card = document.createElement("div");
    card.className = `slot-card ${slot.isBot ? "" : "human"}`;
    card.id = "slot-" + i;
    card.innerHTML = `
      <div class="slot-avatar" id="slot-avatar-${i}">${slot.avatar}</div>
      <label>Nama Pemain ${i+1}</label>
      <input type="text" id="slot-name-${i}"
        value="${slot.name}"
        placeholder="Nama..."
        ${slot.isBot ? "disabled" : ""}
      />
      <div class="slot-toggle">
        <button class="btn-human ${!slot.isBot?"active":""}"
          id="btn-human-${i}" onclick="setHuman(${i})">👤 Manusia</button>
        <button class="btn-bot ${slot.isBot?"active":""}"
          id="btn-bot-${i}" onclick="setBot(${i})">🤖 Bot</button>
      </div>
      <div style="font-size:.7rem;margin-top:6px;color:rgba(255,255,255,.5)">
        Warna: <span style="color:${playerColors[i]}">●</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

window.setHuman = function(i) {
  slotConfig[i].isBot   = false;
  slotConfig[i].avatar  = CONSTANTS.HUMAN_AVATARS[i];
  slotConfig[i].name    = `Pemain ${i+1}`;
  rebuildSlot(i);
};

window.setBot = function(i) {
  slotConfig[i].isBot   = true;
  slotConfig[i].avatar  = CONSTANTS.BOT_AVATARS[i];
  slotConfig[i].name    = CONSTANTS.BOT_NAMES[i];
  rebuildSlot(i);
};

function rebuildSlot(i) {
  buildSetupGrid();
}

// ── Start New Game ─────────────────────────────────────────
function startNewGame() {
  // Ambil nama terkini dari input
  slotConfig.forEach((slot, i) => {
    if (!slot.isBot) {
      const input = document.getElementById("slot-name-" + i);
      if (input && input.value.trim()) slot.name = input.value.trim();
    }
  });

  const playerConfigs = slotConfig.map((slot, i) => ({
    name:   slot.name,
    isBot:  slot.isBot,
    avatar: slot.avatar,
    color:  playerColors[i],
  }));

  showScreen("game-container");
  GameManager.startNewGame(playerConfigs);
  bindIngameButtons();
}

// ── Continue Game ──────────────────────────────────────────
function continueGame() {
  if (!SaveManager.hasSave()) return;
  const ok = SaveManager.load();
  if (!ok) {
    alert("File simpanan tidak valid. Mulai permainan baru.");
    return;
  }
  showScreen("game-container");
  UIManager.bindEvents();
  UIManager.buildBoard();
  UIManager.buildPlayerPanels();
  UIManager.refreshAll();
  // Restore token positions
  GameState.players.forEach((p, i) => UIManager.updateTokenPosition(i, p.position));
  bindIngameButtons();
  TurnManager.start();
}

// ── In-Game Buttons ────────────────────────────────────────
function bindIngameButtons() {
  document.getElementById("btn-save")
    .addEventListener("click", () => SaveManager.save());

  document.getElementById("btn-menu-return")
    .addEventListener("click", () => {
      if (confirm("Kembali ke menu? Progres otomatis disimpan.")) {
        SaveManager.save();
        showMainMenu();
      }
    });

  document.getElementById("btn-settings-ingame")
    .addEventListener("click", () => UIManager.showPopup("settings-popup"));

  document.getElementById("btn-build")
    .addEventListener("click", () => showAssetManager());

  document.getElementById("asset-close-btn")
    .addEventListener("click", () => UIManager.hidePopup("asset-popup"));
}

// ── Asset Manager (Bangun / Hipotek) ──────────────────────
function showAssetManager() {
  const pidx = GameState.currentPlayerIndex;
  const player = GameState.players[pidx];
  if (player.isBot || player.isBankrupt) return;

  const list = document.getElementById("asset-list");
  list.innerHTML = "";

  if (player.ownedTiles.length === 0) {
    list.innerHTML = '<p style="color:rgba(255,255,255,.5);text-align:center;padding:12px">Belum memiliki properti.</p>';
    UIManager.showPopup("asset-popup");
    return;
  }

  player.ownedTiles.forEach(tileIdx => {
    const state  = PropertyManager.getState(tileIdx);
    const propSO = getPropByTile(tileIdx);
    const transSO= getTransByTile(tileIdx);
    if (!state) return;

    const name  = propSO?.city || transSO?.name || `Tile ${tileIdx}`;
    const color = propSO ? (CONSTANTS.GROUP_COLOR[propSO.group] || "#ccc") : "#888";

    const row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid rgba(255,255,255,.1)";

    // Dot warna grup
    const dot = document.createElement("span");
    dot.style.cssText = `width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0`;
    row.appendChild(dot);

    // Nama + status
    const info = document.createElement("span");
    info.style.cssText = "flex:1;font-size:.85rem";
    const statusIcon = state.isMortgaged ? "🔒" : (state.hasHotel ? "🏨" : "🏠".repeat(state.houseCount) || "🏝️");
    info.textContent = `${name} ${statusIcon}`;
    row.appendChild(info);

    // Tombol aksi
    const btns = document.createElement("div");
    btns.style.cssText = "display:flex;gap:5px";

    if (propSO && !state.isMortgaged) {
      // Bangun Rumah
      if (PropertyManager.canBuildHouse(pidx, tileIdx)) {
        const b = makeAssetBtn("🏠 +Rumah", "var(--green)", () => {
          if (PropertyManager.buildHouse(pidx, tileIdx)) {
            UIManager.refreshTileBuilding(tileIdx);
            UIManager.refreshPlayerPanel(pidx);
            UIManager.showNotification(`Rumah dibangun di ${name}! 🏠`, "success");
            showAssetManager();
          }
        });
        btns.appendChild(b);
      }

      // Bangun Hotel
      if (PropertyManager.canBuildHotel(pidx, tileIdx)) {
        const b = makeAssetBtn("🏨 +Hotel", "var(--gold)", () => {
          if (PropertyManager.buildHotel(pidx, tileIdx)) {
            UIManager.refreshTileBuilding(tileIdx);
            UIManager.refreshPlayerPanel(pidx);
            UIManager.showNotification(`Hotel dibangun di ${name}! 🏨`, "success");
            showAssetManager();
          }
        });
        btns.appendChild(b);
      }

      // Jual Bangunan
      if (state.houseCount > 0 || state.hasHotel) {
        const b = makeAssetBtn("💰 Jual", "#e67e22", () => {
          if (PropertyManager.sellBuilding(pidx, tileIdx)) {
            UIManager.refreshTileBuilding(tileIdx);
            UIManager.refreshPlayerPanel(pidx);
            showAssetManager();
          }
        });
        btns.appendChild(b);
      }
    }

    // Hipotek / Tebus
    if (!state.isMortgaged && !state.hasHotel && state.houseCount === 0) {
      const b = makeAssetBtn("🔒 Hipotek", "#777", () => {
        if (PropertyManager.mortgage(pidx, tileIdx)) {
          UIManager.refreshTileOwner(tileIdx);
          UIManager.refreshPlayerPanel(pidx);
          showAssetManager();
        }
      });
      btns.appendChild(b);
    } else if (state.isMortgaged) {
      const propOrTrans = propSO || transSO;
      const redeemCost = Math.floor((propOrTrans?.price || 0) * CONSTANTS.REDEEM_RATIO);
      const b = makeAssetBtn(`🔓 Tebus (${formatRp(redeemCost)})`, "var(--blue)", () => {
        if (PropertyManager.redeemMortgage(pidx, tileIdx)) {
          UIManager.refreshTileOwner(tileIdx);
          UIManager.refreshPlayerPanel(pidx);
          showAssetManager();
        }
      });
      btns.appendChild(b);
    }

    row.appendChild(btns);
    list.appendChild(row);
  });

  UIManager.showPopup("asset-popup");
}

function makeAssetBtn(label, bg, onClick) {
  const b = document.createElement("button");
  b.style.cssText = `padding:4px 8px;border:none;border-radius:5px;
    background:${bg};color:#fff;font-size:.72rem;cursor:pointer;font-weight:700`;
  b.textContent = label;
  b.onclick = onClick;
  return b;
}

// ── Settings ───────────────────────────────────────────────
function initSettings() {
  const bgmSlider = document.getElementById("bgm-slider");
  const sfxSlider = document.getElementById("sfx-slider");
  const bgmVal    = document.getElementById("bgm-val");
  const sfxVal    = document.getElementById("sfx-val");

  // Load saved settings
  const saved = SaveManager.loadSettings();
  bgmSlider.value = Math.round(saved.bgmVolume * 100);
  sfxSlider.value = Math.round(saved.sfxVolume * 100);
  bgmVal.textContent = bgmSlider.value + "%";
  sfxVal.textContent = sfxSlider.value + "%";

  bgmSlider.oninput = () => { bgmVal.textContent = bgmSlider.value + "%"; };
  sfxSlider.oninput = () => { sfxVal.textContent = sfxSlider.value + "%"; };

  document.getElementById("settings-save-btn").onclick = () => {
    SaveManager.saveSettings({
      bgmVolume: bgmSlider.value / 100,
      sfxVolume: sfxSlider.value / 100,
    });
    UIManager.hidePopup("settings-popup");
    UIManager.showNotification("Pengaturan disimpan! ✅", "success");
  };

  document.getElementById("settings-close-btn")
    .onclick = () => UIManager.hidePopup("settings-popup");
}

// ── Board Tile Grid Layout (ditempatkan di board div) ──────
// Fungsi ini override UIManager.buildBoard untuk menempatkan
// tile pada posisi grid yang benar (tepi papan)
const _originalBuildBoard = UIManager.buildBoard.bind(UIManager);
UIManager.buildBoard = function() {
  _originalBuildBoard();
  applyGridPositions();
  addBoardCenter();
};

// Posisi grid 11×11 untuk 40 tile (tepi searah jarum jam)
// col/row berbasis 1-indexed, tile 0 = pojok kiri bawah
const GRID_POSITIONS = [
  // Sisi Bawah: tile 0–9 (kiri→kanan, row=11)
  {col:1,row:11},{col:2,row:11},{col:3,row:11},{col:4,row:11},{col:5,row:11},
  {col:6,row:11},{col:7,row:11},{col:8,row:11},{col:9,row:11},{col:10,row:11},
  // Sisi Kanan: tile 10–19 (bawah→atas, col=11)
  {col:11,row:11},{col:11,row:10},{col:11,row:9},{col:11,row:8},{col:11,row:7},
  {col:11,row:6}, {col:11,row:5},{col:11,row:4},{col:11,row:3},{col:11,row:2},
  // Sisi Atas: tile 20–29 (kanan→kiri, row=1)
  {col:11,row:1},{col:10,row:1},{col:9,row:1},{col:8,row:1},{col:7,row:1},
  {col:6,row:1}, {col:5,row:1},{col:4,row:1},{col:3,row:1},{col:2,row:1},
  // Sisi Kiri: tile 30–39 (atas→bawah, col=1)
  {col:1,row:1},{col:1,row:2},{col:1,row:3},{col:1,row:4},{col:1,row:5},
  {col:1,row:6},{col:1,row:7},{col:1,row:8},{col:1,row:9},{col:1,row:10},
];

function applyGridPositions() {
  GRID_POSITIONS.forEach((pos, tileIdx) => {
    const el = document.getElementById("tile-" + tileIdx);
    if (el) {
      el.style.gridColumn = pos.col;
      el.style.gridRow    = pos.row;
    }
  });
}

function addBoardCenter() {
  const board = document.getElementById("board");
  // Hapus center lama jika ada
  const old = board.querySelector(".board-center");
  if (old) old.remove();

  const center = document.createElement("div");
  center.className = "board-center";
  center.innerHTML = `
    <div class="board-center-map">🗺️</div>
    <div class="board-center-logo">MONOPOLI</div>
    <div class="board-center-sub">NUSANTARA</div>
    <div style="font-size:.7rem;color:#555;margin-top:6px">🇮🇩 Indonesia</div>
  `;
  board.appendChild(center);
}

// ── Screen Helpers ─────────────────────────────────────────
function showMainMenu() {
  document.getElementById("main-menu").classList.remove("hidden");
  document.getElementById("player-setup").classList.add("hidden");
  document.getElementById("game-container").classList.add("hidden");
  document.getElementById("winner-screen").classList.remove("active");
  checkSaveFile();
}

function showScreen(id) {
  document.getElementById("main-menu").classList.add("hidden");
  document.getElementById("player-setup").classList.add("hidden");
  document.getElementById("game-container").classList.add("hidden");
  document.getElementById(id).classList.remove("hidden");
}

// ── Keyboard Shortcuts ─────────────────────────────────────
document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    const btn = document.getElementById("btn-roll");
    if (btn && !btn.disabled) btn.click();
  }
  if (e.code === "Escape") {
    ["property-popup","card-popup","jail-popup",
     "bankrupt-popup","asset-popup","settings-popup","about-popup"]
      .forEach(id => UIManager.hidePopup(id));
  }
});
