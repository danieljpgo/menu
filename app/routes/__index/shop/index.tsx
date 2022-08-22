import { Form, Link, useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import { z } from "zod";
import { Button, Heading, Input, Shelf, Stack, Text } from "~/components";
import { prisma } from "~/server/db.server";
import { requireUserId } from "~/server/session.server";

const schema = z.object({
  shopId: z.string({ required_error: "shopId not found" }),
  method: z.string({ required_error: "method not found" }),
});

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const shop = await prisma.shop.findUnique({
    where: { userId },
    select: {
      id: true,
      menus: {
        select: {
          recipes: {
            select: {
              ingredients: {
                select: {
                  amount: true,
                  id: true,
                  ingredient: true,
                },
              },
            },
          },
        },
      },
      purchaseIngredients: {
        select: {
          id: true,
          bought: true,
          ingredient: true,
        },
      },
    },
  });

  if (!shop) {
    return json({ shop });
  }

  const cde = shop.menus
    .map((menu) => {
      return menu.recipes.map((recipe) => {
        return recipe.ingredients.map((ingredient) => {
          return {
            amount: ingredient.amount,
            ingredientId: ingredient.ingredient.id,
          };
        });
      });
    })
    .flatMap((a) => a.flatMap((b) => b));

  const calc = shop.purchaseIngredients.map((purchase) => {
    const some = cde.filter(
      (ingredient) => ingredient.ingredientId === purchase.ingredient.id
    );

    return {
      ...purchase,
      value: some.reduce((acc, curr) => acc + curr.amount, 0),
    };
  });

  // const abc = shop?.purchaseIngredients.reduce((acc, curr, index) => {
  //   // curr.ingredient.id
  //   const cde = shop.menus.map((menu) => {
  //     return menu.recipes.map(recipe => {
  //       return recipe.ingredients.map(ingredient => {
  //         return {
  //           amount: ingredient.amount,
  //           ingredientId: ingredient.ingredient.id
  //         }
  //       })
  //     })

  //     return acc1
  //   }, [] as any)

  //   return acc
  // }, [] as any)

  return json({
    shop: {
      id: shop.id,
      ingredients: calc,
    },
  });
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const validation = schema.safeParse({
    shopId: formData.get("shopId"),
    method: formData.get("_method"),
  });

  if (!validation.success) {
    const { message } = validation.error.issues[0];
    throw new Error(message);
  }

  if (validation.data.method === "delete") {
    await prisma.shop.deleteMany({
      where: { id: validation.data.shopId, userId },
    });
  }

  if (validation.data.method === "save") {
    const boughts = formData.getAll("ingredientId").map((a) => ({
      id: a,
      check: formData.getAll(`bought - ${a}`),
    }));
    await prisma.shop.update({
      where: {
        id: validation.data.shopId,
      },
      data: {
        purchaseIngredients: {
          updateMany: boughts.map((bought) => ({
            where: { id: String(bought.id) },
            data: {
              bought: bought.check.includes("on"),
            },
          })),
        },
      },
    });
  }
  return redirect("/shop");
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
      <Form method="post">
        <Input type="hidden" name="shopId" value={data.shop?.id} />
        <Stack gap="md">
          <div className="flex items-center justify-between">
            <Heading as="h3" weight="medium">
              Ingredient
            </Heading>
            <div>
              <Button size="sm" type="submit" name="_method" value="save">
                save
              </Button>
            </div>
          </div>
          <Stack as="ul" gap="xs">
            {data.shop?.ingredients.map((ingredient, index) => (
              <li
                key={ingredient.ingredient.id}
                className="flex items-center justify-between"
              >
                <Shelf>
                  <Text>{ingredient.ingredient.name}</Text>-
                  <Text color="light">
                    {ingredient.ingredient.unit === "p"
                      ? ingredient.value
                      : `${ingredient.value} ${ingredient.ingredient.unit}`}
                  </Text>
                </Shelf>
                <div>
                  <Input
                    type="hidden"
                    name="ingredientId"
                    value={ingredient.id}
                  />
                  <Input
                    type="hidden"
                    name={`bought - ${ingredient.id}`}
                    value="off"
                  />
                  <Input
                    type="checkbox"
                    name={`bought - ${ingredient.id}`}
                    defaultChecked={ingredient.bought}
                  />
                </div>
              </li>
            ))}
          </Stack>
        </Stack>
      </Form>
      <div className="fixed bottom-0 left-0 right-0 grid gap-4 px-6 pb-4 bg-white ">
        <hr />
        <div className="flex justify-between">
          <Form method="post">
            <Button size="sm" type="submit" name="_method" value="delete">
              Delete
            </Button>
          </Form>
          <div>
            <Button size="sm" type="button" disabled>
              edit
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
