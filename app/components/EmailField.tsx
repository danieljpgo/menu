import { Input, Label } from "~/components";

type EmailFieldProps = {
  id: string;
  label: string;
  name: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
};

export default function EmailField(props: EmailFieldProps) {
  const { id, label, name, required, disabled, value, defaultValue } = props;

  return (
    <div>
      <Label htmlFor={id} status={disabled ? "disabled" : "none"}>
        {label}
      </Label>
      <Input
        id={id}
        type="email"
        name={name}
        value={value}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
      />
    </div>
  );
}
