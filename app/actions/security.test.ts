import { updateHewan } from "./hewan";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

// Mock Prisma
jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    hewanQurban: {
      update: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mPrismaClient),
  };
});

// Mock NextAuth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock Next.js cache revalidation
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const prismaMock = new PrismaClient() as any;
const mockGetServerSession = getServerSession as jest.Mock;

describe("updateHewan Security Access Control Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fail when user is not authenticated (null session)", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const result = await updateHewan("hewan-123", { status_hewan: "DISEMBELIH" });

    expect(result.success).toBe(false);
    expect(result.message).toContain("Akses ditolak");
    expect(prismaMock.hewanQurban.update).not.toHaveBeenCalled();
  });

  it("should fail when authenticated user is not an admin (e.g., role is STAF)", async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        name: "Staff User",
        role: "STAF",
      },
    });

    const result = await updateHewan("hewan-123", { status_hewan: "DISEMBELIH" });

    expect(result.success).toBe(false);
    expect(result.message).toContain("Akses ditolak");
    expect(prismaMock.hewanQurban.update).not.toHaveBeenCalled();
  });

  it("should fail validation when status_hewan is outside the logical enum bounds defined in the PRD", async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        name: "Admin User",
        role: "ADMIN",
      },
    });

    const invalidStatuses = ["KABUR", "BOCOR", "DIJUAL", "123", "WAITING"];

    for (const status of invalidStatuses) {
      const result = await updateHewan("hewan-123", { status_hewan: status });

      expect(result.success).toBe(false);
      expect(result.message).toContain("Status hewan tidak valid");
      expect(prismaMock.hewanQurban.update).not.toHaveBeenCalled();
    }
  });

  it("should succeed and update status when user is an ADMIN and status is in the logical enum", async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        name: "Admin User",
        role: "ADMIN",
      },
    });

    prismaMock.hewanQurban.update.mockResolvedValue({ id_hewan: "hewan-123" });

    const validStatuses = ["MENUNGGU", "DISEMBELIH", "DIDISTRIBUSIKAN"];

    for (const status of validStatuses) {
      const result = await updateHewan("hewan-123", { status_hewan: status });

      expect(result.success).toBe(true);
      expect(prismaMock.hewanQurban.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id_hewan: "hewan-123" },
          data: expect.objectContaining({
            status_hewan: status,
          }),
        })
      );
    }
  });
});
