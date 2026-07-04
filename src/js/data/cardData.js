// =============================================================
// cardData.js — Monopoli Nusantara
// 22 Kartu Kesempatan + 22 Kartu Dana Nusantara
// effectType: receiveBank | payBank | receiveAll | payAll |
//             moveToTile | moveToStart | moveToNearest |
//             moveBack | goToJail | getOutOfJail | payPerBuilding
// =============================================================
"use strict";

const CHANCE_CARDS = [
  { id:0,  name:"Terpilih Ketua RT",       icon:"🏘️",  effectType:"receiveAll",      value:500000,  desc:"Kamu terpilih Ketua RT! Terima Rp 500.000 dari setiap pemain." },
  { id:1,  name:"Wisata ke Bali",           icon:"🌴",  effectType:"moveToTile",      value:26,      desc:"Dapat tiket wisata gratis! Maju ke Denpasar, Bali." },
  { id:2,  name:"Tiket Kereta Gratis",      icon:"🚂",  effectType:"moveToTile",      value:19,      desc:"Dapat tiket gratis! Maju ke Stasiun Gambir." },
  { id:3,  name:"Warisan Kakek",            icon:"🏠",  effectType:"receiveBank",     value:2500000, desc:"Kakekmu meninggalkan warisan. Terima Rp 2.500.000." },
  { id:4,  name:"Bayar Pajak Daerah",       icon:"📋",  effectType:"payBank",         value:1500000, desc:"Pajak daerah jatuh tempo. Bayar Rp 1.500.000." },
  { id:5,  name:"Lolos Tilang Polisi",      icon:"👮",  effectType:"moveToStart",     value:0,       desc:"Kamu lolos tilang! Maju ke Start, terima Rp 2.000.000." },
  { id:6,  name:"Tertangkap Pungli",        icon:"🚔",  effectType:"goToJail",        value:0,       desc:"Kamu ketahuan pungli! Langsung masuk Penjara." },
  { id:7,  name:"Menang Undian Nasional",   icon:"🎰",  effectType:"receiveBank",     value:1000000, desc:"Selamat! Kamu menang undian. Terima Rp 1.000.000." },
  { id:8,  name:"Renovasi Kantor",          icon:"🏗️",  effectType:"payPerBuilding",  value:0, perHouse:500000, perHotel:1500000, desc:"Wajib renovasi. Bayar Rp 500rb/rumah dan Rp 1,5jt/hotel." },
  { id:9,  name:"Kartu Pembebasan",         icon:"🔑",  effectType:"getOutOfJail",    value:0,       desc:"Simpan kartu ini. Gunakan sekali untuk keluar penjara gratis." },
  { id:10, name:"Ekspedisi Nusantara",      icon:"🗺️",  effectType:"moveBack",        value:3,       desc:"Rutenya salah! Mundur 3 kotak." },
  { id:11, name:"Promosi Jabatan",          icon:"📈",  effectType:"receiveBank",     value:1500000, desc:"Selamat dipromosikan! Terima Rp 1.500.000." },
  { id:12, name:"Kena PHK Tiba-Tiba",       icon:"📉",  effectType:"payBank",         value:800000,  desc:"Tidak terduga di-PHK. Bayar pesangon Rp 800.000." },
  { id:13, name:"Festival Budaya",          icon:"🎭",  effectType:"receiveAll",      value:300000,  desc:"Kamu bintang festival! Terima Rp 300.000 dari tiap pemain." },
  { id:14, name:"Terbukti Korupsi",         icon:"⚖️",  effectType:"goToJail",        value:1000000, desc:"Kamu terbukti korupsi! Masuk Penjara + denda Rp 1.000.000." },
  { id:15, name:"Naik Ojek Online",         icon:"🛵",  effectType:"moveToNearest",   value:0,       desc:"Ojekmu cepat! Maju ke properti tak bertuan terdekat." },
  { id:16, name:"Panen Raya",               icon:"🌾",  effectType:"receiveBank",     value:750000,  desc:"Panen melimpah! Terima Rp 750.000." },
  { id:17, name:"Banjir Rob",               icon:"🌊",  effectType:"payBank",         value:1000000, desc:"Banjir rob datang. Bayar perbaikan Rp 1.000.000." },
  { id:18, name:"Terpilih Duta Wisata",     icon:"🏆",  effectType:"receiveBank",     value:2000000, desc:"Selamat! Kamu Duta Wisata Indonesia. Terima Rp 2.000.000." },
  { id:19, name:"Salah Transfer",           icon:"📲",  effectType:"payAll",          value:200000,  desc:"Salah transfer! Bayar Rp 200.000 ke setiap pemain." },
  { id:20, name:"Lolos Seleksi CPNS",       icon:"📜",  effectType:"receiveBank",     value:3000000, desc:"Selamat lulus CPNS! Terima Rp 3.000.000." },
  { id:21, name:"Ditilang di Jalan Tol",    icon:"🚗",  effectType:"payBank",         value:500000,  desc:"Kamu ditilang di tol. Bayar denda Rp 500.000." },
];

