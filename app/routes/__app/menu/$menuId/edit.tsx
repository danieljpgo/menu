import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import * as React from "react";
import { badRequest, notFound } from "lib/remix";
import { z } from "zod";
import {
  Button,
  Heading,
  SelectField,
  Stack,
  Text,
  TextField,
} from "~/components";
import { requireUserId } from "~/server/session.server";
import { getMenu, updateMenu } from "~/server/menu.server";
import { getRecipes } from "~/server/recipe.server";
import { useHydrated } from "~/hooks";

export const meta: MetaFunction = ({
  data,
}: {
  data: { menu: { name: string } };
}) => ({
  title: data?.menu ? `Menu - ${data.menu.name} - Edit` : "Menu - Not found",
});

const loaderSchema = z.object({
  menuId: z.string({ required_error: "menuId not found" }),
});

const schema = z.union([
  z.object({
    action: z.union([z.literal("add"), z.literal("remove")]),
    menuId: z.string({ required_error: "menuId not found" }),
    name: z.string().optional(),
    description: z.string().optional(),
    removeRecipe: z.string().transform((val) => Number(val)),
    recipes: z.array(z.string()),
  }),
  z.object({
    action: z.literal("save"),
    menuId: z.string({ required_error: "menuId not found" }),
    name: z.string().min(3, "Should be at least 3 characters"),
    description: z.string().min(10, "Should be at least 10 characters"),
    removeRecipe: z.string().transform((val) => Number(val)),
    recipes: z
      .array(z.string({ required_error: "Select a recipe" }))
      .min(1, "Should be at least 1 recipe")
      .refine((array) => !array.some((e, i, a) => a.indexOf(e) !== i), {
        message: "Should not repeat the recipes",
      }),
  }),
]);

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  const validation = loaderSchema.safeParse(params);
  if (!validation.success) throw notFound();

  const menu = await getMenu(validation.data.menuId);
  if (!menu) throw notFound();

  const recipes = await getRecipes(userId);
  return json({ recipes, menu });
}

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request);
  const formData = await request.formData();
  const validation = schema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    recipes: formData.getAll("recipe"),
    action: formData.get("action"),
    menuId: params.menuId,
    removeRecipe: formData.get("removeRecipe"),
  });

  if (!validation.success) {
    return badRequest({
      formError: validation.error.formErrors.formErrors,
      fieldErrors: { ...validation.error.formErrors.fieldErrors },
      fields: {
        name: formData.get("name"),
        description: formData.get("description"),
        recipes: formData.getAll("recipe").map(String),
      },
    });
  }
  const form = validation.data;
  if ("action" in form && form.action === "add") {
    return json({
      formError: [],
      fieldErrors: {
        name: null,
        description: null,
        recipes: [null],
      },
      fields: {
        ...form,
        recipes: [...form.recipes, ""],
      },
    });
  }
  if ("action" in form && form.action === "remove") {
    return json({
      formError: [],
      fieldErrors: {
        name: null,
        description: null,
        recipes: [null],
      },
      fields: {
        ...form,
        recipes: form.recipes.filter((_, i) => form.removeRecipe !== i),
      },
    });
  }
  if ("action" in form && form.action === "save") {
    const menu = await updateMenu(form);
    if (!menu) throw notFound();
    return redirect(`/menu/${menu.id}`);
  }

  return json(null);
}

