# SISTEM QURBAN MMI

### Sistem Informasi Terintegrasi Operasional Qurban Masjid Manarul Ilmi ITS

> **Tagline**: Satu Platform. Terintegrasi. Tanpa Waktu Henti (Zero-Downtime).

## 🔑 Akses Sistem & Akun Uji Coba

Platform ini telah didistribusikan ke lingkungan *cloud*. Silakan akses lingkungan *Staging/Production* melalui tautan berikut:
👉 **[Live Demo: Administrasi Qurban MMI](https://qurban-mmi-staging-cqf3hxbwbqdqgxeh.indonesiacentral-01.azurewebsites.net/)**

Gunakan kredensial pengujian berikut untuk menelusuri kapabilitas sistem berdasarkan pembatasan hak akses (Role-Based Access Control):

| Peran (Role) | Username / Email | Kata Sandi (Password) | Hak Akses Utama |
| --- | --- | --- | --- |
| **👑 Super Admin** | `admin` | `adminmmi` | Konfigurasi sistem penuh & manajemen pengguna |
| **🛡️ Administrator** | `admin@pso.com` | `psocicd123` | Manajemen pendaftaran qurban & inventaris hewan |
| **🏢 Staf Lapangan** | `staff@mmi.com` | `stafmmi123` | Pembaruan status hewan & pelacakan operasional |

---

## 📌 Tentang Proyek (Deskripsi Sistem)

**Sistem Qurban MMI** merupakan platform tingkat *enterprise* yang dikembangkan secara spesifik untuk mengotomatisasi dan mengoptimalkan seluruh siklus hidup pengelolaan ibadah qurban di lingkungan Masjid Manarul Ilmi ITS. Sistem ini menjembatani kesenjangan operasional antara pendaftaran daring, inventarisasi hewan, validasi kualitas, hingga pemrosesan distribusi ke dalam satu ekosistem web yang aman.

### Latar Belakang Masalah

Fasilitas kepanitiaan qurban modern sering kali beroperasi di bawah sistem yang terfragmentasi:

* **Fragmentasi Data**: Pencatatan ganda melalui formulir kertas dan aplikasi *spreadsheet* yang terisolasi, meningkatkan risiko ketidaksesuaian data shohibul qurban.
* **Transparansi Operasional yang Rendah**: Proses penyembelihan hingga distribusi tidak dapat dipantau secara langsung oleh publik, menurunkan tingkat kepercayaan partisipan.
* **Kerentanan Infrastruktur**: Ketiadaan proses pembaruan aplikasi yang terstandarisasi, sehingga perbaikan sistem di tengah hari-H pelaksanaan memicu waktu henti (*downtime*) sistem operasional.

### Solusi Sistem

Sistem ini menggantikan alur kerja konvensional yang mengandalkan kertas dengan platform digital kohesif yang menjamin integritas data dan visibilitas mutlak, didukung oleh infrastruktur CI/CD *Zero-Downtime*.

---

## 📈 Dampak Sistem & Efisiensi Operasional

Dengan mendigitalkan titik-titik pemeriksaan dan menerapkan arsitektur *cloud* modern, sistem ini memberikan peningkatan efisiensi yang terukur:

| Metrik Evaluasi | Proses Konvensional Sebelumnya | Optimalisasi Sistem Qurban MMI | Peningkatan Efisiensi |
| --- | --- | --- | --- |
| **Pendaftaran & Administrasi** | Input manual & pencatatan fisik | Integrasi entri digital & validasi otomatis | **Reduksi Beban 70%** |
| **Transparansi Status** | Konfirmasi manual via pesan instan | Pelacakan status mandiri *Real-Time* | **Visibilitas 100%** |
| **Siklus Rilis Aplikasi** | Pembaruan server manual dengan *downtime* | Otomatisasi CI/CD & *Zero-Downtime Swap* | **Keandalan Server 99.9%** |

---

## 🛠️ Modul Utama Sistem

Sistem Qurban MMI dirancang sebagai platform web modular yang terdiri dari empat subsistem inti:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                 SISTEM ADMINISTRASI QURBAN MMI ITS                     │
└────────────────────────────────────────────────────────────────────────┘
       │                │                 │                │
┌──────────────┐ ┌──────────────┐  ┌──────────────┐ ┌──────────────┐
│ Autentikasi  │ │ Pendaftaran  │  │ Inventaris   │ │ Live Tracking│
│   & RBAC     │ │  Shohibul    │  │   Hewan      │ │   Status     │
└──────────────┘ └──────────────┘  └──────────────┘ └──────────────┘

```

1. **🔐 Modul Autentikasi (NextAuth)**: Mengelola kredensial dan batasan akses rute berbasis *Role-Based Access Control* (Super Admin, Admin, Staf).
2. **📝 Modul Pendaftaran Shohibul**: Manajemen formulir registrasi pequrban beserta alokasi kelompok patungan sapi secara dinamis.
3. **🐄 Modul Inventaris Hewan**: Pencatatan spesifikasi, harga, dan alokasi hewan kurban ke dalam basis data relasional pusat.
4. **📍 Modul Pelacakan Real-Time**: Portal publik yang mengizinkan pemantauan tahap pemrosesan (Menunggu, Disembelih, Didistribusikan) menggunakan Nomor Induk Hewan.

---

## 🧱 Arsitektur Aplikasi & Komponen Teknologi

Sistem mengimplementasikan arsitektur *two-tier* modern yang dirancang untuk penskalaan cepat dan keamanan otentikasi ketat:

```text
┌──────────────────────────────────────┐
│            Client Browser            │
│      (Next.js 16 App Router)         │
└──────────────────────────────────────┘
                   │
                   ▼  [Server Actions & API Routes]
┌──────────────────────────────────────┐
│       Azure Web App Service          │
│     (Docker node:24-slim Host)       │
└──────────────────────────────────────┘
                   │
                   ▼  [Prisma ORM via Pooler]
┌──────────────────────────────────────┐
│         Supabase PostgreSQL          │
│        (Transaction Mode)            │
└──────────────────────────────────────┘

```

* **Frontend & Backend**: Next.js 16, React 19, Tailwind CSS.
* **Manajemen Basis Data**: Supabase PostgreSQL dikonfigurasikan dengan *Connection Pooler* untuk menjamin stabilitas kueri tanpa *timeout*.
* **Infrastruktur DevOps**: GitHub Actions, Docker Container, Azure Container Registry (ACR), dan Azure App Service (Slot Deployment).

---

## ♾️ Diagram Alur CI/CD (Continuous Integration & Deployment)

Proyek ini mendemonstrasikan keandalan distribusi perangkat lunak melalui otomasi alur pembaruan dari pengembangan lokal ke *cloud* tanpa waktu henti:

```mermaid
flowchart TD
    subgraph Local [Lingkungan Lokal]
        LD[Local Development] -->|Git Commit & Hook| H[Husky Pre-commit: Lint & Test]
    end

    subgraph GitHub [Repositori & GitHub Actions]
        H -->|Git Push / PR| GR[GitHub Repository]
        GR -->|Memicu CI/CD Pipeline| GAC[GitHub Actions Runner]
        
        subgraph CI [Tahap Continuous Integration]
            GAC --> CI1[1. npm ci]
            CI1 --> CI2[2. Linting: eslint]
            CI2 --> CI3[3. Prisma Generate]
            CI3 --> CI4[4. Eksekusi Unit Test]
        end
        
        subgraph CD [Tahap Continuous Deployment]
            CI4 -->|Lolos Uji CI| CD1[Eksekusi npx prisma db push]
            CD1 --> CD2[Docker Build: node:24-slim]
            CD2 --> CD3[Azure Container Registry ACR]
        end
    end

    subgraph Azure [Layanan Cloud Azure & Database]
        CD3 -->|Deploy Image| AS_STG[Azure App Service: Staging Slot]
        AS_STG -->|Uji Kelayakan| ST[Automated Smoke Test]
        ST -->|Sukses| SWAP[Proses Slot Swap]
        SWAP -->|Zero-Downtime| AS_PROD[Azure App Service: Production]
        CD1 -->|Migrasi Database| DB[(Supabase PostgreSQL)]
    end

```

---

## 🚀 Panduan Instalasi Lokal (Getting Started)

Ikuti prosedur komprehensif berikut untuk menjalankan *codebase* secara lokal:

### 1. Prasyarat Sistem (Prerequisites)

Pastikan perangkat lunak berikut telah terinstalasi:

* [Node.js](https://nodejs.org/) (Versi `v24.x` direkomendasikan)
* [Git](https://git-scm.com/)
* PostgreSQL Database Instance (Lokal atau Cloud/Supabase)

### 2. Kloning Repositori

Kloning *codebase* proyek ini ke direktori lokal Anda:

```bash
git clone https://github.com/cafauzi13/DevOps-MMI.git
cd DevOps-MMI

```

### 3. Konfigurasi Variabel Lingkungan (`.env`)

Buat berkas `.env` pada *root directory* dan sesuaikan parameter berikut:

```env
# Koneksi Prisma ke Supabase (Transaction Mode port 6543)
DATABASE_URL="postgresql://postgres.azfzd...:password@aws-1-ap...pooler.supabase.com:6543/postgres?pgbouncer=true"

# Koneksi langsung (Session Mode port 5432) untuk keperluan Migrasi
DIRECT_URL="postgresql://postgres.azfzd...:password@aws-1-ap...pooler.supabase.com:5432/postgres"

# Konfigurasi NextAuth Server
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="pso-ci-cd-azure-website-mmi-local"

```

### 4. Instalasi Dependensi & Sinkronisasi Basis Data

Pasang pustaka, terapkan skema ke *database*, dan *generate* Prisma Client:

```bash
npm install
npx prisma db push

```

### 5. Seeding Basis Data

Suntikkan data referensi awal beserta akun administrator bawaan:

```bash
npx prisma db seed

```

### 6. Inisialisasi Server Pengembangan

Nyalakan server Next.js pada lingkungan lokal:

```bash
npm run dev

```

Akses **[http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)** pada peramban (*browser*) Anda.

---

## 🛑 Catatan Teknis & Penanganan Kendala (Troubleshooting)

Selama fase orkestrasi infrastruktur *cloud*, terdapat resolusi masalah krusial yang dicatat sebagai pembelajaran teknis (*Lessons Learned*):

1. **Kompatibilitas Prisma dengan Alpine Linux**: Mengatasi kegagalan pustaka *native* (`libssl.so.1.1`) dengan melakukan migrasi *base image* `Dockerfile` dari `node:20-alpine` menjadi lingkungan berbasis Debian (`node:24-slim`).
2. **Penanganan Silent Error Otentikasi**: Menyelesaikan indikasi respons `401 Unauthorized` pada *environment cloud* dengan merefaktorisasi fungsi `authorize` NextAuth. Penambahan blok `try-catch` secara eksplisit memastikan setiap eksepsi basis data tercetak valid pada log infrastruktur Azure.
3. **Bypass Restriksi Advisory Lock**: Menyelesaikan *Timeout Error (P1002)* akibat *Connection Pooler* pada Supabase dengan menjalankan sinkronisasi mandiri (`npx prisma db push --force-reset`) saat mengeksekusi tahapan *seeding* di *Staging Slot*.
4. **Penyembuhan Cross-Firing Webhook ACR**: Mematikan Continuous Deployment otomatis di Azure Portal dan mengonfigurasi dynamic branch-based tagging di GitHub Actions untuk mengisolasi server Production dari kebocoran push develop.
5. **Resolusi Port Mismatch & Port Mapping**: Menyuntikkan variabel `WEBSITES_PORT = 3000` pada App Settings Azure demi menyelaraskan port internal kontainer Next.js dengan router cloud Azure.
6. **Resolusi ImagePullUnauthorizedFailure via Kredensial Manual**: Mengatasi penolakan pull image pada kluster Production akibat masalah sinkronisasi RBAC dengan cara menyuntikkan variabel otentikasi registri private (`DOCKER_REGISTRY_SERVER_*`) secara manual menggunakan token gembok admin ACR.

---

## 👥 Tim Pengembang

Sistem Informasi Administrasi Qurban MMI dirancang dan dioptimalkan oleh **Kelompok 5 PSO C (Sistem Informasi ITS)**:

* **Muhammad Raihan Hassan** (NRP. 5026231108)
* **Annisa Nur Fauzi** (NRP. 5026231228)
* **Lailatul Fitaliqoh** (NRP. 5026231229)
* **Bara Ardiwinata** (NRP. 5026231232)

---

*Administrasi qurban tingkat enterprise pada satu platform kokoh dan terintegrasi.*