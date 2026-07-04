// =============================================================
// uiManager.js — Monopoli Nusantara
// Mengelola semua DOM: papan, token, panel, popup, notifikasi
// =============================================================
"use strict";

const UIManager = {
  _notifTimer: null,

  // ── Bind Events ───────────────────────────────────────────
  bindEvents() {
    EventBus.on("phaseChanged",      p    => this._onPhaseChanged(p));
    EventBus.on("turnStart",         idx  => this._onTurnStart(idx));
    EventBus.on("logUpdated",        msg  => this._appendLog(msg));
    EventBus.on("notification",     (m,t) => this.showNotification(m, t));
    EventBus.on("tokenMoved",        d    => this.updateTokenPosition(d.playerIndex, d.tileIndex));
    EventBus.on("houseBuilt",        d    => this.refreshTileBuilding(d.tileIndex));
    EventBus.on("hotelBuilt",        d    => this.refreshTileBuilding(d.tileIndex));
    EventBus.on("buildingSold",      d    => this.refreshTileBuilding(d.tileIndex));
    EventBus.on("propertyBought",    d    => this.refreshTileOwner(d.tileIndex));
    EventBus.on("propertyMortgaged", d    => this.refreshTileOwner(d.tileIndex));
    EventBus.on("propertyRedeemed",  d    => this.refreshTileOwner(d.tileIndex));
    EventBus.on("playerBankrupt",    idx  => this.markBankrupt(idx));
  },

  // ── Build Board ───────────────────────────────────────────
  buildBoard() {
    const board = document.getElementById("board");
    if (!board) return;
    board.innerHTML = "";

    BOARD_TILES.forEach(tile => {
      const el = document.createElement("div");
      el.className   = "tile tile-" + tile.type;
      el.dataset.tile= tile.index;
      el.id          = "tile-" + tile.index;

      // Warna band grup
      if (tile.type === "property") {
        const propSO = PROPERTY_DATA.find(p => p.id === tile.propId);
        if (propSO) {
          const band = document.createElement("div");
          band.className = "tile-band";
          band.style.background = CONSTANTS.GROUP_COLOR[propSO.group] || "#ccc";
          el.appendChild(band);
        }
      }

      // Icon tile khusus
      if (tile.icon) {
        const ico = document.createElement("div");
        ico.className   = "tile-icon";
        ico.textContent = tile.icon;
        el.appendChild(ico);
      } else if (tile.type === "transport") {
        const td = TRANSPORT_DATA.find(t => t.id === tile.transId);
        if (td) {
          const ico = document.createElement("div");
          ico.className   = "tile-icon";
          ico.textContent = td.icon;
          el.appendChild(ico);
        }
      }

      // Nama tile
      const nm = document.createElement("div");
      nm.className   = "tile-name";
      nm.textContent = tile.name;
      el.appendChild(nm);

      // Harga (properti & transport)
      if (tile.type === "property") {
        const propSO = PROPERTY_DATA.find(p => p.id === tile.propId);
        if (propSO) {
          const pr = document.createElement("div");
          pr.className   = "tile-price";
          pr.textContent = formatRp(propSO.price);
          el.appendChild(pr);
        }
      } else if (tile.type === "transport") {
        const pr = document.createElement("div");
        pr.className   = "tile-price";
        pr.textContent = formatRp(2000000);
        el.appendChild(pr);
      }

      // Container owner dot + bangunan
      const meta = document.createElement("div");
      meta.className = "tile-meta";
      meta.id        = "tile-meta-" + tile.index;
      el.appendChild(meta);

      // Container token
      const tokens = document.createElement("div");
      tokens.className = "tile-tokens";
      tokens.id        = "tile-tokens-" + tile.index;
      el.appendChild(tokens);

      board.appendChild(el);
    });

    // Letakkan token di tile 0
    GameState.players.forEach((p, i) => this.updateTokenPosition(i, 0));
  },

  // ── Player Panels ─────────────────────────────────────────
  buildPlayerPanels() {
    const container = document.getElementById("player-panels");
    if (!container) return;
    container.innerHTML = "";

    GameState.players.forEach((p, i) => {
      const panel = document.createElement("div");
      panel.className = "player-panel";
      panel.id        = "panel-" + i;
      panel.style.borderColor = p.color;

      panel.innerHTML = `
        <div class="panel-header" style="background:${p.color}">
          <span class="panel-avatar">${p.avatar}</span>
          <span class="panel-name">${p.name}</span>
          <span class="panel-bot-tag">${p.isBot ? "BOT" : "MANUSIA"}</span>
        </div>
        <div class="panel-body">
          <div class="panel-balance" id="bal-${i}">${formatRp(p.balance)}</div>
          <div class="panel-jail-card" id="jcard-${i}" style="display:none">🔑 Kartu Bebas</div>
          <div class="panel-props" id="props-${i}"></div>
        </div>
      `;
      container.appendChild(panel);
    });
  },

  // ── Refresh All ───────────────────────────────────────────
  refreshAll() {
    GameState.players.forEach((p, i) => this.refreshPlayerPanel(i));
    this._refreshLeaderboard();
  },

  refreshPlayerPanel(idx) {
    const p    = GameState.players[idx];
    const bal  = document.getElementById("bal-" + idx);
    const jc   = document.getElementById("jcard-" + idx);
    const pp   = document.getElementById("props-" + idx);
    const panel= document.getElementById("panel-" + idx);

    if (bal)   bal.textContent = formatRp(p.balance);
    if (jc)    jc.style.display = p.heldCards.length > 0 ? "block" : "none";
    if (panel) panel.classList.toggle("bankrupt", p.isBankrupt);

    if (pp) {
      pp.innerHTML = "";
      p.ownedTiles.forEach(t => {
        const propSO  = getPropByTile(t);
        const transSO = getTransByTile(t);
        const name    = propSO?.city || transSO?.name || "";
        const color   = propSO ? (CONSTANTS.GROUP_COLOR[propSO.group] || "#ccc") : "#888";
        const state   = PropertyManager.getState(t);
        const dot     = document.createElement("span");
        dot.className = "prop-dot";
        dot.title     = name + (state?.isMortgaged ? " (Hipotek)" : "");
        dot.style.background = state?.isMortgaged ? "#aaa" : color;
        pp.appendChild(dot);
      });
    }
  },

  // ── Token Position ────────────────────────────────────────
  updateTokenPosition(playerIndex, tileIndex) {
    // Hapus token dari tile lama
    document.querySelectorAll(".token-" + playerIndex)
      .forEach(el => el.remove());

    const container = document.getElementById("tile-tokens-" + tileIndex);
    if (!container) return;

    const p = GameState.players[playerIndex];
    const tok = document.createElement("div");
    tok.className = `token token-${playerIndex}`;
    tok.textContent = p.avatar;
    tok.style.background = p.color;
    tok.title = p.name;
    container.appendChild(tok);
  },

  // ── Tile Visual Updates ───────────────────────────────────
  refreshTileBuilding(tileIndex) {
    const meta  = document.getElementById("tile-meta-" + tileIndex);
    if (!meta) return;
    const state = PropertyManager.getState(tileIndex);
    if (!state) return;

    // Update bangunan icon
    let buildings = "";
    if (state.hasHotel) {
      buildings = '<span class="hotel-icon" title="Hotel">🏨</span>';
    } else {
      buildings = '<span class="house-icons">'
        + '🏠'.repeat(state.houseCount)
        + '</span>';
    }

    // Update owner dot
    const ownerDot = state.ownerIndex >= 0
      ? `<span class="owner-dot" style="background:${CONSTANTS.PLAYER_COLORS[state.ownerIndex]}"></span>`
      : "";

    meta.innerHTML = ownerDot + buildings;
  },

  refreshTileOwner(tileIndex) {
    this.refreshTileBuilding(tileIndex);
  },

  // ── Dice UI ───────────────────────────────────────────────
  setDiceEnabled(enabled) {
    const btn = document.getElementById("btn-roll");
    if (btn) {
      btn.disabled = !enabled;
      btn.classList.toggle("active", enabled);
    }
  },

  startDiceAnim() {
    const d1 = document.getElementById("die1");
    const d2 = document.getElementById("die2");
    if (d1) d1.classList.add("rolling");
    if (d2) d2.classList.add("rolling");

    const faces = ["⚀","⚁","⚂","⚃","⚄","⚅"];
    const anim  = setInterval(() => {
      if (d1) d1.textContent = faces[Math.floor(Math.random()*6)];
      if (d2) d2.textContent = faces[Math.floor(Math.random()*6)];
    }, 80);

    setTimeout(() => {
      clearInterval(anim);
      if (d1) d1.classList.remove("rolling");
      if (d2) d2.classList.remove("rolling");
    }, CONSTANTS.DICE_ANIM_MS);
  },

  showDiceResult(d1, d2) {
    const faces = ["⚀","⚁","⚂","⚃","⚄","⚅"];
    const el1   = document.getElementById("die1");
    const el2   = document.getElementById("die2");
    if (el1) el1.textContent = faces[d1 - 1];
    if (el2) el2.textContent = faces[d2 - 1];
    const tot = document.getElementById("dice-total");
    if (tot) tot.textContent = `Total: ${d1 + d2}${d1===d2?" (Double!)":""}`;
  },

  // ── Popup Beli Properti ───────────────────────────────────
  showBuyPopup(playerIndex, tileIndex) {
    const propSO  = getPropByTile(tileIndex);
    const transSO = getTransByTile(tileIndex);
    const name    = propSO?.city || transSO?.name || "";
    const price   = propSO?.price || transSO?.price || 0;
    const player  = GameState.players[playerIndex];

    let rentTable = "";
    if (propSO) {
      const labels = ["Tanah","1 Rumah","2 Rumah","3 Rumah","4 Rumah","Hotel"];
      rentTable = propSO.rent.map((r, i) =>
        `<tr><td>${labels[i]}</td><td>${formatRp(r)}</td></tr>`
      ).join("");
      rentTable = `<table class="rent-table"><thead><tr><th>Level</th><th>Sewa</th></tr></thead><tbody>${rentTable}</tbody></table>`;
    } else if (transSO) {
      rentTable = CONSTANTS.TRANSPORT_RENT.slice(1).map((r, i) =>
        `<tr><td>${i+1} unit dimiliki</td><td>${formatRp(r)}</td></tr>`
      ).join("");
      rentTable = `<table class="rent-table"><thead><tr><th>Kepemilikan</th><th>Sewa</th></tr></thead><tbody>${rentTable}</tbody></table>`;
    }

    const canAfford = player.balance >= price;
    const colorBand = propSO
      ? `<div class="popup-band" style="background:${CONSTANTS.GROUP_COLOR[propSO.group]||"#ccc"}"></div>` : "";

    document.getElementById("popup-title").textContent  = name;
    document.getElementById("popup-body").innerHTML     = `
      ${colorBand}
      <div class="popup-price">Harga: <strong>${formatRp(price)}</strong></div>
      <div class="popup-balance">Saldo Anda: <strong>${formatRp(player.balance)}</strong></div>
      ${rentTable}
    `;
    document.getElementById("popup-buy-btn").disabled   = !canAfford;
    document.getElementById("popup-buy-btn").onclick    = () => {
      PropertyManager.buy(playerIndex, tileIndex);
      BotManager._tryBuild(playerIndex);
      this.hidePopup("property-popup");
      UIManager.refreshAll();
      TurnManager.endTurn();
    };
    document.getElementById("popup-pass-btn").onclick   = () => {
      this.hidePopup("property-popup");
      TurnManager.endTurn();
    };

    this.showPopup("property-popup");
  },

  // ── Popup Kartu ───────────────────────────────────────────
  showCardPopup(card, onOK) {
    document.getElementById("card-icon").textContent  = card.icon || "❓";
    document.getElementById("card-type").textContent  =
      (card === CHANCE_CARDS.find(c=>c===card) || CHANCE_CARDS.includes(card))
        ? "Kesempatan" : "Dana Nusantara";
    document.getElementById("card-title").textContent = card.name;
    document.getElementById("card-desc").textContent  = card.desc;

    document.getElementById("card-ok-btn").onclick = () => {
      this.hidePopup("card-popup");
      onOK && onOK();
    };

    this.showPopup("card-popup");
  },

  // ── Jail Options ──────────────────────────────────────────
  showJailOptions(playerIndex) {
    const player = GameState.players[playerIndex];
    const hasCard= player.heldCards.length > 0;
    const canPay = player.balance >= CONSTANTS.JAIL_FINE;

    document.getElementById("jail-btn-pay").disabled  = !canPay;
    document.getElementById("jail-btn-card").disabled = !hasCard;
    document.getElementById("jail-btn-roll").onclick  = () => {
      this.hidePopup("jail-popup");
      DiceManager.rollForJail(playerIndex);
    };
    document.getElementById("jail-btn-pay").onclick   = () => {
      this.hidePopup("jail-popup");
      GameManager.payJailFine(playerIndex);
    };
    document.getElementById("jail-btn-card").onclick  = () => {
      this.hidePopup("jail-popup");
      GameManager.useJailCard(playerIndex);
    };

    this.showPopup("jail-popup");
  },

  hideJailOptions() { this.hidePopup("jail-popup"); },

  // ── Bankrupt Notice ───────────────────────────────────────
  showBankruptNotice(playerName, onOK) {
    document.getElementById("bankrupt-name").textContent = playerName;
    document.getElementById("bankrupt-ok-btn").onclick = () => {
      this.hidePopup("bankrupt-popup");
      onOK && onOK();
    };
    this.showPopup("bankrupt-popup");
    setTimeout(() => {
      if (document.getElementById("bankrupt-popup").classList.contains("active"))
        document.getElementById("bankrupt-ok-btn").click();
    }, 3000);
  },

  markBankrupt(idx) {
    const panel = document.getElementById("panel-" + idx);
    if (panel) panel.classList.add("bankrupt");
  },

  // ── Winner Screen ─────────────────────────────────────────
  showWinnerScreen(winner) {
    const el = document.getElementById("winner-screen");
    if (!el) return;

    if (winner) {
      const wealth = PropertyManager.calculateWealth(winner.index);
      document.getElementById("winner-name").textContent   = winner.name;
      document.getElementById("winner-avatar").textContent = winner.avatar;
      document.getElementById("winner-wealth").textContent = formatRp(wealth);

      // Leaderboard akhir
      const sorted = [...GameState.players].sort((a, b) =>
        PropertyManager.calculateWealth(b.index) - PropertyManager.calculateWealth(a.index)
      );
      document.getElementById("winner-leaderboard").innerHTML =
        sorted.map((p, rank) => `
          <div class="lb-row ${p.isBankrupt?"bankrupt":""}">
            <span class="lb-rank">#${rank+1}</span>
            <span class="lb-avatar">${p.avatar}</span>
            <span class="lb-name">${p.name}</span>
            <span class="lb-wealth">${formatRp(PropertyManager.calculateWealth(p.index))}</span>
          </div>
        `).join("");
    } else {
      document.getElementById("winner-name").textContent = "Tidak Ada Pemenang";
    }

    el.classList.add("active");

    document.getElementById("btn-play-again").onclick = () => {
      el.classList.remove("active");
      SaveManager.deleteSave();
      document.getElementById("main-menu").classList.remove("hidden");
      document.getElementById("game-container").classList.add("hidden");
    };
  },

  // ── Notification ─────────────────────────────────────────
  showNotification(message, type = "info") {
    const el = document.getElementById("notification");
    if (!el) return;
    el.textContent  = message;
    el.className    = `notification show ${type}`;
    clearTimeout(this._notifTimer);
    this._notifTimer = setTimeout(() => {
      el.classList.remove("show");
    }, CONSTANTS.NOTIFICATION_MS);
  },

  // ── Log Panel ─────────────────────────────────────────────
  _appendLog(msg) {
    const el = document.getElementById("log-panel");
    if (!el) return;
    const row = document.createElement("div");
    row.className   = "log-entry";
    row.textContent = msg;
    el.prepend(row);
    // Batasi 40 entri
    while (el.children.length > 40) el.removeChild(el.lastChild);
  },

  // ── Leaderboard ───────────────────────────────────────────
  _refreshLeaderboard() {
    const el = document.getElementById("leaderboard");
    if (!el) return;
    const sorted = [...GameState.players].sort((a, b) =>
      PropertyManager.calculateWealth(b.index) - PropertyManager.calculateWealth(a.index)
    );
    el.innerHTML = "<div class='lb-title'>🏆 Kekayaan</div>" +
      sorted.map(p => `
        <div class="lb-row ${p.isBankrupt?"bankrupt":""}">
          <span>${p.avatar} ${p.name}</span>
          <span>${formatRp(PropertyManager.calculateWealth(p.index))}</span>
        </div>
      `).join("");
  },

  // ── Phase Change Handler ──────────────────────────────────
  _onPhaseChanged(phase) {
    const info = document.getElementById("phase-info");
    const labels = {
      IDLE: "Giliran Baru",
      ROLLING: "Melempar Dadu...",
      MOVING: "Token Bergerak...",
      RESOLVE_TILE: "Menyelesaikan Kotak...",
      BUYING: "Pembelian",
      PAYING_RENT: "Membayar Sewa...",
      DRAWING_CARD: "Mengambil Kartu...",
      IN_JAIL: "Di Penjara",
      GAME_OVER: "Permainan Selesai!",
    };
    if (info) info.textContent = labels[phase] || phase;
  },

  _onTurnStart(idx) {
    // Highlight panel pemain aktif
    document.querySelectorAll(".player-panel").forEach(el => el.classList.remove("active-turn"));
    const active = document.getElementById("panel-" + idx);
    if (active) active.classList.add("active-turn");

    const p = GameState.players[idx];
    const turnInfo = document.getElementById("turn-info");
    if (turnInfo) turnInfo.textContent = `Giliran: ${p.avatar} ${p.name}`;
  },

  // ── Generic Popup Helpers ─────────────────────────────────
  showPopup(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.add("active"); }
  },

  hidePopup(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove("active"); }
  },
};
