import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import * as React from "react";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { requireUserId } from "~/server/session.server";
import { Button, Heading, SelectField, Stack, Text } from "~/components";
import { updateShop, getShop } from "~/server/shop.server";
import { badRequest, notFound } from "lib/remix";
import { getMenus } from "~/server/menu.server";
import { useHydrated } from "~/hooks";

const loadSchema = z.object({
  shopId: z.string({ required_error: "shopId not found" }),
});

const schema = z.union([
  z.object({
    action: z.literal("save"),
    menus: z
      .array(z.string({ required_error: "Select a menu" }))
      .min(1, "Should be at least 1 menu")
      .refine((array) => !array.some((e, i, a) => a.indexOf(e) !== i), {
        message: "Should not repeat the menus",
      }),
    removeMenu: z.string().transform((val) => Number(val)),
    shopId: z.string({ required_error: "shopId not found" }),
  }),
  z.object({
    action: z.union([z.literal("add"), z.literal("remove")]),
    menus: z.array(z.string()),
    removeMenu: z.string().transform((val) => Number(val)),
    shopId: z.string({ required_error: "shopId not found" }),
  }),
]);

export const meta: MetaFunction = () => ({
  title: `Menu - Edit Shop`,
});

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  const validation = loadSchema.safeParse(params);
  if (!validation.success) throw notFound();

  const shop = await getShop(validation.data.shopId);
  if (!shop) throw notFound();

  const menus = await getMenus({ userId });
  return json({ shop, menus });
}

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request);
  const formData = await request.formData();
  const validation = schema.safeParse({
    action: formData.get("action"),
    menus: formData.getAll("menu"),
    removeMenu: formData.get("removeMenu"),
    shopId: params.shopId,
  });

  if (!validation.success) {
    console.log(validation.error);
    return badRequest({
      formError: validation.error.formErrors.formErrors,
      fieldErrors: { ...validation.error.formErrors.fieldErrors },
      fields: {
        menus: formData.getAll("menu").map(String),
      },
    });
  }

  const form = validation.data;
  if (form.action === "add") {
    return json({
      formError: [],
      fieldErrors: {
        menus: [null],
      },
      fields: {
        ...form,
        menus: [...form.menus, ""],
      },
    });
  }
  if (form.action === "remove") {
    return json({
      formError: [],
      fieldErrors: {
        menus: [null],
      },
      fields: {
        ...form,
        menus: form.menus.filter((_, i) => form.removeMenu !== i),
      },
    });
  }
  if (form.action === "save") {
    await updateShop(form);
  }

  return redirect(`/shop`);
}

export default function NewShop() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const menusRef = React.useRef<Array<HTMLSelectElement | null>>([]);
  const [selectedMenus, setSelectedMenus] = React.useState(
    data.shop.menus.map(({ id }) => id)
  );
  const hydrated = useHydrated();

  const repetitiveMenuIndex = React.useMemo(
    () =>
      actionData?.fields.menus.map((menu, i, arr) =>
        menu ? (arr.indexOf(menu) !== i ? i : -1) : -1
      ),
    [actionData?.fields.menus]
  );

  React.useEffect(() => {
    if (menusRef.current[0]) {
      menusRef.current[0].focus();
      menusRef.current[0].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }
  }, []);

  React.useEffect(() => {
    if (actionData?.fieldErrors?.menus && repetitiveMenuIndex) {
      const index = repetitiveMenuIndex.filter((a) => a !== -1);
      menusRef.current[index[0]]?.focus();
      menusRef.current[index[0]]?.scrollIntoView({ behavior: "smooth" });
      return;
    }
  }, [actionData, repetitiveMenuIndex]);

  React.useEffect(() => {
    if (selectedMenus.length > 1 && menusRef.current.at(-1)?.value === "") {
      menusRef.current.at(-1)?.focus();
      menusRef.current
        .at(-1)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (menusRef.current.includes(null)) {
      menusRef.current = menusRef.current.filter(Boolean);
      return;
    }
  }, [selectedMenus]);

  function handleAddMenu() {
    if (!hydrated) return;
    setSelectedMenus((prev) => [...prev, ""]);
  }

  function handleRemoveMenu(index: number) {
    if (!hydrated) return;
    setSelectedMenus((prev) => prev.filter((_, i) => index !== i));
  }

  function handleSelectMenu(index: number, selectedId: string) {
    if (!hydrated) return;
    setSelectedMenus((prev) =>
      prev.map((data, i) => (i === index ? selectedId : data))
    );
  }

  const menus = hydrated ? selectedMenus : actionData?.fields.menus ?? [""];

  console.log(repetitiveMenuIndex);
  console.log(actionData?.fieldErrors);

  return (
    <Form method="post">
      <div className="pb-32">
        <Stack gap="md">
          <Text>Create a new shop for your grocery.</Text>
          <Heading as="h3" weight="medium">
            Menus
          </Heading>
          <Stack as="ol" gap="md">
            {menus.map((id, index) => (
              <li
                key={`${id}-${index}`}
                className="flex items-center w-full gap-4"
              >
                <div className="w-full">
                  <SelectField
                    id={`menu-${id}-${index}`}
                    name="menu"
                    label="menu"
                    value={hydrated ? id : undefined}
                    status={
                      repetitiveMenuIndex?.includes(index) ? "error" : undefined
                    }
                    hint={
                      repetitiveMenuIndex?.includes(index)
                        ? actionData?.fieldErrors.menus?.[0]?.toString()
                        : undefined
                    }
                    ref={(node) => (menusRef.current[index] = node)}
                    defaultValue={
                      !hydrated ? actionData?.fields.menus[index] : undefined
                    }
                    onChange={(e) => handleSelectMenu(index, e.target.value)}
                    required
                    // defaultValue={
                    //   data.shop.menus.find((menu) => menu.id === id)?.id
                    // }
                  >
                    <option disabled value="" defaultValue="">
                      Choose a menu
                    </option>
                    {data.menus.map((menu) => (
                      <option key={menu.id} value={menu.id}>
                        {menu.name}
                      </option>
                    ))}
                  </SelectField>
                </div>
                <div className="mt-0.5 self-start pt-6">
                  <input type="hidden" name="removeMenu" value={index} />
                  <Button
                    type={hydrated ? "button" : "submit"}
                    size="sm"
                    name="action"
                    value="remove"
                    disabled={menus.length === 1}
                    onClick={() => handleRemoveMenu(index)}
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
          onClick={handleAddMenu}
        >
          +
        </Button>
        <Button
          type="submit"
          size="sm"
          name="action"
          value="save"
          disabled={menus.length === 0}
          fill
        >
          save
        </Button>
      </div>
    </Form>
  );
}
