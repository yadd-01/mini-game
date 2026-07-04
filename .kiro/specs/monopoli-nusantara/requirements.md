# Requirements Document

## Introduction

Monopoli Nusantara adalah game board digital berbasis Unity 6 yang mengangkat tema budaya dan kekayaan geografis Indonesia. Game ini merupakan adaptasi digital dari permainan Monopoli klasik dengan elemen-elemen Indonesia seperti kota dan provinsi sebagai properti, kartu Kesempatan dan Dana Nusantara yang bernuansa lokal, serta transportasi nasional berupa Bandara, Pelabuhan, dan Stasiun. Game berjalan di platform PC Windows dengan resolusi 1920x1080, tampilan top-down 2D, menggunakan art style Modern Flat UI bertema Indonesia, mendukung 1–4 pemain offline, di mana slot yang kosong diisi oleh AI Bot berbasis rule-based decision tree. Target pemain mencakup semua umur. Tujuan permainan adalah menjadi pemain dengan kekayaan terbesar atau menjadi pemain terakhir yang tidak bangkrut.

Game ini dibangun menggunakan Unity 6 dengan bahasa pemrograman C#, mengimplementasikan pola arsitektur Manager System, ScriptableObject untuk data, Event System untuk komunikasi antar komponen, State Machine untuk alur giliran, dan JSON Save System untuk penyimpanan progres.

---

## Glossary

- **Game**: Monopoli Nusantara secara keseluruhan.
- **GameManager**: Komponen utama yang mengatur state global dan alur permainan.
- **BoardManager**: Komponen yang mengelola papan permainan, tile, dan posisi token.
- **TurnManager**: Komponen yang mengelola urutan giliran antar pemain.
- **DiceManager**: Komponen yang mengelola logika lemparan dadu.
- **PropertyManager**: Komponen yang mengelola kepemilikan, sewa, dan upgrade properti.
- **CardManager**: Komponen yang mengelola dek, pengambilan, dan efek kartu.
- **BotManager**: Komponen yang mengelola logika keputusan AI Bot.
- **UIManager**: Komponen yang mengelola semua elemen antarmuka pengguna.
- **AudioManager**: Komponen yang mengelola pemutaran audio (BGM dan SFX).
- **AnimationManager**: Komponen yang mengelola animasi permainan.
- **SaveManager**: Komponen yang mengelola penyimpanan dan pemuatan data permainan dalam format JSON.
- **SceneLoader**: Komponen yang mengelola transisi antar scene Unity.
- **EventSystem**: Sistem event berbasis C# Action/delegate untuk komunikasi antar Manager.
- **State_Machine**: Mekanisme pengatur alur giliran per kondisi (Rolling, Moving, Buying, PayingRent, DrawingCard, InJail, Bankrupt, GameOver).
- **Pemain**: Peserta manusia yang bermain dalam sesi permainan.
- **AI_Bot**: Pemain virtual berbasis rule-based decision tree yang mengisi slot kosong.
- **Tile**: Satu kotak di papan permainan (total 40 tile, diindeks 0–39).
- **Properti**: Tile yang dapat dibeli berupa kota atau provinsi Indonesia, dikelompokkan dalam grup warna.
- **Grup_Warna**: Kumpulan Properti dalam satu kawasan geografis yang berbagi warna unik di papan.
- **Transportasi**: Tile khusus berupa Bandara, Pelabuhan, atau Stasiun yang dapat dibeli.
- **Rumah**: Bangunan level 1–4 yang dapat dibangun pada Properti setelah memiliki seluruh Grup_Warna.
- **Hotel**: Bangunan level tertinggi yang menggantikan empat Rumah pada Properti.
- **Sewa**: Pembayaran yang dilakukan Pemain atau AI_Bot saat berhenti di Properti milik pihak lain.
- **Kartu_Kesempatan**: Kartu acak dengan efek positif atau negatif bernuansa petualangan Indonesia.
- **Dana_Nusantara**: Kartu acak dengan efek finansial atau mobilitas bernuansa komunitas Indonesia.
- **Penjara**: Tile sudut khusus (indeks 10) sebagai lokasi hukuman; Tile indeks 30 mengirim pemain ke sini.
- **Parkir_Bebas**: Tile sudut khusus (indeks 20) tanpa efek, hanya istirahat.
- **Start**: Tile sudut awal permainan (indeks 0) yang memberikan Rp 2.000.000 saat dilewati atau disinggahi.
- **Ke_Penjara**: Tile sudut khusus (indeks 30) yang langsung mengirim pemain ke Penjara.
- **Uang_Awal**: Saldo awal setiap Pemain dan AI_Bot saat permainan dimulai sebesar Rp 15.000.000.
- **Token**: Representasi visual posisi Pemain atau AI_Bot di papan berupa karakter bertema budaya Indonesia.
- **ScriptableObject**: Aset data Unity yang menyimpan konfigurasi PropertyData, CardData, TileData, AudioData, ColorData.
- **Leaderboard**: Panel HUD yang menampilkan peringkat kekayaan seluruh peserta aktif secara real-time.
- **Bangkrut**: Kondisi di mana saldo Pemain atau AI_Bot jatuh di bawah nol dan tidak ada aset yang dapat dilikuidasi.
- **Kekayaan_Total**: Jumlah saldo tunai ditambah nilai semua aset (Properti + Transportasi + Rumah + Hotel) yang dimiliki.
- **Double**: Hasil lemparan dua dadu yang menunjukkan angka identik, memberikan giliran tambahan.
- **Monopoli_Grup**: Kondisi di mana satu pemain memiliki seluruh Properti dalam satu Grup_Warna.

---

## Requirements

### Requirement 1: Inisialisasi dan Alur Scene

**User Story:** Sebagai pemain, saya ingin game memiliki alur scene yang jelas dari Splash hingga Gameplay, sehingga saya dapat memulai permainan dengan mudah dan intuitif.

#### Acceptance Criteria

1. THE SceneLoader SHALL menampilkan Splash Screen selama 3 detik sebelum berpindah ke scene Main Menu secara otomatis.
2. WHEN pemain memilih "Mulai Permainan" di Main Menu, THE SceneLoader SHALL memuat scene Player Selection.
3. WHEN pemain memilih "Lanjutkan Permainan" di Main Menu dan file simpanan tersedia, THE SceneLoader SHALL memuat scene Gameplay dengan data tersimpan.
4. WHEN pemain mengonfirmasi konfigurasi pemain di Player Selection, THE SceneLoader SHALL memuat scene Gameplay.
5. WHEN permainan berakhir dengan satu pemenang, THE SceneLoader SHALL memuat scene Winner Screen.
6. WHEN pemain memilih "Kembali ke Menu" dari Winner Screen atau Pause Menu, THE SceneLoader SHALL memuat scene Main Menu.
7. WHEN pemain memilih "Credits" di Main Menu, THE SceneLoader SHALL memuat scene Credits yang menampilkan daftar tim pengembang.
8. THE SceneLoader SHALL menampilkan layar loading dengan progress bar selama perpindahan antar scene yang membutuhkan lebih dari 1 detik.
9. THE SceneLoader SHALL menyelesaikan proses pemuatan setiap scene dalam waktu maksimal 5 detik pada spesifikasi minimum hardware.

---

### Requirement 2: Konfigurasi Pemain dan AI Bot

**User Story:** Sebagai pemain, saya ingin memilih jumlah dan profil pemain manusia sebelum permainan dimulai, sehingga slot yang kosong terisi secara otomatis oleh AI Bot.

#### Acceptance Criteria

1. THE UIManager SHALL menampilkan 4 slot pemain di scene Player Selection, masing-masing dapat dikonfigurasi sebagai Pemain Manusia atau AI Bot.
2. THE UIManager SHALL memungkinkan pemain memilih nama dan Token untuk setiap slot Pemain Manusia.
3. THE UIManager SHALL menyediakan 8 pilihan Token berbeda bertema tokoh budaya Indonesia (misalnya: Wayang, Batik, Keris, Becak, Perahu, Angklung, Topeng, Blangkon).
4. WHEN pemain mengonfigurasi kurang dari 4 slot sebagai Pemain Manusia, THE BotManager SHALL mengisi sisa slot dengan AI Bot bernama "Bot Soekarno", "Bot Hatta", "Bot Kartini" sesuai slot yang tersisa.
5. THE GameManager SHALL memberikan Uang_Awal sebesar Rp 15.000.000 kepada setiap Pemain dan AI_Bot saat permainan dimulai.
6. WHEN permainan dimulai, THE TurnManager SHALL menentukan urutan giliran awal dengan cara mengocok urutan pemain secara acak.
7. THE UIManager SHALL menampilkan preview papan kosong di latar belakang scene Player Selection sebagai orientasi visual.


---

### Requirement 3: Desain Papan Permainan (Board Design — 40 Tile)

**User Story:** Sebagai pemain, saya ingin melihat papan permainan dengan 40 tile bertema Indonesia yang tersusun rapi, sehingga saya dapat memahami layout dan perencanaan strategi.

#### Acceptance Criteria

