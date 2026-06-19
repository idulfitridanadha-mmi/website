/**
 * @jest-environment node
 */
import { GET } from "./route";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

// Mock Prisma
jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    hewanQurban: {
      findMany: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mPrismaClient),
  };
});

const prismaMock = new PrismaClient() as any;

describe("GET /api/track API Router", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (queryValue?: string) => {
    const url = queryValue !== undefined 
      ? `http://localhost:3000/api/track?query=${encodeURIComponent(queryValue)}`
      : `http://localhost:3000/api/track`;
    return new NextRequest(url);
  };

  it("should return HTTP status 400 when query is empty or whitespace only", async () => {
    const emptyQueries = ["", "   ", "\n", "\t"];

    for (const q of emptyQueries) {
      const req = createMockRequest(q);
      const res = await GET(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.message).toContain("tidak boleh kosong");
    }

    // Undefined/missing query param
    const reqMissing = new NextRequest("http://localhost:3000/api/track");
    const resMissing = await GET(reqMissing);
    expect(resMissing.status).toBe(400);
  });

  it("should return HTTP status 404 when search results are empty", async () => {
    prismaMock.hewanQurban.findMany.mockResolvedValue([]);

    const req = createMockRequest("Q-999");
    const res = await GET(req);

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).toContain("tidak ditemukan");
  });

  it("should properly mask the shohibul qurban's phone number", async () => {
    const mockDBResults = [
      {
        id_hewan: "h-1",
        no_id_lama: "14471001",
        jenis_qurban: "1",
        status_bayar: "LUNAS",
        status_hewan: "MENUNGGU",
        nkw_pengqurban: "1447001",
        metode_bayar: "TRANSFER",
        pembagian: "Panitia",
        opsi_pesan: "PASRAH",
        pengqurban: {
          nama_lengkap: "Budi Santoso",
          nkw: "1447001",
          telepon: "081234567890", // > 8 chars -> replaceMiddle
          alamat: "Jl. Teknik Kimia ITS",
        },
      },
      {
        id_hewan: "h-2",
        no_id_lama: "14471002",
        jenis_qurban: "1",
        status_bayar: "DP",
        status_hewan: "DISEMBELIH",
        nkw_pengqurban: "1447002",
        metode_bayar: "TUNAI",
        pembagian: "Mandiri",
        opsi_pesan: "AMBIL",
        pengqurban: {
          nama_lengkap: "Siti Rahma",
          nkw: "1447002",
          telepon: "0812345", // <= 8 chars -> replaceMiddle (short form)
          alamat: "Keputih",
        },
      },
    ];

    prismaMock.hewanQurban.findMany.mockResolvedValue(mockDBResults);

    const req = createMockRequest("14471001");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    
    // Check first phone number (081234567890 -> length 12) -> should match replace(/(\d{4})(\d+)(\d{4})/, "$1-****-$3")
    // 0812-****-7890
    expect(json.data[0].telepon_masked).toBe("0812-****-7890");

    // Check second phone number (0812345 -> length 7) -> should match replace(/(\d{2})(\d+)(\d{2})/, "$1-**-$3")
    // 08-***-45
    expect(json.data[1].telepon_masked).toBe("08-**-45");
  });

  it("should clean sensitive data and not leak internal panitia/non-public properties to client", async () => {
    const mockDBResult = {
      id_hewan: "h-1",
      no_id_lama: "14471001",
      jenis_qurban: "1",
      status_bayar: "LUNAS",
      status_hewan: "MENUNGGU",
      nkw_pengqurban: "1447001",
      metode_bayar: "TRANSFER",
      pembagian: "Panitia",
      opsi_pesan: "PASRAH",
      biaya_operasional: 150000,
      bukti_bayar: "bukti_transaksi.jpg",
      keterangan: "Sakit kaki kanan",
      sebab: "Ternyata pincang",
      uang: 3500000,
      pengqurban: {
        nama_lengkap: "Budi Santoso",
        nkw: "1447001",
        telepon: "081234567890",
        alamat: "Jl. Teknik Kimia ITS",
        jenis_kelamin: "L",
      },
    };

    prismaMock.hewanQurban.findMany.mockResolvedValue([mockDBResult]);

    const req = createMockRequest("Budi");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    
    const record = json.data[0];
    
    // Explicit public fields allowed in PRD:
    expect(record.id_hewan).toBe("h-1");
    expect(record.no_id_lama).toBe("14471001");
    expect(record.jenis_qurban).toBe("1");
    expect(record.status_bayar).toBe("LUNAS");
    expect(record.status_hewan).toBe("MENUNGGU");
    expect(record.nama_shohibul).toBe("Budi Santoso");
    expect(record.nkw).toBe("1447001");
    expect(record.telepon_masked).toBe("0812-****-7890");
    expect(record.metode_bayar).toBe("TRANSFER");
    expect(record.pembagian).toBe("Panitia");
    expect(record.opsi_pesan).toBe("PASRAH");

    // Internal and sensitive fields must NOT leak:
    expect(record.biaya_operasional).toBeUndefined();
    expect(record.bukti_bayar).toBeUndefined();
    expect(record.keterangan).toBeUndefined();
    expect(record.sebab).toBeUndefined();
    expect(record.uang).toBeUndefined();
    
    // Parent pengqurban properties must NOT leak:
    expect(record.alamat).toBeUndefined();
    expect(record.jenis_kelamin).toBeUndefined();
    expect(record.telepon).toBeUndefined();
  });

  it("should return HTTP status 500 when database throws an error", async () => {
    prismaMock.hewanQurban.findMany.mockRejectedValue(new Error("Database connection lost"));

    const req = createMockRequest("14471001");
    const res = await GET(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).toContain("internal server");
  });
});
