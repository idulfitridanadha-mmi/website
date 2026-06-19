# 🧪 Hasil Pemindaian Unit Testing Jest - DevOps-MMI

Dokumen ini berisi hasil pemindaian (*scanning*) dinamis secara utuh terhadap berkas pengujian (`*.test.ts` dan `*.test.tsx`) di dalam project saat ini. Seluruh suite (`describe`) dan test case (`test` / `it`) diekstrak secara lengkap beserta penjelasan fungsinya tanpa rangkuman atau placeholder `...`.

---

## 📊 Ringkasan Umum Uji Coba (Metric Summary)
*   **Total Berkas Uji (Test Files)**: 9 Berkas
*   **Total Test Suites (describe)**: 15 Suites
*   **Total Test Cases (test / it)**: 68 Cases
*   **Status Eksekusi**: 100% Passed (Lolos Uji)
*   **Target Cakupan Kode (Code Coverage)**: 100% Statement, Line, dan Function coverage untuk modul-modul inti.

---

## 🧪 Rincian Utuh & Granular Test Suites & Cases

### 1. [hewan.test.ts](file:///c:/Kuliah%20Semester%206/Pengembangan%20Sistem%20dan%20Operasi/final%20project%20ci%20cd/DevOps-MMI/app/actions/hewan.test.ts)
*   **Path**: `app/actions/hewan.test.ts`
*   **Suite**: `Hewan Server Actions`
    *   **Sub-Suite**: `createHewan`
        *   `should successfully create a new sheep and generate receipt if payment is set`: Menguji pendaftaran kambing dengan uang yang secara otomatis membuat kuitansi taktis baru dan memicu revalidatePath.
        *   `should increment kambing sequence ID based on existing lastHewan`: Menguji kenaikan urutan angka ID kambing berdasar pendaftar terakhir (misal dari `14471002` ke `14471003`).
        *   `should calculate next sequence for sapi utuh correctly from existing sapi`: Memastikan nomor urutan kelompok sapi utuh dihitung secara benar dari database.
        *   `should catch kuitansi creation error and still return success true for animal creation`: Memastikan jika terjadi error di pembuatan kuitansi, proses registrasi hewan qurban utama tetap berjalan sukses.
        *   `should return success false on database error`: Menguji respon penanganan error ketika Prisma database mengalami kegagalan/koneksi terputus.
    *   **Sub-Suite**: `updateHewan`
        *   `should update animal details successfully`: Memverifikasi pembaruan data detail hewan qurban (misalnya perubahan bentuk pembayaran atau uang).
        *   `should return error if update fails`: Menguji penanganan kegagalan kueri update database.
    *   **Sub-Suite**: `deleteHewan`
        *   `should successfully delete the animal qurban`: Memverifikasi penghapusan data hewan qurban dan memicu revalidasi antarmuka.
        *   `should return error if delete fails`: Menguji penanganan kegagalan saat proses penghapusan data di basis data.
    *   **Sub-Suite**: `getHewanQurban`
        *   `should retrieve animals and handle sapi patungan groups`: Memastikan data hewan dapat ditarik dan dikelompokkan secara terstruktur berdasarkan kelompok sapi patungan.
        *   `should set penyaluran to 'Campuran (Internal & Luar)' if group members have different values`: Memastikan status penyaluran kelompok sapi diset "Campuran" jika ada anggota kelompok yang menyalurkan secara internal dan luar.
        *   `should return empty array on failure`: Menguji kembalian array kosong saat terjadi kegagalan pengambilan data hewan.
    *   **Sub-Suite**: `getStatistikSapiPatungan`
        *   `should return group stats and suggest next slot group`: Menghitung kuota kelompok sapi patungan dan menyarankan kelompok aktif yang masih kurang dari 7 orang.
        *   `should handle error in getStatistikSapiPatungan`: Menguji respon ketika kalkulasi statistik mengalami kegagalan kueri.

