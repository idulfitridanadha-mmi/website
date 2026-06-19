import { createHewan, updateHewan, deleteHewan, getHewanQurban, getStatistikSapiPatungan } from "./hewan";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Mock dependencies
jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    hewanQurban: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    kuitansiTaktis: {
      create: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mPrismaClient),
  };
});

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/app/lib/hijri", () => ({
  getActiveHijriYear: jest.fn(() => "1447"),
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(() => Promise.resolve({
    user: {
      name: "Admin Tester",
      role: "ADMIN"
    }
  })),
}));

const prismaMock = new PrismaClient() as any;

describe("Hewan Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createHewan", () => {
    it("should successfully create a new sheep and generate receipt if payment is set", async () => {
      // Input data
      const formData = {
        nkw_pengqurban: "1447001",
        jenis_qurban: "1", // Kambing
        bentuk: "UANG",
        uang: "4000000",
        biaya_operasional: "150000",
      };

      prismaMock.hewanQurban.findFirst.mockResolvedValue(null);
      prismaMock.hewanQurban.create.mockResolvedValue({ id_hewan: "hewan-1" });
      prismaMock.kuitansiTaktis.create.mockResolvedValue({});

      const result = await createHewan(formData);

      expect(result.success).toBe(true);
      expect(prismaMock.hewanQurban.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            jenis_qurban: "1",
            uang: 4000000,
          }),
        })
      );
      expect(prismaMock.kuitansiTaktis.create).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/admin/hewan");
    });

    // BARIS 46-48: Kambing Sequence ID Increment
    it("should increment kambing sequence ID based on existing lastHewan", async () => {
      const formData = {
        nkw_pengqurban: "1447001",
        jenis_qurban: "1", // Kambing
        bentuk: "HEWAN",
        uang: "0",
        biaya_operasional: "150000",
      };

      prismaMock.hewanQurban.findFirst.mockResolvedValue({ no_id_lama: "14471002" });
      prismaMock.hewanQurban.create.mockResolvedValue({ id_hewan: "hewan-1" });
      prismaMock.kuitansiTaktis.create.mockResolvedValue({});

      const result = await createHewan(formData);

      expect(result.success).toBe(true);
      expect(prismaMock.hewanQurban.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            no_id_lama: "14471003",
          }),
        })
      );
    });

    // BARIS 31-35: Sapi Sequence Mapping Loop
    it("should calculate next sequence for sapi utuh correctly from existing sapi", async () => {
      const formData = {
        nkw_pengqurban: "1447002",
        jenis_qurban: "2", // Sapi Utuh
        bentuk: "HEWAN",
        uang: "0",
        biaya_operasional: "0",
      };

      prismaMock.hewanQurban.findMany.mockResolvedValue([
        { no_id_lama: "14472005" },
        { no_id_lama: "invalid-id" }, // invalid sequence
      ]);
      prismaMock.hewanQurban.create.mockResolvedValue({ id_hewan: "hewan-2" });

      const result = await createHewan(formData);

      expect(result.success).toBe(true);
      expect(prismaMock.hewanQurban.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            no_id_lama: "14472006",
          }),
        })
      );
    });

    // BARIS 130-132: Error Auto-Kuitansi (should still return success true)
    it("should catch kuitansi creation error and still return success true for animal creation", async () => {
      const formData = {
        nkw_pengqurban: "1447001",
        jenis_qurban: "1",
        bentuk: "UANG",
        uang: "4000000",
      };

      prismaMock.hewanQurban.findFirst.mockResolvedValue(null);
      prismaMock.hewanQurban.create.mockResolvedValue({ id_hewan: "hewan-1" });
      prismaMock.kuitansiTaktis.create.mockRejectedValue(new Error("Kuitansi DB Error"));

      const result = await createHewan(formData);

      expect(result.success).toBe(true); // outer creation succeeds
      expect(prismaMock.kuitansiTaktis.create).toHaveBeenCalled();
    });

    it("should return success false on database error", async () => {
      prismaMock.hewanQurban.findFirst.mockRejectedValue(new Error("DB Connection Error"));

      const result = await createHewan({ jenis_qurban: "1" });

      expect(result.success).toBe(false);
      expect(result.message).toContain("Terjadi kesalahan saat menyimpan");
    });
  });

  describe("updateHewan", () => {
    it("should update animal details successfully", async () => {
      const formData = {
        bentuk: "UANG",
        uang: "4500000",
      };

      prismaMock.hewanQurban.update.mockResolvedValue({ id_hewan: "hewan-1" });

      const result = await updateHewan("hewan-1", formData);

      expect(result.success).toBe(true);
      expect(prismaMock.hewanQurban.update).toHaveBeenCalledWith({
        where: { id_hewan: "hewan-1" },
        data: expect.objectContaining({
          uang: 4500000,
        }),
      });
      expect(revalidatePath).toHaveBeenCalledWith("/admin/hewan");
    });

    it("should return error if update fails", async () => {
      prismaMock.hewanQurban.update.mockRejectedValue(new Error("Update failed"));

      const result = await updateHewan("hewan-1", {});

      expect(result.success).toBe(false);
    });
  });

  describe("deleteHewan", () => {
    it("should successfully delete the animal qurban", async () => {
      prismaMock.hewanQurban.delete.mockResolvedValue({ id_hewan: "hewan-1" });

      const result = await deleteHewan("hewan-1");

      expect(result.success).toBe(true);
      expect(prismaMock.hewanQurban.delete).toHaveBeenCalledWith({
        where: { id_hewan: "hewan-1" },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/admin/hewan");
    });

    it("should return error if delete fails", async () => {
      prismaMock.hewanQurban.delete.mockRejectedValue(new Error("Delete failed"));

      const result = await deleteHewan("hewan-1");

      expect(result.success).toBe(false);
    });
  });

  describe("getHewanQurban", () => {
    it("should retrieve animals and handle sapi patungan groups", async () => {
      const mockAnimals = [
        {
          id_hewan: "h-1",
          jenis_qurban: "3", // Sapi Patungan
          kel_sapi: "A",
          penyaluran: "DALAM",
          pengqurban: { nama_lengkap: "Shohibul 1", alamat: "ITS" },
        },
        {
          id_hewan: "h-2",
          jenis_qurban: "3", // Sapi Patungan
          kel_sapi: "A",
          penyaluran: "DALAM",
          pengqurban: { nama_lengkap: "Shohibul 2", alamat: "ITS" },
        },
        {
          id_hewan: "h-3",
          jenis_qurban: "1", // Kambing
          pengqurban: { nama_lengkap: "Shohibul 3", alamat: "ITS" },
        },
      ];

      prismaMock.hewanQurban.findMany.mockResolvedValue(mockAnimals);

      const result = await getHewanQurban("query", "1447");

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(2); // Group + Kambing = 2 entries
    });

    // BARIS 283-284: Penyaluran Campuran Sapi Patungan
    it("should set penyaluran to 'Campuran (Internal & Luar)' if group members have different values", async () => {
      const mockAnimals = [
        {
          id_hewan: "h-1",
          jenis_qurban: "3", // Sapi Patungan
          kel_sapi: "A",
          penyaluran: "DALAM",
          pengqurban: { nama_lengkap: "Shohibul 1", alamat: "ITS" },
        },
        {
          id_hewan: "h-2",
          jenis_qurban: "3", // Sapi Patungan
          kel_sapi: "A",
          penyaluran: "LUAR",
          pengqurban: { nama_lengkap: "Shohibul 2", alamat: "ITS" },
        },
      ];

      prismaMock.hewanQurban.findMany.mockResolvedValue(mockAnimals);

      const result = await getHewanQurban("query", "1447");

      expect(result.success).toBe(true);
      expect(result.data[0].penyaluran).toBe("Campuran (Internal & Luar)");
    });

    it("should return empty array on failure", async () => {
      prismaMock.hewanQurban.findMany.mockRejectedValue(new Error("Failure"));

      const result = await getHewanQurban();

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
    });
  });

  describe("getStatistikSapiPatungan", () => {
    it("should return group stats and suggest next slot group", async () => {
      prismaMock.hewanQurban.findMany.mockResolvedValue([
        { kel_sapi: "1" },
        { kel_sapi: "1" },
        { kel_sapi: "2" },
      ]);

      const result = await getStatistikSapiPatungan();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ "1": 2, "2": 1 });
      expect(result.suggested).toBe("1"); // 1 has 2 members, which is < 7, so suggest 1
    });

    it("should handle error in getStatistikSapiPatungan", async () => {
      prismaMock.hewanQurban.findMany.mockRejectedValue(new Error("Failure"));

      const result = await getStatistikSapiPatungan();

      expect(result.success).toBe(false);
      expect(result.suggested).toBe("1");
    });
  });
});
