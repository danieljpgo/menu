import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "@remix-run/react";
import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./server/session.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await getUser(request),
  });
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

type DocumentProps = {
  children: React.ReactNode;
  title?: string;
};
function Document(props: DocumentProps) {
  const { children, title = "Untitled" } = props;

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <body className="flex flex-col h-full">
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

const errors: Record<number, string> = {
  401: "No authorization to access the page",
  404: "Page not found",
  500: "Something went wrong, refresh the page in a few moments",
  502: "Something went wrong, check your connection and try again",
  503: "Service Unavailable",
  504: "We got no response from the server, please try again later",
};

export function CatchBoundary() {
  const caught = useCatch();

  if (Object.keys(errors).includes(String(caught.status))) {
    return (
      <Document title={`${caught.status} ${caught.statusText}`}>
        <main>
          <h1>
            {caught.status} {caught.statusText}
          </h1>
          <h2>{errors[caught.status]}</h2>
        </main>
      </Document>
    );
  }

  throw new Error("Generic Error");
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <Document title="Oops :(">
      <main>
        <h1>App Error</h1>
        <h2>
          Something went wrong, try to reload the page or go back to the home
          page
        </h2>
        <pre>
          <code>{error.message}</code>
        </pre>
      </main>
    </Document>
  );
}

// @TODO Improve ErrorBoundary and CatchBoundary