1. THE BoardManager SHALL menampilkan papan permainan dengan tepat 40 Tile yang tersusun membentuk persegi dengan 10 tile per sisi, diindeks 0–39 searah jarum jam.
2. THE BoardManager SHALL mengimplementasikan layout 40 tile berikut secara berurutan:

   **Sisi Bawah (Indeks 0–9, kiri ke kanan):**
   - Tile 0: START (Sudut_Khusus) — "Mulai / GO"
   - Tile 1: Properti Cokelat — "Sabang, Aceh" (Rp 600.000)
   - Tile 2: Dana_Nusantara
   - Tile 3: Properti Cokelat — "Banda Aceh, Aceh" (Rp 600.000)
   - Tile 4: Pajak Penghasilan — Rp 2.000.000
   - Tile 5: Transportasi — "Bandara Sultan Iskandar Muda" (Rp 2.000.000)
   - Tile 6: Properti Biru Muda — "Medan, Sumatera Utara" (Rp 1.000.000)
   - Tile 7: Kartu_Kesempatan
   - Tile 8: Properti Biru Muda — "Pekanbaru, Riau" (Rp 1.000.000)
   - Tile 9: Properti Biru Muda — "Padang, Sumatera Barat" (Rp 1.200.000)

   **Sisi Kiri (Indeks 10–19, bawah ke atas):**
   - Tile 10: PENJARA (Sudut_Khusus) — "Penjara / Just Visiting"
   - Tile 11: Properti Merah Muda — "Palembang, Sumatera Selatan" (Rp 1.400.000)
   - Tile 12: Properti Merah Muda — "Jambi, Jambi" (Rp 1.400.000)
   - Tile 13: Transportasi — "Pelabuhan Tanjung Priok" (Rp 2.000.000)
   - Tile 14: Properti Merah Muda — "Bandar Lampung, Lampung" (Rp 1.600.000)
   - Tile 15: Properti Oranye — "Serang, Banten" (Rp 1.800.000)
   - Tile 16: Dana_Nusantara
   - Tile 17: Properti Oranye — "Bandung, Jawa Barat" (Rp 1.800.000)
   - Tile 18: Properti Oranye — "Semarang, Jawa Tengah" (Rp 2.000.000)
   - Tile 19: Transportasi — "Stasiun Gambir" (Rp 2.000.000)

   **Sisi Atas (Indeks 20–29, kanan ke kiri):**
   - Tile 20: PARKIR BEBAS (Sudut_Khusus) — "Parkir Bebas"
   - Tile 21: Properti Merah — "Yogyakarta, DIY" (Rp 2.200.000)
   - Tile 22: Kartu_Kesempatan
   - Tile 23: Properti Merah — "Surabaya, Jawa Timur" (Rp 2.200.000)
   - Tile 24: Properti Merah — "Malang, Jawa Timur" (Rp 2.400.000)
   - Tile 25: Transportasi — "Bandara Ngurah Rai" (Rp 2.000.000)
   - Tile 26: Properti Kuning — "Denpasar, Bali" (Rp 2.600.000)
   - Tile 27: Properti Kuning — "Mataram, NTB" (Rp 2.600.000)
   - Tile 28: Pajak Kemewahan — Rp 750.000
   - Tile 29: Properti Kuning — "Kupang, NTT" (Rp 2.800.000)

   **Sisi Kanan (Indeks 30–39, atas ke bawah):**
   - Tile 30: KE PENJARA (Sudut_Khusus) — "Go to Jail"
   - Tile 31: Properti Hijau — "Pontianak, Kalimantan Barat" (Rp 3.000.000)
   - Tile 32: Properti Hijau — "Banjarmasin, Kalimantan Selatan" (Rp 3.000.000)
   - Tile 33: Dana_Nusantara
   - Tile 34: Properti Hijau — "Samarinda, Kalimantan Timur" (Rp 3.200.000)
   - Tile 35: Transportasi — "Pelabuhan Makassar" (Rp 2.000.000)
   - Tile 36: Kartu_Kesempatan
   - Tile 37: Properti Biru Tua — "Makassar, Sulawesi Selatan" (Rp 3.500.000)
   - Tile 38: Properti Biru Tua — "Manado, Sulawesi Utara" (Rp 3.500.000)
   - Tile 39: Properti Biru Tua — "Jayapura, Papua" (Rp 4.000.000)

3. THE BoardManager SHALL mengelompokkan Properti ke dalam 8 Grup_Warna berikut:
   - Cokelat (Aceh): Tile 1, 3
   - Biru Muda (Sumatera Tengah): Tile 6, 8, 9
   - Merah Muda (Sumatera Selatan): Tile 11, 12, 14
   - Oranye (Jawa Barat–Tengah): Tile 15, 17, 18
   - Merah (Jawa Timur–DIY): Tile 21, 23, 24
   - Kuning (Bali–Nusa Tenggara): Tile 26, 27, 29
   - Hijau (Kalimantan): Tile 31, 32, 34
   - Biru Tua (Sulawesi–Papua): Tile 37, 38, 39

4. THE BoardManager SHALL menampilkan nama kota/provinsi, harga beli, dan warna grup pada setiap Tile Properti.
5. THE BoardManager SHALL menampilkan ikon khusus pada setiap Tile Transportasi, Pajak, Kartu, dan Sudut_Khusus.
6. THE BoardManager SHALL menampilkan indikator kepemilikan (warna Token pemilik) pada Tile Properti dan Transportasi yang sudah dimiliki.
7. THE BoardManager SHALL menampilkan indikator Rumah (hingga 4 ikon rumah kecil) atau Hotel (1 ikon hotel) pada Tile Properti yang sudah diupgrade.


---

### Requirement 4: Sistem Properti — Harga, Sewa, dan Upgrade

**User Story:** Sebagai pemain, saya ingin mengetahui nilai sewa dan biaya upgrade setiap properti secara detail, sehingga saya dapat membuat keputusan ekonomi yang tepat.

#### Acceptance Criteria

1. THE PropertyManager SHALL menerapkan tabel harga beli, sewa, dan biaya pembangunan berikut untuk setiap Grup_Warna:

   **Cokelat (Rp 600.000/tile):**
   - Sewa dasar: Rp 60.000 | Monopoli: Rp 120.000
   - 1 Rumah: Rp 300.000 | 2 Rumah: Rp 900.000 | 3 Rumah: Rp 2.700.000 | 4 Rumah: Rp 4.000.000
   - Hotel: Rp 5.500.000 | Biaya bangun Rumah: Rp 500.000 | Biaya bangun Hotel: Rp 500.000

   **Biru Muda (Rp 1.000.000–Rp 1.200.000/tile):**
   - Sewa dasar: Rp 100.000 | Monopoli: Rp 200.000
   - 1 Rumah: Rp 500.000 | 2 Rumah: Rp 1.500.000 | 3 Rumah: Rp 4.500.000 | 4 Rumah: Rp 6.250.000
   - Hotel: Rp 7.500.000 | Biaya bangun Rumah: Rp 750.000 | Biaya bangun Hotel: Rp 750.000

   **Merah Muda (Rp 1.400.000–Rp 1.600.000/tile):**
   - Sewa dasar: Rp 140.000 | Monopoli: Rp 280.000
   - 1 Rumah: Rp 700.000 | 2 Rumah: Rp 2.000.000 | 3 Rumah: Rp 6.000.000 | 4 Rumah: Rp 8.750.000
   - Hotel: Rp 10.500.000 | Biaya bangun Rumah: Rp 1.000.000 | Biaya bangun Hotel: Rp 1.000.000

   **Oranye (Rp 1.800.000–Rp 2.000.000/tile):**
   - Sewa dasar: Rp 180.000 | Monopoli: Rp 360.000
   - 1 Rumah: Rp 900.000 | 2 Rumah: Rp 2.750.000 | 3 Rumah: Rp 8.000.000 | 4 Rumah: Rp 11.000.000
   - Hotel: Rp 13.000.000 | Biaya bangun Rumah: Rp 1.250.000 | Biaya bangun Hotel: Rp 1.250.000

   **Merah (Rp 2.200.000–Rp 2.400.000/tile):**
   - Sewa dasar: Rp 220.000 | Monopoli: Rp 440.000
   - 1 Rumah: Rp 1.100.000 | 2 Rumah: Rp 3.300.000 | 3 Rumah: Rp 9.900.000 | 4 Rumah: Rp 13.200.000
   - Hotel: Rp 16.500.000 | Biaya bangun Rumah: Rp 1.500.000 | Biaya bangun Hotel: Rp 1.500.000

   **Kuning (Rp 2.600.000–Rp 2.800.000/tile):**
   - Sewa dasar: Rp 260.000 | Monopoli: Rp 520.000
   - 1 Rumah: Rp 1.300.000 | 2 Rumah: Rp 3.900.000 | 3 Rumah: Rp 11.700.000 | 4 Rumah: Rp 15.600.000
   - Hotel: Rp 19.500.000 | Biaya bangun Rumah: Rp 1.750.000 | Biaya bangun Hotel: Rp 1.750.000

   **Hijau (Rp 3.000.000–Rp 3.200.000/tile):**
   - Sewa dasar: Rp 300.000 | Monopoli: Rp 600.000
   - 1 Rumah: Rp 1.500.000 | 2 Rumah: Rp 4.500.000 | 3 Rumah: Rp 13.500.000 | 4 Rumah: Rp 18.000.000
   - Hotel: Rp 22.500.000 | Biaya bangun Rumah: Rp 2.000.000 | Biaya bangun Hotel: Rp 2.000.000

   **Biru Tua (Rp 3.500.000–Rp 4.000.000/tile):**
   - Sewa dasar: Rp 350.000 | Monopoli: Rp 700.000
   - 1 Rumah: Rp 1.750.000 | 2 Rumah: Rp 5.250.000 | 3 Rumah: Rp 15.750.000 | 4 Rumah: Rp 21.000.000
   - Hotel: Rp 26.250.000 | Biaya bangun Rumah: Rp 2.500.000 | Biaya bangun Hotel: Rp 2.500.000

2. WHEN Token Pemain berhenti di Tile Properti yang belum dimiliki, THE UIManager SHALL menampilkan Property Window berisi nama properti, harga beli, tabel sewa semua level, dan tombol "Beli" serta "Lewati".
3. WHEN Pemain memilih "Beli" dan saldo mencukupi, THE PropertyManager SHALL mencatat kepemilikan dan mengurangi saldo Pemain.
4. IF Pemain memilih "Beli" dan saldo tidak mencukupi, THEN THE UIManager SHALL menampilkan pesan "Saldo tidak cukup" dan membatalkan transaksi.
5. WHEN Pemain memilih "Lewati", THE TurnManager SHALL melanjutkan giliran tanpa perubahan kepemilikan.
6. WHEN Token Pemain berhenti di Tile Properti milik pemain lain, THE PropertyManager SHALL menghitung nilai Sewa sesuai level upgrade dan status Monopoli_Grup, lalu mentransfer otomatis.
7. WHEN Pemain memiliki Monopoli_Grup, THE PropertyManager SHALL menggandakan nilai Sewa dasar seluruh Properti dalam grup tersebut.
8. WHEN Pemain memiliki Monopoli_Grup, THE UIManager SHALL mengaktifkan tombol "Bangun" pada panel properti untuk grup tersebut.
9. THE PropertyManager SHALL membatasi pembangunan Rumah secara merata (even build rule): selisih jumlah Rumah antar Properti dalam satu Grup_Warna tidak boleh melebihi 1.
10. THE PropertyManager SHALL membatasi jumlah maksimal Rumah per Properti menjadi 4 dan Hotel menjadi 1.
11. WHEN Properti sudah memiliki Hotel, THE UIManager SHALL menonaktifkan opsi pembangunan lebih lanjut pada Properti tersebut.


