import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import * as React from "react";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { portions } from "lib/ingredients";
import { badRequest } from "lib/remix";
import { getIngredients } from "~/server/ingredient.server";
import { createRecipe } from "~/server/recipe.server";
import { requireUserId } from "~/server/session.server";
import { useHydrated } from "~/hooks";
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

export const meta: MetaFunction = () => ({
  title: `Menu - Create Recipe`,
});

const schema = z.union([
  z.object({
    action: z.union([z.literal("add"), z.literal("remove")]),
    name: z.string().optional(),
    description: z.string().optional(),
    amounts: z.array(
      z
        .string()
        .transform((val) => Number(val))
        .refine((val) => !Number.isNaN(val), {
          message: "Expected number, received string",
        })
    ),
    ingredients: z.array(z.string()),
    removeIngredient: z.string().transform((val) => Number(val)),
  }),
  z.object({
    action: z.literal("save"),
    name: z.string().min(3, "Should be at least 3 characters"),
    description: z.string().min(10, "Should be at least 10 characters"),
    amounts: z.array(
      z
        .string()
        .transform((val) => Number(val))
        .refine((val) => !Number.isNaN(val), {
          message: "Expected number, received string",
        })
    ),
    ingredients: z
      .array(z.string({ required_error: "Select a ingredient" }))
      .min(1, "Should be at least 1 ingredient")
      .refine((array) => !array.some((e, i, a) => a.indexOf(e) !== i), {
        message: "Should not repeat the ingredients",
      }),
    removeIngredient: z.string().transform((val) => Number(val)),
  }),
]);

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);
  const ingredients = await getIngredients();
  return json({ ingredients });
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const validation = schema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    ingredients: formData.getAll("ingredient"),
    amounts: formData.getAll("amount"),
    action: formData.get("action"),
    removeIngredient: formData.get("removeIngredient"),
  });

  if (!validation.success) {
    return badRequest({
      formError: validation.error.formErrors.formErrors,
      fieldErrors: { ...validation.error.formErrors.fieldErrors },
      fields: {
        name: formData.get("name"),
        description: formData.get("description"),
        ingredients: formData.getAll("ingredient").map(String),
        amounts: formData.getAll("amount").map(Number),
      },
    });
  }
  const form = validation.data;
  if (form.action === "add") {
    return json({
      formError: [],
      fieldErrors: {
        name: null,
        description: null,
        ingredients: [null],
        amounts: [null],
      },
      fields: {
        ...form,
        ingredients: [...form.ingredients, ""],
        amounts: [...form.amounts, 0],
      },
    });
  }
  if (form.action === "remove") {
    return json({
      formError: [],
      fieldErrors: {
        name: null,
        description: null,
        ingredients: [null],
        amounts: [null],
      },
      fields: {
        ...form,
        ingredients: form.ingredients.filter(
          (_, i) => form.removeIngredient !== i
        ),
        amounts: form.amounts.filter((_, i) => form.removeIngredient !== i),
      },
    });
  }
  if (form.action === "save") {
    const recipe = await createRecipe({ ...form, userId });
    return redirect(`/recipes/${recipe.id}`);
  }
  return redirect("/recipes");
}

