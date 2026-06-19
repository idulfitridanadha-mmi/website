"use server";

import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export async function submitPermohonanOnline(payload: any) {
  try {
    // Kita simpan ke "Kamar Tunggu" (tabel permohonan_online)
    await prisma.permohonanOnline.create({
      data: {
        nama_lengkap: payload.nama_lengkap,
        telepon: payload.telepon,
        asal_wilayah: payload.asal_wilayah,
        alamat: payload.alamat,
        
        // Data hewan kita jadiin JSON String biar 1 kolom bisa nampung banyak hewan
        daftar_hewan: JSON.stringify(payload.animals), 
        
        total_pembayaran: payload.totalPrice,
        bukti_bayar: payload.bukti_bayar,
        status: "BELUM_DICEK" // Default status buat admin
      }
    });

    return { success: true, message: "Alhamdulillah, data qurban berhasil disubmit! ✨" };
  } catch (error) {
    console.error("Gagal submit permohonan online:", error);
    return { success: false, message: "Waduh, sistem lagi sibuk. Coba lagi ya! 🔧" };
  }
}

// Ambil semua list permohonan online
export async function getPermohonanOnline() {
  try {
    const rawData = await prisma.permohonanOnline.findMany({
      orderBy: { tanggal_submit: 'desc' }
    });

    const safeData = rawData.map(item => ({
      ...item,
      total_pembayaran: item.total_pembayaran ? Number(item.total_pembayaran) : 0,
      tanggal_submit: item.tanggal_submit.toISOString(),
    }));

    return { success: true, data: safeData };
  } catch (error) {
    console.error("Gagal ambil data permohonan:", error);
    return { success: false, data: [] };
  }
}

