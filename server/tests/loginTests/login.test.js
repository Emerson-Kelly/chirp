import { prisma } from "../../app.js";
import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../../app.js";

describe("Login", () => {
  let mockUser;

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { username: "mock-user" } });

    const hashedPassword = await bcrypt.hash("#Password123", 12);

    mockUser = await prisma.user.create({
      data: {
        username: "mock-user",
        firstName: "mock",
        lastName: "user",
        email: "mock@example.com",
        password: hashedPassword,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { username: "mock-user" } });
    await prisma.$disconnect();
  });

  it("should log in a user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "mock-user", password: "#Password123" })
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body).toHaveProperty("message", "Login successful");
    expect(res.body.user).toHaveProperty("username", "mock-user");
  });

  it("should fail for wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "mock-user", password: "wrong" })
      .expect(401);

    expect(res.body).toHaveProperty("error", "Invalid username or password");
  });

  it("should fail if username is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "#Password123" })
      .expect(400);

    expect(res.body.errors[0].msg).toBe("Enter a valid username");
  });
});
