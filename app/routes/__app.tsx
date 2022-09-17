import { Form, Link, Outlet } from "@remix-run/react";
import { Button, NavLink } from "~/components";
import { useUser } from "~/hooks";

export default function Index() {
  const user = useUser();

  return (
    <>
      <header className="relative bg-white shadow-sm standalone:fixed standalone:left-0 standalone:right-0 standalone:z-20">
        <div className="container mx-auto flex min-h-[72px] items-center justify-between px-6 py-4">
          <h1>
            <Link
              to="/"
              className="text-xl antialiased font-semibold tracking-tight text-gray-800 transition-colors duration-200 transform hover:text-gray-700 lg:text-2xl"
            >
              Menu
            </Link>
          </h1>
          <nav>
            <ul className="flex items-center gap-4">
              <li>
                <NavLink to="/shop" prefetch="render">
                  shop
                </NavLink>
              </li>
              <li>
                <NavLink to="/menu" prefetch="render">
                  menus
                </NavLink>
              </li>
              <li>
                <NavLink to="/recipes" prefetch="render">
                  recipes
                </NavLink>
              </li>
              <li>
                {/* @TODO <Text/> */}
                <span className="text-sm font-medium text-gray-700">|</span>
              </li>
              <li className="hidden md:flex">
                {/* @TODO <Text/> */}
                <p className="text-sm font-medium text-gray-700 transition-colors duration-200 transform hover:text-blue-500">
                  {user.email}
                </p>
              </li>
              <li>
                <Form action="/logout" method="post">
                  <Button type="submit" size="sm">
                    logout
                  </Button>
                </Form>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto h-full standalone:pt-[72px]">
        <Outlet />
      </main>
    </>
  );
}
