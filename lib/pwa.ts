import siteWebmanifest from "../public/site.webmanifest";

export const pwaMetas = {
  "apple-mobile-web-app-status-bar-style": "default",
  "apple-mobile-web-app-capable": "yes",
};

export const assets = {
  "favicon-196": "favicon-196.png",
  "apple-icon-180": "apple-icon-180.png",
  "apple-splash-2048-2732": "apple-splash-2048-2732.jpg",
  "apple-splash-2732-2048": "apple-splash-2732-2048.jpg",
  "apple-splash-1668-2388": "apple-splash-1668-2388.jpg",
  "apple-splash-2388-1668": "apple-splash-2388-1668.jpg",
  "apple-splash-1536-2048": "apple-splash-1536-2048.jpg",
  "apple-splash-2048-1536": "apple-splash-2048-1536.jpg",
  "apple-splash-1668-2224": "apple-splash-1668-2224.jpg",
  "apple-splash-2224-1668": "apple-splash-2224-1668.jpg",
  "apple-splash-1620-2160": "apple-splash-1620-2160.jpg",
  "apple-splash-2160-1620": "apple-splash-2160-1620.jpg",
  "apple-splash-1284-2778": "apple-splash-1284-2778.jpg",
  "apple-splash-2778-1284": "apple-splash-2778-1284.jpg",
  "apple-splash-1170-2532": "apple-splash-1170-2532.jpg",
  "apple-splash-2532-1170": "apple-splash-2532-1170.jpg",
  "apple-splash-1125-2436": "apple-splash-1125-2436.jpg",
  "apple-splash-2436-1125": "apple-splash-2436-1125.jpg",
  "apple-splash-1242-2688": "apple-splash-1242-2688.jpg",
  "apple-splash-2688-1242": "apple-splash-2688-1242.jpg",
  "apple-splash-828-1792": "apple-splash-828-1792.jpg",
  "apple-splash-1792-828": "apple-splash-1792-828.jpg",
  "apple-splash-1242-2208": "apple-splash-1242-2208.jpg",
  "apple-splash-2208-1242": "apple-splash-2208-1242.jpg",
  "apple-splash-750-1334": "apple-splash-750-1334.jpg",
  "apple-splash-1334-750": "apple-splash-1334-750.jpg",
  "apple-splash-640-1136": "apple-splash-640-1136.jpg",
  "apple-splash-1136-640": "apple-splash-1136-640.jpg",
};

export const pwaLinks = [
  { rel: "manifest", href: siteWebmanifest },
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
];
