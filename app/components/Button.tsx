import * as React from "react";
import { Spinner } from "~/components";

const sizes = {
  sm: "px-3 py-1.5 text-sm ",
  md: "px-4 py-2",
};

type ButtonProps = {
  children: string | React.ReactNode;
  size?: "sm" | "md";
  disabled?: boolean;
  loading?: boolean;
  type?: "submit" | "reset" | "button";
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export default function Button(props: ButtonProps) {
  const {
    children,
    type = "button",
    disabled,
    loading,
    size = "md",
    onClick,
  } = props;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        w-full transform rounded-lg bg-gray-800 px-4 py-2 tracking-wide text-white transition-colors duration-200 hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-800 disabled:cursor-not-allowed disabled:bg-opacity-70
        ${sizes[size]}
    `}
      onClick={onClick}
    >
      <div className="flex items-center justify-center gap-2">
        <span>{children}</span>
        {loading && <Spinner variant="contrast" />}
      </div>
    </button>
  );
}
