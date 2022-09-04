import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import * as React from "react";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { requireUserId } from "~/server/session.server";
import { Button, Heading, SelectField, Stack, Text } from "~/components";
import { updateShop, getShop } from "~/server/shop.server";
import { notFound } from "lib/remix";
import { getMenus } from "~/server/menu.server";

const schema = z.object({
  shopId: z.string({ required_error: "shopId not found" }),
});

const formSchema = z.object({
  menusId: z.array(z.string()),
  shopId: z.string({ required_error: "shopId not found" }),
});

export const meta: MetaFunction = () => ({
  title: `Menu - Edit Shop`,
});

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  const validation = schema.safeParse(params);
  if (!validation.success) {
    // @TODO better error handler
    throw new Error(validation.error.issues[0].message);
  }

  const shop = await getShop(validation.data.shopId);
  if (!shop) {
    throw notFound();
  }

  const menus = await getMenus({ userId });
  return json({ shop, menus });
}

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request);
  const formData = await request.formData();
  const validation = formSchema.safeParse({
    menusId: formData.getAll("menu"),
    shopId: params.shopId,
  });

  if (!validation.success) {
    // @TODO better error handler
    return json({ errors: { name: null, body: null } }, { status: 400 });
  }

  const newShop = await updateShop(validation.data);
  if (!newShop) {
    throw notFound();
  }
  return redirect(`/shop`);
}

export default function NewShop() {
  const data = useLoaderData<typeof loader>();
  const [menus, setMenus] = React.useState(data.shop.menus);
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
          fill
        >
          +
        </Button>
        <Button type="submit" size="sm" disabled={menus.length === 0} fill>
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
