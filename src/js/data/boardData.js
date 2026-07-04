// =============================================================
// boardData.js — Monopoli Nusantara
// Data lengkap 40 tile papan, 23 properti, 5 transportasi
// =============================================================
"use strict";

// ── 40 Tile Layout ────────────────────────────────────────────
const BOARD_TILES = [
  { index: 0,  type: "start",       name: "START",                          icon: "🏁" },
  { index: 1,  type: "property",    name: "Sabang, Aceh",                   propId: 0  },
  { index: 2,  type: "community",   name: "Dana Nusantara",                 icon: "📦" },
  { index: 3,  type: "property",    name: "Banda Aceh, Aceh",               propId: 1  },
  { index: 4,  type: "tax",         name: "Pajak Penghasilan",              taxType: "income", icon: "💰" },
  { index: 5,  type: "transport",   name: "Bandara Iskandar Muda",          transId: 0 },
  { index: 6,  type: "property",    name: "Medan, Sumatera Utara",          propId: 2  },
  { index: 7,  type: "chance",      name: "Kesempatan",                     icon: "❓" },
  { index: 8,  type: "property",    name: "Pekanbaru, Riau",                propId: 3  },
  { index: 9,  type: "property",    name: "Padang, Sumatera Barat",         propId: 4  },
  { index: 10, type: "jail",        name: "Penjara",                        icon: "⛓️" },
  { index: 11, type: "property",    name: "Palembang, Sumatera Selatan",    propId: 5  },
  { index: 12, type: "property",    name: "Jambi, Jambi",                   propId: 6  },
  { index: 13, type: "transport",   name: "Pelabuhan Tanjung Priok",        transId: 1 },
  { index: 14, type: "property",    name: "Bandar Lampung, Lampung",        propId: 7  },
  { index: 15, type: "property",    name: "Serang, Banten",                 propId: 8  },
  { index: 16, type: "community",   name: "Dana Nusantara",                 icon: "📦" },
  { index: 17, type: "property",    name: "Bandung, Jawa Barat",            propId: 9  },
  { index: 18, type: "property",    name: "Semarang, Jawa Tengah",          propId: 10 },
  { index: 19, type: "transport",   name: "Stasiun Gambir",                 transId: 2 },
  { index: 20, type: "freeparking", name: "Parkir Bebas",                   icon: "🅿️" },
  { index: 21, type: "property",    name: "Yogyakarta, DIY",                propId: 11 },
  { index: 22, type: "chance",      name: "Kesempatan",                     icon: "❓" },
  { index: 23, type: "property",    name: "Surabaya, Jawa Timur",           propId: 12 },
  { index: 24, type: "property",    name: "Malang, Jawa Timur",             propId: 13 },
  { index: 25, type: "transport",   name: "Bandara Ngurah Rai",             transId: 3 },
  { index: 26, type: "property",    name: "Denpasar, Bali",                 propId: 14 },
  { index: 27, type: "property",    name: "Mataram, NTB",                   propId: 15 },
  { index: 28, type: "tax",         name: "Pajak Kemewahan",                taxType: "luxury", icon: "💎" },
  { index: 29, type: "property",    name: "Kupang, NTT",                    propId: 16 },
  { index: 30, type: "gotojail",    name: "Ke Penjara",                     icon: "🚔" },
  { index: 31, type: "property",    name: "Pontianak, Kalimantan Barat",    propId: 17 },
  { index: 32, type: "property",    name: "Banjarmasin, Kalimantan Selatan",propId: 18 },
  { index: 33, type: "community",   name: "Dana Nusantara",                 icon: "📦" },
  { index: 34, type: "property",    name: "Samarinda, Kalimantan Timur",    propId: 19 },
  { index: 35, type: "transport",   name: "Pelabuhan Makassar",             transId: 4 },
  { index: 36, type: "chance",      name: "Kesempatan",                     icon: "❓" },
  { index: 37, type: "property",    name: "Makassar, Sulawesi Selatan",     propId: 20 },
  { index: 38, type: "property",    name: "Manado, Sulawesi Utara",         propId: 21 },
  { index: 39, type: "property",    name: "Jayapura, Papua",                propId: 22 },
];

