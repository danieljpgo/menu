// @TODO: arial label for ul

type StackProps = {
  children: React.ReactNode;
  as?: "section" | "div" | "ul" | "li";
};

export default function Stack(props: StackProps) {
  const { children, as: tag = "div" } = props;
  const Tag = tag;

  return <Tag className="flex flex-col">{children}</Tag>;
}
