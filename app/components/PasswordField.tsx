import { Input, Label } from "~/components";

type PasswordFieldProps = {
  id: string;
  label: string;
  name: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
};

export default function PasswordField(props: PasswordFieldProps) {
  const { id, label, name, required, disabled, value, defaultValue } = props;

  return (
    <div>
      <Label htmlFor={id} disabled={disabled}>
        {label}
      </Label>
      <Input
        id={id}
        type="password"
        name={name}
        value={value}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
      />
    </div>
  );
}
