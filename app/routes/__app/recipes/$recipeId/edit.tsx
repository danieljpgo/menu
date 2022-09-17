import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { portions } from "lib/ingredients";
import { badRequest, notFound } from "lib/remix";
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
import { useHydrated } from "~/hooks";
import { getIngredients } from "~/server/ingredient.server";
import { getRecipe, updateRecipe } from "~/server/recipe.server";
import { requireUserId } from "~/server/session.server";

export const meta: MetaFunction = ({
  data,
}: {
  data: { menu: { name: string } };
}) => ({
  title: data?.menu ? `Menu - Edit ${data.menu.name}` : "Menu - Not found",
});

const loaderSchema = z.object({
  recipeId: z.string({ required_error: "recipeId not found" }),
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
    recipeId: z.string({ required_error: "recipeId not found" }),
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
    recipeId: z.string({ required_error: "recipeId not found" }),
    removeIngredient: z.string().transform((val) => Number(val)),
  }),
]);

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request);
  const validation = loaderSchema.safeParse(params);
  if (!validation.success) throw notFound();

  const recipe = await getRecipe(validation.data.recipeId);
  if (!recipe) throw notFound();

  const ingredients = await getIngredients();
  return json({ ingredients, recipe });
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const validation = schema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    ingredients: formData.getAll("ingredient"),
    amounts: formData.getAll("amount"),
    action: formData.get("action"),
    recipeId: params.recipeId,
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
  if ("action" in form && form.action === "add") {
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
  if ("action" in form && form.action === "remove") {
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
  if ("action" in form && form.action === "save") {
    const recipe = await updateRecipe({ ...form, userId });
    if (!recipe) throw notFound();
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
  const [selectedIngredients, setSelectedIngredients] = React.useState(() =>
    data.recipe.ingredients.map((ingredient) => ({
      id: ingredient.ingredientId,
      amount: String(ingredient.amount),
    }))
  );
  const hydrated = useHydrated();

  const repetitiveIngredientsIndex = React.useMemo(
    () =>
      actionData?.fields.ingredients.map((ingredient, i, arr) =>
        ingredient ? (arr.indexOf(ingredient) !== i ? i : -1) : -1
      ),
    [actionData?.fields.ingredients]
  );

  React.useEffect(() => {
    if (nameRef.current?.value) {
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
    setSelectedIngredients((prev) => [...prev, { id: "", amount: "0" }]);
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

  function handleChangeAmount(index: number, amount: string) {
    if (!hydrated) return;
    setSelectedIngredients((prev) =>
      prev.map((data, i) => (i === index ? { ...data, amount } : data))
    );
  }

  const ingredients = hydrated
    ? selectedIngredients
    : actionData?.fields.ingredients.map((id, i) => ({
        id,
        amount: String(actionData?.fields.amounts[i]),
      })) ??
      data.recipe.ingredients.map((ingredient) => ({
        id: ingredient.ingredientId,
        amount: String(ingredient.amount),
      }));

  return (
    <Form method="post">
      <div className="pb-32">
        <Stack gap="md">
          <Text>edit a new recipe for your menus.</Text>
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
            defaultValue={
              actionData?.fields.name?.toString() ?? data.recipe.name
            }
            required
          />
          <TextField
            id="description"
            name="description"
            label="description"
            ref={descriptionRef}
            hint={actionData?.fieldErrors.description?.[0]}
            status={actionData?.fieldErrors.description ? "error" : undefined}
            defaultValue={
              actionData?.fields.description?.toString() ??
              data.recipe.description
            }
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
                    name="ingredient"
                    label={`ingredient`}
                    value={hydrated ? ingredient.id : undefined}
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
                    defaultValue={hydrated ? undefined : ingredient.id}
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
                <div className="w-1/3">
                  {data.ingredients.find((a) => a.id === ingredient.id)
                    ?.unit === "p" ? (
                    <SelectField
                      id={`amount-${index}`}
                      name="amount"
                      label={`amount`}
                      value={ingredient.amount}
                      ref={(node) => (amountRef.current[index] = node)}
                      onChange={(e) =>
                        handleChangeAmount(index, e.target.value)
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
                      id={`amount-${index}`}
                      name="amount"
                      label={`amount`}
                      value={ingredient.amount}
                      ref={(node) => (amountRef.current[index] = node)}
                      onChange={(e) =>
                        handleChangeAmount(index, e.target.value)
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