---

### Requirement 5: Sistem Dadu

**User Story:** Sebagai pemain, saya ingin melempar dadu untuk menentukan langkah saya, sehingga permainan berjalan secara acak dan adil bagi semua peserta.

#### Acceptance Criteria

1. WHEN giliran Pemain tiba, THE UIManager SHALL mengaktifkan tombol "Lempar Dadu" dan menonaktifkan semua tombol aksi lainnya.
2. WHEN Pemain menekan tombol "Lempar Dadu", THE DiceManager SHALL menghasilkan dua angka acak independen masing-masing antara 1 hingga 6 menggunakan Unity Random.Range.
3. THE DiceManager SHALL menampilkan animasi dadu bergulir selama 1–2 detik sebelum menampilkan hasil final.
4. THE DiceManager SHALL menampilkan nilai akhir masing-masing dadu secara visual pada panel dadu di HUD.
5. WHEN hasil dua dadu menunjukkan angka yang sama (Double), THE TurnManager SHALL mencatat jumlah Double berturut-turut dan memberikan giliran tambahan setelah aksi selesai.
6. WHEN Pemain mendapatkan Double sebanyak 3 kali berturut-turut dalam satu putaran giliran, THE TurnManager SHALL mengirim Pemain ke Penjara tanpa memberikan giliran tambahan.
7. WHILE Pemain berada di Penjara, THE DiceManager SHALL memungkinkan lemparan dadu hanya untuk percobaan mendapatkan Double guna keluar Penjara.
8. THE DiceManager SHALL menonaktifkan tombol "Lempar Dadu" selama animasi dadu, animasi pergerakan Token, dan selama giliran AI_Bot berlangsung.

---

### Requirement 6: Sistem Pergerakan Token

**User Story:** Sebagai pemain, saya ingin Token saya bergerak secara visual di papan sesuai hasil dadu, sehingga saya dapat mengikuti perkembangan permainan secara real-time.

#### Acceptance Criteria

1. WHEN DiceManager menghasilkan hasil lemparan, THE GameManager SHALL menggerakkan Token Pemain maju sejumlah Tile sesuai total kedua dadu searah jarum jam.
2. THE AnimationManager SHALL menampilkan animasi Token berpindah antar Tile satu per satu dengan durasi 0,2 detik per Tile, disertai SFX langkah.
3. WHEN Token Pemain melewati Tile Start (indeks 0) saat bergerak maju, THE GameManager SHALL menambahkan Rp 2.000.000 ke saldo Pemain dan menampilkan notifikasi.
4. WHEN Token Pemain berhenti tepat di Tile Start, THE GameManager SHALL menambahkan Rp 2.000.000 ke saldo Pemain.
5. WHEN Token Pemain selesai bergerak dan berhenti di sebuah Tile, THE GameManager SHALL memicu aksi yang sesuai berdasarkan kategori Tile.
6. WHEN kartu atau aturan mengharuskan perpindahan Token ke posisi tertentu, THE AnimationManager SHALL menampilkan animasi teleport singkat (0,5 detik) tanpa melintasi Tile antara.
7. WHEN Token Pemain dikirim ke Penjara dari Tile 30, THE GameManager SHALL menempatkan Token di Tile 10 (Penjara) dan mencatat status "Di Penjara" pada data Pemain tersebut.


---

### Requirement 7: Sistem Transportasi

**User Story:** Sebagai pemain, saya ingin membeli dan mendapatkan penghasilan dari Transportasi nasional, sehingga saya memiliki sumber pendapatan pasif yang skalabel.

#### Acceptance Criteria

1. THE BoardManager SHALL menempatkan 4 tile Transportasi di posisi strategis: Bandara Sultan Iskandar Muda (Tile 5), Pelabuhan Tanjung Priok (Tile 13), Stasiun Gambir (Tile 19), dan Bandara Ngurah Rai (Tile 25), serta Pelabuhan Makassar (Tile 35).
2. WHEN Token Pemain berhenti di Tile Transportasi yang belum dimiliki, THE UIManager SHALL menampilkan Transportasi Window dengan harga beli Rp 2.000.000 dan tabel sewa berdasarkan jumlah kepemilikan.
3. WHEN Pemain membeli Transportasi dan saldo mencukupi, THE PropertyManager SHALL mencatat kepemilikan dan mengurangi saldo sebesar Rp 2.000.000.
4. WHEN Token Pemain berhenti di Tile Transportasi milik pemain lain, THE PropertyManager SHALL menghitung dan mentransfer Sewa berdasarkan total Transportasi yang dimiliki pemilik menggunakan rumus berikut:
   - 1 Transportasi dimiliki = Rp 250.000
   - 2 Transportasi dimiliki = Rp 500.000
   - 3 Transportasi dimiliki = Rp 1.000.000
   - 4 Transportasi dimiliki = Rp 2.000.000
   - 5 Transportasi dimiliki = Rp 2.500.000
5. THE PropertyManager SHALL menghitung jumlah Transportasi yang dimiliki pemilik saat tamu berhenti, bukan jumlah saat pembelian.
6. WHEN Pemain memiliki semua 5 Transportasi, THE UIManager SHALL menampilkan label "Monopoli Transportasi" pada panel aset Pemain.

---

### Requirement 8: Sistem Kartu — Daftar Lengkap Kartu_Kesempatan

**User Story:** Sebagai pemain, saya ingin mengambil kartu Kesempatan dengan efek yang beragam dan bertema Indonesia, sehingga permainan memiliki elemen kejutan yang mengasyikkan.

#### Acceptance Criteria

1. WHEN Token Pemain berhenti di Tile Kartu_Kesempatan (Tile 7, 22, 36), THE CardManager SHALL mengambil satu kartu dari atas dek Kartu_Kesempatan yang sudah dikocok.
2. THE CardManager SHALL menampilkan Card Popup dengan animasi flip 0,4 detik, menampilkan ilustrasi, nama kartu, dan teks efek.
3. THE CardManager SHALL menyediakan tepat 22 kartu unik dalam dek Kartu_Kesempatan dengan daftar berikut:

   | No | Nama Kartu | Efek |
   |----|-----------|------|
   | 1 | Terpilih Ketua RT | Terima Rp 500.000 dari setiap pemain lain |
   | 2 | Wisata ke Bali | Maju ke Tile 26 (Denpasar). Jika melewati Start, terima Rp 2.000.000 |
   | 3 | Tiket Kereta Gratis | Maju ke Stasiun Gambir (Tile 19). Jika melewati Start, terima Rp 2.000.000 |
   | 4 | Dapat Warisan Kakek | Terima Rp 2.500.000 dari Bank |
   | 5 | Bayar Pajak Daerah | Bayar Rp 1.500.000 ke Bank |
   | 6 | Lolos Tilang Polisi | Maju ke Start, terima Rp 2.000.000 |
   | 7 | Tertangkap Pungli | Masuk Penjara langsung, tidak terima uang Start |
   | 8 | Menang Undian Nasional | Terima Rp 1.000.000 dari Bank |
   | 9 | Renovasi Kantor | Bayar Rp 500.000 per Rumah dan Rp 1.500.000 per Hotel yang dimiliki |
   | 10 | Kartu Pembebasan | Simpan kartu ini; gunakan sekali untuk keluar Penjara gratis |
   | 11 | Ekspedisi Nusantara | Mundur 3 Tile dari posisi saat ini |
   | 12 | Promosi Jabatan | Terima Rp 1.500.000 dari Bank |
   | 13 | Kena PHK Tiba-Tiba | Bayar Rp 800.000 ke Bank |
   | 14 | Festival Budaya | Terima Rp 300.000 dari setiap pemain lain |
   | 15 | Ditemukan Terbukti Korupsi | Masuk Penjara, bayar denda Rp 1.000.000 |
   | 16 | Naik Ojek Online | Maju ke Properti terdekat yang belum dimiliki; beli dengan harga normal atau lewati |
   | 17 | Panen Raya | Terima Rp 750.000 dari Bank |
   | 18 | Banjir Rob | Bayar Rp 1.000.000 biaya perbaikan ke Bank |
   | 19 | Terpilih Duta Wisata | Terima Rp 2.000.000 dari Bank |
   | 20 | Salah Transfer | Bayar Rp 200.000 ke setiap pemain lain |
   | 21 | Lolos Seleksi CPNS | Terima Rp 3.000.000 dari Bank |
   | 22 | Ditilang di Jalan Tol | Bayar Rp 500.000 ke Bank |

4. WHEN seluruh kartu dalam dek Kartu_Kesempatan telah diambil, THE CardManager SHALL mengocok ulang dek sebelum kartu berikutnya diambil.
5. IF Pemain menerima kartu "Kartu Pembebasan" (No. 10), THEN THE CardManager SHALL menyimpan kartu tersebut di inventori Pemain dan menampilkan indikator pada HUD.
6. WHEN efek kartu dieksekusi, THE CardManager SHALL menerapkan efek secara otomatis setelah Pemain menutup Card Popup dengan menekan tombol "OK".


---

### Requirement 9: Sistem Kartu — Daftar Lengkap Dana_Nusantara

**User Story:** Sebagai pemain, saya ingin mengambil kartu Dana Nusantara yang mewakili kejadian komunitas bernuansa lokal Indonesia, sehingga permainan terasa lebih kultural dan menghibur.

#### Acceptance Criteria

