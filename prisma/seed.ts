import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/id_ID';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Menghapus data lama dari seluruh tabel basis data (Clean DB)...');

  // Urutan penghapusan untuk menghindari pelanggaran Foreign Key Constraints
  await prisma.kuitansiTaktisDetail.deleteMany({});
  await prisma.kuitansiTaktis.deleteMany({});
  await prisma.hewanQurban.deleteMany({});
  await prisma.sapiTerpisah.deleteMany({});
  await prisma.pengqurban.deleteMany({});
  await prisma.setorPetugasJaga.deleteMany({});
  await prisma.petugasJaga.deleteMany({});
  await prisma.permohonan.deleteMany({});
  await prisma.permohonanOnline.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Basis data telah dibersihkan secara aman.');
  console.log('🚀 Memulai pembuatan 50 Data Dummy Terintegrasi per Entitas dengan format spesifik...');

  // =========================================
  // 1. SEEDING PETUGAS JAGA (50 DATA)
  // =========================================
  const petugasJagaList: any[] = [];
  for (let i = 1; i <= 50; i++) {
    const idLama = `PETUGAS-${1000 + i}`;
    const petugas = await prisma.petugasJaga.create({
      data: {
        id_lama: idLama,
        nama: faker.person.fullName().toUpperCase(),
        no_hp: faker.phone.number({ style: 'national' }),
      }
    });
    petugasJagaList.push(petugas);
  }
  console.log('✅ Berhasil men-generate 50 Petugas Jaga.');

  // =========================================
  // 2. SEEDING PENGQURBAN (50 DATA)
  // =========================================
  const pengqurbanList: any[] = [];
  const wilayahCodes = ["ITS", "ITSA", "ITSB", "ITSC", "ITSD", "ITSE", "ITSF", "ITSG", "ITSH", "ITSI", "ITSJ", "ITSK", "ITSL", "ITSM", "ITSN", "ITSO", "ITSP", "ITSQ", "ITSR", "ITSS", "ITST", "ITSU", "ITSV", "ITSW", "ITSX", "LUAR"];
  
  for (let i = 1; i <= 50; i++) {
    // FORMAT NKW: [4 digit Tahun Hijriah: 1446 atau 1447] + [3 digit Nomor Urut]
    const tahunHijriah = Math.random() > 0.5 ? "1446" : "1447";
    const noUrutStr = String(i).padStart(3, '0');
    const nkw = `${tahunHijriah}${noUrutStr}`; // Cth: 1447012

    const randomPetugas = petugasJagaList[Math.floor(Math.random() * petugasJagaList.length)];
    const isMale = Math.random() > 0.5;
    
    const pengqurban = await prisma.pengqurban.create({
      data: {
        nkw: nkw,
        tanggal: faker.date.recent({ days: 30 }),
        nama_lengkap: faker.person.fullName({ sex: isMale ? 'male' : 'female' }).toUpperCase(),
        jenis_kelamin: isMale ? 'L' : 'P',
        kd_wilayah: wilayahCodes[Math.floor(Math.random() * wilayahCodes.length)],
        no_urut: i,
        alamat: faker.location.streetAddress(true).toUpperCase(),
        telepon: faker.phone.number({ style: 'national' }),
        id_petugas: randomPetugas.id_petugas,
      }
    });
    pengqurbanList.push(pengqurban);
  }
  console.log('✅ Berhasil men-generate 50 Pengqurban dengan format NKW 7-digit.');

  // =========================================
  // 3. SEEDING PERMOHONAN (INSTANSI/PROPOSAL) (50 DATA)
  // =========================================
  const permohonanList: any[] = [];
  for (let i = 1; i <= 50; i++) {
    const noIdSurat = `SURAT-${3000 + i}`;
    const permohonan = await prisma.permohonan.create({
      data: {
        no_id_surat: noIdSurat,
        tanggal: faker.date.recent({ days: 45 }),
        nomor_surat: `050/MMI-ITS/VI/${2026 + i}`,
        nama_pemohon: `YAYASAN / MASJID ${faker.company.name().toUpperCase()}`,
        alamat_pemohon: faker.location.streetAddress().toUpperCase(),
        kota_pemohon: faker.location.city().toUpperCase(),
        no_kontak: faker.phone.number({ style: 'national' }),
        penanggung_jawab: faker.person.fullName().toUpperCase(),
        no_rek: faker.finance.accountNumber(),
        bank: 'BANK SYARIAH INDONESIA (BSI)',
        atas_nama: faker.person.fullName().toUpperCase(),
      }
    });
    permohonanList.push(permohonan);
  }
  console.log('✅ Berhasil men-generate 50 Permohonan Instansi.');

  // =========================================
  // 4. SEEDING HEWAN QURBAN (50 DATA - FORMAT ID HEWAN 8-DIGIT)
  // =========================================
  const metodeBayarOpsi = ["TUNAI", "TRANSFER"];
  const statusBayarOpsi = ["LUNAS", "DP", "BELUM LUNAS"];
  const statusHewanOpsi = ["MENUNGGU", "DISEMBELIH", "DIDISTRIBUSIKAN"];
  const bentukOpsi = ["UANG", "HEWAN"];
  const penyaluranOpsi = ["DALAM", "LUAR"];
  
  for (let i = 1; i <= 50; i++) {
    const randomPengqurban = pengqurbanList[Math.floor(Math.random() * pengqurbanList.length)];
    const randomPermohonan = permohonanList[Math.floor(Math.random() * permohonanList.length)];
    
    // Tarik tahun Hijriah dari NKW pengqurban yang terhubung
    const tahunHijriah = randomPengqurban.nkw.substring(0, 4);
    const jenisQurban = ["1", "2", "3"][Math.floor(Math.random() * 3)]; // 1=Kambing, 2=Sapi Utuh, 3=Sapi Patungan
    const noUrutStr = String(i).padStart(3, '0');
    
    // FORMAT ID HEWAN: [4 digit Tahun Hijriah] + [1 digit Kode Jenis Qurban (1,2,3)] + [3 digit Nomor Urut]
    const noIdLama = `${tahunHijriah}${jenisQurban}${noUrutStr}`; // Cth: 14472007

    const bentuk = bentukOpsi[Math.floor(Math.random() * bentukOpsi.length)];
    const penyaluran = penyaluranOpsi[Math.floor(Math.random() * penyaluranOpsi.length)];
    
    // Hitung nominal harga qurban sesuai bentuk & jenis
    let uang = 0;
    if (bentuk === "UANG") {
      if (jenisQurban === "1" || jenisQurban === "3") uang = 4000000;
      if (jenisQurban === "2") uang = 28000000;
    } else {
      uang = jenisQurban === "1" ? 150000 : 1000000; // Operasional jika bawa hewan hidup
    }

    // Nama shohibul sapi patungan (jika jenis sapi utuh)
    let namaShohibulSapi = null;
    if (jenisQurban === "2") {
      const names = Array.from({ length: 7 }, () => faker.person.fullName().toUpperCase());
      namaShohibulSapi = JSON.stringify(names);
    }

    await prisma.hewanQurban.create({
      data: {
        no_id_lama: noIdLama,
        nkw_pengqurban: randomPengqurban.nkw,
        jenis_qurban: jenisQurban,
        bentuk: bentuk,
        uang: uang,
        nama_shohibul_sapi: namaShohibulSapi,
        biaya_operasional: bentuk === "HEWAN" ? (jenisQurban === "1" ? 150000 : 1000000) : 100000,
        pindah_sapi: Math.random() > 0.8,
        penyaluran_luar: penyaluran === "LUAR",
        metode_bayar: metodeBayarOpsi[Math.floor(Math.random() * metodeBayarOpsi.length)],
        status_bayar: statusBayarOpsi[Math.floor(Math.random() * statusBayarOpsi.length)],
        status_hewan: statusHewanOpsi[Math.floor(Math.random() * statusHewanOpsi.length)],
        penyembelihan: "AREA UTAMA MMI",
        melihat: Math.random() > 0.5,
        menyembelih: Math.random() > 0.8,
        jml_bagian: Math.floor(Math.random() * 5) + 1,
        pembagian: "SHOHIBUL & DHUAFA",
        pesan_bagian: Math.random() > 0.5 ? "MINTA KAKI SAPI & DADA" : null,
        kel_sapi: jenisQurban === "3" ? String(Math.floor(Math.random() * 10) + 1) : null,
        no_uq: `UQ-${500 + i}`,
        penyaluran: penyaluran,
        lokasi: penyaluran === "LUAR" ? randomPermohonan.nama_pemohon : "MASJID MANARUL ILMI",
        keterangan: "DUMMY DATA - AMAN UNTUK PRESENTASI KULIAH",
        penerima: penyaluran === "LUAR" ? randomPermohonan.penanggung_jawab : "UMUM",
        petugas: "PANITIA MMI",
        sebab: null,
        no_id_surat: penyaluran === "LUAR" ? randomPermohonan.no_id_surat : null,
      }
    });
  }
  console.log('✅ Berhasil men-generate 50 Hewan Qurban dengan format ID 8-digit.');

  // =========================================
  // 5. SEEDING SAPI TERPISAH (50 DATA)
  // =========================================
  for (let i = 1; i <= 50; i++) {
    const randomPengqurban = pengqurbanList[Math.floor(Math.random() * pengqurbanList.length)];
    const tahunHijriah = randomPengqurban.nkw.substring(0, 4);
    const noUrutStr = String(50 + i).padStart(3, '0'); // Urutan dilanjutkan dari 50 ke atas biar no_id_lama unik
    
    // FORMAT ID SAPI TERPISAH: [4 digit Tahun Hijriah] + [1 digit Kode Jenis: 3 (Sapi Patungan)] + [3 digit Nomor Urut]
    const noIdLama = `${tahunHijriah}3${noUrutStr}`; 

    await prisma.sapiTerpisah.create({
      data: {
        no_id_lama: noIdLama,
        nkw_pengqurban: randomPengqurban.nkw,
        nama: faker.person.fullName().toUpperCase(),
        kel_sapi: String(Math.floor(Math.random() * 10) + 1),
        no_uq: `UQ-SAPI-${600 + i}`,
      }
    });
  }
  console.log('✅ Berhasil men-generate 50 Sapi Terpisah dengan format ID 8-digit.');

  // =========================================
  // 6. SEEDING SETOR PETUGAS JAGA (50 DATA)
  // =========================================
  for (let i = 1; i <= 50; i++) {
    const idLama = `SETOR-${6000 + i}`;
    const randomPetugas = petugasJagaList[Math.floor(Math.random() * petugasJagaList.length)];
    await prisma.setorPetugasJaga.create({
      data: {
        id_lama: idLama,
        id_petugas: randomPetugas.id_lama,
        no_urut: i,
        tanggal: faker.date.recent({ days: 15 }),
        nama: randomPetugas.nama,
        jml_setor: faker.number.int({ min: 1000000, max: 15000000 }),
        keterangan: `SETORAN HARIAN SHOHIBUL OLEH ${randomPetugas.nama}`,
      }
    });
  }
  console.log('✅ Berhasil men-generate 50 Setoran Petugas Jaga.');

  // =========================================
  // 7. SEEDING KUITANSI TAKTIS & DETAIL (50 DATA)
  // =========================================
  for (let i = 1; i <= 50; i++) {
    const noKw = `KW-TAK-${7000 + i}`;
    const randomPengqurban = pengqurbanList[Math.floor(Math.random() * pengqurbanList.length)];
    
    await prisma.kuitansiTaktis.create({
      data: {
        no_kw: noKw,
        tanggal: faker.date.recent({ days: 20 }),
        penanggung_jawab: randomPengqurban.nama_lengkap,
        detail_kuitansi: {
          create: [
            {
              pos: "KONSUMSI",
              uraian: "Pembelian konsumsi rapat koordinasi panitia qurban",
              debit: 0,
              kredit: faker.number.int({ min: 250000, max: 1500000 }),
            },
            {
              pos: "LOGISTIK",
              uraian: "Pembelian terpal dan bambu kandang penampungan",
              debit: 0,
              kredit: faker.number.int({ min: 500000, max: 3000000 }),
            }
          ]
        }
      }
    });
  }
  console.log('✅ Berhasil men-generate 50 Kuitansi Taktis beserta rinciannya.');

  // =========================================
  // 8. SEEDING PERMOHONAN ONLINE (FORM PENDAFTARAN) (50 DATA)
  // =========================================
  for (let i = 1; i <= 50; i++) {
    const isMale = Math.random() > 0.5;
    
    const dummyAnimals = [
      {
        jenis: ["1", "3", "2"][Math.floor(Math.random() * 3)],
        bentuk: bentukOpsi[Math.floor(Math.random() * bentukOpsi.length)],
        nominal: faker.number.int({ min: 4000000, max: 28000000 }),
        melihat: Math.random() > 0.5 ? "YA" : "TIDAK",
        menyembelih: Math.random() > 0.8 ? "YA" : "TIDAK",
        penyaluran: penyaluranOpsi[Math.floor(Math.random() * penyaluranOpsi.length)],
        opsi_pesan: "PASRAH"
      }
    ];

    await prisma.permohonanOnline.create({
      data: {
        tanggal_submit: faker.date.recent({ days: 10 }),
        status: ["BELUM_DICEK", "DISETUJUI", "DITOLAK"][Math.floor(Math.random() * 3)],
        nama_lengkap: faker.person.fullName({ sex: isMale ? 'male' : 'female' }).toUpperCase(),
        telepon: faker.phone.number({ style: 'national' }),
        asal_wilayah: wilayahCodes[Math.floor(Math.random() * wilayahCodes.length)],
        alamat: faker.location.streetAddress(true).toUpperCase(),
        daftar_hewan: JSON.stringify(dummyAnimals),
        total_pembayaran: dummyAnimals[0].nominal,
        bukti_bayar: "dummy_receipt.jpg",
      }
    });
  }
  console.log('✅ Berhasil men-generate 50 Pendaftaran Online.');

  // =========================================
  // 9. SEEDING AKUN ADMIN WAJIB (ADMIN & SUPER ADMIN)
  // =========================================
  console.log('Seeding akun pengguna sistem (Admin & Staff)...');

  // Akun Admin Wajib dari Permintaan User
  const psoPassword = await bcrypt.hash('psocicd123', 10);
  await prisma.user.create({
    data: {
      username: 'admin@pso.com',
      password: psoPassword,
      nama: 'Admin Kelompok 5 PSO C',
      role: 'ADMIN',
    }
  });

  // Akun Super Admin bawaan sistem
  const superPassword = await bcrypt.hash('adminmmi', 10);
  await prisma.user.create({
    data: {
      username: 'admin',
      password: superPassword,
      nama: 'Super Admin - Masjid Manarul Ilmi ITS',
      role: 'ADMIN',
    }
  });

  // Tambahan akun bendahara dan staff untuk validasi roles
  const staffPassword = await bcrypt.hash('stafmmi123', 10);
  await prisma.user.create({
    data: {
      username: 'staff@mmi.com',
      password: staffPassword,
      nama: 'Petugas Lapangan MMI',
      role: 'STAF',
    }
  });

  console.log('✅ Berhasil men-generate akun Admin (admin@pso.com) dan pengguna pendukung.');
  console.log('🎉 SEEDING DATA DUMMY DENGAN FORMAT SPESIFIK HIJRIAH (50 DATA) SUKSES!');
}

main()
  .catch((e) => {
    console.error('❌ Gagal menjalankan database seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });