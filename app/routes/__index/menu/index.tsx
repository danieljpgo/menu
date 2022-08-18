import { Link } from "@remix-run/react";
import { Text } from "~/components";

export default function Menus() {
  return (
    <Text as="p" size="sm" weight="normal" color="dark">
      No menu selected. Select a menu on the top, or{" "}
      {/* @TODO Link component */}
      <Link to="new" className={`transform text-sm font-medium text-blue-500`}>
        create a new menu.
      </Link>
    </Text>
  );
}
