import { prisma } from "~/server/db.server";

export function getMenu(id: string) {
  return prisma.menu.findUnique({
    include: {
      recipes: {
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      },
    },
    where: { id },
  });
}

export function getMenus({ userId }: { userId: string }) {
  return prisma.menu.findMany({
    where: { userId },
    select: { name: true, id: true },
    orderBy: { name: "asc" },
  });
}

export function createMenu(form: {
  userId: string;
  name: string;
  description: string;
  recipes: Array<string>;
}) {
  return prisma.menu.create({
    data: {
      name: form.name,
      description: form.description,
      recipes: {
        connect: form.recipes.map((recipe) => ({
          id: recipe,
        })),
      },
      user: {
        connect: {
          id: form.userId,
        },
      },
    },
  });
}

export function deleteMenu(id: string) {
  return prisma.menu.deleteMany({
    where: { id },
  });
}

export async function updateMenu(
  id: string,
  form: { recipes: Array<string>; name: string; description: string }
) {
  const menu = await getMenu(id);

  if (!menu) return menu;

  const disconnectRecipes = menu.recipes.filter(
    (recipe) => !form.recipes.some((id) => id === recipe.id)
  );
  const connectRecipes = form.recipes.filter(
    (id) => !menu.recipes.some((recipe) => recipe.id === id)
  );

  const newMenu = await prisma.menu.update({
    where: { id },
    data: {
      name: form.name,
      description: form.description,
      recipes: {
        disconnect: disconnectRecipes.map(({ id }) => ({ id })),
        connect: connectRecipes.map((id) => ({ id })),
      },
    },
  });

  return newMenu;
}
