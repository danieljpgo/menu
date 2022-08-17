import type { NavLinkProps as RemixNavLinkProps } from "@remix-run/react";
import { NavLink as RemixNavLink } from "@remix-run/react";

type NavLinkProps = RemixNavLinkProps;

export default function NavLink(props: NavLinkProps) {
  const { children } = props;

  return (
    <RemixNavLink
      {...props}
      className={({ isActive }) =>
        `text-sm font-medium ${
          isActive ? "text-blue-500" : "text-gray-700"
        }  hover:text-blue-500" transform transition-colors duration-200`
      }
    >
      {children}
    </RemixNavLink>
  );
}
