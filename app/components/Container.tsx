type ContainerProps = {
  children: React.ReactNode;
  as?: "main" | "div";
};

export default function Container(props: ContainerProps) {
  const { children, as: tag = "div" } = props;
  const Tag = tag;

  return <Tag className="container w-full h-full mx-auto">{children}</Tag>;
}
