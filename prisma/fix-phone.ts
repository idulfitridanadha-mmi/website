import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Memulai pembersihan data nomor telepon di tabel Pengqurban...");

  // 1. Ambil seluruh data pengqurban
  const pengqurbans = await prisma.pengqurban.findMany({
    select: {
      id_pengqurban: true,
      nkw: true,
      nama_lengkap: true,
      telepon: true,
    },
  });

  console.log(`📋 Ditemukan total ${pengqurbans.length} data pengqurban.`);
  
  let updatedCount = 0;
  let skippedCount = 0;

  for (const p of pengqurbans) {
    const rawPhone = p.telepon;
    
    if (!rawPhone) {
      skippedCount++;
      continue;
    }

    // Bersihkan karakter non-numerik
    const cleanedPhone = rawPhone.replace(/\D/g, "");

    // Jika setelah dibersihkan berbeda dengan data awal, lakukan update
    if (cleanedPhone !== rawPhone) {
      await prisma.pengqurban.update({
        where: { id_pengqurban: p.id_pengqurban },
        data: { telepon: cleanedPhone },
      });
      console.log(`✅ [UPDATED] NKW: ${p.nkw} | ${p.nama_lengkap} : "${rawPhone}" ➡️ "${cleanedPhone}"`);
      updatedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log("\n✨ PROSES SELESAI ✨");
  console.log(`📈 Total diperbarui: ${updatedCount} data.`);
  console.log(`📉 Total dilewati (sudah bersih/kosong): ${skippedCount} data.`);
}

main()
  .catch((e) => {
    console.error("❌ Terjadi kesalahan saat menjalankan script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
