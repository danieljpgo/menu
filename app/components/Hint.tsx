const colors = {
  error: "text-red-400",
};

type HintProps = {
  htmlFor: string;
  children: string;
  disabled?: boolean;
  status?: "error";
  required?: boolean;
};

export default function Hint(props: HintProps) {
  const { children, htmlFor, status, disabled } = props;

  return (
    <label
      htmlFor={htmlFor}
      className={`
        mt-2 block text-xs font-normal leading-4 text-gray-600 transition-opacity duration-200
        ${disabled ? "opacity-75" : ""}
        ${status && colors[status]}
      `}
    >
      {children}
    </label>
  );
}
