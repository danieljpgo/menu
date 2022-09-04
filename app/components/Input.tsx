import * as React from "react";

// @TODO remove classname
// @TODO status error + animations
// @TODO disabled animations

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  props,
  ref
) {
  return (
    <input
      {...props}
      ref={ref}
      className="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 disabled:bg-gray-50 disabled:opacity-75"
    />
  );
});

export default Input;