1. WHEN Token Pemain berhenti di Tile Dana_Nusantara (Tile 2, 16, 33), THE CardManager SHALL mengambil satu kartu dari atas dek Dana_Nusantara yang sudah dikocok.
2. THE CardManager SHALL menampilkan Card Popup dengan animasi flip 0,4 detik, menampilkan ilustrasi bertema gotong royong, nama kartu, dan teks efek.
3. THE CardManager SHALL menyediakan tepat 22 kartu unik dalam dek Dana_Nusantara dengan daftar berikut:

   | No | Nama Kartu | Efek |
   |----|-----------|------|
   | 1 | Dari Bank Hari Ulang Tahun | Terima Rp 500.000 dari setiap pemain lain |
   | 2 | Iuran Arisan Kampung | Bayar Rp 500.000 ke setiap pemain lain |
   | 3 | Dana Bantuan Sosial | Terima Rp 1.000.000 dari Bank |
   | 4 | Bayar Iuran BPJS | Bayar Rp 750.000 ke Bank |
   | 5 | Gotong Royong Sukses | Terima Rp 400.000 dari setiap pemain lain |
   | 6 | Hasil Penjualan Kerajinan | Terima Rp 1.200.000 dari Bank |
   | 7 | Kena Denda Adat | Bayar Rp 900.000 ke Bank |
   | 8 | Bebas Penjara | Simpan kartu ini; gunakan sekali untuk keluar Penjara gratis |
   | 9 | Transfer Salah Rekening | Bayar Rp 300.000 ke Bank |
   | 10 | Subsidi Pemerintah Daerah | Terima Rp 1.500.000 dari Bank |
   | 11 | Musibah Bencana Alam | Bayar Rp 1.000.000 biaya rekonstruksi ke Bank |
   | 12 | Bayar Tagihan Listrik PLN | Bayar Rp 600.000 ke Bank |
   | 13 | Royalti Batik Ekspor | Terima Rp 2.000.000 dari Bank |
   | 14 | Retribusi Pasar | Bayar Rp 400.000 ke Bank |
   | 15 | Bonus Akhir Tahun | Terima Rp 1.000.000 dari Bank |
   | 16 | Perbaikan Jembatan Desa | Bayar Rp 500.000 ke Bank |
   | 17 | Dapat Bantuan Sembako | Terima Rp 700.000 dari Bank |
   | 18 | Menang Lomba 17 Agustus | Terima Rp 800.000 dari Bank |
   | 19 | Kena Penipuan Online | Bayar Rp 1.200.000 ke Bank |
   | 20 | Dana Desa Cair | Terima Rp 2.500.000 dari Bank |
   | 21 | Bayar Pajak Kendaraan | Bayar Rp 550.000 ke Bank |
   | 22 | Hadiah Kuis Televisi | Terima Rp 1.800.000 dari Bank |

4. WHEN seluruh kartu dalam dek Dana_Nusantara telah diambil, THE CardManager SHALL mengocok ulang dek sebelum kartu berikutnya diambil.
5. IF Pemain menerima kartu "Bebas Penjara" (No. 8), THEN THE CardManager SHALL menyimpan kartu tersebut di inventori Pemain dan menampilkan indikator pada HUD.
6. WHEN Pemain menggunakan kartu "Bebas Penjara" atau "Kartu Pembebasan" saat di Penjara, THE CardManager SHALL menghapus kartu dari inventori Pemain setelah digunakan.
7. FOR ALL efek kartu yang melibatkan pembayaran kepada atau dari setiap pemain lain, THE CardManager SHALL memproses transaksi ke setiap pemain aktif (tidak bangkrut) satu per satu secara berurutan.


---

### Requirement 10: Sistem Penjara

**User Story:** Sebagai pemain, saya ingin memahami aturan masuk dan keluar penjara secara lengkap, sehingga saya dapat merencanakan strategi dan merespons situasi penjara dengan tepat.

#### Acceptance Criteria

1. THE GameManager SHALL mengenali tiga kondisi yang menyebabkan Pemain masuk Penjara:
   a. Token berhenti di Tile 30 (Ke_Penjara)
   b. Pemain mendapat Double sebanyak 3 kali berturut-turut dalam satu putaran giliran
   c. Efek kartu bertuliskan "Masuk Penjara"
2. WHEN Pemain masuk Penjara karena kondisi apapun, THE GameManager SHALL memindahkan Token ke Tile 10 (Penjara), menetapkan status "Di_Penjara = true", dan mereset hitungan Double berturut-turut ke 0.
3. WHEN Pemain masuk Penjara dari Tile 30, THE GameManager SHALL tidak memberikan uang melewati Start kepada Pemain.
4. WHILE Pemain berstatus "Di_Penjara", THE UIManager SHALL menawarkan 3 opsi pada awal giliran: (a) Lempar Dadu untuk Double, (b) Bayar Denda Rp 500.000, (c) Gunakan Kartu Pembebasan.
5. WHEN Pemain memilih "Bayar Denda" dan saldo mencukupi, THE GameManager SHALL mengurangi saldo Rp 500.000, menetapkan "Di_Penjara = false", dan memperbolehkan lemparan dadu normal.
6. WHEN Pemain memilih "Gunakan Kartu Pembebasan" dan kartu tersedia di inventori, THE GameManager SHALL menghapus kartu, menetapkan "Di_Penjara = false", dan memperbolehkan lemparan dadu normal.
7. WHEN Pemain memilih "Lempar Dadu" dan mendapat Double, THE GameManager SHALL menetapkan "Di_Penjara = false" dan menggerakkan Token sesuai total dadu tersebut.
8. WHEN Pemain memilih "Lempar Dadu" dan tidak mendapat Double, THE TurnManager SHALL menambahkan 1 ke hitungan "Gagal_Keluar_Penjara" Pemain dan mengakhiri giliran tanpa pergerakan.
9. IF Pemain sudah gagal mendapatkan Double selama 3 giliran berturut-turut di Penjara, THEN THE GameManager SHALL mengharuskan Pemain membayar denda Rp 500.000, menetapkan "Di_Penjara = false", dan menggerakkan Token sesuai hasil dadu giliran ketiga tersebut.
10. WHEN Token Pemain melewati Tile 10 (Penjara) tanpa status "Di_Penjara", THE GameManager SHALL memperlakukan Tile tersebut sebagai "Sekadar Berkunjung" tanpa efek apapun.

---

### Requirement 11: Sistem Pajak

**User Story:** Sebagai pemain, saya ingin memahami konsekuensi berhenti di tile pajak, sehingga saya dapat memperhitungkan pengeluaran wajib dalam strategi keuangan.

#### Acceptance Criteria

1. WHEN Token Pemain berhenti di Tile 4 (Pajak Penghasilan), THE GameManager SHALL mengurangi saldo Pemain sebesar Rp 2.000.000 dan menampilkan notifikasi "Bayar Pajak Penghasilan Rp 2.000.000".
2. WHEN Token Pemain berhenti di Tile 28 (Pajak Kemewahan), THE GameManager SHALL mengurangi saldo Pemain sebesar Rp 750.000 dan menampilkan notifikasi "Bayar Pajak Kemewahan Rp 750.000".
3. THE GameManager SHALL mengirim uang pajak ke Bank (dihapus dari sirkulasi), bukan ke pemain lain.
4. IF saldo Pemain tidak mencukupi untuk membayar pajak, THEN THE GameManager SHALL menyatakan Pemain tersebut Bangkrut sesuai prosedur Requirement 14.
5. WHEN AI_Bot berhenti di Tile Pajak, THE GameManager SHALL memproses pembayaran pajak secara otomatis tanpa input pengguna.


---

### Requirement 12: Sistem Giliran (Turn System dan State Machine)

**User Story:** Sebagai pemain, saya ingin giliran diatur secara tertib dengan state machine yang jelas, sehingga semua pemain berpartisipasi secara adil dan urutan aksi tidak ambigu.

#### Acceptance Criteria

1. THE TurnManager SHALL mengelola urutan giliran secara melingkar (round-robin) dari pemain indeks 0 hingga indeks terakhir aktif, lalu kembali ke indeks 0.
2. THE TurnManager SHALL mengimplementasikan State_Machine dengan state-state berikut: Idle → Rolling → Moving → ResolveTile → Buying → PayingRent → DrawingCard → Building → InJail → Bankrupt → GameOver.
3. WHEN giliran Pemain manusia tiba (state Idle), THE UIManager SHALL menampilkan indikator giliran aktif, highlight panel pemain yang sedang bermain, dan mengaktifkan tombol "Lempar Dadu".
4. WHEN giliran AI_Bot tiba, THE BotManager SHALL memulai eksekusi giliran secara otomatis setelah jeda 1 detik untuk memberikan kesan "berpikir", dan THE UIManager SHALL menampilkan label "Bot sedang berpikir...".
5. WHEN Pemain mendapatkan Double, THE TurnManager SHALL mencatat giliran tambahan dan memberikan giliran kembali kepada Pemain yang sama setelah ResolveTile selesai, kecuali jika Pemain dikirim ke Penjara.
6. THE TurnManager SHALL melewati giliran setiap Pemain atau AI_Bot yang berstatus Bangkrut.
7. WHEN semua aksi dalam satu giliran selesai, THE TurnManager SHALL berpindah ke state Idle untuk pemain berikutnya.
8. THE TurnManager SHALL menyimpan riwayat state saat ini ke SaveManager sehingga state dapat dipulihkan saat memuat simpanan.

---

### Requirement 13: AI Bot — Decision Tree Rule-Based

**User Story:** Sebagai pemain tunggal atau multi-pemain, saya ingin AI Bot bertindak secara logis dan menantang berdasarkan aturan decision tree yang jelas, sehingga permainan tetap kompetitif.

#### Acceptance Criteria

1. THE BotManager SHALL mengimplementasikan AI_Bot menggunakan decision tree berbasis rule, tanpa machine learning atau model eksternal.
2. THE BotManager SHALL menggunakan variabel konteks berikut dalam setiap evaluasi keputusan:
   - `saldo`: saldo tunai AI_Bot saat ini
   - `hargaProperti`: harga beli Properti atau Transportasi yang disinggahi
   - `jumlahPropertiGrup`: jumlah Properti dalam Grup_Warna yang sudah dimiliki AI_Bot
   - `totalPropertiGrup`: total Properti dalam Grup_Warna yang disinggahi
   - `punya_kartu_bebas`: boolean apakah AI_Bot memiliki kartu Pembebasan
   - `gagalKeluar`: hitungan gagal keluar Penjara
3. THE BotManager SHALL menerapkan decision tree pembelian Properti berikut:
   ```
   JIKA hargaProperti <= (saldo * 0,5) DAN Properti belum dimiliki:
     BELI
   JIKA hargaProperti > (saldo * 0,5) ATAU saldo < Rp 2.000.000:
     LEWATI
   JIKA Properti sudah dimiliki pemain lain:
     LEWATI
   ```
