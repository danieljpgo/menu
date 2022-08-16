import { Form, Link, Outlet } from "@remix-run/react";
import { useUser } from "~/hooks";

export default function Index() {
  const user = useUser();

  return (
    <>
      <header className="flex items-center justify-between p-4 text-white bg-slate-800">
        <h1 className="flex items-center text-3xl font-bold">
          <Link to="/recipes" prefetch="render">
            recipes
          </Link>
          <hr className="w-4 mx-4" />
          <Link to="/menu" prefetch="render">
            menu
          </Link>
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
      <main className="flex h-full">
        <Outlet />
      </main>
    </>
  );
}
