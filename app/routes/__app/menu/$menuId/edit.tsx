import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import * as React from "react";
import { z } from "zod";
import {
  Button,
  Heading,
  SelectField,
  Stack,
  Text,
  TextField,
} from "~/components";
import { prisma } from "~/server/db.server";
import { requireUserId } from "~/server/session.server";

export const meta: MetaFunction = () => ({
  title: `Menu - New`,
});

const schema = z.object({
  menuId: z.string({ required_error: "menuId not found" }),
});
const formSchema = z.object({
  name: z.string(),
  description: z.string(),
  recipes: z.array(z.string()),
  menuId: z.string({ required_error: "menuId not found" }),
});

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request);
  const validation = schema.safeParse(params);

  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }
  const menu = await prisma.menu.findUnique({
    where: { id: validation.data.menuId },
    include: { recipes: true },
  });

  if (!menu) {
    throw new Response("Not Found", { status: 404 });
  }
  const recipes = await prisma.recipe.findMany({
    orderBy: { name: "desc" },
  });
  return json({ recipes, menu });
}

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request);
  const formData = await request.formData();
  const validation = formSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    recipes: formData.getAll("recipe"),
    menuId: params.menuId,
  });

  // @TODO better error handler
  if (!validation.success) {
    return json({ errors: { name: null, body: null } }, { status: 400 });
  }

  const form = validation.data;
  const menu = await prisma.menu.findUnique({
    where: { id: validation.data.menuId },
    include: {
      recipes: true,
    },
  });

  if (!menu) {
    throw new Response("Not Found", { status: 404 });
  }

  const disconnectRecipes = menu.recipes.filter(
    (recipe) => !form.recipes.some((id) => id === recipe.id)
  );
  const connectRecipes = form.recipes.filter(
    (id) => !menu.recipes.some((recipe) => recipe.id === id)
  );

  const newMenu = await prisma.menu.update({
    where: { id: form.menuId },
    data: {
      name: form.name,
      description: form.description,
      recipes: {
        disconnect: disconnectRecipes.map(({ id }) => ({ id })),
        connect: connectRecipes.map((id) => ({ id })),
      },
    },
  });
  return redirect(`/menu/${newMenu.id}`);
}

export default function NewMenu() {
  const data = useLoaderData<typeof loader>();
  const [recipesId, setRecipesId] = React.useState(() =>
    data.menu.recipes.map(({ id }) => id)
  );
  // const actionData = useActionData<typeof action>();

  // const selectRef = React.useRef<HTMLSelectElement>(null);
  // const titleRef = React.useRef<HTMLInputElement>(null);
  // const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  // React.useEffect(() => {
  //   if (actionData?.errors?.title) {
  //     titleRef.current?.focus();
  //   } else if (actionData?.errors?.body) ws{
  //     bodyRef.current?.focus();
  //   }
  // }, [actionData]);

  return (
    <Form method="post">
      <div className="pb-32">
        <Stack gap="md">
          <Text>Create a new menu for your grocery.</Text>
          <Heading as="h3" weight="medium">
            Details
          </Heading>
          <TextField
            id="name"
            name="name"
            label="name"
            defaultValue={data.menu.name}
          />
          <TextField
            id="description"
            name="description"
            label="description"
            defaultValue={data.menu.description}
          />
          <Heading as="h3" weight="medium">
            Recipes
          </Heading>
          <Stack as="ol" gap="md">
            {recipesId.map((id, index) => (
              <li className="flex items-center w-full gap-4" key={id}>
                <div className="w-full">
                  <SelectField
                    id={`recipe-${id}`}
                    name="recipe"
                    label="recipe"
                    defaultValue={id}
                  >
                    {data.recipes.map((recipe) => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </option>
                    ))}
                  </SelectField>
                </div>
                <div className="pt-6">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      setRecipesId((prev) => prev.filter((_, i) => index !== i))
                    }
                  >
                    -
                  </Button>
                </div>
              </li>
            ))}
          </Stack>
        </Stack>
      </div>
      <div className="fixed bottom-0 left-0 right-0 grid gap-4 px-6 pb-4 bg-white">
        <hr className="pb-0.5" />
        <Button
          type="button"
          size="sm"
          onClick={() =>
            setRecipesId((prev) => [
              ...prev,
              `${prev[prev.length]}-${prev.length}`,
            ])
          }
        >
          +
        </Button>
        <Button type="submit" size="sm" disabled={recipesId.length === 0} fill>
          save
        </Button>
      </div>
    </Form>
  );
}

/* <label className="leading-4" htmlFor="name">
        name
      </label>
      <input
        id="name"
        name="name"
        className="flex-1 px-3 text-lg border-2 border-blue-500 rounded-md"
        // aria-invalid={actionData?.errors?.name ? true : undefined}
        // aria-errormessage={
        // actionData?.errors?.name ? "title-error" : undefined
        // }
      /> */

/* <label className="leading-4" htmlFor="description">
        description
      </label>
      <input
        id="description"
        name="description"
        className="flex-1 px-3 text-lg border-2 border-blue-500 rounded-md"
        // aria-invalid={actionData?.errors?.name ? true : undefined}
        // aria-errormessage={
        // actionData?.errors?.name ? "title-error" : undefined
        // }
      /> */

/* <div>
        <label className="flex flex-col w-full gap-1">
          <span>Title: </span>
          <input
            ref={titleRef}
            name="title"
            className="flex-1 px-3 text-lg border-2 border-blue-500 rounded-md"
            aria-invalid={actionData?.errors?.title ? true : undefined}
            aria-errormessage={
              actionData?.errors?.title ? "title-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.title && (
          <div className="pt-1 text-red-700" id="title-error">
            {actionData.errors.title}
          </div>
        )}
      </div>

      <div>
        <label className="flex flex-col w-full gap-1">
          <span>Body: </span>
          <textarea
            ref={bodyRef}
            name="body"
            rows={8}
            className="flex-1 w-full px-3 py-2 text-lg leading-6 border-2 border-blue-500 rounded-md"
            aria-invalid={actionData?.errors?.body ? true : undefined}
            aria-errormessage={
              actionData?.errors?.body ? "body-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.body && (
          <div className="pt-1 text-red-700" id="body-error">
            {actionData.errors.body}
          </div>
        )}
      </div>
*/
// @TODO handle ingredient value selection
// @TODO handle focus in better way
// @TODO focus on input again when clicking add more
// @TODO check the reason for the multiplies render
// @TODO create a good error screen
