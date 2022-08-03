import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { prisma } from "~/server/db.server";

import { requireUserId } from "~/server/session.server";
import { useUser } from "lib/remix";

// @TODO Move to layout component
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

export default function RecipesLayout() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();

  return (
    <div className="flex flex-col h-full min-h-screen">
      <header className="flex items-center justify-between p-4 text-white bg-slate-800">
        <h1 className="text-3xl font-bold">
          <Link to=".">menu</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="px-4 py-2 text-blue-100 rounded bg-slate-600 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full border-r w-80 bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + new recipe
          </Link>

          <hr />

          {data.recipes.length === 0 ? (
            <p className="p-4">No recipes yet</p>
          ) : (
            <ol>
              {data.recipes.map((recipe) => (
                <li key={recipe.id}>
                  <NavLink
                    to={recipe.id}
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                  >
                    📝 {recipe.name}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