export default function NewRecipe() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const nameRef = React.useRef<HTMLInputElement>(null);
  const descriptionRef = React.useRef<HTMLInputElement>(null);
  const ingredientsRef = React.useRef<Array<HTMLSelectElement | null>>([]);
  const amountRef = React.useRef<
    Array<HTMLSelectElement | HTMLInputElement | null>
  >([]);
  const [selectedIngredients, setSelectedIngredients] = React.useState([
    { id: "", amount: 0 },
  ]);
  const hydrated = useHydrated();

  const repetitiveIngredientsIndex = React.useMemo(
    () =>
      actionData?.fields.ingredients.map((ingredient, i, arr) =>
        ingredient ? (arr.indexOf(ingredient) !== i ? i : -1) : -1
      ),
    [actionData?.fields.ingredients]
  );

  React.useEffect(() => {
    if (nameRef.current?.value === "") {
      nameRef.current?.focus();
      nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
  }, []);

  React.useEffect(() => {
    if (actionData?.fieldErrors.name) {
      nameRef.current?.focus();
      nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (actionData?.fieldErrors?.description) {
      descriptionRef.current?.focus();
      descriptionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }
    if (actionData?.fieldErrors?.ingredients && repetitiveIngredientsIndex) {
      const index = repetitiveIngredientsIndex.filter((a) => a !== -1);
      ingredientsRef.current[index[0]]?.focus();
      ingredientsRef.current[index[0]]?.scrollIntoView({ behavior: "smooth" });
      return;
    }
  }, [actionData, repetitiveIngredientsIndex]);

  React.useEffect(() => {
    if (
      selectedIngredients.length > 1 &&
      ingredientsRef.current.at(-1)?.value === ""
    ) {
      ingredientsRef.current.at(-1)?.focus();
      ingredientsRef.current
        .at(-1)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (ingredientsRef.current.includes(null)) {
      ingredientsRef.current = ingredientsRef.current.filter(Boolean);
      return;
    }
  }, [selectedIngredients]);

  function handleAddIngredient() {
    if (!hydrated) return;
    setSelectedIngredients((prev) => [...prev, { id: "", amount: 0 }]);
  }

  function handleRemoveIngredient(index: number) {
    if (!hydrated) return;
    setSelectedIngredients((prev) => prev.filter((_, i) => index !== i));
  }

  function handleSelectIngredient(index: number, selectedId: string) {
    if (!hydrated) return;
    setSelectedIngredients((prev) =>
      prev.map((data, i) => (i === index ? { ...data, id: selectedId } : data))
    );
    setTimeout(() => {
      amountRef.current.at(index)?.focus();
      amountRef.current.at(index)?.scrollIntoView({ behavior: "smooth" });
    }, 600);
  }

  function handleChangeAmount(index: number, amount: number) {
    if (!hydrated) return;
    setSelectedIngredients((prev) =>
      prev.map((data, i) => (i === index ? { ...data, amount } : data))
    );
  }

  const ingredients = hydrated
    ? selectedIngredients
    : actionData?.fields.ingredients.map((id, i) => ({
        id,
        amount: actionData?.fields.amounts[i],
      })) ?? [{ id: "", amount: 0 }];

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
            Ingredient
          </Heading>
          <Stack as="ol" gap="md">
            {ingredients.map((ingredient, index) => (
              <Shelf as="li" gap="md" key={`${index}`}>
                <div className="w-full">
                  <SelectField
                    id={`ingredient-${ingredient.id}`}
                    label="ingredient"
                    name="ingredient"
                    value={ingredient.id}
                    status={
                      repetitiveIngredientsIndex?.includes(index)
                        ? "error"
                        : undefined
                    }
                    ref={(node) => (ingredientsRef.current[index] = node)}
                    hint={
                      repetitiveIngredientsIndex?.includes(index)
                        ? actionData?.fieldErrors.ingredients?.[0]?.toString()
                        : undefined
                    }
                    defaultValue={
                      !hydrated
                        ? actionData?.fields.ingredients[index]
                        : undefined
                    }
                    onChange={(e) =>
                      handleSelectIngredient(index, e.target.value)
                    }
                    required
                  >
                    <option disabled value="" defaultValue="">
                      Choose a ingredient
                    </option>
                    {data.ingredients.map((ingredient) => (
                      <option key={ingredient.id} value={ingredient.id}>
                        {ingredient.name} - {ingredient.unit}
                      </option>
                    ))}
                  </SelectField>
                </div>
                <div className="w-28">
                  {data.ingredients.find(
                    (ing) => ing.id === ingredients[index].id
                  )?.unit === "p" ? (
                    <SelectField
                      key={`amount-${index}-select`}
                      id={`amount-${index}`}
                      name="amount"
                      label={`amount`}
                      value={ingredient.amount}
                      ref={(node) => (amountRef.current[index] = node)}
                      onChange={(e) =>
                        handleChangeAmount(index, Number(e.target.value))
                      }
                      defaultValue={
                        !hydrated
                          ? actionData?.fields.amounts[index]
                          : undefined
                      }
                      required
                    >
                      <option disabled value={0} defaultValue={0}>
                        0
                      </option>
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
                      key={`amount-${index}-number`}
                      id={`amount-${index}`}
                      name="amount"
                      label="amount"
                      value={ingredient.amount}
                      ref={(node) => (amountRef.current[index] = node)}
                      onChange={(e) =>
                        handleChangeAmount(index, Number(e.target.value))
                      }
                      defaultValue={
                        !hydrated
                          ? actionData?.fields.amounts[index]
                          : undefined
                      }
                      required
                    />
                  )}
                </div>
                <div className="mt-0.5 self-start pt-6">
                  <input type="hidden" name="removeIngredient" value={index} />
                  <Button
                    type={hydrated ? "button" : "submit"}
                    size="sm"
                    name="action"
                    value="remove"
                    disabled={ingredients.length === 1}
                    onClick={() => handleRemoveIngredient(index)}
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
          type={hydrated ? "button" : "submit"}
          size="sm"
          name="action"
          value="add"
          onClick={handleAddIngredient}
          fill
        >
          +
        </Button>
        <Button
          type="submit"
          size="sm"
          name="action"
          value="save"
          disabled={ingredients.length === 0}
          fill
        >
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
