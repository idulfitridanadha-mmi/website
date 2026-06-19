import { createPetugas, getPetugasJaga, updatePetugas, deletePetugas } from "./petugas";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Mock dependencies
jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    petugasJaga: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
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

jest.mock("@/app/lib/hijri", () => ({
  getActiveHijriYear: jest.fn(() => "1447"),
}));

const prismaMock = new PrismaClient() as any;

describe("Petugas Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createPetugas", () => {
    it("should successfully create a new volunteer with incremented sequence id", async () => {
      const formData = {
        nama: "Volunteer A",
        no_hp: "0812345",
      };

      prismaMock.petugasJaga.findFirst.mockResolvedValue({ id_lama: "144701" });
      prismaMock.petugasJaga.create.mockResolvedValue({ id_lama: "144702" });

      const result = await createPetugas(formData);

      expect(result.success).toBe(true);
      expect(result.message).toContain("ID: 144702");
      expect(prismaMock.petugasJaga.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id_lama: "144702",
          nama: "Volunteer A",
        }),
      });
      expect(revalidatePath).toHaveBeenCalledWith("/admin/petugas");
    });

    it("should handle creating volunteer when no previous volunteer exists", async () => {
      const formData = {
        nama: "Volunteer B",
      };

      prismaMock.petugasJaga.findFirst.mockResolvedValue(null);
      prismaMock.petugasJaga.create.mockResolvedValue({ id_lama: "144701" });

      const result = await createPetugas(formData);

      expect(result.success).toBe(true);
      expect(result.message).toContain("ID: 144701");
    });

    it("should return success false on database errors during creation", async () => {
      prismaMock.petugasJaga.findFirst.mockRejectedValue(new Error("Database connection failed"));

      const result = await createPetugas({ name: "Volunteer C" });

      expect(result.success).toBe(false);
      expect(result.message).toContain("Terjadi kesalahan saat menyimpan");
    });
  });

  describe("getPetugasJaga", () => {
    it("should retrieve list of volunteers successfully", async () => {
      const mockVolunteers = [
        { id_lama: "144701", nama: "Volunteer A" },
      ];
      prismaMock.petugasJaga.findMany.mockResolvedValue(mockVolunteers);

      const result = await getPetugasJaga("Volunteer", "1447");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockVolunteers);
    });

    it("should return empty array on database failure", async () => {
      prismaMock.petugasJaga.findMany.mockRejectedValue(new Error("Failure"));

      const result = await getPetugasJaga();

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
    });
  });

  describe("updatePetugas", () => {
    it("should update volunteer info successfully", async () => {
      const formData = {
        nama: "Updated Volunteer",
      };

      prismaMock.petugasJaga.update.mockResolvedValue({ id_petugas: "vol-1" });

      const result = await updatePetugas("vol-1", formData);

      expect(result.success).toBe(true);
      expect(prismaMock.petugasJaga.update).toHaveBeenCalledWith({
        where: { id_petugas: "vol-1" },
        data: expect.objectContaining({
          nama: "Updated Volunteer",
        }),
      });
      expect(revalidatePath).toHaveBeenCalledWith("/admin/petugas");
    });

    it("should return success false on update failure", async () => {
      prismaMock.petugasJaga.update.mockRejectedValue(new Error("Update failed"));

      const result = await updatePetugas("vol-1", {});

      expect(result.success).toBe(false);
      expect(result.message).toContain("Terjadi kesalahan saat memperbarui");
    });
  });

  describe("deletePetugas", () => {
    it("should successfully delete a volunteer", async () => {
      prismaMock.petugasJaga.delete.mockResolvedValue({ id_petugas: "vol-1" });

      const result = await deletePetugas("vol-1");

      expect(result.success).toBe(true);
      expect(prismaMock.petugasJaga.delete).toHaveBeenCalledWith({
        where: { id_petugas: "vol-1" },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/admin/petugas");
    });

    it("should return error if deletion fails (e.g. relational constraint)", async () => {
      prismaMock.petugasJaga.delete.mockRejectedValue(new Error("Relational dependency"));

      const result = await deletePetugas("vol-1");

      expect(result.success).toBe(false);
      expect(result.message).toContain("tidak terikat dengan data shohibul qurban");
    });
  });
});
