import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { prisma } from "~/server/db.server";

import { requireUserId } from "~/server/session.server";
import { useUser } from "lib/remix";

// @TODO Move to layout component
export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const menu = await prisma.menu.findFirst({
    where: { userId },
  });
  return json({ menu });
}

export default function RecipesLayout() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();

  return (
    <div className="flex flex-col h-full min-h-screen">
      <header className="flex items-center justify-between p-4 text-white bg-slate-800">
        <h1 className="flex items-center text-3xl font-bold">
          <Link to="/recipes">recipes</Link>
          <hr className="w-4 mx-4" />
          <Link to="/menu">menu</Link>
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
            + new menu
          </Link>

          <hr />

          {!data.menu ? (
            <p className="p-4">No menu yet</p>
          ) : (
            <ol>
              <li key={data.menu.id}>
                <NavLink
                  to={data.menu.id}
                  className={({ isActive }) =>
                    `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                  }
                >
                  📋 {data.menu.name}
                </NavLink>
              </li>
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
