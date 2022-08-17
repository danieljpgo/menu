import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
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
      <nav className="flex justify-center w-screen overflow-x-auto bg-white shadow-sm ">
        <Shelf as="ol">
          {data.menus.map((menu, index) => (
            <>
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
            </>
          ))}
        </Shelf>
      </nav>
      <div className="flex-1 px-6 py-4">
        <Outlet />
      </div>
    </>
  );
}