4. THE BotManager SHALL menerapkan decision tree pembangunan Rumah/Hotel berikut:
   ```
   JIKA AI_Bot memiliki Monopoli_Grup DAN saldo > (biaya_bangun * 2):
     BANGUN pada Properti dengan Sewa terendah dalam grup (even build)
   JIKA saldo <= (biaya_bangun * 2):
     TUNDA pembangunan
   ```
5. THE BotManager SHALL menerapkan decision tree keluar Penjara berikut:
   ```
   JIKA punya_kartu_bebas:
     GUNAKAN kartu Pembebasan
   JIKA TIDAK punya kartu DAN saldo > Rp 1.500.000:
     BAYAR denda Rp 500.000
   JIKA TIDAK punya kartu DAN saldo <= Rp 1.500.000:
     LEMPAR dadu untuk Double
   JIKA gagalKeluar >= 3:
     PAKSA bayar denda (terlepas dari saldo)
   ```
6. THE BotManager SHALL menyelesaikan setiap keputusan dalam waktu maksimal 1 detik.
7. THE BotManager SHALL menampilkan tindakan AI_Bot di log panel HUD dengan teks singkat, misalnya "Bot Soekarno membeli Bandung" atau "Bot Hatta melewati pembelian".
8. WHEN AI_Bot harus membayar Sewa atau Pajak dan saldo tidak mencukupi, THE BotManager SHALL menentukan AI_Bot sebagai Bangkrut sesuai prosedur Requirement 14.


---

### Requirement 14: Manajemen Aset, Kebangkrutan, dan Likuidasi

**User Story:** Sebagai pemain, saya ingin sistem menangani kebangkrutan secara adil dan otomatis, sehingga permainan berjalan sesuai aturan tanpa intervensi manual.

#### Acceptance Criteria

1. THE GameManager SHALL memeriksa kondisi Bangkrut setiap kali saldo Pemain atau AI_Bot dikurangi.
2. WHEN saldo Pemain atau AI_Bot jatuh di bawah Rp 0, THE GameManager SHALL memeriksa apakah Pemain memiliki aset yang dapat dilikuidasi (Properti, Transportasi, Rumah, Hotel).
3. IF Pemain memiliki bangunan (Rumah atau Hotel) yang dapat dijual, THEN THE UIManager SHALL menampilkan dialog "Jual Aset" yang memungkinkan Pemain memilih bangunan untuk dijual dengan nilai 50% dari harga beli.
4. IF Pemain memilih untuk menjual bangunan dan hasilnya mencukupi kewajiban, THEN THE PropertyManager SHALL memproses penjualan dan pembayaran kewajiban.
5. IF saldo Pemain tetap negatif setelah semua bangunan dijual, THEN THE GameManager SHALL menyatakan Pemain Bangkrut.
6. WHEN Pemain dinyatakan Bangkrut akibat tidak mampu membayar Sewa kepada pemain lain, THE PropertyManager SHALL mentransfer seluruh Properti, Transportasi, Rumah, dan Hotel milik Pemain Bangkrut kepada pemilik tagihan secara langsung.
7. WHEN Pemain dinyatakan Bangkrut akibat tidak mampu membayar Pajak atau kewajiban Bank, THE PropertyManager SHALL mengembalikan seluruh Properti dan Transportasi ke status tidak dimiliki, dan menghapus semua Rumah dan Hotel.
8. WHEN Pemain dinyatakan Bangkrut, THE UIManager SHALL menampilkan popup "Bangkrut!" dengan animasi, menghapus Token dari papan, dan mencatat Pemain sebagai tidak aktif.
9. THE TurnManager SHALL melewati giliran Pemain yang sudah dinyatakan Bangkrut di semua putaran berikutnya.

---

### Requirement 15: Kondisi Menang dan Kalah

**User Story:** Sebagai pemain, saya ingin permainan memiliki kondisi kemenangan dan kekalahan yang jelas dan terdefinisi, sehingga saya tahu kapan dan bagaimana permainan berakhir.

#### Acceptance Criteria

1. WHEN hanya tersisa tepat satu Pemain atau AI_Bot yang tidak Bangkrut, THE GameManager SHALL menyatakan Pemain atau AI_Bot tersebut sebagai pemenang dan memicu transisi ke Winner Screen.
2. THE UIManager SHALL menghitung Kekayaan_Total pemenang sebagai: saldo tunai + nilai semua Properti (harga beli) + nilai semua Transportasi (harga beli) + nilai semua Rumah (50% harga beli) + nilai semua Hotel (50% harga beli).
3. WHEN Winner Screen ditampilkan, THE UIManager SHALL menampilkan nama pemenang, Token pemenang, total kekayaan, dan urutan kebangkrutan pemain lain.
4. THE UIManager SHALL menampilkan animasi selebrasi (confetti, fireworks bertema batik) selama minimal 3 detik sebelum tombol navigasi dapat ditekan.
5. THE UIManager SHALL menyediakan tombol "Main Lagi" (kembali ke Player Selection) dan "Menu Utama" pada Winner Screen.
6. THE UIManager SHALL menampilkan Leaderboard kekayaan real-time yang diperbarui setiap akhir giliran selama permainan berlangsung.
7. WHEN semua Pemain manusia dinyatakan Bangkrut dan masih ada AI_Bot yang aktif, THE GameManager SHALL tetap melanjutkan permainan antar AI_Bot hingga satu pemenang tersisa, menampilkan proses tersebut dalam mode fast-forward visual.


---

### Requirement 16: Antarmuka Pengguna (UI/UX)

**User Story:** Sebagai pemain, saya ingin antarmuka yang informatif, responsif, dan bertema Indonesia, sehingga saya dapat memantau semua informasi permainan dengan mudah dan nyaman.

#### Acceptance Criteria

1. THE UIManager SHALL menampilkan Gameplay HUD yang memuat elemen-elemen berikut secara bersamaan:
   - Panel kiri: daftar semua pemain dengan saldo, Token, dan indikator giliran aktif
   - Panel kanan: Leaderboard kekayaan real-time
   - Panel bawah: tombol "Lempar Dadu", panel dadu, tombol "Bangun", tombol "Pause"
   - Panel tengah: papan permainan 40 tile dengan semua Token, bangunan, dan label
   - Log aksi: 3 aksi terakhir dalam format teks ringkas di sudut layar

2. THE UIManager SHALL menampilkan Property Window ketika Token berhenti di Tile yang dapat dibeli, berisi:
   - Nama dan foto landmark kota/provinsi
   - Grup warna dan anggota grup
   - Harga beli
   - Tabel sewa untuk setiap level (0 Rumah, 1–4 Rumah, Hotel)
   - Biaya bangun Rumah dan Hotel
   - Tombol "Beli" (aktif jika saldo cukup) dan "Lewati"

3. THE UIManager SHALL menampilkan Card Popup ketika kartu diambil, berisi:
   - Animasi flip kartu 0,4 detik
   - Ilustrasi kartu bertema Indonesia
   - Nama kartu dengan tipografi dekoratif
   - Teks efek kartu yang jelas
   - Tombol "OK" untuk mengonfirmasi dan mengeksekusi efek

4. THE UIManager SHALL menampilkan Pause Menu dengan opsi: Lanjutkan, Simpan, Pengaturan, dan Kembali ke Menu Utama.
5. THE UIManager SHALL menampilkan Settings Screen dengan kontrol: slider volume BGM (0–100%), slider volume SFX (0–100%), toggle bahasa Indonesia/English, dan tombol simpan pengaturan.
6. THE UIManager SHALL merender seluruh elemen antarmuka pada resolusi 1920x1080 piksel tanpa elemen yang terpotong atau tumpang tindih.
7. THE UIManager SHALL menampilkan animasi transisi (fade in/out 0,3 detik) untuk setiap perpindahan antara layar atau popup.
8. THE UIManager SHALL menggunakan color palette bertema Merah Putih Indonesia:
   - Merah Utama: #CE1126
   - Putih: #FFFFFF
   - Emas Aksen: #D4AF37
   - Hijau Tropis: #008040
   - Biru Nusantara: #0066CC
   - Cokelat Kayu: #8B4513
9. THE UIManager SHALL menggunakan tipografi yang mendukung karakter Latin dan Indonesia (minimal font: satu display font dekoratif untuk judul, satu sans-serif untuk body text).
10. THE UIManager SHALL menampilkan tooltip informatif ketika Pemain mengarahkan kursor ke Tile, Token, atau ikon aset di papan.


---

### Requirement 17: Visual dan Art Direction

**User Story:** Sebagai pemain, saya ingin game memiliki tampilan visual yang konsisten bertema budaya Indonesia dengan art style Modern Flat UI, sehingga pengalaman bermain terasa autentik dan estetis.

#### Acceptance Criteria

1. THE UIManager SHALL menerapkan art style Modern Flat UI dengan karakteristik berikut:
   - Tidak ada gradien kompleks; menggunakan flat color atau gradient linear 2 warna maksimal
   - Menggunakan drop shadow halus (offset 2px, blur 4px, opacity 30%) untuk elemen yang memerlukan kedalaman
   - Ikon berbentuk vector flat dengan outline tipis konsisten
   - Border radius 8px untuk semua panel dan tombol
   - Spacing dan padding mengikuti grid 8px

2. THE BoardManager SHALL mendesain papan permainan dengan elemen visual berikut:
   - Tile Properti: menampilkan strip warna Grup di bagian atas, nama kota dalam teks bersih, dan harga beli kecil
   - Tile Transportasi: menampilkan ikon kendaraan (pesawat, kapal, kereta) dengan warna abu-abu gelap
   - Tile Sudut_Khusus: desain lebih besar dengan ilustrasi ikonik (patung Garuda untuk Start, jeruji penjara untuk Penjara, dll.)
   - Tile Kartu: ilustrasi kartu mini dengan efek bayangan

3. THE AnimationManager SHALL menampilkan Token sebagai karakter 2D flat yang terinspirasi dari budaya Indonesia:
   - Token memiliki animasi idle (bobbing 2px, loop) saat menunggu giliran
   - Token memiliki animasi berjalan saat berpindah Tile
   - Token memiliki animasi selebrasi saat memenangkan permainan