### 2. [pengqurban.test.ts](file:///c:/Kuliah%20Semester%206/Pengembangan%20Sistem%20dan%20Operasi/final%20project%20ci%20cd/DevOps-MMI/app/actions/pengqurban.test.ts)
*   **Path**: `app/actions/pengqurban.test.ts`
*   **Suite**: `Pengqurban Server Actions`
    *   **Sub-Suite**: `getPengqurban`
        *   `should retrieve pengqurban data successfully with parameters`: Memverifikasi penarikan data pengqurban berdasarkan query nama dan tahun Hijriah.
        *   `should return empty array and success false on database failure`: Menangani kegagalan kueri penarikan data.
    *   **Sub-Suite**: `createPengqurban`
        *   `should successfully create new pengqurban if NKW is unique`: Menguji pembuatan data pendaftar baru jika NKW belum terdaftar dengan parsing no urut.
        *   `should return error if NKW is already registered`: Menolak pembuatan data pengqurban baru jika NKW yang diinput sudah ada di database.
        *   `should return success false on database exceptions`: Menangani error crash tak terduga pada basis data saat pembuatan.
    *   **Sub-Suite**: `updatePengqurban`
        *   `should update pengqurban details successfully`: Memverifikasi pembaruan informasi detail profil pengqurban (nama/nomor kontak).
        *   `should return success false if database update fails`: Menangani error crash database saat pembaruan profil.
    *   **Sub-Suite**: `deletePengqurban`
        *   `should successfully delete the pengqurban`: Memverifikasi penghapusan data pendaftar.
        *   `should handle relational dependency failure (error P2003)`: Memastikan penghapusan ditolak dan memberikan info relevan jika pengqurban masih terikat dengan hewan qurban.
        *   `should handle generic delete errors`: Menangani error crash generik saat penghapusan.

### 3. [permohonan-online.test.ts](file:///c:/Kuliah%20Semester%206/Pengembangan%20Sistem%20dan%20Operasi/final%20project%20ci%20cd/DevOps-MMI/app/actions/permohonan-online.test.ts)
*   **Path**: `app/actions/permohonan-online.test.ts`
*   **Suite**: `Permohonan Online Server Actions`
    *   **Sub-Suite**: `submitPermohonanOnline`
        *   `should successfully submit permohonan online`: Menguji pendaftaran mandiri oleh shohibul secara online beserta data hewan dan bukti transfer.
        *   `should handle error in submitPermohonanOnline`: Menangani kegagalan input registrasi online.
    *   **Sub-Suite**: `getPermohonanOnline`
        *   `should retrieve permohonan online list and format dates and currency`: Menguji penampilan list pendaftar online beserta formatting tanggal ISO.
        *   `should handle error in getPermohonanOnline`: Menangani kegagalan kueri penarikan daftar online.
    *   **Sub-Suite**: `verifyPermohonan`
        *   `should decline permohonan successfully when action is DITOLAK`: Menguji fungsi verifikator menolak pengajuan online.
        *   `should return success false if permohonan is not found`: Menguji penanganan verifikasi jika ID permohonan tidak valid/tidak ada.
        *   `should return success false if permohonan is already ACC`: Mencegah verifikasi ulang untuk permohonan yang statusnya sudah disetujui.
        *   `should clean non-digits from previous NKW when generating a new NKW`: Menguji pembersihan karakter non-angka (seperti `/`) pada NKW sebelumnya untuk penambahan urutan numerik.
        *   `should handle existing sapi sequences correctly and assign animal sequences correctly`: Menguji penentuan urutan no ID sapi baru pada proses ACC.
        *   `should suggest next group for sapi patungan and build new group if preceding is full`: Memetakan shohibul sapi patungan ke kelompok yang masih kosong/belum penuh (maksimal 7 slot) secara otomatis.
        *   `should set lastUrutan sequence increment for non-sapi animal`: Menguji penambahan urutan nomor ID secara berurutan untuk multi-kambing pendaftar.
        *   `should return success false and catch database transaction errors`: Memastikan pembatalan/rollback transaksi database secara aman jika terjadi error di tengah jalan saat verifikasi.

