import { Outlet } from "@remix-run/react";

export default function Auth() {
  return (
    <main className="flex flex-col justify-center min-h-full">
      <section className="w-full max-w-md px-8 mx-auto">
        <Outlet />
      </section>
    </main>
  );
}