4. THE UIManager SHALL menampilkan background papan bertema peta kepulauan Indonesia dengan garis pantai stilisasi dan motif batik sebagai border papan.
5. THE UIManager SHALL menampilkan Rumah sebagai ikon rumah adat miniatur dan Hotel sebagai ikon hotel modern miniatur di atas Tile Properti.
6. THE UIManager SHALL menampilkan animasi partikel koin (emas) saat transaksi uang berhasil dieksekusi (terima atau bayar).
7. THE UIManager SHALL menggunakan font display "Noto Serif" atau equivalen untuk nama kota di tile, dan font sans-serif "Inter" atau equivalen untuk UI teks.

---

### Requirement 18: Sistem Audio

**User Story:** Sebagai pemain, saya ingin mendengar audio berkualitas yang bertema Indonesia pada setiap aksi permainan, sehingga pengalaman bermain lebih imersif dan menyenangkan.

#### Acceptance Criteria

1. THE AudioManager SHALL memutar Background Music (BGM) bertema gamelan/musik tradisional Indonesia dengan BPM 90–120 secara looping tanpa jeda saat permainan berlangsung.
2. THE AudioManager SHALL menerapkan BGM yang berbeda untuk setiap scene:
   - Splash/Main Menu: musik tenang bertema budaya Indonesia
   - Player Selection: musik upbeat ceria
   - Gameplay: musik dinamis bertema nusantara
   - Winner Screen: musik triumfal

3. THE AudioManager SHALL memutar SFX untuk setiap aksi berikut:
   - Lemparan dadu: suara dadu bergulir dan jatuh
   - Langkah Token: suara langkah ringan per Tile
   - Pembelian Properti: suara transaksi (dering kas)
   - Pembangunan Rumah: suara konstruksi ringan
   - Pembangunan Hotel: suara konstruksi lebih besar
   - Pengambilan Kartu: suara flip kertas
   - Pembayaran Sewa: suara uang berpindah
   - Masuk Penjara: suara gembok/jeruji
   - Bangkrut: suara sedih/dramatis
   - Kemenangan: suara fanfare

4. THE AudioManager SHALL mengatur volume BGM dan volume SFX secara independen berdasarkan nilai yang disimpan di SaveManager (default: BGM 70%, SFX 80%).
5. THE AudioManager SHALL menerapkan audio mixing: BGM otomatis menurunkan volume (ducking) menjadi 30% saat SFX penting dimainkan, lalu kembali ke volume normal dalam 0,5 detik.
6. THE AudioManager SHALL memutar SFX maksimal 3 instance bersamaan untuk mencegah tumpang tindih yang berlebihan.
7. IF audio file gagal dimuat, THEN THE AudioManager SHALL mencatat error ke log dan melanjutkan permainan tanpa audio, tanpa mengganggu gameplay.


---

### Requirement 19: Sistem Animasi

**User Story:** Sebagai pemain, saya ingin melihat animasi yang halus dan responsif pada setiap aksi penting, sehingga permainan terasa hidup, polished, dan memuaskan untuk dimainkan.

#### Acceptance Criteria

1. THE AnimationManager SHALL menampilkan animasi dadu bergulir dengan rotasi 3D (simulasi dengan sprite sheet 2D) selama 1–2 detik, diakhiri dengan penampilan angka final yang jelas.
2. THE AnimationManager SHALL menampilkan animasi Token berjalan antar Tile satu per satu dengan durasi 0,2 detik per Tile menggunakan Unity DOTween atau animasi kurva manual.
3. THE AnimationManager SHALL menampilkan animasi konstruksi Rumah selama 0,5 detik: Rumah muncul dari bawah Tile dengan efek scale-up (0 → 1) disertai partikel debu.
4. THE AnimationManager SHALL menampilkan animasi konstruksi Hotel selama 0,7 detik: Hotel muncul menggantikan 4 Rumah dengan efek scale-up lebih dramatis disertai partikel lebih besar.
5. THE AnimationManager SHALL menampilkan animasi flip kartu selama 0,4 detik: kartu berputar pada sumbu Y (efek 2D scale -1 ke 1) menggunakan dua sprite (belakang dan depan kartu).
6. THE AnimationManager SHALL menampilkan animasi transisi popup (fade in 0,3 detik, fade out 0,2 detik) untuk semua jendela dialog dan popup.
7. THE AnimationManager SHALL menampilkan animasi token idle (bobbing vertikal 2px, periode 1 detik) untuk Token pemain yang sedang menunggu giliran.
8. THE AnimationManager SHALL menampilkan animasi selebrasi Winner Screen: confetti jatuh dari atas layar selama 5 detik, Token pemenang melompat, dan teks "PEMENANG!" muncul dengan efek scale bounce.
9. THE AnimationManager SHALL menampilkan animasi partikel koin emas (5–10 koin) yang memercik dari posisi transaksi saat uang diterima.
10. THE AnimationManager SHALL memastikan semua animasi dapat dilewati (skip) oleh pemain dengan menekan tombol apapun, kecuali animasi perpindahan Token yang sudah berdurasi singkat.

---

### Requirement 20: Sistem Penyimpanan (Save System — JSON)

**User Story:** Sebagai pemain, saya ingin menyimpan dan melanjutkan permainan kapan saja, sehingga saya tidak kehilangan progres akibat menutup aplikasi.

#### Acceptance Criteria

1. THE SaveManager SHALL menyimpan state permainan dalam format JSON terstruktur ke path: `Application.persistentDataPath/saves/monopoli_nusantara_save.json`.
2. THE SaveManager SHALL menyimpan data berikut dalam JSON:
   ```json
   {
     "version": "1.0",
     "timestamp": "ISO-8601 datetime",
     "currentPlayerIndex": 0,
     "currentState": "Rolling",
     "players": [
       {
         "id": 0, "name": "Pemain 1", "isBot": false,
         "token": "Wayang", "balance": 15000000,
         "position": 5, "isInJail": false,
         "jailTurns": 0, "doubleCount": 0,
         "isBankrupt": false, "heldCards": ["KartuBebas"]
       }
     ],
     "properties": [
       {
         "tileIndex": 6, "ownerIndex": 0,
         "houseCount": 2, "hasHotel": false
       }
     ],
     "chanceCardOrder": [3, 7, 1, 15, ...],
     "communityCardOrder": [5, 2, 18, 11, ...],
     "chanceCardIndex": 3,
     "communityCardIndex": 1,
     "settings": { "bgmVolume": 0.7, "sfxVolume": 0.8 }
   }
   ```
3. WHEN Pemain memilih "Simpan" dari Pause Menu, THE SaveManager SHALL menulis file JSON dan menampilkan notifikasi "Permainan Tersimpan" selama 2 detik.
4. THE SaveManager SHALL menyelesaikan proses penulisan file dalam waktu maksimal 2 detik.
5. WHEN Pemain memilih "Lanjutkan Permainan" dari Main Menu, THE SaveManager SHALL memeriksa keberadaan dan validitas file simpanan.
6. IF file simpanan tersedia dan valid, THEN THE SaveManager SHALL memuat semua data dan merestorasi state permainan secara penuh.
7. IF file simpanan tidak ditemukan atau gagal diparse (JSON tidak valid), THEN THE SaveManager SHALL menampilkan pesan "Tidak ada data simpanan yang valid" dan menonaktifkan tombol "Lanjutkan Permainan".
8. THE SaveManager SHALL menyimpan pengaturan audio dan bahasa secara otomatis setiap kali pengaturan diubah, terpisah dari data permainan.
9. FOR ALL data yang dimuat dari file simpanan, THE SaveManager SHALL memvalidasi bahwa setiap nilai berada dalam rentang yang diizinkan sebelum menerapkannya ke GameManager.


---

### Requirement 21: Arsitektur Teknis — Manager System dan ScriptableObject

**User Story:** Sebagai developer, saya ingin game dibangun dengan arsitektur Manager System yang terstruktur dan data berbasis ScriptableObject, sehingga kode mudah dipelihara, diuji, dan dikembangkan lebih lanjut.

#### Acceptance Criteria

1. THE GameManager SHALL bertindak sebagai central coordinator yang mengelola referensi ke semua Manager lain dan mengorkestrasi alur permainan melalui EventSystem.
2. THE GameManager SHALL mengimplementasikan pola Singleton untuk memastikan hanya satu instance aktif per scene.
3. THE EventSystem SHALL mendefinisikan event C# bertipe Action/UnityEvent untuk setiap transisi state signifikan, antara lain:
   - `OnDiceRolled(int die1, int die2)`
   - `OnTokenMoved(int playerIndex, int newTileIndex)`
   - `OnPropertyPurchased(int playerIndex, int tileIndex)`
   - `OnRentPaid(int payerIndex, int receiverIndex, long amount)`
   - `OnCardDrawn(int playerIndex, CardType type, int cardIndex)`
   - `OnPlayerBankrupt(int playerIndex)`
   - `OnGameOver(int winnerIndex)`

4. THE GameManager SHALL memuat data seluruh Properti dari ScriptableObject `PropertyData` yang berisi per entri: `tileIndex`, `cityName`, `provinceName`, `buyPrice`, `rentByLevel[6]`, `houseCost`, `hotelCost`, `colorGroup`, `landmark photo reference`.
5. THE CardManager SHALL memuat data kartu dari ScriptableObject `CardData` yang berisi per entri: `cardId`, `cardName`, `description`, `effectType`, `effectValue`, `illustrationSprite`.
6. THE BoardManager SHALL memuat konfigurasi seluruh tile dari ScriptableObject `TileData` yang berisi per entri: `tileIndex`, `tileType`, `displayName`, `linkedDataIndex`.
7. THE AudioManager SHALL memuat referensi audio dari ScriptableObject `AudioData` yang berisi: `bgmClips[]`, `sfxDiceRoll`, `sfxTokenStep`, `sfxBuy`, `sfxBuild`, `sfxCard`, `sfxRent`, `sfxJail`, `sfxBankrupt`, `sfxWin`.
8. THE UIManager SHALL memuat palet warna dari ScriptableObject `ColorData` yang berisi warna untuk setiap Grup_Warna dan elemen UI.
9. WHEN data dalam ScriptableObject dimodifikasi melalui Unity Inspector, THE GameManager SHALL menerapkan perubahan pada sesi permainan berikutnya tanpa memerlukan recompile kode.
10. THE GameManager SHALL menggunakan namespace `MonopoliNusantara` untuk semua class dalam proyek guna mencegah konflik nama.