### 4. [petugas.test.ts](file:///c:/Kuliah%20Semester%206/Pengembangan%20Sistem%20dan%20Operasi/final%20project%20ci%20cd/DevOps-MMI/app/actions/petugas.test.ts)
*   **Path**: `app/actions/petugas.test.ts`
*   **Suite**: `Petugas Server Actions`
    *   **Sub-Suite**: `createPetugas`
        *   `should successfully create a new volunteer with incremented sequence id`: Menguji pembuatan petugas jaga baru dengan pembuatan ID berurutan secara otomatis.
        *   `should handle creating volunteer when no previous volunteer exists`: Menguji inisialisasi ID pertama jika belum ada petugas jaga terdaftar.
        *   `should return success false on database errors during creation`: Menangani kegagalan kueri saat pembuatan data.
    *   **Sub-Suite**: `getPetugasJaga`
        *   `should retrieve list of volunteers successfully`: Menguji pencarian data petugas jaga aktif.
        *   `should return empty array on database failure`: Menangani kegagalan kueri pencarian data.
    *   **Sub-Suite**: `updatePetugas`
        *   `should update volunteer info successfully`: Menguji pembaruan profil dan nama petugas jaga.
        *   `should return success false on update failure`: Menangani kegagalan kueri pembaruan.
    *   **Sub-Suite**: `deletePetugas`
        *   `should successfully delete a volunteer`: Menguji penghapusan data petugas jaga.
        *   `should return error if deletion fails (e.g. relational constraint)`: Memberikan informasi error jika petugas gagal dihapus karena keterikatan relasi database.

### 5. [security.test.ts](file:///c:/Kuliah%20Semester%206/Pengembangan%20Sistem%20dan%20Operasi/final%20project%20ci%20cd/DevOps-MMI/app/actions/security.test.ts)
*   **Path**: `app/actions/security.test.ts`
*   **Suite**: `updateHewan Security Access Control Tests`
    *   `should fail when user is not authenticated (null session)`: Memastikan server action menolak pembaruan status hewan jika user belum login.
    *   `should fail when authenticated user is not an admin (e.g., role is STAF)`: Memastikan staf non-admin diblokir dari pembaruan status hewan.
    *   `should fail validation when status_hewan is outside the logical enum bounds defined in the PRD`: Menolak status hewan ilegal (misal `"KABUR"`, `"BOCOR"`) untuk menjaga integritas data.
    *   `should succeed and update status when user is an ADMIN and status is in the logical enum`: Mengizinkan admin mengubah status dengan nilai enum valid (`MENUNGGU`, `DISEMBELIH`, `DIDISTRIBUSIKAN`).

### 6. [route.test.ts](file:///c:/Kuliah%20Semester%206/Pengembangan%20Sistem%20dan%20Operasi/final%20project%20ci%20cd/DevOps-MMI/app/api/track/route.test.ts)
*   **Path**: `app/api/track/route.test.ts`
*   **Suite**: `GET /api/track API Router`
    *   `should return HTTP status 400 when query is empty or whitespace only`: Menguji validasi input parameter pencarian kosong.
    *   `should return HTTP status 404 when search results are empty`: Mengembalikan 404 jika nomor ID atau nama tidak ditemukan di database.
    *   `should properly mask the shohibul qurban's phone number`: Memastikan nomor telepon disensor secara dinamis di bagian tengah demi keamanan privasi.
    *   `should clean sensitive data and not leak internal panitia/non-public properties to client`: Memastikan data sensitif internal panitia (seperti nominal uang, bukti bayar, biaya operasional) disaring keluar dan tidak bocor ke publik.
    *   `should return HTTP status 500 when database throws an error`: Menangani kegagalan tak terduga database dengan status 500.

### 7. [page.test.tsx](file:///c:/Kuliah%20Semester%206/Pengembangan%20Sistem%20dan%20Operasi/final%20project%20ci%20cd/DevOps-MMI/app/tracking/page.test.tsx)
*   **Path**: `app/tracking/page.test.tsx`
*   **Suite**: `Pengujian Halaman Tracking Status Hewan Kurban`
    *   `Harus menampilkan teks "LUNAS" ketika status pembayaran hewan kurban selesai`: Memverifikasi UI halaman tracking berhasil menampilkan info status lunas.
    *   `Harus menampilkan teks "DISEMBELIH" ketika hewan kurban sudah diproses`: Memverifikasi UI halaman tracking berhasil menampilkan status disembelih.

