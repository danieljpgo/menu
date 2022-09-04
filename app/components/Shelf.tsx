// @TODO: arial label for ul
const gaps = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

type ShelfProps = {
  children: React.ReactNode;
  gap?: keyof typeof gaps;
  as?: "section" | "div" | "ul" | "ol" | "li";
};

export default function Shelf(props: ShelfProps) {
  const { children, as: tag = "div", gap = "sm" } = props;
  const Tag = tag;

  return <Tag className={`flex ${gaps[gap]}`}>{children}</Tag>;
}
