import type { ChangeEventHandler } from "react";
import { countryOptions } from "@/features/geo/countries";

/**
 * Country dropdown. It saves the country name (for example "India"), so it works with existing data.
 * A saved country that is not in the list (older records) is kept as an extra entry instead of being lost.
 * Use `value` + `onChange` for a controlled field, or `defaultValue` inside a form that is read with FormData.
 */
export function CountrySelect({
  name = "country",
  value,
  defaultValue,
  onChange,
  required,
  className,
  id,
}: {
  name?: string;
  value?: string;
  defaultValue?: string | null;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  required?: boolean;
  className?: string;
  id?: string;
}) {
  const current = (value ?? defaultValue ?? "").trim();
  const known = current !== "" && countryOptions.some((country) => country.name.toLowerCase() === current.toLowerCase());
  const props = value !== undefined ? { value: current, onChange } : { defaultValue: current, onChange };

  return (
    <select id={id} name={name} required={required} className={className} {...props}>
      <option value="">Select country</option>
      {current !== "" && !known && <option value={current}>{current}</option>}
      {countryOptions.map((country) => (
        <option key={country.iso} value={country.name}>
          {country.name}
        </option>
      ))}
    </select>
  );
}
