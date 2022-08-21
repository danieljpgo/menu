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
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
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
    onChange,
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
        onChange={onChange}
      >
        {children}
      </Select>
    </div>
  );
}