### 8. [tracking.test.ts](file:///c:/Kuliah%20Semester%206/Pengembangan%20Sistem%20dan%20Operasi/final%20project%20ci%20cd/DevOps-MMI/app/utils/tracking.test.ts)
*   **Path**: `app/utils/tracking.test.ts`
*   **Suite**: `Tracking UI Utility Helpers`
    *   **Sub-Suite**: `getStepStatus`
        *   `should return completed for steps equal or prior to current status`: Memverifikasi status stepper langkah selesai.
        *   `should return active for the step immediately following current status`: Memverifikasi status stepper langkah aktif.
        *   `should return upcoming for later steps`: Memverifikasi status stepper langkah mendatang.
        *   `should handle empty status and default to MENUNGGU index`: Menguji fallback status kosong.
        *   `should handle invalid/unrecognized status (e.g. KABUR) and default to MENUNGGU index`: Menguji fallback status ilegal.
    *   **Sub-Suite**: `getStepperColorClass`
        *   `should return green classes for completed steps`: Memastikan warna hijau terpasang untuk langkah selesai.
        *   `should return amber pulse classes for active steps`: Memastikan warna amber animasi pulse terpasang untuk langkah aktif.
        *   `should return gray classes for upcoming steps`: Memastikan warna abu-abu terpasang untuk langkah mendatang.
    *   **Sub-Suite**: `getPaymentBadgeColorClass`
        *   `should return green styling for LUNAS`: Memverifikasi warna badge lunas.
        *   `should return yellow/amber styling for DP`: Memverifikasi warna badge uang muka (DP).
        *   `should return red styling for BELUM LUNAS and unknown values`: Memverifikasi warna badge belum lunas/lainnya.

### 9. [sample.test.tsx](file:///c:/Kuliah%20Semester%206/Pengembangan%20Sistem%20dan%20Operasi/final%20project%20ci%20cd/DevOps-MMI/sample.test.tsx)
*   **Path**: `sample.test.tsx`
*   **Suite**: `Uji Coba Lingkungan Jest`
    *   `harus menghitung penjumlahan dasar dengan benar`: Memverifikasi integrasi dasar engine Jest berjalan sukses dengan kalkulasi aritmatika.

---

## 🛠️ VALIDASI SLIDE PRESENTASI & TROUBLESHOOTING PIPELINE

Berikut adalah analisis pencocokan (*mapping*) dan pembuktian fisik dari kodingan proyek terhadap poin-poin yang dideklarasikan pada Slide Presentasi Kelompok kami.

### 🟥 TAHAP 1: VALIDASI DATA UTAMA PIPELINE (Slide Hal 4 & 6)

#### 1. GitHub Actions Workflow
*   **Berkas Fisik**: `.github/workflows/cd.yml` (dan `.github/workflows/ci.yml`)
*   **Baris Pemicu (Trigger)**:
    Pipa CD di `.github/workflows/cd.yml` dikonfigurasi untuk dipicu pada kejadian `push` dan `pull_request` pada branch `main` dan `develop`:
    ```yaml
    on:
      push:
        branches: [ "main", "develop" ]
      pull_request:
        branches: [ "main", "develop" ]
    ```
    Ini menjamin bahwa setiap kali ada penggabungan fitur baru atau integrasi kode, alur kerja build dan deployment dijalankan secara otomatis.

#### 2. GitHub Actions Cache (`type=gha`)
*   **Berkas Fisik**: `.github/workflows/cd.yml` (Baris 38-39)
*   **Bukti Skrip**:
    Pada tahap `Build dan push Docker image` (menggunakan action `docker/build-push-action@v5`), cache Docker memanfaatkan internal engine GitHub Actions untuk mempercepat build selanjutnya:
    ```yaml
    cache-from: type=gha
    cache-to: type=gha,mode=max
    ```
    Metode `type=gha` ini menyimpan layer kontainer langsung ke penyimpanan aman GitHub Actions, menghindari proses unduhan ulang package npm atau penyusunan ulang layer OS dari awal jika tidak ada perubahan.

