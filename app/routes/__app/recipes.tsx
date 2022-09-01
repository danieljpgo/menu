import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useMatches } from "@remix-run/react";
import { portions } from "lib/ingredients";
import { Heading, Shelf, Stack, Text } from "~/components";
import { getRecipes } from "~/server/recipe.server";
import { requireUserId } from "~/server/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const recipes = await getRecipes({ userId });
  return json({ recipes });
}

export default function RecipesLayout() {
  const data = useLoaderData<typeof loader>();
  const matches = useMatches();

  const showRecipes = !matches.some((match) =>
    [
      "routes/__app/recipes/new",
      "routes/__app/recipes/$recipeId",
      "routes/__app/recipes/$recipeId/index",
      "routes/__app/recipes/$recipeId/edit",
    ].includes(match.id)
  );

  return (
    <>
      <div className="grid gap-4 px-6 py-4">
        <Stack gap="md">
          <Heading as="h2" weight="semibold">
            Recipes
          </Heading>
          {showRecipes && (
            <div className="pb-16">
              <Stack as="ul" gap="md">
                {data.recipes.length === 0 && (
                  <Text as="p" size="sm" weight="normal" color="dark">
                    No recipes created yet,{" "}
                    <Link
                      to="new"
                      className="text-sm font-medium text-blue-500 transform"
                    >
                      create a new recipe.
                    </Link>
                  </Text>
                )}
                {data.recipes.map((recipe, index) => (
                  <li
                    key={recipe.id}
                    className={
                      index !== data.recipes.length - 1
                        ? "border-b border-solid pb-4"
                        : ""
                    }
                  >
                    <Link to={`${recipe.id}`}>
                      <Stack gap="xs">
                        <Heading as="h3" weight="medium">
                          {recipe.name}
                        </Heading>
                        <Text>{recipe.description}</Text>
                        <Heading as="h4" weight="medium">
                          Ingredients
                        </Heading>
                      </Stack>
                      <ul>
                        {recipe.ingredients.map((ingredient) => (
                          <Shelf as="li" key={ingredient.ingredient.id}>
                            <Text>-</Text>
                            <Text>{ingredient.ingredient.name}</Text>-
                            <Text color="light">
                              {ingredient.ingredient.unit === "p"
                                ? portions.find(
                                    (portion) =>
                                      portion.value === ingredient.amount
                                  )?.label ?? "?"
                                : `${ingredient.amount} ${ingredient.ingredient.unit}`}
                            </Text>
                          </Shelf>
                        ))}
                      </ul>
                    </Link>
                  </li>
                ))}
              </Stack>
            </div>
          )}
        </Stack>
        <Outlet />
      </div>
    </>
  );
}
