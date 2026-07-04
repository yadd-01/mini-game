// =============================================================
// saveManager.js — Monopoli Nusantara
// Simpan / muat permainan via localStorage browser
// =============================================================
"use strict";

const SaveManager = {
  KEY_GAME:     "monopoli_nusantara_save",
  KEY_SETTINGS: "monopoli_nusantara_settings",

  autoSave() {
    try {
      localStorage.setItem(this.KEY_GAME, GameState.toSaveData());
    } catch(e) {
      console.warn("[Save] AutoSave gagal:", e);
    }
  },

  save() {
    try {
      localStorage.setItem(this.KEY_GAME, GameState.toSaveData());
      EventBus.emit("notification", "💾 Permainan tersimpan!", "success");
    } catch(e) {
      EventBus.emit("notification", "❌ Gagal menyimpan permainan.", "error");
    }
  },

  load() {
    try {
      const json = localStorage.getItem(this.KEY_GAME);
      if (!json) return false;
      return GameState.loadFromSaveData(json);
    } catch(e) {
      console.error("[Save] Load gagal:", e);
      return false;
    }
  },

  hasSave() {
    return !!localStorage.getItem(this.KEY_GAME);
  },

  deleteSave() {
    localStorage.removeItem(this.KEY_GAME);
  },

  saveSettings(settings) {
    localStorage.setItem(this.KEY_SETTINGS, JSON.stringify(settings));
  },

  loadSettings() {
    try {
      const s = localStorage.getItem(this.KEY_SETTINGS);
      return s ? JSON.parse(s) : { bgmVolume: 0.7, sfxVolume: 0.8 };
    } catch { return { bgmVolume: 0.7, sfxVolume: 0.8 }; }
  },
};
