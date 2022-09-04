import type { Ingredient } from "@prisma/client";
import { prisma } from "./db.server";

export function getShop(id: string) {
  return prisma.shop.findUnique({
    where: { id },
    select: {
      menus: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function getShopPurchasesWithTotalValues({
  userId,
}: {
  userId: string;
}) {
  const shop = await prisma.shop.findUnique({
    where: { userId },
    select: {
      id: true,
      purchases: { select: { id: true, bought: true, ingredient: true } },
      menus: {
        select: {
          recipes: {
            select: {
              ingredients: {
                select: { id: true, amount: true, ingredient: true },
              },
            },
          },
        },
      },
    },
  });

  if (!shop) return shop;

  const ingredients = shop.menus
    .map((menu) =>
      menu.recipes.map((recipe) =>
        recipe.ingredients.map((ingredient) => ({
          id: ingredient.ingredient.id,
          amount: ingredient.amount,
        }))
      )
    )
    .flat()
    .flat();

  const purchases = shop.purchases.map((purchase) => ({
    ...purchase,
    value: ingredients
      .filter((ingredient) => ingredient.id === purchase.ingredient.id)
      .reduce((acc, curr) => acc + curr.amount, 0),
  }));

  return { ...shop, purchases };
}

export async function createShop(
  { userId }: { userId: string },
  form: { menus: string[] }
) {
  const menus = await prisma.menu.findMany({
    where: { id: { in: form.menus } },
    select: {
      recipes: {
        select: {
          ingredients: {
            select: {
              ingredient: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const purchaseIngredients = new Set<Ingredient["id"]>();
  menus.forEach((menu) =>
    menu.recipes.forEach((recipe) =>
      recipe.ingredients.forEach((ingredient) =>
        purchaseIngredients.add(ingredient.ingredient.id)
      )
    )
  );
  const shop = prisma.shop.create({
    data: {
      purchases: {
        create: Array.from(purchaseIngredients).map((id) => ({
          ingredient: { connect: { id } },
        })),
      },
      menus: { connect: form.menus.map((id) => ({ id })) },
      user: { connect: { id: userId } },
    },
  });

  return shop;
}

export async function updateShop(form: { menusId: string[]; shopId: string }) {
  const shop = await prisma.shop.findUnique({
    where: { id: form.shopId },
    include: {
      purchases: true,
      menus: {
        include: {
          recipes: {
            include: {
              ingredients: {
                select: {
                  ingredient: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!shop) {
    return shop;
  }

  const disconnectMenus = shop.menus.filter(
    (menu) => !form.menusId.some((id) => id === menu.id)
  );
  const unchangedMenus = shop.menus.filter((menu) =>
    form.menusId.some((id) => id === menu.id)
  );
  const connectMenus = form.menusId.filter(
    (id) => !shop.menus.some((menu) => menu.id === id)
  );
  const newMenusId = [...unchangedMenus.map(({ id }) => id), ...connectMenus];

  const newMenus = await prisma.menu.findMany({
    where: { id: { in: newMenusId } },
    select: {
      recipes: {
        select: {
          ingredients: {
            select: {
              ingredient: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const newPurchaseIngredients = new Set<Ingredient["id"]>();
  newMenus.forEach((menu) =>
    menu.recipes.forEach((recipe) =>
      recipe.ingredients.forEach((ingredient) =>
        newPurchaseIngredients.add(ingredient.ingredient.id)
      )
    )
  );

  const currentPurchaseIngredients = new Set<Ingredient["id"]>();
  shop.menus.forEach((menu) =>
    menu.recipes.forEach((recipe) =>
      recipe.ingredients.forEach((ingredient) =>
        currentPurchaseIngredients.add(ingredient.ingredient.id)
      )
    )
  );

  const deletePurchases = Array.from(currentPurchaseIngredients).filter(
    (id) => !Array.from(newPurchaseIngredients).some((a) => id === a)
  );
  const createPurchases = Array.from(newPurchaseIngredients).filter(
    (id) => !Array.from(currentPurchaseIngredients).some((a) => a === id)
  );

  const updatedShop = prisma.shop.update({
    where: { id: form.shopId },
    data: {
      menus: {
        disconnect: disconnectMenus.map((menu) => ({ id: menu.id })),
        connect: connectMenus.map((id) => ({ id })),
      },
      purchases: {
        deleteMany: deletePurchases.map((id) => ({
          ingredientId: id,
        })),
        create: createPurchases.map((id) => ({
          ingredient: { connect: { id } },
        })),
      },
    },
  });

  return updatedShop;
}

export function updateShopPurchases(
  id: string,
  form: { boughts: Array<{ id: string; check: boolean }> }
) {
  return prisma.shop.update({
    where: { id },
    data: {
      purchases: {
        updateMany: form.boughts.map((bought) => ({
          where: { id: String(bought.id) },
          data: { bought: bought.check },
        })),
      },
    },
  });
}

export function deleteShop(id: string) {
  return prisma.shop.delete({
    where: { id },
  });
}
