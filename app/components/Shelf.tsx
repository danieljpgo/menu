// @TODO: arial label for ul

type ShelfProps = {
  children: React.ReactNode;
  as?: "section" | "div" | "ul" | "ol" | "li" | "nav";
};

export default function Shelf(props: ShelfProps) {
  const { children, as: tag = "div" } = props;
  const Tag = tag;

  return <Tag className="flex">{children}</Tag>;
}
