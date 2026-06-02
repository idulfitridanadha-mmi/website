import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query || !query.trim()) {
      return NextResponse.json(
        { success: false, message: "Kueri pencarian tidak boleh kosong." },
        { status: 400 }
      );
    }

    const searchQuery = query.trim();

    // Mencari data hewan qurban berdasarkan ID Hewan, NKW, Nomor HP, atau Nama Lengkap
    const results = await prisma.hewanQurban.findMany({
      where: {
        OR: [
          { no_id_lama: { equals: searchQuery, mode: "insensitive" } },
          { nkw_pengqurban: { equals: searchQuery, mode: "insensitive" } },
          {
            pengqurban: {
              OR: [
                { telepon: { contains: searchQuery } },
                { nama_lengkap: { contains: searchQuery, mode: "insensitive" } }
              ]
            }
          }
        ]
      },
      include: {
        pengqurban: {
          select: {
            nama_lengkap: true,
            nkw: true,
            telepon: true,
            alamat: true
          }
        }
      },
      orderBy: { no_id_lama: "desc" }
    });

    if (results.length === 0) {
      return NextResponse.json(
        { success: false, message: "Data pelacakan qurban tidak ditemukan." },
        { status: 404 }
      );
    }

    // Melakukan penyensoran (masking) pada nomor telepon shohibul
    const sanitizedData = results.map(h => {
      const originalPhone = h.pengqurban?.telepon || "";
      let maskedPhone = "-";

      if (originalPhone) {
        const cleaned = originalPhone.trim();
        if (cleaned.length > 8) {
          maskedPhone = cleaned.replace(/(\d{4})(\d+)(\d{4})/, "$1-****-$3");
        } else {
          maskedPhone = cleaned.replace(/(\d{2})(\d+)(\d{2})/, "$1-**-$3");
        }
      }

      return {
        id_hewan: h.id_hewan,
        no_id_lama: h.no_id_lama || "Dalam Proses",
        jenis_qurban: h.jenis_qurban,
        status_bayar: h.status_bayar,
        status_hewan: h.status_hewan || "MENUNGGU",
        nama_shohibul: h.pengqurban?.nama_lengkap || h.nama_shohibul_sapi || "Shohibul MMI",
        nkw: h.pengqurban?.nkw || h.nkw_pengqurban,
        telepon_masked: maskedPhone,
        metode_bayar: h.metode_bayar || "TUNAI",
        pembagian: h.pembagian || "Panitia",
        opsi_pesan: h.opsi_pesan || "PASRAH"
      };
    });

    return NextResponse.json({ success: true, data: sanitizedData });
  } catch (error) {
    console.error("API Tracking Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
