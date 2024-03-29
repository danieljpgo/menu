import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";
import { portions } from "lib/ingredients";
import { notFound } from "lib/remix";
import { z } from "zod";
import { Button, Heading, Shelf, Stack, Text } from "~/components";
import { deleteMenu, getMenu } from "~/server/menu.server";
import { requireUserId } from "~/server/session.server";

export const meta: MetaFunction = ({ data }) => ({
  title: `Menu - ${data.menu.name}`,
});

const schema = z.object({
  menuId: z.string({ required_error: "menuId not found" }),
});

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request);
  const validation = schema.safeParse(params);
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }
  const menu = await getMenu(validation.data.menuId);
  if (!menu) throw notFound();
  return json({ menu });
}

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request);
  const validation = schema.safeParse(params);
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }
  await deleteMenu(validation.data.menuId);
  return redirect("/menu");
}

export default function MenuDetails() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="pb-16">
      <Stack gap="sm">
        <Heading as="h3" weight="medium">
          {data.menu.name}
        </Heading>
        <Text>{data.menu.description}</Text>
        <Heading as="h4" weight="medium">
          Recipes
        </Heading>
        <Stack as="ul" gap="md">
          {data.menu.recipes.map((recipe, index) => (
            <li
              key={recipe.id}
              className={`grid gap-2 ${
                index !== data.menu.recipes.length - 1
                  ? "border-b border-solid pb-4"
                  : ""
              }
            `}
            >
              <div>
                <Heading as="h4" weight="medium">
                  {recipe.name}
                </Heading>
                <Text>{recipe.description}</Text>
              </div>
              <div>
                <Heading as="h5" weight="medium">
                  Ingredients
                </Heading>
                <ul>
                  {recipe.ingredients.map((ingredient) => (
                    <Shelf as="li" key={ingredient.id}>
                      <Text>-</Text>
                      <Text>{ingredient.ingredient.name}</Text>-
                      <Text color="light">
                        {ingredient.ingredient.unit === "p"
                          ? portions.find(
                              (portion) => portion.value === ingredient.amount
                            )?.label ?? "?"
                          : `${ingredient.amount} ${ingredient.ingredient.unit}`}
                      </Text>
                    </Shelf>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </Stack>
        <div className="fixed bottom-0 left-0 right-0 grid gap-4 px-6 pb-4 bg-white ">
          <hr />
          <Shelf gap="md">
            <Form method="post" className="w-full">
              <Button size="sm" type="submit" fill>
                delete
              </Button>
            </Form>
            <Link to="edit" className="w-full">
              <Button size="sm" type="button" fill>
                edit
              </Button>
            </Link>
          </Shelf>
        </div>
      </Stack>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();
  if (caught.status === 404) {
    return <div>Note not found</div>;
  }
  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

// @TODO select the first from the list or reset redirecting to index?
// @TODO create a good error screen
