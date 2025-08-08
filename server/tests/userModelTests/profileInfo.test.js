import { getProfileInfo, postEditProfileInfo } from "../../lib/dataService.js";
import { jest } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";

describe("getProfileInfo", () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
  };

  it("should call prisma.user.findUnique with correct filters", async () => {
    const fakeUser = {
      id: "12345678",
      username: "johndoe",
      firstName: "John",
      lastName: "Doe",
      profileImageUrl: "https://example.com/john.jpg",
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
      data: { username: "taken-name",
      profileImageUrl: "/assets/images/default-user-profile.jpg",
    },
    });
  });
});

describe("POST /api/users/:id/profile", () => {
  const mockUpdate = jest.fn();

  const mockPrisma = {
    user: {
      update: mockUpdate,
    },
  };

  beforeEach(() => {
    mockUpdate.mockReset();
  });

  const ownerId = "user-123";
  const otherId = "user-456";

  const payload = {
    username: "newname",
    firstName: "New",
    lastName: "Name",
    profileImageUrl: "https://example.com/uploads/pic.png",
    bio: "Updated bio",
  };

  it("200: owner updates their own profile", async () => {
    const updated = { id: ownerId, ...payload };

    mockPrisma.user.update.mockResolvedValue(updated);

    const res = await request(app)
      .post(`/api/users/${ownerId}/profile`)
      .set("Authorization", "Bearer fake")
      .set("x-user-id", ownerId)
      .send(payload);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ profile: updated });
  });

  it("401: no auth token provided", async () => {
    const res = await request(app)
      .post(`/api/users/${ownerId}/profile`)
      .send(payload);

    expect(res.statusCode).toBe(401);
  });

  it("403: cannot update another user's profile", async () => {
    const res = await request(app)
      .post(`/api/users/${otherId}/profile`)
      .set("Authorization", "Bearer fake")
      .set("x-user-id", ownerId)
      .send(payload);

    expect(res.statusCode).toBe(403);
  });

  it("400: validation error (e.g., bio too long)", async () => {
    const tooLong = { bio: "x".repeat(151) };
    const res = await request(app)
      .post(`/api/users/${ownerId}/profile`)
      .set("Authorization", "Bearer fake")
      .set("x-user-id", ownerId)
      .send(tooLong);

    expect(res.statusCode).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});