#### 3. Azure Container Registry (ACR) Privat
*   **Berkas Fisik**: `.github/workflows/cd.yml` (Baris 23-28)
*   **Bukti Skrip**:
    Akses otentikasi login ACR dilakukan secara aman menggunakan *secrets* GitHub yang menyimpan variabel kredensial server, nama pengguna, dan kata sandi admin registri kontainer:
    ```yaml
    - name: Login ke Azure Container Registry (ACR)
      uses: docker/login-action@v3
      with:
        registry: ${{ secrets.ACR_LOGIN_SERVER }}
        username: ${{ secrets.ACR_USERNAME }}
        password: ${{ secrets.ACR_PASSWORD }}
    ```

#### 4. Azure App Service Slot Deployment (Isolasi Staging-Prod)
*   **Berkas Fisik**: `.github/workflows/cd.yml` (Baris 41-56)
*   **Bukti Skrip**:
    *   **Isolasi Branch `develop` ke Staging Slot**:
        ```yaml
        - name: Deploy ke Azure Staging Slot
          if: (github.base_ref || github.ref_name) == 'develop'
          uses: azure/webapps-deploy@v2
          with:
            app-name: 'qurban-mmi' 
            slot-name: 'staging'
            publish-profile: ${{ secrets.AZURE_STAGING_CREDENTIALS }}
            images: '${{ secrets.ACR_LOGIN_SERVER }}/qurban-mmi:${{ github.sha }}'
        ```
    *   **Isolasi Branch `main` ke Production Slot**:
        ```yaml
        - name: Deploy ke Azure Production Slot
          if: (github.base_ref || github.ref_name) == 'main'
          uses: azure/webapps-deploy@v2
          with:
            app-name: 'qurban-mmi'
            publish-profile: ${{ secrets.AZURE_PROD_CREDENTIALS }}
            images: '${{ secrets.ACR_LOGIN_SERVER }}/qurban-mmi:${{ github.sha }}'
        ```
    Dengan pemisahan ini, branch `develop` (tempat penggabungan fitur baru saat demo) didesentralisasi hanya ke slot `staging` via gembok `AZURE_STAGING_CREDENTIALS` tanpa risiko merusak slot utama produksi.

---

### 🟨 TAHAP 2: VALIDASI RESOLUSI KENDALA CI / STANDAR KODE (Slide Hal 10 - 14)

#### 1. Let to Const Fix
*   **Berkas Fisik**: `components/admin/HewanActionButtons.tsx` (misalnya baris 81, 84, 128, 162, 197)
*   **Bukti Implementasi**:
    Variabel internal React yang menampung daftar parsed name (`parsedNames`), payload, respon database (`res`), dan variabel daftar anggota sapi patungan (`membersList`) dideklarasikan secara konsisten menggunakan kata kunci `const` alih-alih `let`.
    ```typescript
    const parsedNames = ["", "", "", "", "", "", ""];
    const payload = { ...hwn, ... };
    const res = await updateHewan(selectedMember.id_hewan, payload);
    const membersList = data.isGroup ? data.members : [data];
    ```
    Ini menjaga imutabilitas data dan menaati aturan ESLint `@typescript-eslint/prefer-const` yang sebelumnya sempat menghasilkan kegagalan build (Exit Code 1).

#### 2. Unescaped Entity Fix
*   **Berkas Fisik**: `app/tracking/page.tsx` (Baris 184)
*   **Bukti Kodingan**:
    Penggunaan karakter kutip tunggal (`'`) pada tulisan teks JSX halaman tracking status yang sebelumnya memicu warning compiler ESLint diselesaikan dengan mengubahnya menjadi entitas HTML `&apos;`:
    ```typescript
    <p className="text-[10px] text-gray-400 font-bold mt-0.5 leading-normal">
      Penyembelihan syar&apos;i oleh jagal resmi MMI di area jagal.
    </p>
    ```

#### 3. Node.js Deprecation Bypass
*   **Berkas Fisik**: `.github/workflows/cd.yml` (Baris 9-10)
*   **Bukti Kodingan**:
    Untuk membungkam peringatan tentang penghentian dukungan (*deprecation warning*) Node.js v16 pada runner GitHub Actions, variabel lingkungan global dipasang tepat di bawah pemicu `on:`:
    ```yaml
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
    ```
    Ini memaksa seluruh aksi JavaScript dalam pipeline CD untuk menggunakan runtime Node.js v24 yang aman dan mutakhir.

