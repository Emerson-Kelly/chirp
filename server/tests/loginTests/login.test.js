/*
import { prisma } from "../../lib/dataService.js";
import { jest } from "@jest/globals";
import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../../app.js";

// TODO: add login test when JWT is set up

beforeAll(async () => {
  // Make sure no leftover test users exist
  await prisma.user.deleteMany({
    where: { username: "test-user" },
  });

  // Create a fake user in the test database
  await prisma.user.create({
    data: {
      id: "11122233", // fixed test ID
      firstName: "test",
      lastName: "user",
      profileImageUrl: "https://example.com/test.jpg",
      bio: "Hi this is a test!",
      username: "test-user",
      password: "#Password123",
      email: "test@example.com",
    },
  });
});

afterAll(async () => {
  // Clean up test data
  await prisma.user.deleteMany({
    where: { username: "test-user" },
  });
  await prisma.$disconnect();
});

describe("Authentication", () => {
  describe("Login", () => {
    it("should log in a user successfully", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "test-user", password: "#Password123" })
        .expect(200)
        .expect("Content-Type", /json/);

      // Skip JWT validation for now
      expect(res.body).toHaveProperty("message", "Login successful");
    });

    it("should fail for wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "test-user", password: "wrong" })
        .expect(401);

      expect(res.body).toHaveProperty("error");
    });
  });
});
*/