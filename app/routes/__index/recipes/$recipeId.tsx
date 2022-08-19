import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { prisma } from "~/server/db.server";
import { requireUserId } from "~/server/session.server";
import { Button, Heading, Shelf, Stack, Text } from "~/components";

const schema = z.object({
  recipeId: z.string({ required_error: "recipeId not found" }),
});

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  const validation = schema.safeParse(params);

  if (!validation.success) {
    const { message } = validation.error.issues[0];
    throw new Error(message);
  }

  const recipe = await prisma.recipe.findFirst({
    select: {
      id: true,
      description: true,
      name: true,
      ingredients: {
        include: {
          Recipe: true,
          ingredient: true,
        },
      },
    },
    where: { id: validation.data.recipeId, userId },
  });
  if (!recipe) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ recipe });
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  const validation = schema.safeParse(params);

  if (!validation.success) {
    const { message } = validation.error.issues[0];
    throw new Error(message);
  }

  await prisma.recipe.deleteMany({
    where: { id: validation.data.recipeId, userId },
  });
  return redirect("/recipes");
}

export default function RecipeDetails() {
  const data = useLoaderData<typeof loader>();

  return (
    <Stack gap="md">
      <Stack>
        <Heading as="h2" weight="semibold">
          {data.recipe.name}
        </Heading>
        <Text>{data.recipe.description}</Text>
      </Stack>
      <Stack>
        <Heading as="h3" weight="medium">
          Ingredient
        </Heading>
        <Stack as="ul" gap="xs">
          {data.recipe.ingredients.map((ingredient) => (
            <Shelf key={ingredient.id}>
              <Text>{ingredient.ingredient.name}</Text>-
              <Text color="light">{ingredient.amount}</Text>
              <Text color="light">{ingredient.ingredient.unit}</Text>
            </Shelf>
          ))}
        </Stack>
      </Stack>
      <hr />
      <div className="flex justify-between">
        <div>
          <Button size="sm" type="button" disabled>
            {/* @TODO ICON? */}
            edit
          </Button>
        </div>

        <Form method="post">
          <Button size="sm" type="submit">
            Delete
          </Button>
        </Form>
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
