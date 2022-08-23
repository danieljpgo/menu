import { Form, Link, useLoaderData } from "@remix-run/react";
import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import { z } from "zod";
import { Button, Heading, Input, Shelf, Stack, Text } from "~/components";
import { prisma } from "~/server/db.server";
import { requireUserId } from "~/server/session.server";

export const meta: MetaFunction = () => ({
  title: "Menu - Shop",
});

const schema = z.object({
  shopId: z.string({ required_error: "shopId not found" }),
  action: z.enum(["save", "delete", "edit"], {
    required_error: "action not found",
  }),
});

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const shop = await prisma.shop.findUnique({
    where: { userId },
    select: {
      id: true,
      purchaseIngredients: {
        select: { id: true, bought: true, ingredient: true },
      },
      menus: {
        select: {
          recipes: {
            select: {
              ingredients: {
                select: { id: true, amount: true, ingredient: true },
              },
            },
          },
        },
      },
    },
  });

  if (!shop) {
    return json({ shop });
  }

  const ingredients = shop.menus
    .map((menu) =>
      menu.recipes.map((recipe) =>
        recipe.ingredients.map((ingredient) => ({
          id: ingredient.ingredient.id,
          amount: ingredient.amount,
        }))
      )
    )
    .flatMap((recipe) => recipe)
    .flatMap((recipe) => recipe);

  const purchases = shop.purchaseIngredients.map((purchase) => ({
    ...purchase,
    value: ingredients
      .filter((ingredient) => ingredient.id === purchase.ingredient.id)
      .reduce((acc, curr) => acc + curr.amount, 0),
  }));

  return json({ shop: { id: shop.id, purchases } });
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const validation = schema.safeParse({
    shopId: formData.get("shopId"),
    action: formData.get("action"),
  });

  // @TODO better error handler
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }
  const form = validation.data;

  if (form.action === "delete") {
    await prisma.shop.deleteMany({
      where: { id: validation.data.shopId, userId },
    });
    return json({ ok: true, action: form.action });
  }

  if (form.action === "save") {
    const boughts = formData
      .getAll("ingredientId")
      .map((id) => ({ id, check: formData.getAll(`bought-${id}`) }));

    await prisma.shop.update({
      where: { id: validation.data.shopId },
      data: {
        purchaseIngredients: {
          updateMany: boughts.map((bought) => ({
            where: { id: String(bought.id) },
            data: { bought: bought.check.includes("on") },
          })),
        },
      },
    });
    return json({ ok: true, action: form.action });
  }

  return redirect(".");
}

export default function Shop() {
  const data = useLoaderData<typeof loader>();

  if (!data.shop) {
    return (
      <Text as="p" size="sm" weight="normal" color="dark">
        No shop created yet.{" "}
        <Link to="new" className="text-sm font-medium text-blue-500 transform">
          create a new one.
        </Link>
      </Text>
    );
  }

  return (
    <>
      <Stack gap="md">
        <Form method="post">
          <Input type="hidden" name="shopId" value={data.shop.id} />
          <div className="flex items-center justify-between">
            <Heading as="h3" weight="medium">
              Ingredient
            </Heading>
            <Button size="sm" type="submit" name="action" value="save">
              save
            </Button>
          </div>
          <Stack as="ul" gap="xs">
            {data.shop?.purchases.map((purchase) => (
              <li
                key={purchase.ingredient.id}
                className="grid items-center justify-between grid-flow-col"
              >
                <Shelf>
                  <Text>{purchase.ingredient.name}</Text>-
                  <Text color="light">
                    {purchase.ingredient.unit === "p"
                      ? purchase.value
                      : `${purchase.value} ${purchase.ingredient.unit}`}
                  </Text>
                </Shelf>
                <Input type="hidden" name="ingredientId" value={purchase.id} />
                <Input
                  type="hidden"
                  name={`bought-${purchase.id}`}
                  value="off"
                />
                <Input
                  type="checkbox"
                  name={`bought-${purchase.id}`}
                  defaultChecked={purchase.bought}
                />
              </li>
            ))}
          </Stack>
        </Form>
      </Stack>
      <div className="fixed bottom-0 left-0 right-0 grid gap-4 px-6 pb-4 bg-white">
        <hr />
        <Form method="post" className="flex justify-between">
          <Input type="hidden" name="shopId" value={data.shop.id} />
          <Button size="sm" type="submit" name="action" value="delete">
            Delete
          </Button>
          <Button size="sm" type="button" name="action" value="edit">
            edit
          </Button>
        </Form>
      </div>
    </>
  );
}

// @TODO useFetch for saving?
// @TODO catch boundary
// @TODO error boundary
// @TODO form error handle
