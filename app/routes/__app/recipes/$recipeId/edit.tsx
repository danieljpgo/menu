import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { portions } from "lib/ingredients";
import { notFound } from "lib/remix";
import * as React from "react";
import { z } from "zod";
import {
  Button,
  Heading,
  NumberField,
  SelectField,
  Shelf,
  Stack,
  Text,
  TextField,
} from "~/components";
import { getIngredients } from "~/server/ingredient.server";
import { getRecipe, updateRecipe } from "~/server/recipe.server";
import { requireUserId } from "~/server/session.server";

export const meta: MetaFunction = () => ({
  title: `Menu - Create Recipe`,
});

const schema = z.object({
  recipeId: z.string({ required_error: "recipeId not found" }),
});

const formSchema = z.object({
  recipeId: z.string({ required_error: "recipeId not found" }),
  name: z.string(),
  description: z.string(),
  amounts: z.array(
    z
      .string()
      .transform((val) => Number(val))
      .refine((val) => !Number.isNaN(val), {
        message: "Expected number, received string",
      })
    // @TODO create a abstraction
  ),
  ingredients: z.array(z.string()),
});

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request);
  const validation = schema.safeParse(params);
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message); // @TODO handle errors
  }
  const recipe = await getRecipe(validation.data.recipeId);
  if (!recipe) throw notFound();
  const ingredients = await getIngredients();
  return json({ ingredients, recipe });
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const validation = formSchema.safeParse({
    recipeId: formData.get("recipeId"),
    name: formData.get("name"),
    description: formData.get("description"),
    ingredients: formData.getAll("ingredient"),
    amounts: formData.getAll("amount"),
  });
  if (!validation.success) {
    return json({ errors: { name: null, body: null } }, { status: 400 }); // @TODO better error handler // @TODO repetetive ingredients
  }
  const recipe = await updateRecipe({ userId }, validation.data);
  if (!recipe) throw notFound();
  return redirect(`/recipes/${recipe.id}`);
}

export default function NewRecipe() {
  const data = useLoaderData<typeof loader>();
  const [selectedIngredients, setSelectedIngredients] = React.useState(() =>
    data.recipe.ingredients.map((ingredient) => ({
      id: ingredient.ingredientId,
      amount: ingredient.amount,
    }))
  );

  // const actionData = useActionData<typeof action>();

  // const titleRef = React.useRef<HTMLInputElement>(null);
  // const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  // React.useEffect(() => {
  //   if (actionData?.errors?.title) {
  //     titleRef.current?.focus();
  //   } else if (actionData?.errors?.body) {
  //     bodyRef.current?.focus();
  //   }
  // }, [actionData]);

  return (
    <Form method="post">
      <div className="pb-32">
        <Stack gap="md">
          <Text>create a new recipe for your menus.</Text>
          <Heading as="h3" weight="medium">
            Details
          </Heading>
          <TextField
            id="name"
            name="name"
            label="name"
            defaultValue={data.recipe.name}
          />
          <TextField
            id="description"
            name="description"
            label="description"
            defaultValue={data.recipe.description}
          />
          <Heading as="h3" weight="medium">
            Ingredient
          </Heading>
          <Stack as="ol" gap="md">
            {selectedIngredients.map((ingredient, index) => (
              <Shelf as="li" gap="md" key={ingredient.id}>
                <div className="w-full">
                  <SelectField
                    id={`ingredient-${index}`}
                    name="ingredient"
                    label={`ingredient`}
                    defaultValue={ingredient.id}
                    onChange={(e) =>
                      setSelectedIngredients((prev) =>
                        prev.map((a, i) =>
                          i === index ? { amount: 0, id: e.target.value } : a
                        )
                      )
                    }
                  >
                    {data.ingredients.map((ingredient) => (
                      <option key={ingredient.id} value={ingredient.id}>
                        {ingredient.name} - {ingredient.unit}
                      </option>
                    ))}
                  </SelectField>
                </div>
                <div className="w-1/3">
                  {data.ingredients.find((a) => a.id === ingredient.id)
                    ?.unit === "p" ? (
                    <SelectField
                      id={`amount-${index}`}
                      name="amount"
                      label={`amount`}
                      defaultValue={ingredient.amount}
                    >
                      {portions.map((sizes) => (
                        <option
                          key={`amount-${index}-${sizes.label}`}
                          value={sizes.value}
                        >
                          {sizes.label}
                        </option>
                      ))}
                    </SelectField>
                  ) : (
                    <NumberField
                      id={`amount-${index}`}
                      name="amount"
                      label={`amount`}
                      defaultValue={ingredient.amount}
                    />
                  )}
                </div>
                <div className="self-center pt-6">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      setSelectedIngredients((prev) =>
                        prev.filter((_, i) => index !== i)
                      )
                    }
                  >
                    -
                  </Button>
                </div>
              </Shelf>
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
            setSelectedIngredients((prev) => [
              ...prev,
              {
                id: data.ingredients[0].id,
                amount: 0,
              },
            ])
          }
          fill
        >
          +
        </Button>
        <input type="hidden" name="recipeId" value={data.recipe.id} />
        <Button type="submit" size="sm" fill>
          save
        </Button>
      </div>
    </Form>
  );
}

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

/* <label className="leading-4" htmlFor={`ingredient-${number}`}>
        ingredient
      </label>
      <select name="ingredient" id={`ingredient-${number}`}>
        {data.ingredients.map((ingredient) => (
          <option key={ingredient.id} value={ingredient.id}>
            {ingredient.name} - {ingredient.unit}
          </option>
        ))}
      </select> */

/* <label className="leading-4" htmlFor={`amount-${number}`}>
        amount
      </label>
      <input
        id={`amount-${number}`}
        name="amount"
        className="flex-1 px-3 text-lg border-2 border-blue-500 rounded-md"
        // aria-invalid={actionData?.errors?.name ? true : undefined}
        // aria-errormessage={
        // actionData?.errors?.name ? "title-error" : undefined
        // }
      /> */

// @TODO handle ingredient value selection
// @TODO handle focus in better way
// @TODO focus on input again when clicking add more
// @TODO check the reason for the multiplies render
// @TODO create a good error screen
// @TODO repetitive ingredients
