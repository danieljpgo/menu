import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { prisma } from "~/server/db.server";
import { requireUserId } from "~/server/session.server";
import { NavLink, Shelf } from "~/components";

export const meta: MetaFunction = () => ({
  title: "Menu",
});

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const menus = await prisma.menu.findMany({
    where: { userId },
  });
  return json({ menus });
}

export default function RecipesLayout() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <nav className="flex items-center bg-white shadow-sm">
        <div className="w-screen overflow-x-auto">
          <Shelf as="ol">
            {data.menus.map((menu, index) => (
              <li key={menu.id} className="flex items-center whitespace-nowrap">
                <div className="px-6 py-4">
                  <NavLink to={menu.id} prefetch="render">
                    📋 {menu.name}
                  </NavLink>
                </div>
                {index !== data.menus.length - 1 && (
                  <span className="text-sm font-medium text-gray-700">|</span>
                )}
              </li>
            ))}
          </Shelf>
        </div>
        {/* @TODO add border */}
        <span className="text-sm font-medium text-gray-700">|</span>
        <div className="flex min-h-[56px] items-center px-6">
          <Link
            to="new"
            className="text-lg font-medium text-blue-500 transform"
          >
            +
          </Link>
        </div>
      </nav>
      <div className="flex-1 px-6 py-4">
        <Outlet />
      </div>
    </>
  );
}
