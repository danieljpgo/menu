const styles = {
  italic: "italic",
  "not-italic": "not-italic",
} as const;

const colors = {
  light: "text-gray-500",
  base: "text-gray-600",
  dark: "text-gray-700",
  contrast: "text-white",
  error: "text-red-400",
  success: "text-green-500",
  secondary: "text-blue-500",
} as const;

const sizes = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
} as const;

const tags = {
  p: "p",
  b: "b",
  i: "i",
  strong: "strong",
  em: "em",
} as const;

const weights = {
  bold: "font-bold",
  semibold: "font-semibold",
  medium: "font-medium",
  normal: "font-normal",
  light: "font-light",
  "extra-light": "font-extralight",
  thin: "font-thin",
} as const;

type TextProps = {
  children: string | React.ReactNode;
  size?: keyof typeof sizes;
  color?: keyof typeof colors;
  as?: keyof typeof tags;
} & (
  | {
      as?: Exclude<keyof typeof tags, "b" | "strong" | "i">;
      weight?: keyof typeof weights;
      style?: keyof typeof styles;
    }
  | { as: "b" | "strong"; style?: keyof typeof styles }
  | { as: "i" | "em"; weight?: keyof typeof weights }
);

export default function Text(props: TextProps) {
  const { children, color = "base", as = "p", size = "base" } = props;
  const Tag = as;

  const isBold = props.as === "b" || props.as === "strong";
  const isItalic = props.as === "i" || props.as === "em";

  const hasWeights = props.as === "em" || props.as === "i" || props.as === "p";
  const hasStyles =
    props.as === "b" || props.as === "strong" || props.as === "p";

  return (
    <Tag
      className={`
        ${sizes[size]}
        ${colors[color]}
        ${
          hasStyles
            ? styles[props.style ?? "not-italic"]
            : isItalic
            ? styles["italic"]
            : ""
        }
        ${
          hasWeights
            ? weights[props.weight ?? "normal"]
            : isBold
            ? weights["bold"]
            : ""
        }
      `}
    >
      {children}
    </Tag>
  );
}
