import * as React from "react";
import { Spinner } from "~/components";

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2",
};

type ButtonProps = {
  children: string;
  fill?: boolean;
  disabled?: React.ButtonHTMLAttributes<HTMLButtonElement>["disabled"];
  loading?: boolean;
  name?: React.ButtonHTMLAttributes<HTMLButtonElement>["name"];
  value?: React.ButtonHTMLAttributes<HTMLButtonElement>["value"];
  size?: keyof typeof sizes;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export default function Button(props: ButtonProps) {
  const {
    children,
    fill,
    type = "button",
    name,
    value,
    disabled,
    loading,
    size = "md",
    onClick,
  } = props;

  return (
    <button
      name={name}
      value={value}
      type={type}
      disabled={disabled || loading}
      className={`
      transform rounded-lg bg-gray-800 px-4 py-2 tracking-wide text-white outline-none transition-colors duration-200 
      hover:bg-gray-700
      focus:border-blue-400 focus:bg-gray-700 focus:ring focus:ring-blue-300
      focus:ring-opacity-40 focus-visible:border-blue-400 focus-visible:ring focus-visible:ring-blue-300 
      focus-visible:ring-opacity-40  active:bg-gray-800 disabled:cursor-not-allowed disabled:bg-opacity-70

      

        ${sizes[size]}
        ${fill ? "w-full" : ""}
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
