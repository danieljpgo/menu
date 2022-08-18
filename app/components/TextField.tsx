import { Input, Label } from "~/components";

type TextFieldProps = {
  id: string;
  label: string;
  name: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  required?: boolean;
};

export default function TextField(props: TextFieldProps) {
  const {
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
      <Input
        id={id}
        type="text"
        name={name}
        value={value}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
      />
    </div>
  );
}