---

### Requirement 22: Arsitektur Teknis — Scene Structure

**User Story:** Sebagai developer, saya ingin setiap scene memiliki tanggung jawab yang terdefinisi dengan jelas, sehingga loading scene cepat dan manajemen memori efisien.

#### Acceptance Criteria

1. THE SceneLoader SHALL mengelola 6 scene Unity berikut dengan tanggung jawab masing-masing:
   - `SplashScene`: Menampilkan logo studio dan Monopoli Nusantara branding; auto-transisi ke MainMenuScene setelah 3 detik.
   - `MainMenuScene`: Menampilkan menu utama dengan tombol Mulai Permainan, Lanjutkan, Pengaturan, Credits, Keluar; menginisialisasi AudioManager global.
   - `PlayerSelectionScene`: Menampilkan konfigurasi 4 slot pemain; validasi minimal 1 pemain manusia.
   - `GameplayScene`: Menginisialisasi dan menjalankan seluruh permainan; berisi semua Manager (GameManager, TurnManager, BoardManager, DiceManager, PropertyManager, CardManager, BotManager, UIManager, AudioManager, AnimationManager, SaveManager).
   - `WinnerScene`: Menampilkan hasil akhir permainan; menerima data pemenang via SceneLoader parameter.
   - `CreditsScene`: Menampilkan scrolling credits dengan nama tim dan referensi aset.

2. THE SceneLoader SHALL menggunakan Unity Additive Loading untuk memuat scene transisi ringan tanpa unload scene utama terlebih dahulu.
3. THE GameManager SHALL membebaskan memori dari aset yang tidak diperlukan menggunakan `Resources.UnloadUnusedAssets()` saat perpindahan dari GameplayScene ke WinnerScene.
4. THE SceneLoader SHALL menyimpan data konfigurasi pemain dari PlayerSelectionScene ke `DontDestroyOnLoad` object untuk diakses oleh GameplayScene.


---

### Requirement 23: Performa dan Stabilitas

**User Story:** Sebagai pemain, saya ingin game berjalan lancar tanpa lag atau crash pada PC dengan spesifikasi minimal, sehingga pengalaman bermain tidak terganggu oleh masalah teknis.

#### Acceptance Criteria

1. THE GameManager SHALL mempertahankan frame rate minimal 30 FPS selama sesi permainan berlangsung pada spesifikasi hardware minimum berikut:
   - Prosesor: Intel Core i3-6100 atau AMD Ryzen 3 1200
   - RAM: 4 GB
   - GPU: Intel HD Graphics 530 atau AMD Radeon HD 7750
   - Storage: 500 MB ruang tersedia
   - OS: Windows 10 64-bit

2. THE SceneLoader SHALL menyelesaikan proses pemuatan setiap scene dalam waktu maksimal 5 detik pada spesifikasi minimum.
3. THE GameManager SHALL membatasi object pooling Token dan animasi partikel maksimal 20 instance simultan untuk menjaga konsumsi memori di bawah 300 MB.
4. IF GameManager mendeteksi error kritis yang tidak tertangani (unhandled exception), THEN THE GameManager SHALL mencatat log error ke `Application.persistentDataPath/logs/error_log.txt` dengan timestamp, lalu menampilkan popup "Terjadi kesalahan. Silakan restart aplikasi" dan menutup aplikasi secara aman.
5. THE SaveManager SHALL menangani file I/O error dengan graceful degradation: jika penyimpanan gagal, menampilkan pesan error tanpa crash.
6. THE AudioManager SHALL menangani missing audio file dengan silent fallback tanpa mengganggu gameplay.
7. THE UIManager SHALL menggunakan Unity Canvas Scaler dalam mode "Scale with Screen Size" dengan referensi 1920x1080 untuk mendukung resolusi layar berbeda tanpa distorsi.
8. THE GameManager SHALL melakukan garbage collection manual (`System.GC.Collect()`) setelah scene transition untuk mencegah akumulasi memori berlebihan.

---

### Requirement 24: Accessibility dan Localization

**User Story:** Sebagai pemain, saya ingin game mendukung pilihan bahasa Indonesia dan Inggris, serta memiliki kontrol input yang jelas, sehingga game dapat diakses oleh audiens yang lebih luas.

#### Acceptance Criteria

1. THE UIManager SHALL menyediakan opsi pemilihan bahasa di Settings Screen: Bahasa Indonesia (default) dan English.
2. THE UIManager SHALL menyimpan preferensi bahasa pemain ke SaveManager dan menerapkannya pada semua teks UI setelah restart.
3. THE UIManager SHALL menggunakan Localization Table berbasis Unity Localization Package atau JSON manual yang memuat minimal 200 string teks untuk:
   - Nama kota/provinsi (opsional transliterasi untuk English)
   - Nama kartu dan deskripsi efek kartu
   - Label UI (tombol, menu, dialog)
   - Notifikasi dan log aksi

4. THE UIManager SHALL menampilkan semua teks menggunakan color contrast ratio minimal 4.5:1 untuk keterbacaan sesuai standar WCAG 2.1 Level AA.
5. THE UIManager SHALL menampilkan tooltip atau label alt-text pada setiap tombol dan ikon interaktif untuk memberikan konteks yang jelas.
6. THE GameManager SHALL mendukung kontrol input utama melalui mouse: klik kiri untuk aksi utama, klik kanan untuk membuka context menu (property management), hover untuk tooltip.
7. THE GameManager SHALL memungkinkan input keyboard sebagai shortcut: [Space] untuk lempar dadu, [P] untuk pause, [Esc] untuk kembali/close popup.
8. THE UIManager SHALL menampilkan panduan kontrol singkat di sudut kanan bawah HUD Gameplay yang dapat di-toggle on/off.


---

### Requirement 25: Rencana Pengembangan (Development Plan)

**User Story:** Sebagai tim developer, saya ingin memiliki rencana pengembangan yang terstruktur dalam fase-fase yang jelas, sehingga proyek dapat diselesaikan secara bertahap dengan prioritas yang tepat.

#### Acceptance Criteria

1. THE GameManager SHALL dikembangkan mengikuti 5 fase pengembangan berikut yang terstruktur:

   **Fase 1 — Foundation & Core Architecture (Minggu 1–2):**
   - Setup proyek Unity 6, konfigurasi Package Manager (DOTween, Localization, Input System)
   - Implementasi semua Manager class dengan struktur Singleton
   - Implementasi EventSystem dengan seluruh event delegates
   - Implementasi SceneLoader dengan transisi dasar
   - Pembuatan semua ScriptableObject schema (belum diisi data)
   - Implementasi SaveManager dengan struktur JSON
   - Unit test setiap Manager (inisialisasi, dependency injection)

   **Fase 2 — Board & Core Gameplay (Minggu 3–4):**
   - Implementasi BoardManager: layout 40 tile, kategorisasi, rendering
   - Implementasi DiceManager: RNG, animasi dadu, deteksi Double
   - Implementasi TurnManager: State Machine lengkap, round-robin
   - Implementasi pergerakan Token dengan animasi
   - Pengisian semua data PropertyData ScriptableObject (40 tile, 8 grup warna)
   - Implementasi sistem Properti: beli, sewa dasar
   - Implementasi sistem Pajak dan Tile Sudut_Khusus
   - Implementasi sistem Penjara (masuk dan keluar)
   - Playtest internal: alur giliran dasar

   **Fase 3 — Advanced Mechanics (Minggu 5–6):**
   - Implementasi sistem upgrade Rumah dan Hotel (even build rule)
   - Implementasi sistem Monopoli_Grup dan penggandaan sewa
   - Implementasi sistem Transportasi dengan sewa progresif
   - Implementasi CardManager: shuffle, draw, eksekusi semua 44 efek kartu
   - Pengisian semua CardData ScriptableObject (22 Kesempatan + 22 Dana)
   - Implementasi sistem Bangkrut dan likuidasi aset
   - Implementasi kondisi menang dan kalah
   - Implementasi BotManager: decision tree lengkap

   **Fase 4 — UI/UX, Audio & Visual Polish (Minggu 7–8):**
   - Desain dan implementasi semua layar UI (HUD, popups, menus)
   - Implementasi art direction: color palette, tipografi, ikon flat
   - Implementasi papan bermotif batik, latar peta Indonesia
   - Implementasi semua Token karakter budaya Indonesia
   - Implementasi AudioManager: integrasi semua SFX dan BGM
   - Implementasi AnimationManager: semua animasi (DOTween curves)
   - Implementasi Leaderboard real-time dan log aksi
   - Implementasi Winner Screen dengan animasi selebrasi
   - Implementasi sistem Localization (ID/EN)

   **Fase 5 — Testing, Optimization & Release (Minggu 9–10):**
   - Playtesting menyeluruh dengan semua kombinasi pemain (1P, 2P, 3P, 4P, 4 Bot)
   - Balancing: penyesuaian harga properti dan nilai sewa berdasarkan playtesting
   - Optimasi performa: profiling CPU/GPU/memory, object pooling
   - Bug fixing prioritas tinggi
   - Implementasi error logging dan crash handler
   - Build dan packaging untuk Windows (IL2CPP, 64-bit)
   - Final QA dan release candidate

2. THE GameManager SHALL dibangun menggunakan Unity 6 dengan konfigurasi build target: Windows Standalone x64, Scripting Backend IL2CPP, API Compatibility Level .NET Standard 2.1.
3. THE GameManager SHALL mengimplementasikan semua fitur menggunakan C# dengan konvensi penamaan PascalCase untuk class dan method, camelCase untuk field, prefix `_` untuk private field.
4. THE GameManager SHALL menyertakan XML documentation comments pada semua public method dan property untuk kemudahan pemeliharaan kode.


---

### Requirement 26: Manajemen Properti Lanjutan — Jual dan Hipotek

