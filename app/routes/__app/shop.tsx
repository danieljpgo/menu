import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useMatches,
} from "@remix-run/react";
import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import { z } from "zod";
import { requireUserId } from "~/server/session.server";
import {
  deleteShop,
  updateShopPurchases,
  getShopPurchasesWithTotalValues,
} from "~/server/shop.server";
import { Button, Heading, Input, Shelf, Stack, Text } from "~/components";

const schema = z.object({
  shopId: z.string({ required_error: "shopId not found" }),
  action: z.enum(["save", "delete"], {
    required_error: "action not found",
  }),
  ingredientIds: z.array(
    z.string({ required_error: "ingredientId not found" })
  ),
});

export const meta: MetaFunction = () => ({
  title: "Menu - Shop",
});

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const shop = await getShopPurchasesWithTotalValues({ userId });
  if (!shop) return json({ shop });

  return json({ shop: { id: shop.id, purchases: shop.purchases } });
}

export async function action({ request }: ActionArgs) {
  await requireUserId(request);
  const formData = await request.formData();
  const validation = schema.safeParse({
    shopId: formData.get("shopId"),
    action: formData.get("action"),
    ingredientIds: formData.getAll("ingredientId"),
  });

  if (!validation.success) {
    // @TODO better error handler
    throw new Error(validation.error.issues[0].message);
  }

  const form = validation.data;

  if (form.action === "delete") {
    await deleteShop(form.shopId);
    return json({ ok: true, action: form.action });
  }

  if (form.action === "save") {
    const boughts = form.ingredientIds
      .map((id) => ({ id, check: formData.getAll(`bought-${id}`) }))
      .map((bought) => ({ ...bought, check: bought.check.includes("on") }));

    await updateShopPurchases(validation.data.shopId, { boughts });
    return json({ ok: true, action: form.action });
  }

  return redirect(".");
}

export default function Shop() {
  const data = useLoaderData<typeof loader>();
  const matches = useMatches();

  const showShop = !matches.some((match) =>
    [
      "routes/__app/shop/new",
      "routes/__app/shop/edit",
      "routes/__app/shop/edit.$shopId",
    ].includes(match.id)
  );

  return (
    <div className="grid gap-4 px-6 py-4">
      <Heading as="h2" weight="semibold">
        Shop
      </Heading>
      {showShop && (
        <>
          {!data.shop ? (
            <Text as="p" size="sm" weight="normal" color="dark">
              No shop created yet.{" "}
              <Link
                to="new"
                className="text-sm font-medium text-blue-500 transform"
              >
                create a new one.
              </Link>
            </Text>
          ) : (
            <>
              <Form method="post">
                <Stack gap="md">
                  <Input type="hidden" name="shopId" value={data.shop.id} />
                  <div className="flex justify-between">
                    <Heading as="h3" weight="medium">
                      Ingredient
                    </Heading>
                    <div className="-mt-1">
                      <Button
                        size="sm"
                        type="submit"
                        name="action"
                        value="save"
                      >
                        save
                      </Button>
                    </div>
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
                        <Input
                          type="hidden"
                          name="ingredientId"
                          value={purchase.id}
                        />
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
                </Stack>
              </Form>
            </>
          )}
          <div className="fixed bottom-0 left-0 right-0 grid gap-4 px-6 pb-4 bg-white">
            <hr />
            {data.shop ? (
              <Form method="post">
                <Input type="hidden" name="shopId" value={data.shop.id} />
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    size="sm"
                    type="submit"
                    name="action"
                    value="delete"
                    fill
                  >
                    delete
                  </Button>
                  <Link to={`edit/${data.shop.id}`} className="grid w-full">
                    <Button size="sm" type="button" fill>
                      edit
                    </Button>
                  </Link>
                </div>
              </Form>
            ) : (
              <Link to="new" className="grid w-full">
                <Button size="sm" type="button" fill>
                  +
                </Button>
              </Link>
            )}
          </div>
        </>
      )}
      <Outlet />
    </div>
  );
}
