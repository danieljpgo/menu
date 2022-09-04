import { Link } from "@remix-run/react";
import { Button } from "~/components";

export default function Recipes() {
  return (
    <div className="fixed bottom-0 left-0 right-0 grid gap-4 px-6 pb-4 bg-white">
      <hr className="pb-0.5" />
      <Link to="new">
        <Button type="submit" size="sm" fill>
          +
        </Button>
      </Link>
    </div>
  );
}
