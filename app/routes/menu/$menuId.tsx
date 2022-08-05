import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { prisma } from "~/server/db.server";
import { requireUserId } from "~/server/session.server";

// @TODO select the first from the list or reset redirecting to index?
// @TODO create a good error screen

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  invariant(params.menuId, "noteId not found");
  const menu = await prisma.menu.findFirst({
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
    where: { id: params.menuId, userId },
  });
  if (!menu) {
    throw new Response("Not Found", { status: 404 });
  }

  console.log(menu.recipes[0].ingredients);
  return json({ menu });
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  invariant(params.menuId, "menuId not found");

  await prisma.menu.deleteMany({
    where: { id: params.menuId, userId },
  });

  return redirect("/menu");
}

export default function RecipeDetails() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="grid gap-4">
      <h3 className="text-2xl font-bold">{data.menu.name}</h3>
      <p>{data.menu.description}</p>
      <ul className="grid gap-4">
        {data.menu.recipes.map((a) => (
          <li key={a.id} className="">
            <p>{a.name}</p>
            <p>{a.description}</p>
            <div>
              {a.ingredients.map((b) => (
                <div key={b.id} className="flex gap-2">
                  <p>{b.ingredient.name}</p>
                  <p>{b.amount}</p>
                  <p>{b.ingredient.unit}</p>
                </div>
              ))}
            </div>
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
    return <div>Note not found</div>;
  }
  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
