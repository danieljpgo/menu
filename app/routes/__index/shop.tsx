import { Outlet } from "@remix-run/react";
import { Heading } from "~/components";

export default function ShopLayout() {
  return (
    <div className="grid gap-4 px-6 py-4">
      <Heading as="h2" weight="semibold">
        Shop
      </Heading>
      <Outlet />
    </div>
  );
}
