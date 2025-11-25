import { prisma } from "../../app.js";
import { getProfileInfo, postEditProfileInfo } from "../../lib/dataService.js";
import { jest } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import jwt from "jsonwebtoken";

function generateTestJWT(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
}

describe("getProfileInfo", () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
  };

  it("should call prisma.user.findUnique with correct filters", async () => {
    const fakeUser = {
      id: "12345678",
      username: "newname",
      firstName: "New",
      lastName: "Name",
      profileImageUrl: "https://example.com/harry.jpg",
      bio: "Hi there",
    };

    mockPrisma.user.findUnique.mockResolvedValue(fakeUser);

    const result = await getProfileInfo(
      mockPrisma,
      fakeUser.id,
      fakeUser.username,
      fakeUser.firstName,
      fakeUser.lastName,
      fakeUser.profileImageUrl,
      fakeUser.bio
    );

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "12345678" },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        bio: true,
      },
    });

    expect(result).toEqual(fakeUser);
  });
});

describe("postEditProfileInfo", () => {
  const mockPrisma = {
    user: {
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    mockPrisma.user.update.mockReset();
  });

  it("updates all fields when all are provided", async () => {
    const id = "user-123";
    const payload = {
      username: "newname",
      firstName: "New",
      lastName: "Name",
      profileImageUrl: "/uploads/new.png",
      bio: "Updated bio",
    };
    const updatedUser = { id, ...payload };

    mockPrisma.user.update.mockResolvedValue(updatedUser);

    const result = await postEditProfileInfo(mockPrisma, id, payload);

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id },
      data: {
        username: "newname",
        firstName: "New",
        lastName: "Name",
        profileImageUrl: "/uploads/new.png",
        bio: "Updated bio",
      },
    });
    expect(result).toEqual(updatedUser);
  });

  it("updates only provided fields (partial update)", async () => {
    const id = "user-123";
    const payload = { bio: "Only bio changed" };
    const updatedUser = {
      id,
      username: "existing",
      firstName: "Existing",
      lastName: "User",
      profileImageUrl: "",
      bio: "Only bio changed",
    };

    mockPrisma.user.update.mockResolvedValue(updatedUser);

    const result = await postEditProfileInfo(mockPrisma, id, payload);

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id },
      data: {
        bio: "Only bio changed",
        profileImageUrl: "/assets/images/default-user-profile.jpg",
      },
    });
    expect(result).toEqual(updatedUser);
  });

  it("bubbles up unique constraint error (P2002)", async () => {
    const id = "user-123";
    const payload = { username: "taken-name" };
    const err = Object.assign(new Error("Unique constraint"), {
      code: "P2002",
      meta: { target: ["username"] },
    });

    mockPrisma.user.update.mockRejectedValue(err);

    await expect(
      postEditProfileInfo(mockPrisma, id, payload)
    ).rejects.toMatchObject({
      code: "P2002",
    });

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id },
      data: {
        username: "taken-name",
        profileImageUrl: "/assets/images/default-user-profile.jpg",
      },
    });
  });
});

describe("POST /api/users/:id/profile", () => {
  let testUser;
  let token;

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: "update@test.com" } });

    testUser = await prisma.user.create({
      data: {
        username: "update-user",
        email: "update@test.com",
        firstName: "Old",
        lastName: "Name",
        password: "hashed-pass",
        bio: "Old bio",
      },
    });

    token = generateTestJWT(testUser);
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: testUser.id } });
    //await prisma.$disconnect();
  });

  it("200: owner updates their own profile", async () => {
    const payload = {
      username: "new-user",
      firstName: "New",
      lastName: "Name",
      bio: "Updated bio",
    };

    const res = await request(app)
      .post(`/api/users/${testUser.id}/profile`)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(res.statusCode).toBe(200);
    expect(res.body.profile.username).toBe("new-user");
  });
});
