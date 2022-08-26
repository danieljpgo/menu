import type { Ingredient } from "@prisma/client";
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import * as React from "react";
import { z } from "zod";
import { Button, Heading, SelectField, Stack, Text } from "~/components";
import { prisma } from "~/server/db.server";
import { requireUserId } from "~/server/session.server";

const schema = z.object({
  shopId: z.string({ required_error: "shopId not found" }),
});

const formSchema = z.object({
  menus: z.array(z.string()),
  shopId: z.string({ required_error: "shopId not found" }),
});

export const meta: MetaFunction = () => ({
  title: `Menu - Edit Shop`,
});

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  const validation = schema.safeParse(params);

  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }

  const shop = await prisma.shop.findUniqueOrThrow({
    where: { id: validation.data.shopId },
    include: { menus: true },
  });
  const menus = await prisma.menu.findMany({
    where: { userId: userId },
    orderBy: { name: "desc" },
  });
  return json({ shop, menus });
}

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request);

  const formData = await request.formData();
  const validation = formSchema.safeParse({
    menus: formData.getAll("menu"), //rename to menusId
    shopId: params.shopId,
  });

  // @TODO better error handler
  if (!validation.success) {
    return json({ errors: { name: null, body: null } }, { status: 400 });
  }

  const form = validation.data;

  const shop = await prisma.shop.findUnique({
    where: { id: validation.data.shopId },
    include: { menus: true },
  });

  if (!shop) {
    throw new Response("Not Found", { status: 404 });
  }

  const menus = await prisma.menu.findMany({
    where: {
      id: { in: form.menus },
    },
    select: {
      recipes: {
        select: {
          ingredients: {
            select: {
              ingredient: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const purchaseIngredients = new Set<Ingredient["id"]>();
  menus.forEach((menu) =>
    menu.recipes.forEach((recipe) =>
      recipe.ingredients.forEach((ingredient) =>
        purchaseIngredients.add(ingredient.ingredient.id)
      )
    )
  );

  const disconnectMenus = shop.menus.filter(
    (menu) => !form.menus.some((id) => id === menu.id)
  );
  const connectMenus = form.menus.filter(
    (id) => !shop.menus.some((menu) => menu.id === id)
  );

  await prisma.shop.update({
    where: { id: form.shopId },
    data: {
      menus: {
        disconnect: disconnectMenus.map((menu) => ({ id: menu.id })),
        connect: connectMenus.map((id) => ({ id })),
      },
      // {

      // : form.menus.map((id) => ({ id })),
      // connect: form.menus.map((id) => ({ id })),
      // },
      // purchaseIngredients: {
      //   // create: Array.from(purchaseIngredients).map((id) => ({
      //   //   ingredient: { connect: { id } },
      //   // })),
      // },
    },
  });
  return redirect(`/shop`);
}

export default function NewShop() {
  const data = useLoaderData<typeof loader>();
  const [menus, setMenus] = React.useState(data?.shop?.menus ?? []);
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

  if (!data.shop) {
    return null;
  }

  return (
    <Form method="post">
      <div className="pb-32">
        <Stack gap="md">
          <Text>Create a new shop for your grocery.</Text>
          <Heading as="h3" weight="medium">
            Menus
          </Heading>
          <Stack as="ol" gap="md">
            {menus.map((shopMenu, index) => (
              <li
                key={`${shopMenu.id}-${index}`}
                className="flex items-center w-full gap-4"
              >
                <div className="w-full">
                  <SelectField
                    id={`menu-${shopMenu.id}`}
                    name="menu"
                    label="menu"
                    defaultValue={
                      data.shop.menus.find(({ id }) => id === shopMenu.id)?.id
                    }
                  >
                    {data.menus.map((menu) => (
                      <option key={menu.id} value={menu.id}>
                        {menu.name}
                      </option>
                    ))}
                  </SelectField>
                </div>

                <div className="pt-6">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      setMenus((prev) => prev.filter((_, i) => index !== i))
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
          onClick={() => setMenus((prev) => [...prev, data.menus[0]])}
        >
          +
        </Button>
        <Button type="submit" size="sm" disabled={menus.length === 0}>
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
