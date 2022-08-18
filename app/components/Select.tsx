type SelectProps = React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;

export default function Select(props: SelectProps) {
  const { children } = props;

  return (
    <select
      {...props}
      className="block h-[42px] w-full rounded-lg border bg-white px-4 py-2 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 disabled:bg-gray-50 disabled:opacity-75"
    >
      {children}
    </select>
  );
}