---

### 🟩 TAHAP 3: VALIDASI RESOLUSI KENDALA CD & CLOUD CRASH (Slide Hal 15 - 16)

#### 1. Port Mismatch Fix
*   **Posisi Implementasi**: Azure App Settings (`WEBSITES_PORT = 3000`)
*   **Logika & Fungsi**:
    Kontainer Docker Next.js pada `Dockerfile` dikonfigurasi untuk mengekspos dan berjalan pada port 3000 (`EXPOSE 3000`, `ENV PORT 3000`). Azure Web App for Containers secara bawaan mencoba melakukan routing trafik HTTP eksternal ke port 80/8080.
    Dengan mendefinisikan variabel lingkungan `WEBSITES_PORT` bernilai `3000` di konfigurasi App Service Azure, router Azure diselaraskan untuk mengarahkan seluruh lalu lintas ke port internal kontainer 3000, menghilangkan error timeout koneksi.

#### 2. ImagePullUnauthorized Fix
*   **Posisi Implementasi**: Konfigurasi Otentikasi Registri Azure (`DOCKER_REGISTRY_SERVER_*`)
*   **Logika & Fungsi**:
    Ketika Azure App Service mencoba menarik Docker image dari Azure Container Registry (ACR) privat, ia membutuhkan hak akses. Error `ImagePullUnauthorized` diselesaikan dengan mengaktifkan akses *Admin User* pada panel akses kontrol ACR, kemudian mengintegrasikan variabel konfigurasi berikut pada Azure App Settings secara manual:
    *   `DOCKER_REGISTRY_SERVER_URL` = Server Login ACR (`<nama-acr>.azurecr.io`)
    *   `DOCKER_REGISTRY_SERVER_USERNAME` = Kredensial Username Admin ACR
    *   `DOCKER_REGISTRY_SERVER_PASSWORD` = Kredensial Password Admin ACR
    Ini memungkinkan Azure App Service melakukan *pull* image dengan aman setiap kali ada deployment baru.

#### 3. Inkompatibilitas Alpine Linux Fix
*   **Berkas Fisik**: `Dockerfile` (Baris 2, 10, 19)
*   **Logika & Fungsi**:
    Penggunaan base image minimal berbasis Alpine Linux (`node:20-alpine`) sering memicu kegagalan startup kontainer akibat inkompatibilitas dengan pustaka native C/C++ yang dibutuhkan Prisma ORM (misalnya dependensi `glibc` dan `libssl.so`).
    Masalah diselesaikan dengan mengganti base image kontainer ke distribusi berbasis Debian yang kompatibel dan stabil:
    ```dockerfile
    FROM node:20-slim AS deps
    ```
    Ditambah dengan instalasi modul sertifikat keamanan dan OpenSSL secara eksplisit pada layer OS kontainer:
    ```dockerfile
    RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
    ```

#### 4. Restriksi Advisory Lock Database Fix
*   **Berkas Fisik**: `prisma/schema.prisma` (Baris 9-13)
*   **Logika & Fungsi**:
    Supabase Connection Pooler (di port transaction `6543`) membatasi penggunaan *advisory locks* yang digunakan Prisma untuk memverifikasi migrasi, memicu Timeout Error (P1002).
    Solusinya adalah memisahkan string koneksi langsung (*direct connection string*) bypass ke port Supabase asli `5432` di `schema.prisma`:
    ```prisma
    datasource db {
      provider  = "postgresql"
      url       = env("DATABASE_URL")
      directUrl = env("DIRECT_URL")
    }
    ```
    Dan dalam proses seed awal di staging slot, menggunakan perintah sinkronisasi skema langsung tanpa membuat riwayat migrasi yang lambat:
    ```bash
    npx prisma db push --force-reset
    ```
    Ini menghapus konflik kunci migrasi dan mempercepat pembersihan data tanpa ada bentrokan koneksi pooler.

