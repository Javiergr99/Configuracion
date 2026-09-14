import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SettingsField } from "@/features/appearance-settings/components/settings-field";

export function SettingsTextControl({
  label,
  value,
  persistedValue,
  onChange,
  multiline = false,
  maxLength,
}: {
  label: string;
  value: string;
  persistedValue: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  maxLength?: number;
}) {
  const edited = value !== persistedValue;

  return (
    <SettingsField label={label} edited={edited}>
      {multiline ? (
        <Textarea
          value={value}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-[52px] resize-none px-2.5 py-2 text-[11px] leading-4"
        />
      ) : (
        <Input
          value={value}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 px-2.5 text-[11px]"
        />
      )}
    </SettingsField>
  );
}
