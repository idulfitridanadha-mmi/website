# 🛠️ PANDUAN INSTALASI & STANDARISASI LOKAL (LOCAL SETUP GUIDE)
### *Masjid Manarul Ilmi ITS - Qurban MMI*

Panduan ini disusun untuk memastikan standardisasi lingkungan pengembangan lokal bagi seluruh anggota tim pengembang DevOps Qurban MMI.

---

## 💻 1. Standardisasi Perangkat Lunak (Tools Requirement)

Pastikan perangkat Anda menggunakan versi perkakas berikut demi menjaga kompatibilitas Docker dan runtime di Azure:

*   **Node.js**: **Versi v24.x** (Versi LTS terbaru direkomendasikan).
*   **Git**: Versi 2.40+ (untuk mendukung hook Husky & pre-commit).
*   **Docker**: Docker Desktop (untuk pengemasan container lokal).
*   **Azure CLI**: Versi 2.45+ (untuk konfigurasi slot deployment & auto-swap).

---

## ⚙️ 2. Langkah Instalasi Mandiri

Ikuti urutan instalasi berikut dari direktori utama proyek:

### Langkah A: Instal Dependensi Node
Pasang seluruh pustaka dependensi proyek menggunakan npm:
```bash
npm install
```

### Langkah B: Bangun Prisma Client
Generate kembali artefak Prisma Client agar kueri basis data sinkron dengan skema ORM:
```bash
npx prisma generate
```

### Langkah C: Konfigurasi Variabel Lingkungan (`.env`)
Buat berkas bernama `.env` di direktori utama dan isikan konfigurasi minimum berikut:
```env
# Koneksi Prisma ke Supabase (Transaction Mode port 6543)
DATABASE_URL="postgresql://postgres.azfzd...:password@aws-1-ap...pooler.supabase.com:6543/postgres?pgbouncer=true"

# Koneksi langsung (Session Mode port 5432) untuk keperluan Migrasi
DIRECT_URL="postgresql://postgres.azfzd...:password@aws-1-ap...pooler.supabase.com:5432/postgres"

# Konfigurasi NextAuth & Port
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="pso-ci-cd-azure-website-mmi-local"
WEBSITES_PORT=3000
```

---

## 🧪 3. Mengatasi Isu Uji Coba (`npm test` Blank / Gagal)

Jika Anda atau anggota tim mengalami kegagalan ketika menjalankan pengetesan (misalnya layar pengujian terhenti, blank, atau tidak ada test suite yang berjalan), jalankan urutan pemulihan taktis berikut secara berurutan:

1. **Bersihkan & Instal Ulang Dependensi**:
   ```bash
   npm install
   ```
2. **Paksa Inisialisasi Database ORM**:
   ```bash
   npx prisma generate
   ```
3. **Konfigurasikan Berkas `.env` Lokal**:
   Pastikan variabel `DATABASE_URL` dan `NEXTAUTH_SECRET` sudah terisi dengan benar (seperti pada bagian 2 di atas).
4. **Jalankan Uji Coba dengan Command Khusus**:
   Picu mesin uji otomatis menggunakan perintah pengujian di bawah ini untuk memverifikasi cakupan kode (*code coverage*) menggunakan Jest:
   ```bash
   npm test -- --passWithNoTests
   ```
   *(Jest akan langsung menjalankan seluruh suite pengujian dan merender tabel cakupan kode secara rinci di terminal tanpa macet/blank).*

---

## 🌲 4. Kenalan & Pindah Kapsul Waktu (Branch Management)

Proyek ini menggunakan arsitektur **Parallel Non-Linear Branching** khusus untuk kebutuhan simulasi live demo di depan asdos. Jangan sampai salah kamar ya, gaes! Ini peta jalannya:

### ⏪ 1. Branch Masa Lalu: `archive/before-feature`
* **Apa ini?** Kondisi aplikasi purba sebelum fitur tracking dibikin. Di sini rute `/tracking` masih Error 404 (Kosong murni).
* **Kapan dipakai?** Dipakai di AWAL demo sebagai panggung steril awal sebelum kita melakukan aksi sulap penggabungan kode.
* **Cara pindah ke sini:**
    ```bash
    git checkout archive/before-feature
    ```

### ⏩ 2. Branch Masa Depan: `archive/final-feature`
* **Apa ini?** Kondisi aplikasi masa depan yang udah matang. Fitur tracking udah lengkap 100%, pengaman NextAuth udah aktif, dan 68 unit tests Jest udah PASS semua.
* **Kapan dipakai?** Branch ini dilarang keras buat diutak-atik langsung. Dia cuma bertindak sebagai "sumber fitur" yang bakal kita panggil dan gabungkan ke branch `develop` pas live action di depan asdos.
* **Cara pindah ke sini:**
    ```bash
    git checkout archive/final-feature
    ```

### 🧪 3. Cara Latihan Simulasi Live Demo Mandiri
Kalau kamu mau coba latihan akrobat Gitflow ini sendirian di lokal laptopmu sebelum jam presentasi, ini urutan tombolnya:
```bash
# Ambil data terbaru dari langit
git fetch origin

# Masuk ke ruang develop lokal dan paksa reset ke kondisi purba
git checkout develop
git reset --hard origin/archive/before-feature
git clean -fd

# [AKSI LIVE DEMO] Gabungkan fitur masa depan ke develop!
git merge origin/archive/final-feature --no-ff -m "simulasi: live merge fitur tracking"
# (BOOM! Folder app/tracking langsung auto-muncul tanpa conflict!)
```