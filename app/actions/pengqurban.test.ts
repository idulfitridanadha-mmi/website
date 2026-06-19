import { getPengqurban, createPengqurban, updatePengqurban, deletePengqurban } from "./pengqurban";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Mock dependencies
jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    pengqurban: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mPrismaClient),
  };
});

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const prismaMock = new PrismaClient() as any;

describe("Pengqurban Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPengqurban", () => {
    it("should retrieve pengqurban data successfully with parameters", async () => {
      const mockData = [
        { nkw: "1447001", nama_lengkap: "Fulan bin Fulan" }
      ];
      prismaMock.pengqurban.findMany.mockResolvedValue(mockData);

      const result = await getPengqurban("Fulan", "1447");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(prismaMock.pengqurban.findMany).toHaveBeenCalled();
    });

    it("should return empty array and success false on database failure", async () => {
      prismaMock.pengqurban.findMany.mockRejectedValue(new Error("Database error"));

      const result = await getPengqurban();

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
    });
  });

  describe("createPengqurban", () => {
    it("should successfully create new pengqurban if NKW is unique", async () => {
      const formData = {
        nkw: "1447003",
        nama_lengkap: "Shohibul 3",
        no_urut: "3",
      };

      prismaMock.pengqurban.findUnique.mockResolvedValue(null);
      prismaMock.pengqurban.create.mockResolvedValue({ nkw: "1447003" });

      const result = await createPengqurban(formData);

      expect(result.success).toBe(true);
      expect(result.message).toContain("berhasil disimpan");
      expect(prismaMock.pengqurban.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          nkw: "1447003",
          no_urut: 3,
        }),
      });
      expect(revalidatePath).toHaveBeenCalledWith("/admin/pengqurban");
    });

    it("should return error if NKW is already registered", async () => {
      const formData = {
        nkw: "1447003",
        nama_lengkap: "Shohibul 3",
      };

      prismaMock.pengqurban.findUnique.mockResolvedValue({ nkw: "1447003" });

      const result = await createPengqurban(formData);

      expect(result.success).toBe(false);
      expect(result.message).toContain("sudah terdaftar");
      expect(prismaMock.pengqurban.create).not.toHaveBeenCalled();
    });

    it("should return success false on database exceptions", async () => {
      prismaMock.pengqurban.findUnique.mockRejectedValue(new Error("DB Connection Error"));

      const result = await createPengqurban({ nkw: "1447003" });

      expect(result.success).toBe(false);
      expect(result.message).toContain("Terjadi kesalahan saat menyimpan");
    });
  });

  describe("updatePengqurban", () => {
    it("should update pengqurban details successfully", async () => {
      const formData = {
        nama_lengkap: "Updated Name",
      };

      prismaMock.pengqurban.update.mockResolvedValue({ nkw: "1447001" });

      const result = await updatePengqurban("1447001", formData);

      expect(result.success).toBe(true);
      expect(prismaMock.pengqurban.update).toHaveBeenCalledWith({
        where: { nkw: "1447001" },
        data: expect.objectContaining({
          nama_lengkap: "Updated Name",
        }),
      });
      expect(revalidatePath).toHaveBeenCalledWith("/admin/pengqurban");
    });

    it("should return success false if database update fails", async () => {
      prismaMock.pengqurban.update.mockRejectedValue(new Error("Update failure"));

      const result = await updatePengqurban("1447001", {});

      expect(result.success).toBe(false);
      expect(result.message).toContain("Gagal mengupdate");
    });
  });

  describe("deletePengqurban", () => {
    it("should successfully delete the pengqurban", async () => {
      prismaMock.pengqurban.delete.mockResolvedValue({ nkw: "1447001" });

      const result = await deletePengqurban("1447001");

      expect(result.success).toBe(true);
      expect(prismaMock.pengqurban.delete).toHaveBeenCalledWith({
        where: { nkw: "1447001" },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/admin/pengqurban");
    });

    it("should handle relational dependency failure (error P2003)", async () => {
      const error: any = new Error("Foreign key constraint violation");
      error.code = "P2003";
      prismaMock.pengqurban.delete.mockRejectedValue(error);

      const result = await deletePengqurban("1447001");

      expect(result.success).toBe(false);
      expect(result.message).toContain("Hapus dulu data hewan qurban");
    });

    it("should handle generic delete errors", async () => {
      prismaMock.pengqurban.delete.mockRejectedValue(new Error("Delete failed"));

      const result = await deletePengqurban("1447001");

      expect(result.success).toBe(false);
      expect(result.message).toContain("Terjadi kesalahan saat menghapus");
    });
  });
});
