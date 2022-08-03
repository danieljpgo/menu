import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { prisma } from "~/server/db.server";
import { requireUserId } from "~/server/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  invariant(params.recipeId, "noteId not found");
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
    where: { id: params.recipeId, userId },
  });
  if (!recipe) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ recipe });
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  invariant(params.recipeId, "recipeId not found");

  await prisma.recipe.deleteMany({
    where: { id: params.recipeId, userId },
  });

  return redirect("/recipes");
}

export default function RecipeDetails() {
  const data = useLoaderData<typeof loader>();

  console.log({ data });

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.recipe.name}</h3>
      <p className="py-6">{data.recipe.description}</p>
      <ul>
        {data.recipe.ingredients.map((a) => (
          <li key={a.ingredient.name}>
            <p className="py-6">{a.ingredient.name}</p>
            <p className="py-6">{a.amount}</p>
            <p className="py-6">{a.ingredient.unit}</p>
          </li>
        ))}
      </ul>
      <hr className="my-4" />
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
    return <div>Note not found</div>;
  }
  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
