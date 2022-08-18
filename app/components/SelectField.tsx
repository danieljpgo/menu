import { Select, Label } from "~/components";

type SelectFieldProps = {
  id: string;
  label: string;
  name: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  required?: boolean;
};

export default function SelectField(props: SelectFieldProps) {
  const {
    children,
    id,
    label,
    name,
    disabled,
    required = false,
    value,
    defaultValue,
  } = props;

  return (
    <div>
      <Label status={disabled ? "disabled" : "none"} htmlFor={id}>
        {label}
      </Label>
      <Select
        id={id}
        name={name}
        value={value}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
      >
        {children}
      </Select>
    </div>
  );
}
