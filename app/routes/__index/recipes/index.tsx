import type { LoaderArgs } from "@remix-run/node";
import { Heading, Shelf, Stack, Text } from "~/components";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { prisma } from "~/server/db.server";
import { requireUserId } from "~/server/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const recipes = await prisma.recipe.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
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
    },
  });
  return json({ recipes });
}

export default function Recipes() {
  const data = useLoaderData<typeof loader>();

  return (
    <Stack gap="md">
      <Heading as="h2" weight="medium">
        Recipes
      </Heading>
      <Stack as="ul" gap="md">
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
              <Heading as="h4" weight="medium">
                {recipe.name}
              </Heading>
              <Heading as="h5" weight="medium">
                Ingredients
              </Heading>
              <ul>
                {recipe.ingredients.map((data, index) => (
                  <Shelf as="li" key={data.ingredient.id}>
                    <Text>{data.ingredient.name}</Text>-
                    <Text color="light">{data.amount}</Text>
                    <Text color="light">{data.ingredient.unit}</Text>
                  </Shelf>
                ))}
              </ul>
            </Link>
          </li>
        ))}
      </Stack>
    </Stack>
    // <p>
    //   No recipes selected. Select a recipe on the left, or{" "}
    //   <Link to="new" className="text-blue-500 underline">
    //     create a new recipe.
    //   </Link>
    // </p>
  );
}
