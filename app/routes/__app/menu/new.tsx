import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import * as React from "react";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { badRequest } from "lib/remix";
import { createMenu } from "~/server/menu.server";
import { getRecipes } from "~/server/recipe.server";
import { requireUserId } from "~/server/session.server";
import { useHydrated } from "~/hooks";
import {
  Button,
  Heading,
  SelectField,
  Stack,
  Text,
  TextField,
} from "~/components";

export const meta: MetaFunction = () => ({
  title: `Menu - New`,
});

const schema = z.object({
  name: z.string().min(3, "Should be at least 3 characters"),
  description: z.string().min(10, "Should be at least 10 characters"),
  recipes: z
    .array(z.string({ required_error: "Select a recipe" }))
    .min(1, "Should be at least 1 recipe")
    .refine((array) => !array.some((e, i, a) => a.indexOf(e) !== i), {
      message: "Should not repeat the recipes",
    }),
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
  console.log("a");
  if (formData.get("action") === "add") {
    return json({
      formError: [],
      fieldErrors: {
        name: null,
        description: null,
        recipes: [null],
      },
      fields: {
        name: formData.get("name"),
        description: formData.get("description"),
        recipes: [...formData.getAll("recipe").map(String), ""],
      },
    });
  }
  if (formData.get("action") === "remove") {
    return json({
      formError: [],
      fieldErrors: {
        name: null,
        description: null,
        recipes: [null],
      },
      fields: {
        name: formData.get("name"),
        description: formData.get("description"),
        recipes: formData
          .getAll("recipe")
          .map(String)
          .filter(
            (_, i) => Number(formData.get("removeIndex")?.toString()) !== i
          ),
      },
    });
  }

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
  const menu = await createMenu({ ...validation.data, userId });
  return redirect(`/menu/${menu.id}`);
}

export default function NewMenu() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [recipesIdState, setRecipesIdState] = React.useState([""]);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const descriptionRef = React.useRef<HTMLInputElement>(null);
  const recipesRef = React.useRef<Array<HTMLSelectElement | null>>([]);
  const hydrated = useHydrated();

  const repetitiveRecipesIndex = actionData?.fields.recipes.map(
    (recipe, i, arr) => (recipe ? (arr.indexOf(recipe) !== i ? i : -1) : -1)
  );

  const recipesId = hydrated
    ? recipesIdState
    : actionData?.fields.recipes ?? [""];

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
    if (nameRef.current?.value === "" && recipesIdState.length === 1) {
      nameRef.current?.focus();
      nameRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    console.log(recipesRef, "<<");
    if (recipesRef.current.at(-1) !== null) {
      console.log(recipesRef);
      recipesRef.current.at(-1)?.focus();
      recipesRef.current.at(-1)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (recipesRef.current.includes(null)) {
      console.log(recipesRef, "<<");
      recipesRef.current = recipesRef.current.filter(Boolean);

      return;
    }
  }, [recipesIdState]);

  function handleAddRecipe() {
    if (!hydrated) return;
    setRecipesIdState((prev) => [...prev, `${prev.at(-1)}-${prev.length}`]);
  }
  function handleRemoveRecipe(index: number) {
    if (!hydrated) return;
    setRecipesIdState((prev) => prev.filter((_, i) => index !== i));
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
            ref={nameRef}
            hint={actionData?.fieldErrors.name?.[0]}
            status={actionData?.fieldErrors.name ? "error" : undefined}
            defaultValue={actionData?.fields.name?.toString()}
            required
          />
          <TextField
            id="description"
            name="description"
            label="description"
            ref={descriptionRef}
            hint={actionData?.fieldErrors.description?.[0]}
            status={actionData?.fieldErrors.description ? "error" : undefined}
            defaultValue={actionData?.fields.description?.toString()}
            required
          />
          <Heading as="h3" weight="medium">
            Recipes
          </Heading>
          <Stack as="ol" gap="md">
            {recipesId.map((id, index) => (
              <li
                className="flex items-center w-full gap-4"
                key={`${id}-${index}`}
              >
                <div className="w-full">
                  <SelectField
                    key={id}
                    id={`recipe-${id}`}
                    name="recipe"
                    label="recipe"
                    ref={(node) => (recipesRef.current[index] = node)}
                    hint={
                      repetitiveRecipesIndex?.includes(index)
                        ? actionData?.fieldErrors.recipes?.[0]?.toString()
                        : undefined
                    }
                    status={
                      actionData?.fieldErrors.recipes ? "error" : undefined
                    }
                    defaultValue={actionData?.fields.recipes[index]?.toString()}
                    required
                  >
                    {data.recipes.map((recipe) => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </option>
                    ))}
                  </SelectField>
                </div>
                <div className="mt-0.5 self-start pt-6">
                  <input type="hidden" name="removeIndex" value={index} />
                  <Button
                    type={hydrated ? "button" : "submit"}
                    size="sm"
                    name="action"
                    value="remove"
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
          disabled={recipesId.length === 0}
          fill
        >
          save
        </Button>
      </div>
    </Form>
  );
}

// @TODO handle ingredient value selection
// @TODO check the reason for the multiplies render
// @TODO create a good error screen
