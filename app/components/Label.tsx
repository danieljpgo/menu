type LabelProps = {
  htmlFor: string;
  children: string;
  status?: "none" | "disabled";
};

export default function Label(props: LabelProps) {
  const { children, htmlFor, status = "none" } = props;

  return (
    <label
      className={`${
        status === "disabled" ? "opacity-75" : ""
      } mb-2 block text-sm font-medium leading-4 text-gray-600`}
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}
