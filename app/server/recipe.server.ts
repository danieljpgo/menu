import { prisma } from "./db.server";

export function getRecipe(id: string) {
  return prisma.recipe.findUnique({
    where: { id },
    select: {
      id: true,
      description: true,
      name: true,
      ingredients: {
        include: {
          recipe: true,
          ingredient: true,
        },
      },
    },
  });
}

export function getRecipes(userId: string) {
  return prisma.recipe.findMany({
    where: { userId },
    select: {
      ingredients: {
        select: {
          ingredient: true,
          amount: true,
        },
      },
      id: true,
      user: true,
      name: true,
      description: true,
    },
    orderBy: { name: "asc" },
  });
}

export function deteleRecipe(id: string) {
  return prisma.recipe.delete({
    where: { id },
  });
}

export async function updateRecipe(
  { userId }: { userId: string },
  form: {
    recipeId: string;
    name: string;
    description: string;
    ingredients: Array<string>;
    amounts: Array<number>;
  }
) {
  const recipe = await getRecipe(form.recipeId);
  if (!recipe) return recipe;
  const deleteIngredient = recipe.ingredients.filter(
    (ingredient) =>
      !form.ingredients.some((id) => id === ingredient.ingredientId)
  );
  const updatedIngredient = recipe.ingredients.filter((ingredient) =>
    form.ingredients.some(
      (id, index) =>
        id === ingredient.ingredientId &&
        form.amounts[index] !== ingredient.amount
    )
  );
  const addIngredient = form.ingredients.filter(
    (id) =>
      !recipe.ingredients.some((ingredient) => ingredient.ingredientId === id)
  );
  return prisma.recipe.update({
    where: { id: form.recipeId },
    data: {
      name: form.name,
      description: form.description,
      ingredients: {
        create: addIngredient.map((ingredient) => ({
          amount:
            form.amounts[form.ingredients.findIndex((id) => id === ingredient)],
          ingredient: { connect: { id: ingredient } },
        })),
        updateMany: updatedIngredient.map((ingredient) => ({
          where: { id: ingredient.id },
          data: {
            amount:
              form.amounts[
                form.ingredients.findIndex(
                  (id) => id === ingredient.ingredientId
                )
              ],
          },
        })),
        deleteMany: deleteIngredient.map((ingredient) => ({
          id: ingredient.id,
        })),
      },
      user: { connect: { id: userId } },
    },
  });
}

export function createRecipe(form: {
  userId: string;
  name: string;
  description: string;
  ingredients: Array<string>;
  amounts: Array<number>;
}) {
  return prisma.recipe.create({
    data: {
      name: form.name,
      description: form.description,
      ingredients: {
        create: form.ingredients.map((ingredient, index) => ({
          amount: form.amounts[index],
          ingredient: { connect: { id: ingredient } },
        })),
      },
      user: { connect: { id: form.userId } },
    },
  });
}