const COMMUNITY_CARDS = [
  { id:0,  name:"Hadiah Ulang Tahun",       icon:"🎂",  effectType:"receiveAll",      value:500000,  desc:"Selamat ulang tahun! Setiap pemain memberi Rp 500.000." },
  { id:1,  name:"Iuran Arisan Kampung",     icon:"👥",  effectType:"payAll",          value:500000,  desc:"Giliran kamu bayar arisan! Bayar Rp 500.000 ke tiap pemain." },
  { id:2,  name:"Dana Bantuan Sosial",      icon:"🤝",  effectType:"receiveBank",     value:1000000, desc:"Bantuan sosial pemerintah cair! Terima Rp 1.000.000." },
  { id:3,  name:"Bayar Iuran BPJS",         icon:"🏥",  effectType:"payBank",         value:750000,  desc:"Iuran BPJS jatuh tempo. Bayar Rp 750.000." },
  { id:4,  name:"Gotong Royong Sukses",     icon:"💪",  effectType:"receiveAll",      value:400000,  desc:"Gotong royongmu berhasil! Terima Rp 400.000 dari tiap pemain." },
  { id:5,  name:"Jual Kerajinan Tangan",    icon:"🏺",  effectType:"receiveBank",     value:1200000, desc:"Kerajinanmu laris! Terima Rp 1.200.000." },
  { id:6,  name:"Kena Denda Adat",          icon:"🪘",  effectType:"payBank",         value:900000,  desc:"Melanggar aturan adat. Bayar denda Rp 900.000." },
  { id:7,  name:"Bebas Penjara",            icon:"🔓",  effectType:"getOutOfJail",    value:0,       desc:"Simpan kartu ini. Gunakan sekali untuk keluar penjara gratis." },
  { id:8,  name:"Salah Rekening",           icon:"🏦",  effectType:"payBank",         value:300000,  desc:"Transfer ke rekening salah. Bayar klarifikasi Rp 300.000." },
  { id:9,  name:"Subsidi Pemda",            icon:"🏛️",  effectType:"receiveBank",     value:1500000, desc:"Subsidi pemerintah daerah cair! Terima Rp 1.500.000." },
  { id:10, name:"Bencana Alam",             icon:"🌋",  effectType:"payBank",         value:1000000, desc:"Bencana alam melanda. Bayar rekonstruksi Rp 1.000.000." },
  { id:11, name:"Tagihan Listrik PLN",      icon:"⚡",  effectType:"payBank",         value:600000,  desc:"Tagihan PLN datang. Bayar Rp 600.000." },
  { id:12, name:"Royalti Batik Ekspor",     icon:"🎨",  effectType:"receiveBank",     value:2000000, desc:"Batikmu diekspor! Terima royalti Rp 2.000.000." },
  { id:13, name:"Retribusi Pasar",          icon:"🛒",  effectType:"payBank",         value:400000,  desc:"Retribusi pasar harus dibayar. Bayar Rp 400.000." },
  { id:14, name:"Bonus Akhir Tahun",        icon:"🎁",  effectType:"receiveBank",     value:1000000, desc:"Bonus akhir tahun! Terima Rp 1.000.000." },
  { id:15, name:"Perbaikan Jembatan Desa",  icon:"🌉",  effectType:"payBank",         value:500000,  desc:"Urunan perbaikan jembatan. Bayar Rp 500.000." },
  { id:16, name:"Bantuan Sembako",          icon:"🛍️",  effectType:"receiveBank",     value:700000,  desc:"Bantuan sembako dijual. Terima Rp 700.000." },
  { id:17, name:"Juara Lomba 17 Agustus",   icon:"🇮🇩",  effectType:"receiveBank",     value:800000,  desc:"Kamu juara lomba 17-an! Terima hadiah Rp 800.000." },
  { id:18, name:"Kena Penipuan Online",     icon:"⚠️",  effectType:"payBank",         value:1200000, desc:"Tertipu penipuan online. Rugi Rp 1.200.000." },
  { id:19, name:"Dana Desa Cair",           icon:"🏡",  effectType:"receiveBank",     value:2500000, desc:"Dana desa tahun ini cair! Terima Rp 2.500.000." },
  { id:20, name:"Pajak Kendaraan",          icon:"🚙",  effectType:"payBank",         value:550000,  desc:"Pajak kendaraan jatuh tempo. Bayar Rp 550.000." },
  { id:21, name:"Menang Kuis Televisi",     icon:"📺",  effectType:"receiveBank",     value:1800000, desc:"Menang kuis TV! Terima hadiah Rp 1.800.000." },
];
