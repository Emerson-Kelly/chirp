import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

export function getSearchedUsers(prisma, query) {
  return prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: query, mode: "insensitive" } },
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: [{ username: "asc" }, { firstName: "asc" }, { lastName: "asc" }],
  });
}
