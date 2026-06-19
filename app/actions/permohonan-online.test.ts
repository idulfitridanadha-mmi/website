import { submitPermohonanOnline, getPermohonanOnline, verifyPermohonan } from "./permohonan-online";
import { PrismaClient } from "@prisma/client";

// Mock @prisma/client
jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    permohonanOnline: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    pengqurban: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    hewanQurban: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mPrismaClient)),
  };
  return {
    PrismaClient: jest.fn(() => mPrismaClient),
  };
});

const prismaMock = new PrismaClient() as any;

describe("Permohonan Online Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("submitPermohonanOnline", () => {
    it("should successfully submit permohonan online", async () => {
      const payload = {
        nama_lengkap: "Fulan",
        telepon: "0812345",
        asal_wilayah: "ITS",
        alamat: "Surabaya",
        animals: [{ jenis: "1", bentuk: "UANG", nominal: 4000000 }],
        totalPrice: 4000000,
        bukti_bayar: "struk.png",
      };

      prismaMock.permohonanOnline.create.mockResolvedValue({ id_permohonan: "perm-1" });

      const result = await submitPermohonanOnline(payload);

      expect(result.success).toBe(true);
      expect(result.message).toContain("berhasil disubmit");
      expect(prismaMock.permohonanOnline.create).toHaveBeenCalled();
    });

    it("should handle error in submitPermohonanOnline", async () => {
      prismaMock.permohonanOnline.create.mockRejectedValue(new Error("DB Connection Error"));

      const result = await submitPermohonanOnline({});

      expect(result.success).toBe(false);
      expect(result.message).toContain("sistem lagi sibuk");
    });
  });

  describe("getPermohonanOnline", () => {
    it("should retrieve permohonan online list and format dates and currency", async () => {
      const mockData = [
        {
          id_permohonan: "perm-1",
          total_pembayaran: 4000000,
          tanggal_submit: new Date("2026-06-08T00:00:00.000Z"),
        },
      ];

      prismaMock.permohonanOnline.findMany.mockResolvedValue(mockData);

      const result = await getPermohonanOnline();

      expect(result.success).toBe(true);
      expect(result.data[0].total_pembayaran).toBe(4000000);
      expect(result.data[0].tanggal_submit).toBe("2026-06-08T00:00:00.000Z");
    });

    it("should handle error in getPermohonanOnline", async () => {
      prismaMock.permohonanOnline.findMany.mockRejectedValue(new Error("Fetch error"));

      const result = await getPermohonanOnline();

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
    });
  });

  describe("verifyPermohonan", () => {
    it("should decline permohonan successfully when action is DITOLAK", async () => {
      prismaMock.permohonanOnline.update.mockResolvedValue({ id_permohonan: "perm-1", status: "DITOLAK" });

      const result = await verifyPermohonan("perm-1", "DITOLAK");

      expect(result.success).toBe(true);
      expect(result.message).toContain("berhasil ditolak");
      expect(prismaMock.permohonanOnline.update).toHaveBeenCalledWith({
        where: { id_permohonan: "perm-1" },
        data: { status: "DITOLAK" },
      });
    });

    it("should return success false if permohonan is not found", async () => {
      prismaMock.permohonanOnline.findUnique.mockResolvedValue(null);

      const result = await verifyPermohonan("perm-1", "ACC");

      expect(result.success).toBe(false);
      expect(result.message).toContain("tidak ditemukan");
    });

    it("should return success false if permohonan is already ACC", async () => {
      prismaMock.permohonanOnline.findUnique.mockResolvedValue({
        id_permohonan: "perm-1",
        status: "ACC",
      });

      const result = await verifyPermohonan("perm-1", "ACC");

      expect(result.success).toBe(false);
      expect(result.message).toContain("sudah pernah di-ACC");
    });

    it("should clean non-digits from previous NKW when generating a new NKW", async () => {
      prismaMock.permohonanOnline.findUnique.mockResolvedValue({
        id_permohonan: "perm-1",
        nama_lengkap: "Shohibul A",
        telepon: "0812345",
        asal_wilayah: "ITS",
        alamat: "Surabaya",
        daftar_hewan: JSON.stringify([
          {
            jenis: "1",
            bentuk: "UANG",
            nominal: 4000000,
            melihat: "YA",
            menyembelih: "TIDAK",
            pindah_sapi: "TIDAK",
            penyaluran: "DALAM",
          },
        ]),
        status: "BELUM_DICEK",
      });

      // Mock previous NKW containing non-digits (e.g. 1447/005)
      prismaMock.pengqurban.findFirst.mockResolvedValue({ nkw: "1447/005" });
      prismaMock.hewanQurban.findMany.mockResolvedValue([]);
      prismaMock.hewanQurban.findFirst.mockResolvedValue(null);

      const result = await verifyPermohonan("perm-1", "ACC");

      expect(result.success).toBe(true);
      expect(prismaMock.pengqurban.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nkw: "1447006", // Incremented from 005 to 006
          }),
        })
      );
    });

    it("should handle existing sapi sequences correctly and assign animal sequences correctly", async () => {
      prismaMock.permohonanOnline.findUnique.mockResolvedValue({
        id_permohonan: "perm-1",
        nama_lengkap: "Shohibul A",
        daftar_hewan: JSON.stringify([
          {
            jenis: "2", // Sapi Utuh
            bentuk: "HEWAN",
            melihat: "TIDAK",
            menyembelih: "TIDAK",
            pindah_sapi: "TIDAK",
            penyaluran: "DALAM",
            nama_shohibul_sapi: ["Nama 1", "Nama 2", "", "", "", "", ""],
          },
        ]),
        status: "BELUM_DICEK",
      });

      prismaMock.pengqurban.findFirst.mockResolvedValue(null);
      // Existing sapi
      prismaMock.hewanQurban.findMany.mockResolvedValue([
        { no_id_lama: "14472002" },
      ]);

      const result = await verifyPermohonan("perm-1", "ACC");

      expect(result.success).toBe(true);
      expect(prismaMock.hewanQurban.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            no_id_lama: "14472003", // incremented sequence from 002 to 003
            nama_shohibul_sapi: JSON.stringify(["Nama 1", "Nama 2"]),
          }),
        })
      );
    });

    it("should suggest next group for sapi patungan and build new group if preceding is full", async () => {
      prismaMock.permohonanOnline.findUnique.mockResolvedValue({
        id_permohonan: "perm-1",
        nama_lengkap: "Shohibul A",
        daftar_hewan: JSON.stringify([
          {
            jenis: "3", // Sapi Patungan
            bentuk: "UANG",
            melihat: "YA",
            menyembelih: "YA",
            pindah_sapi: "TIDAK",
            penyaluran: "DALAM",
          },
        ]),
        status: "BELUM_DICEK",
      });

      prismaMock.pengqurban.findFirst.mockResolvedValue(null);
      // Mock existing sapi:
      // Group 1 has 7 members (full)
      // Group 2 is a Sapi Utuh (fills up slot to 7)
      // Therefore, next patungan should go to Group 3
      const mockSapiList = [
        { jenis_qurban: "3", kel_sapi: "1" },
        { jenis_qurban: "3", kel_sapi: "1" },
        { jenis_qurban: "3", kel_sapi: "1" },
        { jenis_qurban: "3", kel_sapi: "1" },
        { jenis_qurban: "3", kel_sapi: "1" },
        { jenis_qurban: "3", kel_sapi: "1" },
        { jenis_qurban: "3", kel_sapi: "1" }, // 7 in Group 1
        { jenis_qurban: "2", kel_sapi: "2" }, // Sapi Utuh in Group 2 (fills 7 slots)
      ];

      prismaMock.hewanQurban.findMany.mockResolvedValue(mockSapiList);
      prismaMock.hewanQurban.findFirst.mockResolvedValue(null);

      const result = await verifyPermohonan("perm-1", "ACC");

      expect(result.success).toBe(true);
      expect(prismaMock.hewanQurban.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            kel_sapi: "3", // group 3 suggested
          }),
        })
      );
    });

    it("should set lastUrutan sequence increment for non-sapi animal", async () => {
      prismaMock.permohonanOnline.findUnique.mockResolvedValue({
        id_permohonan: "perm-1",
        nama_lengkap: "Shohibul A",
        daftar_hewan: JSON.stringify([
          {
            jenis: "1", // Kambing
            bentuk: "UANG",
            melihat: "YA",
            menyembelih: "YA",
            pindah_sapi: "TIDAK",
            penyaluran: "DALAM",
          },
          {
            jenis: "1", // Second Kambing (will trigger urutanMap[mapKey]++)
            bentuk: "UANG",
            melihat: "YA",
            menyembelih: "YA",
            pindah_sapi: "TIDAK",
            penyaluran: "DALAM",
          },
        ]),
        status: "BELUM_DICEK",
      });

      prismaMock.pengqurban.findFirst.mockResolvedValue(null);
      prismaMock.hewanQurban.findMany.mockResolvedValue([]);
      prismaMock.hewanQurban.findFirst.mockResolvedValue({ no_id_lama: "14471015" });

      const result = await verifyPermohonan("perm-1", "ACC");

      expect(result.success).toBe(true);
      expect(prismaMock.hewanQurban.create).toHaveBeenCalledTimes(2);
    });

    it("should return success false and catch database transaction errors", async () => {
      prismaMock.permohonanOnline.findUnique.mockResolvedValue({
        id_permohonan: "perm-1",
        nama_lengkap: "Shohibul A",
        daftar_hewan: JSON.stringify([]),
        status: "BELUM_DICEK",
      });

      prismaMock.pengqurban.findFirst.mockRejectedValue(new Error("Transaction crash"));

      const result = await verifyPermohonan("perm-1", "ACC");

      expect(result.success).toBe(false);
      expect(result.message).toContain("kesalahan saat memindahkan data");
    });
  });
});
