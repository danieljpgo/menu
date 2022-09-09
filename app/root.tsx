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
import siteWebmanifest from "../public/site.webmanifest";
import globalCSS from "./styles/global.css";

import { assets } from "../lib/pwa";
// import favicon from "../lib/pwa";

import { getUser } from "./server/session.server";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    { rel: "stylesheet", href: globalCSS },
    { rel: "manifest", href: siteWebmanifest },
    // {
    //   rel: "icon",
    //   type: "image/png",
    //   sizes: "196x196",
    //   href: "../public/favicon.ico",
    // },
    {
      rel: "apple-touch-icon",
      type: "image/png",
      sizes: "196x196",
      href: assets["apple-icon-180"],
    },

    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-2048-2732"],
      media:
        "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-2732-2048"],
      media:
        "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-1668-2388"],
      media:
        "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-2388-1668"],
      media:
        "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-1536-2048"],
      media:
        "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-2048-1536"],
      media:
        "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-1668-2224"],
      media:
        "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-2224-1668"],
      media:
        "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-1620-2160"],
      media:
        "(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-2160-1620"],
      media:
        "(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-1284-2778"],
      media:
        "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-2778-1284"],
      media:
        "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-1170-2532"],
      media:
        "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-2532-1170"],
      media:
        "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-1125-2436"],
      media:
        "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-2436-1125"],
      media:
        "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-1242-2688"],
      media:
        "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-2688-1242"],
      media:
        "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-828-1792"],
      media:
        "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-1792-828"],
      media:
        "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-1242-2208"],
      media:
        "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-2208-1242"],
      media:
        "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-750-1334"],
      media:
        "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-1334-750"],
      media:
        "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-640-1136"],
      media:
        "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
    },
    {
      rel: "apple-touch-startup-image",
      href: assets["apple-splash-1136-640"],
      media:
        "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
    },

    // { rel: "manifest", href: siteWebmanifest, media: '' },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  viewport: "width=device-width,initial-scale=1",
  "apple-mobile-web-app-status-bar-style": "black-translucent",
  "apple-mobile-web-app-capable": "yes",
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
