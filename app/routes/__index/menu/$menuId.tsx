import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { prisma } from "~/server/db.server";
import { requireUserId } from "~/server/session.server";
import { Button, Heading, Shelf, Stack, Text } from "~/components";

export const meta: MetaFunction = ({ data }) => ({
  title: `Menu - ${data.menu.name}`,
});

const schema = z.object({
  menuId: z.string({ required_error: "menuId not found" }),
});

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  const validation = schema.safeParse(params);

  if (!validation.success) {
    const { message } = validation.error.issues[0];
    throw new Error(message);
  }

  const menu = await prisma.menu.findFirst({
    include: {
      recipes: {
        include: {
          ingredients: {
            include: { ingredient: true },
          },
        },
      },
    },
    where: { id: params.menuId, userId },
  });
  if (!menu) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ menu });
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  const validation = schema.safeParse(params);

  if (!validation.success) {
    const { message } = validation.error.issues[0];
    throw new Error(message);
  }

  await prisma.menu.deleteMany({
    where: { id: params.menuId, userId },
  });

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
                  {recipe.ingredients.map((data) => (
                    <Shelf as="li" key={data.id}>
                      <Text>-</Text>
                      <Text>{data.ingredient.name}</Text>-
                      <Text color="light">{data.amount}</Text>
                      <Text color="light">{data.ingredient.unit}</Text>
                    </Shelf>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </Stack>
        <div className="fixed bottom-0 left-0 right-0 grid gap-4 px-6 pb-4 bg-white ">
          <hr />
          <div className="flex justify-between">
            <Form method="post">
              <Button size="sm" type="submit">
                Delete
              </Button>
            </Form>
            <div>
              <Button size="sm" type="button" disabled>
                edit
              </Button>
            </div>
          </div>
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