export default function NewMenu() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const nameRef = React.useRef<HTMLInputElement>(null);
  const descriptionRef = React.useRef<HTMLInputElement>(null);
  const recipesRef = React.useRef<Array<HTMLSelectElement | null>>([]);
  const [selectedRecipes, setSelectedRecipes] = React.useState(() =>
    data.menu.recipes.map(({ id }) => id)
  );
  const hydrated = useHydrated();

  const repetitiveRecipesIndex = React.useMemo(
    () =>
      actionData?.fields.recipes.map((recipe, i, arr) =>
        recipe ? (arr.indexOf(recipe) !== i ? i : -1) : -1
      ),
    [actionData?.fields.recipes]
  );

  React.useEffect(() => {
    if (actionData?.fieldErrors.name) {
      nameRef.current?.focus();
      nameRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (actionData?.fieldErrors?.description) {
      descriptionRef.current?.focus();
      descriptionRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (actionData?.fieldErrors?.recipes && repetitiveRecipesIndex) {
      const index = repetitiveRecipesIndex.filter((a) => a !== -1);
      recipesRef.current[index[0]]?.focus();
      recipesRef.current[index[0]]?.scrollIntoView({ behavior: "smooth" });
      return;
    }
  }, [actionData, repetitiveRecipesIndex]);

  React.useEffect(() => {
    if (nameRef.current) {
      nameRef.current?.focus();
      nameRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
  }, []);

  React.useEffect(() => {
    // if (nameRef.current) {
    //   // if (nameRef.current?.value === "" && selectedRecipes.length === 1) {
    //   nameRef.current?.focus();
    //   nameRef.current?.scrollIntoView({ behavior: "smooth" });
    //   return;
    // }
    if (recipesRef.current.at(-1)?.value === "") {
      recipesRef.current.at(-1)?.focus();
      recipesRef.current.at(-1)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (recipesRef.current.includes(null)) {
      recipesRef.current = recipesRef.current.filter(Boolean);
      return;
    }
  }, [selectedRecipes]);

  function handleAddRecipe() {
    if (!hydrated) return;
    setSelectedRecipes((prev) => [...prev, ""]);
  }

  function handleRemoveRecipe(index: number) {
    if (!hydrated) return;
    setSelectedRecipes((prev) => prev.filter((_, i) => index !== i));
  }

  function handleSelectRecipe(index: number, selectedId: string) {
    if (!hydrated) return;
    setSelectedRecipes((prev) =>
      prev.map((id, i) => (i === index ? selectedId : id))
    );
  }

  const recipeIds = actionData?.fields.recipes
    ? actionData?.fields.recipes
    : selectedRecipes;

  return (
    <Form method="post">
      <div className="pb-32">
        <Stack gap="md">
          <Text>Edit the menu you created.</Text>
          <Heading as="h3" weight="medium">
            Details
          </Heading>
          <TextField
            id="name"
            name="name"
            label="name"
            ref={nameRef}
            hint={actionData?.fieldErrors.name?.[0]}
            status={actionData?.fieldErrors.name ? "error" : undefined}
            defaultValue={data.menu.name}
            // defaultValue={actionData?.fields.name?.toString()}
            required
          />
          <TextField
            id="description"
            name="description"
            label="description"
            defaultValue={data.menu.description}
            ref={descriptionRef}
            hint={actionData?.fieldErrors.description?.[0]}
            status={actionData?.fieldErrors.description ? "error" : undefined}
            // defaultValue={actionData?.fields.description?.toString()}
            required
          />
          <Heading as="h3" weight="medium">
            Recipes
          </Heading>
          <Stack as="ol" gap="md">
            {recipeIds.map((id, index) => (
              <li className="flex items-center w-full gap-4" key={`${index}`}>
                <div className="w-full">
                  <SelectField
                    id={`recipe-${id}`}
                    name="recipe"
                    label="recipe"
                    value={id}
                    status={
                      repetitiveRecipesIndex?.includes(index)
                        ? "error"
                        : undefined
                    }
                    ref={(node) => (recipesRef.current[index] = node)}
                    hint={
                      repetitiveRecipesIndex?.includes(index)
                        ? actionData?.fieldErrors.recipes?.[0]?.toString()
                        : undefined
                    }
                    defaultValue={id}
                    // defaultValue={
                    //   !hydrated
                    //     ? actionData?.fields.recipes[index]?.toString()
                    //     : undefined
                    // }
                    onChange={(e) => handleSelectRecipe(index, e.target.value)}
                    required
                  >
                    <option disabled value="" defaultValue="">
                      Choose a recipe
                    </option>
                    {data.recipes.map((recipe) => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </option>
                    ))}
                  </SelectField>
                </div>
                <div className="mt-0.5 self-start pt-6">
                  <input type="hidden" name="removeRecipe" value={index} />
                  <Button
                    type={hydrated ? "button" : "submit"}
                    size="sm"
                    name="action"
                    value="remove"
                    disabled={recipeIds.length === 1}
                    onClick={() => handleRemoveRecipe(index)}
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
          type={hydrated ? "button" : "submit"}
          size="sm"
          name="action"
          value="add"
          onClick={handleAddRecipe}
        >
          +
        </Button>
        <Button
          type="submit"
          size="sm"
          name="action"
          value="save"
          disabled={recipeIds.length === 0}
          fill
        >
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
