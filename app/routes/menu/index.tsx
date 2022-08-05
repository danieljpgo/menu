import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { prisma } from "~/server/db.server";
import { requireUserId } from "~/server/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
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
    where: { userId },
  });
  return json({ menu });
}

export default function Recipes() {
  const data = useLoaderData<typeof loader>();

  console.log(data);
  return (
    <div className="grid gap-4">
      {data.menu ? (
        <>
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
        </>
      ) : (
        <p>
          No recipes selected. Select a recipe on the left, or{" "}
          <Link to="new" className="text-blue-500 underline">
            create a new recipe.
          </Link>
        </p>
      )}
    </div>
  );
}
