const colors = {
  error: "text-red-400",
};

type LabelProps = {
  htmlFor: string;
  children: string;
  disabled?: boolean;
  status?: "error";
  required?: boolean;
};

export default function Label(props: LabelProps) {
  const { children, htmlFor, required, status, disabled } = props;

  return (
    <label
      htmlFor={htmlFor}
      className={`
        mb-2 block text-sm font-medium leading-4 text-gray-600 transition-opacity duration-200
        ${disabled ? "opacity-75" : ""}
      `}
    >
      {children}
      {required && (
        <span
          className={`
            transition-colors duration-200 
            ${status && colors[status]}
          `}
        >
          &nbsp;*
        </span>
      )}
    </label>
  );
}
