// =============================================================
// eventBus.js — Monopoli Nusantara
// Observer pattern sederhana untuk komunikasi antar modul
// =============================================================
"use strict";

const EventBus = {
  _listeners: {},

  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
  },

  off(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
  },

  emit(event, ...args) {
    (this._listeners[event] || []).forEach(cb => {
      try { cb(...args); } catch(e) { console.error(`[EventBus] Error pada event "${event}":`, e); }
    });
  },

  clear() { this._listeners = {}; },
};
