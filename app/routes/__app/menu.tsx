import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/server/session.server";
import { Heading, NavLink, Shelf } from "~/components";
import { getMenus } from "~/server/menu.server";

export const meta: MetaFunction = () => ({
  title: "Menu",
});

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const menus = await getMenus({ userId });

  return json({ menus });
}

export default function RecipesLayout() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <nav className="flex items-center bg-white shadow-sm">
        <div className="w-screen overflow-x-auto">
          <Shelf as="ol">
            {data.menus.length === 0 ? (
              <li className="flex items-center whitespace-nowrap ">
                <p className="px-6 py-4 text-sm font-medium text-gray-700 transition-colors duration-200 transfor">
                  Create your first menu
                </p>
              </li>
            ) : (
              data.menus.map((menu, index) => (
                <li
                  key={menu.id}
                  className="flex items-center whitespace-nowrap"
                >
                  <div className="px-6 py-4">
                    <NavLink to={menu.id} prefetch="render">
                      📋 {menu.name}
                    </NavLink>
                  </div>
                  {index !== data.menus.length - 1 && (
                    <span className="text-sm font-medium text-gray-700">|</span>
                  )}
                </li>
              ))
            )}
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
      <div className="grid gap-4 px-6 py-4">
        <Heading as="h2" weight="semibold">
          Menu
        </Heading>
        <Outlet />
      </div>
    </>
  );
}