// Fungsi Pindah Data
export async function verifyPermohonan(id_permohonan: string, action: "ACC" | "DITOLAK") {
  try {
    if (action === "DITOLAK") {
      await prisma.permohonanOnline.update({
        where: { id_permohonan },
        data: { status: "DITOLAK" }
      });
      return { success: true, message: "Permohonan berhasil ditolak! ❌" };
    }

    const permohonan = await prisma.permohonanOnline.findUnique({
      where: { id_permohonan }
    });

    if (!permohonan) return { success: false, message: "Data tidak ditemukan!" };
    if (permohonan.status === "ACC") return { success: false, message: "Data sudah pernah di-ACC!" };

    // ✨ 1. REVISI NKW: FORMAT 1447001 (Tanpa Garis Miring)
    const hijriYear = "1447"; 
    const lastPengqurban = await prisma.pengqurban.findFirst({
      where: { nkw: { startsWith: hijriYear } },
      orderBy: { nkw: 'desc' }
    });

    let newNkw = `${hijriYear}001`;
    let noUrut = 1;
    
    if (lastPengqurban) {
      // Kita bersihin barangkali ada sisa data lama yang masih pake "/"
      const cleanNkw = lastPengqurban.nkw.replace(/\D/g, ''); 
      const lastNumberStr = cleanNkw.substring(4); // Ambil 3 digit terakhir
      const lastNumber = parseInt(lastNumberStr);
      
      if (!isNaN(lastNumber)) {
        noUrut = lastNumber + 1;
        newNkw = `${hijriYear}${noUrut.toString().padStart(3, '0')}`;
      }
    }

    // 2. Eksekusi pakai PRISMA TRANSACTION
    await prisma.$transaction(async (tx) => {
      
      // A. Bikin Pengqurban Baru
      await tx.pengqurban.create({
        data: {
          nkw: newNkw,
          no_urut: noUrut,
          nama_lengkap: permohonan.nama_lengkap,
          telepon: permohonan.telepon || "-", 
          kd_wilayah: permohonan.asal_wilayah || "LUAR",
          alamat: permohonan.alamat || "-",
          jenis_kelamin: "L", 
        }
      });

      // ✨ ALGORITMA SMART GROUPING SAPI (REVISI FILTER TAHUN HIJRIYAH) ✨
      // 1. Tarik data sapi HANYA untuk tahun ini (berdasarkan prefix NKW)
      const sapiList = await tx.hewanQurban.findMany({
        where: { 
          jenis_qurban: { in: ["2", "3"] }, 
          kel_sapi: { not: null },
          nkw_pengqurban: { startsWith: hijriYear } // 🔥 INI DIA KUNCI JAWABANNYA!
        },
        select: { jenis_qurban: true, kel_sapi: true }
      });

      const groupCounts: Record<number, number> = {};
      let maxGroup = 0;

      // Hitung isi masing-masing kelompok yang udah ada di tahun ini
      for (const sapi of sapiList) {
         if (!sapi.kel_sapi || sapi.kel_sapi === "ANTREAN") continue;
         const groupNum = parseInt(sapi.kel_sapi);
         if (!isNaN(groupNum)) {
            if (groupNum > maxGroup) maxGroup = groupNum; 
            
            if (sapi.jenis_qurban === "2") {
               groupCounts[groupNum] = 7; // Sapi Utuh = Langsung penuh
            } else {
               groupCounts[groupNum] = (groupCounts[groupNum] || 0) + 1; // Patungan = Tambah 1
            }
         }
      }

      // B. Pecah JSON Hewan & Masukin ke Tabel HewanQurban
      const daftarHewan = JSON.parse(permohonan.daftar_hewan);
      const urutanMap: Record<string, number> = {};
      
      for (const hwn of daftarHewan) {
        const kodeHewan = hwn.jenis; 
        const isSapi = kodeHewan === "2" || kodeHewan === "3";
        const mapKey = isSapi ? "SAPI" : kodeHewan;

        if (urutanMap[mapKey] === undefined) {
          if (isSapi) {
            const hewanSapi = await tx.hewanQurban.findMany({
              where: {
                OR: [
                  { no_id_lama: { startsWith: `${hijriYear}2` } },
                  { no_id_lama: { startsWith: `${hijriYear}3` } }
                ]
              },
              select: { no_id_lama: true }
            });
            let maxSeq = 0;
            hewanSapi.forEach(h => {
              if (h.no_id_lama && h.no_id_lama.length >= 6) {
                const seq = parseInt(h.no_id_lama.substring(5));
                if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
              }
            });
            urutanMap[mapKey] = maxSeq + 1;
          } else {
            const prefixId = `${hijriYear}${kodeHewan}`;
            const lastHewan = await tx.hewanQurban.findFirst({
              where: { no_id_lama: { startsWith: prefixId } },
              orderBy: { no_id_lama: 'desc' }
            });
            
            let urutanHewan = 1;
            if (lastHewan && lastHewan.no_id_lama && lastHewan.no_id_lama.length >= 6) {
              const lastUrutanStr = lastHewan.no_id_lama.substring(5);
              const lastUrutan = parseInt(lastUrutanStr);
              if (!isNaN(lastUrutan)) urutanHewan = lastUrutan + 1;
            }
            urutanMap[mapKey] = urutanHewan;
          }
        } else {
          urutanMap[mapKey]++;
        }

        const prefixId = `${hijriYear}${kodeHewan}`;
        const newIdHewan = `${prefixId}${urutanMap[mapKey].toString().padStart(3, '0')}`;

        // ✨ PENENTUAN NASIB KELOMPOK SAPI (Cari slot kosong dari nomor 1) ✨
        let finalKelSapi = null;
        if (hwn.jenis === "2") {
            maxGroup++;
            finalKelSapi = maxGroup.toString();
            groupCounts[maxGroup] = 7; 
        } else if (hwn.jenis === "3") {
            // Cek urut dari kelompok 1 sampai maxGroup + 1
            for (let i = 1; i <= maxGroup + 1; i++) {
                if ((groupCounts[i] || 0) < 7) {
                    finalKelSapi = i.toString();
                    groupCounts[i] = (groupCounts[i] || 0) + 1; 
                    if (i > maxGroup) maxGroup = i; // Kalau ternyata bikin grup baru, update maxGroup
                    break;
                }
            }
        }

        await tx.hewanQurban.create({
          data: {
            nkw_pengqurban: newNkw,
            no_id_lama: newIdHewan,
            jenis_qurban: hwn.jenis,
            bentuk: hwn.bentuk,
            uang: hwn.nominal,
            
            // ✨ SUDAH PAKAI KELOMPOK HASIL ALGORITMA DI ATAS
            kel_sapi: finalKelSapi, 
            
            nama_shohibul_sapi: hwn.jenis === "2" ? JSON.stringify(hwn.nama_shohibul_sapi.filter((n:string)=>n!=="")) : null,
            metode_bayar: "TRANSFER",
            status_bayar: "BELUM LUNAS",
            bukti_bayar: permohonan.bukti_bayar,
            
            melihat: hwn.melihat === "YA" || hwn.melihat === true,
            menyembelih: hwn.menyembelih === "YA" || hwn.menyembelih === true,
            pindah_sapi: hwn.pindah_sapi === "YA" || hwn.pindah_sapi === true,
            penyaluran: hwn.penyaluran,
            penyaluran_luar: hwn.penyaluran_luar === "YA" || hwn.penyaluran_luar === true || hwn.penyaluran === "LUAR",
            jml_bagian: parseInt(hwn.jml_bagian) || 1,
            
            opsi_pesan: hwn.opsi_pesan,
            pesan_bagian: hwn.pesan || null,
            pengambilan_pesan: hwn.pengambilan_pesan,
          }
        });
      }

      // C. Update Status Permohonan jadi ACC
      await tx.permohonanOnline.update({
        where: { id_permohonan },
        data: { status: "ACC" }
      });
    });

    return { success: true, message: `Sukses! NKW ${newNkw} berhasil dibuat! ✨` };

  } catch (error) {
    console.error("Gagal verifikasi permohonan:", error);
    return { success: false, message: "Terjadi kesalahan saat memindahkan data. 🔧" };
  }
}