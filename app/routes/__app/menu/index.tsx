import { Link } from "@remix-run/react";
import { Button, Text } from "~/components";

export default function Menus() {
  return (
    <>
      <Text as="p" size="sm" weight="normal" color="dark">
        No menu selected. Select a menu on the top, or{" "}
        <Link to="new" className="text-sm font-medium text-blue-500 transform">
          create a new menu.
        </Link>
      </Text>
      <div className="fixed bottom-0 left-0 right-0 grid gap-4 px-6 pb-4 bg-white">
        <hr className="pb-0.5" />
        <Link to="new" className="grid w-full">
          <Button type="submit" size="sm" fill>
            +
          </Button>
        </Link>
      </div>
    </>
  );
}
