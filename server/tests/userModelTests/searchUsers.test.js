import { jest } from "@jest/globals";
import { getSearchedUsers } from "../../lib/dataService.js";
import request from "supertest";
import app from "../../app.js";

const mockFindMany = jest.fn();

const mockPrisma = {
  user: {
    findMany: mockFindMany,
  },
};

describe("getSearchedUsers", () => {
  beforeEach(() => {
    mockFindMany.mockReset();
  });

  it("should call findMany with only username-like search and return results", async () => {
    const fakeUsers = [
      { username: "bob123", firstName: "Bob", lastName: "Smith" },
    ];
    mockFindMany.mockResolvedValue(fakeUsers);

    const query = "bob123";

    const result = await getSearchedUsers(mockPrisma, query);

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: [{ username: "asc" }, { firstName: "asc" }, { lastName: "asc" }],
    });

    expect(result).toEqual(fakeUsers);
  });

  it("should call findMany with only firstName-like search and return results", async () => {
    const fakeUsers = [
      { username: "bob123", firstName: "Bob", lastName: "Smith" },
    ];
    mockFindMany.mockResolvedValue(fakeUsers);

    const query = "Bob";

    const result = await getSearchedUsers(mockPrisma, query);

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: [{ username: "asc" }, { firstName: "asc" }, { lastName: "asc" }],
    });

    expect(result).toEqual(fakeUsers);
  });

  it("should call findMany with only lastName-like search and return results", async () => {
    const fakeUsers = [
      { username: "bob123", firstName: "Bob", lastName: "Smith" },
    ];
    mockFindMany.mockResolvedValue(fakeUsers);

    const query = "Smith";

    const result = await getSearchedUsers(mockPrisma, query);

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: [{ username: "asc" }, { firstName: "asc" }, { lastName: "asc" }],
    });

    expect(result).toEqual(fakeUsers);
  });

  it("should call findMany with multiple names in one query string", async () => {
    const fakeUsers = [
      { username: "andy123", firstName: "Andy", lastName: "Johnson" },
    ];
    mockFindMany.mockResolvedValue(fakeUsers);

    const query = "Andy Johnson";

    const result = await getSearchedUsers(mockPrisma, query);

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: [{ username: "asc" }, { firstName: "asc" }, { lastName: "asc" }],
    });

    expect(result).toEqual(fakeUsers);
  });
});

describe("GET /api/users/search", () => {
  it("returns 400 if query param 'q' is missing", async () => {
    const res = await request(app).get("/api/users/search");
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it("returns user list for a valid search query", async () => {
    const res = await request(app).get("/api/users/search").query({ q: "Bob" });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
