import { Link } from "@remix-run/react";

export default function Recipes() {
  return (
    <p>
      No recipes selected. Select a recipe on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new recipe.
      </Link>
    </p>
  );
}