// ── Data Properti (rent[0]=dasar, [1–4]=rumah, [5]=hotel) ─────
const PROPERTY_DATA = [
  // id  tile  city               group       price      houseCost  rent[6]
  { id:0,  tile:1,  city:"Sabang",           group:"Brown",    price:600000,  houseCost:500000,  hotelCost:500000,  rent:[60000,  300000,  900000, 2700000, 4000000, 5500000] },
  { id:1,  tile:3,  city:"Banda Aceh",       group:"Brown",    price:600000,  houseCost:500000,  hotelCost:500000,  rent:[60000,  300000,  900000, 2700000, 4000000, 5500000] },
  { id:2,  tile:6,  city:"Medan",            group:"LightBlue",price:1000000, houseCost:750000,  hotelCost:750000,  rent:[100000, 500000, 1500000, 4500000, 6250000, 7500000] },
  { id:3,  tile:8,  city:"Pekanbaru",        group:"LightBlue",price:1000000, houseCost:750000,  hotelCost:750000,  rent:[100000, 500000, 1500000, 4500000, 6250000, 7500000] },
  { id:4,  tile:9,  city:"Padang",           group:"LightBlue",price:1200000, houseCost:750000,  hotelCost:750000,  rent:[120000, 600000, 1800000, 5000000, 7000000, 9000000] },
  { id:5,  tile:11, city:"Palembang",        group:"Pink",     price:1400000, houseCost:1000000, hotelCost:1000000, rent:[140000, 700000, 2000000, 6000000, 8750000,10500000] },
  { id:6,  tile:12, city:"Jambi",            group:"Pink",     price:1400000, houseCost:1000000, hotelCost:1000000, rent:[140000, 700000, 2000000, 6000000, 8750000,10500000] },
  { id:7,  tile:14, city:"Bandar Lampung",   group:"Pink",     price:1600000, houseCost:1000000, hotelCost:1000000, rent:[160000, 800000, 2200000, 6500000, 9000000,11000000] },
  { id:8,  tile:15, city:"Serang",           group:"Orange",   price:1800000, houseCost:1250000, hotelCost:1250000, rent:[180000, 900000, 2750000, 8000000,11000000,13000000] },
  { id:9,  tile:17, city:"Bandung",          group:"Orange",   price:1800000, houseCost:1250000, hotelCost:1250000, rent:[180000, 900000, 2750000, 8000000,11000000,13000000] },
  { id:10, tile:18, city:"Semarang",         group:"Orange",   price:2000000, houseCost:1250000, hotelCost:1250000, rent:[200000,1000000, 3000000, 9000000,12000000,14000000] },
  { id:11, tile:21, city:"Yogyakarta",       group:"Red",      price:2200000, houseCost:1500000, hotelCost:1500000, rent:[220000,1100000, 3300000, 9900000,13200000,16500000] },
  { id:12, tile:23, city:"Surabaya",         group:"Red",      price:2200000, houseCost:1500000, hotelCost:1500000, rent:[220000,1100000, 3300000, 9900000,13200000,16500000] },
  { id:13, tile:24, city:"Malang",           group:"Red",      price:2400000, houseCost:1500000, hotelCost:1500000, rent:[240000,1200000, 3600000,10800000,14400000,18000000] },
  { id:14, tile:26, city:"Denpasar",         group:"Yellow",   price:2600000, houseCost:1750000, hotelCost:1750000, rent:[260000,1300000, 3900000,11700000,15600000,19500000] },
  { id:15, tile:27, city:"Mataram",          group:"Yellow",   price:2600000, houseCost:1750000, hotelCost:1750000, rent:[260000,1300000, 3900000,11700000,15600000,19500000] },
  { id:16, tile:29, city:"Kupang",           group:"Yellow",   price:2800000, houseCost:1750000, hotelCost:1750000, rent:[280000,1400000, 4200000,12600000,16800000,21000000] },
  { id:17, tile:31, city:"Pontianak",        group:"Green",    price:3000000, houseCost:2000000, hotelCost:2000000, rent:[300000,1500000, 4500000,13500000,18000000,22500000] },
  { id:18, tile:32, city:"Banjarmasin",      group:"Green",    price:3000000, houseCost:2000000, hotelCost:2000000, rent:[300000,1500000, 4500000,13500000,18000000,22500000] },
  { id:19, tile:34, city:"Samarinda",        group:"Green",    price:3200000, houseCost:2000000, hotelCost:2000000, rent:[320000,1600000, 4800000,14400000,19200000,24000000] },
  { id:20, tile:37, city:"Makassar",         group:"DarkBlue", price:3500000, houseCost:2500000, hotelCost:2500000, rent:[350000,1750000, 5250000,15750000,21000000,26250000] },
  { id:21, tile:38, city:"Manado",           group:"DarkBlue", price:3500000, houseCost:2500000, hotelCost:2500000, rent:[350000,1750000, 5250000,15750000,21000000,26250000] },
  { id:22, tile:39, city:"Jayapura",         group:"DarkBlue", price:4000000, houseCost:2500000, hotelCost:2500000, rent:[400000,2000000, 6000000,18000000,24000000,30000000] },
];

// ── Data Transportasi ─────────────────────────────────────────
const TRANSPORT_DATA = [
  { id:0, tile:5,  name:"Bandara Sultan Iskandar Muda", icon:"✈️", price:2000000 },
  { id:1, tile:13, name:"Pelabuhan Tanjung Priok",      icon:"🚢", price:2000000 },
  { id:2, tile:19, name:"Stasiun Gambir",               icon:"🚂", price:2000000 },
  { id:3, tile:25, name:"Bandara Ngurah Rai",           icon:"✈️", price:2000000 },
  { id:4, tile:35, name:"Pelabuhan Makassar",           icon:"🚢", price:2000000 },
];

// ── Grup Properti (grup → array tile index) ───────────────────
const GROUP_TILES = {
  Brown:     [1, 3],
  LightBlue: [6, 8, 9],
  Pink:      [11, 12, 14],
  Orange:    [15, 17, 18],
  Red:       [21, 23, 24],
  Yellow:    [26, 27, 29],
  Green:     [31, 32, 34],
  DarkBlue:  [37, 38, 39],
};

// Helper lookup by tile index
function getPropByTile(tileIdx)  { return PROPERTY_DATA.find(p => p.tile === tileIdx) || null; }
function getTransByTile(tileIdx) { return TRANSPORT_DATA.find(t => t.tile === tileIdx) || null; }
function getTileData(tileIdx)    { return BOARD_TILES[tileIdx] || null; }
