import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import * as React from "react";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { prisma } from "~/server/db.server";
import { requireUserId } from "~/server/session.server";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request); // @TODO: redirect if not reve permission
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { name: "desc" },
  });
  return json({ ingredients });
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request); // @TODO: redirect if not reve permission
  const formData = await request.formData();
  const name = formData.get("name");
  const description = formData.get("description");
  const amount = formData.get("amount");
  const ingredient = formData.get("ingredient");

  // @TODO Zod
  if (
    typeof name !== "string" ||
    name.length === 0 ||
    typeof amount !== "string" ||
    amount.length === 0 ||
    typeof ingredient !== "string" ||
    ingredient.length === 0 ||
    typeof description !== "string" ||
    description.length === 0
  ) {
    return json({ errors: { name: null, body: null } }, { status: 400 });
  }

  const recipe = await prisma.recipe.create({
    data: {
      name,
      description,
      user: {
        connect: {
          id: userId,
        },
      },
      ingredients: {
        create: {
          amount: Number(amount),
          ingredient: {
            connect: {
              id: ingredient,
            },
          },
        },
      },
    },
  });
  return redirect(`/recipes/${recipe.id}`);
}

export default function NewRecipe() {
  const [ingredientsAmount, setIngredientsAmount] = React.useState(1);
  const data = useLoaderData<typeof loader>();
  // const actionData = useActionData<typeof action>();

  // @TODO handle focus in better way
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
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <label htmlFor="name">name</label>
      <input
        id="name"
        name="name"
        className="flex-1 px-3 text-lg leading-loose border-2 border-blue-500 rounded-md"
        // aria-invalid={actionData?.errors?.name ? true : undefined}
        // aria-errormessage={
        // actionData?.errors?.name ? "title-error" : undefined
        // }
      />
      <label htmlFor="description">description</label>
      <input
        id="description"
        name="description"
        className="flex-1 px-3 text-lg leading-loose border-2 border-blue-500 rounded-md"
        // aria-invalid={actionData?.errors?.name ? true : undefined}
        // aria-errormessage={
        // actionData?.errors?.name ? "title-error" : undefined
        // }
      />
      {[...Array(ingredientsAmount).keys()].map((number) => (
        <div className="flex gap-2" key={number}>
          <div className="grid gap-2">
            <label htmlFor="ingredient">ingredient</label>
            <select name="ingredient" id="ingredient">
              {data.ingredients.map((ingredient) => (
                <option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name} - {ingredient.unit}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="amount">amount</label>
            <input
              id="amount"
              name="amount"
              className="flex-1 px-3 text-lg leading-loose border-2 border-blue-500 rounded-md"
              // aria-invalid={actionData?.errors?.name ? true : undefined}
              // aria-errormessage={
              // actionData?.errors?.name ? "title-error" : undefined
              // }
            />
          </div>
        </div>
      ))}
      <button
        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:bg-blue-400"
        onClick={() => setIngredientsAmount((prev) => prev + 1)}
        type="button"
        disabled
      >
        +
      </button>

      <div className="text-right">
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
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
            className="flex-1 px-3 text-lg leading-loose border-2 border-blue-500 rounded-md"
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
