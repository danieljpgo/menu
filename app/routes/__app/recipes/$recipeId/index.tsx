import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";
import { portions } from "lib/ingredients";
import { notFound } from "lib/remix";
import { z } from "zod";
import { Button, Heading, Shelf, Stack, Text } from "~/components";
import { deteleRecipe, getRecipe } from "~/server/recipe.server";
import { requireUserId } from "~/server/session.server";

const schema = z.object({
  recipeId: z.string({ required_error: "recipeId not found" }),
});

export const meta: MetaFunction = ({ data }) => ({
  title: `Menu - ${data.recipe.name}`,
});

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request);
  const validation = schema.safeParse(params);
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }
  const recipe = await getRecipe(validation.data.recipeId);
  if (!recipe) throw notFound();
  return json({ recipe });
}

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request);
  const validation = schema.safeParse(params);
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }
  await deteleRecipe(validation.data.recipeId);
  return redirect("/recipes");
}

export default function RecipeDetails() {
  const data = useLoaderData<typeof loader>();

  return (
    <Stack gap="xs">
      <Heading as="h3" weight="medium">
        {data.recipe.name}
      </Heading>
      <Text>{data.recipe.description}</Text>
      <Stack gap="none">
        <Heading as="h4" weight="medium">
          Ingredients
        </Heading>
        <ul>
          {data.recipe.ingredients.map((ingredient) => (
            <Shelf key={ingredient.id}>
              <Text>-</Text>
              <Text>{ingredient.ingredient.name}</Text>-
              <Text color="light">
                {ingredient.ingredient.unit === "p"
                  ? portions.find(
                      (portion) => portion.value === ingredient.amount
                    )?.label ?? "?"
                  : `${ingredient.amount} ${ingredient.ingredient.unit}`}
              </Text>
            </Shelf>
          ))}
        </ul>
      </Stack>
      <div className="fixed bottom-0 left-0 right-0 grid gap-4 px-6 pb-4 bg-white ">
        <hr />
        <Shelf gap="md">
          <Form method="post" className="w-full">
            <Button size="sm" type="submit" fill>
              delete
            </Button>
          </Form>
          <Link to="edit" className="grid w-full">
            <Button size="sm" type="button" fill>
              edit
            </Button>
          </Link>
        </Shelf>
      </div>
    </Stack>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();
  if (caught.status === 404) {
    return <div>{caught.data}</div>;
  }
  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

// @TODO select the first from the list or reset redirecting to index?
// @TODO create a good error screen
