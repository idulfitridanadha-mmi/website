"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getActiveHijriYear } from "@/app/lib/hijri";

const prisma = new PrismaClient();

// ==========================================
// 1. FUNGSI CREATE HEWAN QURBAN 🐄🐐 (+ AUTO KWITANSI CERDAS)
// ==========================================
export async function createHewan(formData: any) {
  try {
    const hijriYear = getActiveHijriYear();
    const kodeHewan = formData.jenis_qurban; 

    let nextSeq = 1;

    if (kodeHewan === "2" || kodeHewan === "3") {
      const hewanSapi = await prisma.hewanQurban.findMany({
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
      nextSeq = maxSeq + 1;
    } else {
      const lastHewan = await prisma.hewanQurban.findFirst({
        where: {
          no_id_lama: { startsWith: `${hijriYear}${kodeHewan}` }
        },
        orderBy: { no_id_lama: 'desc' }
      });

      if (lastHewan && lastHewan.no_id_lama && lastHewan.no_id_lama.length >= 6) {
        const lastSeqStr = lastHewan.no_id_lama.substring(5); 
        nextSeq = parseInt(lastSeqStr) + 1;
      }
    }

    const seqString = nextSeq.toString().padStart(3, '0'); 
    const generatedNoIdLama = `${hijriYear}${kodeHewan}${seqString}`;

    // 💾 1. SIMPAN DATA HEWAN KE DATABASE
    const newHewan = await prisma.hewanQurban.create({
      data: {
        no_id_lama: generatedNoIdLama,
        nkw_pengqurban: formData.nkw_pengqurban,
        jenis_qurban: formData.jenis_qurban, 
        bentuk: formData.bentuk || null, 
        uang: formData.uang ? parseFloat(formData.uang) : null,
        penyembelihan: formData.penyembelihan || null,
        melihat: formData.melihat === 'YA',
        menyembelih: formData.menyembelih === 'YA',
        jml_bagian: formData.jml_bagian ? parseInt(formData.jml_bagian) : null,
        pembagian: formData.pembagian || null,
        pesan_bagian: formData.pesan_bagian || null,
        kel_sapi: formData.kel_sapi || null,
        no_uq: formData.no_uq || null,
        penyaluran: formData.penyaluran || null, 
        lokasi: formData.lokasi || null,
        keterangan: formData.keterangan || null,
        penerima: formData.penerima || null,
        petugas: formData.petugas || null,
        sebab: formData.sebab || null,
        no_id_surat: formData.no_id_surat || null,
        
        biaya_operasional: formData.biaya_operasional ? parseFloat(formData.biaya_operasional) : null,
        pindah_sapi: formData.pindah_sapi === 'YA',
        penyaluran_luar: formData.penyaluran_luar === 'YA',
        metode_bayar: formData.metode_bayar || "TUNAI",
        status_bayar: formData.status_bayar || "BELUM LUNAS",
        
        nama_shohibul_sapi: formData.nama_shohibul_sapi || null,
        bukti_bayar: formData.file_nama || null, 
      }
    });

    // 🧾 2. LOGIKA AUTO-KWITANSI CERDAS
    const uangQurban = formData.uang ? parseFloat(formData.uang) : 0;
    const uangOperasional = formData.biaya_operasional ? parseFloat(formData.biaya_operasional) : 0;

    // Kalau ada uang masuk (dari Qurban ATAU Operasional), kita cetak kwitansinya!
    if (uangQurban > 0 || uangOperasional > 0) {
        const detailItems = [];
        
        // Item 1: Catat Uang Qurbannya
        if (uangQurban > 0) {
            detailItems.push({
                pos: "PEMASUKAN QURBAN",
                uraian: `Titipan uang qurban untuk ID Hewan: ${generatedNoIdLama}`,
                debit: uangQurban,
                kredit: 0
            });
        }
        
        // Item 2: Catat Uang Operasionalnya (Kalau bawa hewan hidup)
        if (uangOperasional > 0) {
            detailItems.push({
                pos: "OPERASIONAL QURBAN",
                uraian: `Biaya operasional hewan hidup untuk ID Hewan: ${generatedNoIdLama}`,
                debit: uangOperasional,
                kredit: 0
            });
        }

        try {
            // Langsung inject ke tabel KuitansiTaktis!
            await prisma.kuitansiTaktis.create({
                data: {
                    no_kw: `KW-${generatedNoIdLama}`, // Bikin No KW unik berdasarkan ID Hewan
                    penanggung_jawab: formData.nkw_pengqurban, // Penanggung jawab diisi NKW Shohibul
                    detail_kuitansi: {
                        create: detailItems
                    }
                }
            });
            console.log(`[SYSTEM] Auto-Kwitansi berhasil digenerate: KW-${generatedNoIdLama}`);
        } catch (kwErr) {
            console.error("Gagal auto-generate kuitansi:", kwErr);
            // Error kuitansi ditahan di sini biar data hewan tetep sukses kesimpen
        }
    }

    revalidatePath("/admin/pengqurban");
    revalidatePath("/admin/hewan");
    revalidatePath("/admin/kuitansi"); // ✨ Refresh juga halaman kuitansinya!

    return { success: true, message: `Berhasil! Hewan ID: ${generatedNoIdLama}` };
  } catch (error) {
    console.error("Gagal nyimpen hewan:", error);
    return { success: false, message: "Terjadi kesalahan saat menyimpan data hewan." };
  }
}

// ==========================================
// 2. FUNGSI UPDATE HEWAN QURBAN 📝
// ==========================================
export async function updateHewan(id_hewan: string, formData: any) {
  try {
    await prisma.hewanQurban.update({
      where: { id_hewan },
      data: {
        bentuk: formData.bentuk || null, 
        uang: formData.uang ? parseFloat(formData.uang) : null,
        penyembelihan: formData.penyembelihan || null,
        melihat: formData.melihat === 'YA',
        menyembelih: formData.menyembelih === 'YA',
        jml_bagian: formData.jml_bagian ? parseInt(formData.jml_bagian) : null,
        pembagian: formData.pembagian || null,
        pesan_bagian: formData.pesan_bagian || null,
        kel_sapi: formData.kel_sapi || null,
        no_uq: formData.no_uq || null,
        penyaluran: formData.penyaluran || null, 
        lokasi: formData.lokasi || null,
        keterangan: formData.keterangan || null,
        penerima: formData.penerima || null,
        petugas: formData.petugas || null,
        sebab: formData.sebab || null,
        no_id_surat: formData.no_id_surat || null,
        
        biaya_operasional: formData.biaya_operasional ? parseFloat(formData.biaya_operasional) : null,
        pindah_sapi: formData.pindah_sapi === 'YA',
        penyaluran_luar: formData.penyaluran_luar === 'YA',
        metode_bayar: formData.metode_bayar || "TUNAI",
        status_bayar: formData.status_bayar || "BELUM LUNAS",
        status_hewan: formData.status_hewan || "MENUNGGU",
        
        // ✨ SUPER FORM BARU ✨
        nama_shohibul_sapi: formData.nama_shohibul_sapi || null,
        bukti_bayar: formData.file_nama || null,
      }
    });

    revalidatePath("/admin/hewan");
    revalidatePath("/admin/pengqurban");
    revalidatePath("/tracking");
    return { success: true, message: "Data hewan qurban berhasil diperbarui!" };
  } catch (error) {
    console.error("Gagal update hewan:", error);
    return { success: false, message: "Terjadi kesalahan saat memperbarui data hewan." };
  }
}

// ==========================================
// 3. FUNGSI DELETE HEWAN QURBAN 🗑️
// ==========================================
export async function deleteHewan(id_hewan: string) {
  try {
    await prisma.hewanQurban.delete({
      where: { id_hewan }
    });

    revalidatePath("/admin/pengqurban");
    revalidatePath("/admin/hewan");
    
    return { success: true, message: "Data hewan qurban berhasil dihapus!" };
  } catch (error) {
    console.error("Gagal hapus hewan:", error);
    return { success: false, message: "Terjadi kesalahan saat menghapus data hewan." };
  }
}

// ==========================================
// 4. FUNGSI BACA DATA HEWAN (GET + SEARCHING + AUTO GROUPING 🐄🤝) 
// ==========================================
export async function getHewanQurban(query: string = "", yearFilter: string = "") {
  try {
    const rawData = await prisma.hewanQurban.findMany({
      where: {
        AND: [
          query ? {
            OR: [
              { pengqurban: { nama_lengkap: { contains: query, mode: 'insensitive' } } },
              { kel_sapi: { contains: query, mode: 'insensitive' } },
              { no_id_lama: { contains: query, mode: 'insensitive' } }
            ]
          } : {},
          (yearFilter && yearFilter !== "Semua") ? {
            no_id_lama: { startsWith: yearFilter }
          } : {}
        ]
      },
      include: {
        pengqurban: {
          select: { 
            nama_lengkap: true, 
            alamat: true
          } 
        }
      },
      orderBy: { no_id_lama: 'desc' }
    });

    const groupedData: any[] = [];
    const sapiPatunganMap = new Map<string, any>();

    for (const item of rawData) {
      if (item.jenis_qurban === "3" && item.kel_sapi) {
        const groupKey = item.kel_sapi.toUpperCase(); 
        
        if (!sapiPatunganMap.has(groupKey)) {
          const newGroup = {
            ...item,
            id_hewan: `GROUP_${groupKey}`,
            no_id_lama: `KELOMPOK ${groupKey}`,
            isGroup: true,
            members: [item],
            pengqurban: {
              ...item.pengqurban,
              nama_lengkap: `Sapi Patungan Kelompok ${groupKey}`
            }
          };
          sapiPatunganMap.set(groupKey, newGroup);
          groupedData.push(newGroup);
        } else {
          const existingGroup = sapiPatunganMap.get(groupKey);
          existingGroup.members.push(item);
        }
      } else {
        groupedData.push(item);
      }
    }

    for (const group of sapiPatunganMap.values()) {
      group.pengqurban.nama_lengkap = `Sapi Patungan Kel. ${group.kel_sapi} (${group.members.length} Orang)`;
      group.bentuk = group.members[0].bentuk || "-";
      
      const semuaPenyaluran = Array.from(new Set(group.members.map((m: any) => m.penyaluran || "INTERNAL MMI")));
      if (semuaPenyaluran.length === 1) {
        group.penyaluran = semuaPenyaluran[0]; 
      } else {
        group.penyaluran = "Campuran (Internal & Luar)";
      }
    }

    return { success: true, data: groupedData };
  } catch (error) {
    console.error("Gagal narik data hewan:", error);
    return { success: false, data: [] };
  }
}

// ==========================================
// 5. FUNGSI CEK STATISTIK KELOMPOK SAPI PATUNGAN 📊
// ==========================================
export async function getStatistikSapiPatungan() {
  try {
    const hijriYear = getActiveHijriYear();
    
    // Cari semua hewan patungan di tahun ini
    const patunganList = await prisma.hewanQurban.findMany({
      where: {
        jenis_qurban: "3",
        no_id_lama: { startsWith: hijriYear }
      },
      select: { kel_sapi: true }
    });

    // Hitung ada berapa anggota di masing-masing kelompok
    const stats: Record<string, number> = {};
    patunganList.forEach(item => {
      if (item.kel_sapi) {
        const key = item.kel_sapi.toUpperCase();
        stats[key] = (stats[key] || 0) + 1;
      }
    });

    // Robot AI nyariin kelompok mana yang belum genap 7 orang
    let suggestedGroup = "1";
    for (let i = 1; i <= 100; i++) {
      const key = i.toString();
      if ((stats[key] || 0) < 7) {
        suggestedGroup = key;
        break;
      }
    }

    return { success: true, data: stats, suggested: suggestedGroup };
  } catch (error) {
    console.error("Gagal ambil statistik sapi:", error);
    return { success: false, data: {}, suggested: "1" };
  }
}