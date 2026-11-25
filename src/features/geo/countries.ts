import allCountries from "intl-tel-input/data";
import englishTexts from "intl-tel-input/i18n/en";

export interface CountryOption {
  iso: string;
  name: string;
  dial: string;
}

// Two entries the library has no English name for.
const extraNames: Record<string, string> = { ac: "Ascension Island", xk: "Kosovo" };
const names = englishTexts as Record<string, string | undefined>;

/** Every country (same list as the admin panel), sorted by name. The country NAME is what is saved. */
export const countryOptions: CountryOption[] = allCountries
  .map((country) => ({
    iso: country.iso2,
    name: names[country.iso2] || extraNames[country.iso2] || country.iso2.toUpperCase(),
    dial: country.dialCode,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

/** The list's spelling of a country picked by its ISO code (address search gives one); falls back to the given name. */
export function countryNameFor(iso?: string | null, name?: string | null): string {
  const found = iso ? countryOptions.find((country) => country.iso === iso.toLowerCase()) : undefined;
  return found?.name ?? name ?? "";
}
