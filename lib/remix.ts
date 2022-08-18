import { useMatches } from "@remix-run/react";
import { redirect } from "@remix-run/server-runtime";
import { useMemo } from "react";

import type { User } from "~/server/user.server";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

/**
 * Create a new Response with a permanently redirect using `301` as status code.
 */
export function redirectPermanently(
  url: string,
  init?: Omit<ResponseInit, "status">
) {
  return redirect(url, {
    ...init,
    status: 301,
  });
}

// /**
//  * Create a response receiving a JSON object with the status code 404.
//  * @example
//  * export let loader: LoaderFunction = async ({ request, params }) => {
//  *   const user = await getUser(request);
//  *   if (!db.exists(params.id)) throw notFound<BoundaryData>({ user });
//  * }
//  */
//  export function notFound<Data = unknown>(
//   data: Data,
//   init?: Omit<ExtendedResponseInit, "status">
// ) {
//   return json<Data>(data, { ...init, status: 404 });
// }

// /**
//  * Create a response receiving a JSON object with the status code 403.
//  * @example
//  * export let loader: LoaderFunction = async ({ request }) => {
//  *   let user = await getUser(request);
//  *   if (!user.idAdmin) throw forbidden<BoundaryData>({ user });
//  * }
//  */
//  export function forbidden<Data = unknown>(
//   data: Data,
//   init?: Omit<ExtendedResponseInit, "status">
// ) {
//   return json<Data>(data, { ...init, status: 403 });
// }
