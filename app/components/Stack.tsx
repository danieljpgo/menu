// @TODO: arial label for ul
const gaps = {
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

type StackProps = {
  children: React.ReactNode;
  gap?: keyof typeof gaps;
  as?: "section" | "div" | "ul" | "ol" | "li";
};

export default function Stack(props: StackProps) {
  const { children, as: tag = "div", gap = "sm" } = props;
  const Tag = tag;

  return <Tag className={`flex flex-col ${gaps[gap]}`}>{children}</Tag>;
}