**User Story:** Sebagai pemain, saya ingin dapat menjual bangunan atau menghipotek properti saat membutuhkan uang tunai, sehingga saya memiliki opsi manajemen finansial untuk menghindari kebangkrutan.

#### Acceptance Criteria

1. THE PropertyManager SHALL memungkinkan Pemain menjual Rumah dari Properti miliknya kapan saja selama gilirannya dengan nilai 50% dari harga beli Rumah.
2. THE PropertyManager SHALL memungkinkan Pemain menjual Hotel dari Properti miliknya kapan saja selama gilirannya; penjualan Hotel menghasilkan nilai Hotel 50% dan mengembalikan 4 Rumah ke Properti jika stok Rumah tersedia, atau menghasilkan nilai Hotel 50% saja jika stok tidak tersedia.
3. THE PropertyManager SHALL memungkinkan Pemain menghipotek Properti atau Transportasi yang tidak memiliki bangunan, dengan nilai hipotek 50% dari harga beli.
4. WHEN Properti atau Transportasi dihipotek, THE PropertyManager SHALL mencatat status hipotek dan menampilkan tanda hipotek visual pada Tile di papan; pemain lain yang berhenti di Tile terhipotek tidak membayar sewa.
5. THE PropertyManager SHALL memungkinkan Pemain menebus Properti atau Transportasi yang dihipotek dengan membayar nilai hipotek ditambah bunga 10% (total 55% dari harga beli).
6. WHEN Properti dalam satu Grup_Warna masih memiliki bangunan, THE UIManager SHALL mencegah Pemain menghipotek Properti lain dalam grup tersebut dan menampilkan pesan "Jual bangunan terlebih dahulu".
7. THE UIManager SHALL menampilkan panel manajemen aset yang dapat diakses dari HUD selama giliran Pemain, memungkinkan jual bangunan atau hipotek tanpa harus berhenti di Tile tertentu.

---

### Requirement 27: Sistem Parkir Bebas

**User Story:** Sebagai pemain, saya ingin Tile Parkir Bebas memberikan pengalaman bermain yang menarik, sehingga ada insentif tambahan dalam perjalanan mengelilingi papan.

#### Acceptance Criteria

1. WHEN Token Pemain berhenti di Tile 20 (Parkir_Bebas), THE GameManager SHALL tidak menerapkan efek apapun (tidak ada pembayaran, tidak ada kartu) — Pemain hanya beristirahat.
2. THE UIManager SHALL menampilkan animasi istirahat singkat pada Token saat berhenti di Parkir_Bebas.
3. THE UIManager SHALL menampilkan notifikasi "Parkir Bebas — Istirahat sebentar!" kepada Pemain saat berhenti di Tile tersebut.

---

### Requirement 28: Konfigurasi Spesifikasi Build

**User Story:** Sebagai developer, saya ingin game dikonfigurasi untuk build Windows yang optimal, sehingga produk akhir dapat didistribusikan kepada pengguna dengan performa terbaik.

#### Acceptance Criteria

1. THE GameManager SHALL dikonfigurasi dalam Unity Build Settings dengan target platform: Windows, architecture: x86_64.
2. THE GameManager SHALL menggunakan Scripting Backend: IL2CPP untuk performa runtime optimal pada Windows.
3. THE GameManager SHALL menggunakan API Compatibility Level: .NET Standard 2.1.
4. THE GameManager SHALL menghasilkan executable dengan ukuran build kurang dari 500 MB setelah kompresi (tidak termasuk aset audio beresolusi tinggi opsional).
5. THE GameManager SHALL memuat resolusi default 1920x1080 Fullscreen saat pertama kali dijalankan, dengan opsi ubah resolusi melalui Unity Launcher atau Settings Screen in-game.
6. THE GameManager SHALL menyimpan PlayerPrefs untuk pengaturan resolusi, fullscreen, dan volume agar preferensi pengguna persisten antar sesi.
7. THE SaveManager SHALL menggunakan `Application.persistentDataPath` sebagai direktori simpanan agar kompatibel dengan Windows user profile (biasanya `C:\Users\[username]\AppData\LocalLow\[CompanyName]\MonopoliNusantara`).


---

### Requirement 29: Sistem Validasi Data dan Integritas Permainan

**User Story:** Sebagai developer, saya ingin sistem memvalidasi konsistensi data permainan secara otomatis, sehingga bug akibat state yang tidak valid dapat dideteksi dan ditangani sejak dini.

#### Acceptance Criteria

1. THE GameManager SHALL memvalidasi state permainan setiap akhir giliran, memastikan:
   - Jumlah total uang di seluruh pemain + uang yang dibayarkan ke Bank = konstanta total uang awal
   - Tidak ada dua Token menempati posisi yang sama kecuali di Tile Penjara (Tile 10)
   - Setiap Properti maksimal dimiliki oleh satu pemain
   - Jumlah Rumah per Properti antara 0–4; Hotel hanya 0 atau 1
   - Pemain yang bangkrut tidak memiliki aset apapun

2. IF validasi menemukan inkonsistensi, THEN THE GameManager SHALL mencatat log error dengan detail state yang tidak valid dan menampilkan notifikasi kepada pemain bahwa data permainan mungkin tidak konsisten.
3. THE SaveManager SHALL memvalidasi semua nilai dalam JSON yang dimuat sebelum menerapkannya, memastikan: saldo tidak negatif saat load, posisi tile dalam rentang 0–39, jumlah bangunan dalam batas maksimal.
4. FOR ALL operasi transaksi keuangan, THE PropertyManager SHALL memastikan jumlah uang yang dikurangi dari satu pihak sama persis dengan jumlah yang ditambahkan ke pihak penerima (tidak ada uang yang hilang dalam transaksi).
5. THE CardManager SHALL memvalidasi bahwa setiap dek kartu memuat jumlah kartu yang benar (22 Kesempatan + 22 Dana) sebelum dek mulai digunakan, dan mengocok ulang secara otomatis jika ditemukan jumlah yang salah.

---

### Requirement 30: Pengujian dan Quality Assurance

**User Story:** Sebagai developer, saya ingin skenario pengujian terdefinisi dengan jelas, sehingga setiap mekanik permainan dapat diverifikasi berfungsi dengan benar sebelum rilis.

#### Acceptance Criteria

1. THE GameManager SHALL mendukung mode "Debug/Cheat Mode" yang hanya aktif saat build Development (bukan Release), menyediakan tombol tersembunyi untuk:
   - Set saldo pemain ke nilai arbitrer
   - Pindahkan Token ke tile manapun
   - Paksa hasil dadu ke nilai tertentu
   - Tambahkan kartu ke inventori pemain

2. THE DiceManager SHALL menyediakan method `SetTestResult(int die1, int die2)` yang dapat dipanggil dari test script untuk memastikan hasil dadu deterministik dalam unit test.
3. THE CardManager SHALL menyediakan method `DrawSpecificCard(CardType type, int cardIndex)` yang dapat dipanggil dari test script untuk memastikan kartu tertentu ditarik dalam integration test.
4. THE GameManager SHALL mencatat riwayat seluruh aksi permainan dalam session ke in-memory log yang dapat diekspor sebagai CSV untuk analisis playtesting.
5. THE GameManager SHALL mendukung skenario pengujian berikut yang harus lulus sebelum rilis:
   - Skenario T01: Permainan 4 AI Bot berjalan hingga selesai tanpa error (stress test 10 kali)
   - Skenario T02: Pemain membeli semua properti satu grup, membangun 4 Rumah lalu Hotel, sewa dihitung benar
   - Skenario T03: Pemain bangkrut karena tidak mampu bayar sewa, aset ditransfer dengan benar
   - Skenario T04: Simpan dan muat permainan, semua state identik sebelum dan sesudah load
   - Skenario T05: Triple double dikirim ke penjara, semua opsi keluar penjara berfungsi
   - Skenario T06: Semua 44 kartu efek dieksekusi tanpa error
   - Skenario T07: Permainan dengan 1 manusia dan 3 bot berjalan hingga selesai

---

## Ringkasan Requirements

| # | Requirement | Prioritas | Fase |
|---|-------------|-----------|------|
| 1 | Alur Scene | Tinggi | 1 |
| 2 | Konfigurasi Pemain & AI Bot | Tinggi | 1 |
| 3 | Desain Papan 40 Tile | Tinggi | 2 |
| 4 | Sistem Properti — Harga & Sewa | Tinggi | 2 |
| 5 | Sistem Dadu | Tinggi | 2 |
| 6 | Sistem Pergerakan Token | Tinggi | 2 |
| 7 | Sistem Transportasi | Tinggi | 3 |
| 8 | Kartu Kesempatan (22 kartu) | Tinggi | 3 |
| 9 | Dana Nusantara (22 kartu) | Tinggi | 3 |
| 10 | Sistem Penjara | Tinggi | 2 |
| 11 | Sistem Pajak | Tinggi | 2 |
| 12 | Sistem Giliran & State Machine | Tinggi | 2 |
| 13 | AI Bot Decision Tree | Tinggi | 3 |
| 14 | Manajemen Bangkrut & Likuidasi | Tinggi | 3 |
| 15 | Kondisi Menang & Kalah | Tinggi | 3 |
| 16 | UI/UX Antarmuka | Tinggi | 4 |
| 17 | Visual & Art Direction | Sedang | 4 |
| 18 | Sistem Audio | Sedang | 4 |
| 19 | Sistem Animasi | Sedang | 4 |
| 20 | Sistem Penyimpanan JSON | Tinggi | 1 |
| 21 | Arsitektur Manager & ScriptableObject | Tinggi | 1 |
| 22 | Arsitektur Scene Structure | Tinggi | 1 |
| 23 | Performa & Stabilitas | Tinggi | 5 |
| 24 | Accessibility & Localization | Sedang | 4 |
| 25 | Rencana Pengembangan | Informasi | — |
| 26 | Jual Bangunan & Hipotek | Sedang | 3 |
| 27 | Sistem Parkir Bebas | Rendah | 2 |
| 28 | Konfigurasi Build | Sedang | 5 |
| 29 | Validasi Data & Integritas | Sedang | 5 |
| 30 | Pengujian & QA | Tinggi | 5 |

**Total: 30 Requirements | 44 Kartu Unik | 40 Tile | 8 Grup Warna | 5 Jenis Transportasi**
