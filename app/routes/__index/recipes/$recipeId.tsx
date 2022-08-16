import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { prisma } from "~/server/db.server";
import { requireUserId } from "~/server/session.server";

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
        select: {
          amount: true,
          ingredient: {
            select: {
              unit: true,
              name: true,
            },
          },
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
    <div className="grid gap-4">
      <h3 className="text-2xl font-bold">{data.recipe.name}</h3>
      <p>{data.recipe.description}</p>
      <ul className="grid gap-4">
        {data.recipe.ingredients.map((a) => (
          <li key={a.ingredient.name} className="flex gap-2">
            <p>{a.ingredient.name}</p>
            <p>{a.amount}</p>
            <p>{a.ingredient.unit}</p>
          </li>
        ))}
      </ul>
      <hr className="" />
      <Form method="post">
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>
    </div>
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
