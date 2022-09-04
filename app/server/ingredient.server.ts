import { prisma } from "./db.server";

export function getIngredients() {
  return prisma.ingredient.findMany({
    orderBy: { name: "asc" },
  });
}
