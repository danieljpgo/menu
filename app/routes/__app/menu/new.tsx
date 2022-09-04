import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import * as React from "react";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { createMenu } from "~/server/menu.server";
import { getRecipes } from "~/server/recipe.server";
import { requireUserId } from "~/server/session.server";
import {
  Button,
  Heading,
  SelectField,
  Stack,
  Text,
  TextField,
} from "~/components";
import { badRequest } from "lib/remix";

export const meta: MetaFunction = () => ({
  title: `Menu - New`,
});

const schema = z.object({
  name: z.string().min(3, "Should be at least 3 characters"),
  description: z.string().min(10, "Should be at least 10 characters"),
  recipes: z
    .array(z.string({ required_error: "Select a recipe" }))
    .min(1, "Should be at least 1 recipe"),
});

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const recipes = await getRecipes(userId);
  return json({ recipes });
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const validation = schema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    recipes: formData.getAll("recipe"),
  });
  if (!validation.success) {
    return badRequest({
      formError: validation.error.formErrors.formErrors,
      fieldErrors: { ...validation.error.formErrors.fieldErrors },
      fields: {
        name: formData.get("name"),
        description: formData.get("description"),
      },
    });
    // return json({ formError: "", fields: {} });
    // return json({ errors: { name: null, body: null } }, { status: 400 }); // @TODO better error handler
  }
  const menu = await createMenu({ ...validation.data, userId });
  return redirect(`/menu/${menu.id}`);
}

export default function NewMenu() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [recipesId, setRecipesId] = React.useState([""]);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const descriptionRef = React.useRef<HTMLInputElement>(null);
  const recipesRef = React.useRef<Array<HTMLSelectElement | null>>([]);

  React.useEffect(() => {
    if (actionData?.fieldErrors.name) {
      nameRef.current?.focus();
      return;
    }
    if (actionData?.fieldErrors?.description) {
      descriptionRef.current?.focus();
      return;
    }
  }, [actionData]);

  React.useEffect(() => {
    if (nameRef.current?.value === "" && recipesId.length === 1) {
      nameRef.current?.focus();
      nameRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (recipesRef.current.at(-1) !== null) {
      recipesRef.current.at(-1)?.focus();
      recipesRef.current.at(-1)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (recipesRef.current.includes(null)) {
      recipesRef.current = recipesRef.current.filter(Boolean);
      return;
    }
  }, [recipesId]);

  function handleAddRecipe() {
    setRecipesId((prev) => [...prev, `${prev.at(-1)}-${prev.length}`]);
  }

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
            status={actionData?.fieldErrors.name ? "error" : undefined}
            ref={nameRef}
            required
          />
          <TextField
            id="description"
            name="description"
            label="description"
            ref={descriptionRef}
            required
          />
          <Heading as="h3" weight="medium">
            Recipes
          </Heading>
          <Stack as="ol" gap="md">
            {recipesId.map((id, index) => (
              <li className="flex items-center w-full gap-4" key={id}>
                <div className="w-full">
                  <SelectField
                    key={id}
                    ref={(node) => (recipesRef.current[index] = node)}
                    id={`recipe-${id}`}
                    name="recipe"
                    label="recipe"
                    required
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
        <Button type="button" size="sm" onClick={handleAddRecipe}>
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
