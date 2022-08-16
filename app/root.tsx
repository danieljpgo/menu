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
  // title: "Remix Notes",
});

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await getUser(request),
  });
}

// @TODO check if pages title withs ok

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
    // <html lang="en" className="h-full">
    //   <head>
    //     <Meta />
    //     <Links />
    //   </head>
    //   <body className="h-full">
    //     <ScrollRestoration />
    //     <Scripts />
    //     <LiveReload />
    //   </body>
    // </html>
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
      <body className="h-full">
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <Document title="Uh-oh!">
      <main>
        <h1>App Error</h1>
        <pre>{error.message}</pre>
      </main>
    </Document>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <main>
        <h1>
          {caught.status} {caught.statusText}
        </h1>
      </main>
    </Document>
  );
}
