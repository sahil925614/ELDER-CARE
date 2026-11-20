import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { MapPin } from "lucide-react";
import { searchAddresses } from "@/features/geo/addressSearch";
import type { AddressSuggestion } from "@/features/geo/addressSearch";

interface AddressValues {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zip_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Address, city, state, country and zip code with "type to search" suggestions.
 * Choosing a suggestion fills the other fields and keeps the map position (sent as latitude/longitude),
 * which the care team uses to match the nearest provider. Typing by hand clears the saved position;
 * the server finds it again when the form is saved.
 */
export function AddressFields({ values }: { values?: AddressValues }) {
  const [form, setForm] = useState({
    address: values?.address ?? "",
    city: values?.city ?? "",
    state: values?.state ?? "",
    country: values?.country || "India",
    zip_code: values?.zip_code ?? "",
  });
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    values?.latitude != null && values?.longitude != null
      ? { lat: values.latitude, lng: values.longitude }
      : null,
  );
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const controller = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      controller.current?.abort();
    },
    [],
  );

  function change(name: keyof typeof form) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm((current) => ({ ...current, [name]: value }));
      setPosition(null);
      if (name !== "address") return;
      window.clearTimeout(timer.current);
      controller.current?.abort();
      if (value.trim().length < 3) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      timer.current = window.setTimeout(async () => {
        controller.current = new AbortController();
        const found = await searchAddresses(value, controller.current.signal);
        setSuggestions(found);
        setOpen(found.length > 0);
      }, 400);
    };
  }

  function choose(item: AddressSuggestion) {
    setForm((current) => ({
      address: item.address || item.label,
      city: item.city || current.city,
      state: item.state || current.state,
      country: item.country || current.country,
      zip_code: item.postcode || current.zip_code,
    }));
    setPosition({ lat: item.lat, lng: item.lng });
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <>
      <label className="portal-label relative sm:col-span-2">
        Address
        <input
          name="address"
          required
          autoComplete="off"
          value={form.address}
          onChange={change("address")}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          className="portal-input"
        />
        {open && (
          <ul className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-xl border border-brand-100 bg-white p-1 shadow-lg">
            {suggestions.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    choose(item);
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-normal text-slate-800 hover:bg-brand-50"
                >
                  {item.address || item.label}
                  <span className="block text-xs text-slate-500">
                    {[item.city, item.state, item.postcode, item.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <span
          className={
            "mt-1.5 flex items-center gap-1 text-xs font-normal " +
            (position ? "text-emerald-700" : "text-slate-500")
          }
        >
          <MapPin size={13} />
          {position
            ? "Location saved. The nearest provider can be matched."
            : "Start typing, then choose a suggestion to fill the city, state and zip code."}
        </span>
      </label>
      <label className="portal-label">
        City
        <input
          name="city"
          required
          value={form.city}
          onChange={change("city")}
          className="portal-input"
        />
      </label>
      <label className="portal-label">
        State
        <input
          name="state"
          value={form.state}
          onChange={change("state")}
          className="portal-input"
        />
      </label>
      <label className="portal-label">
        Country
        <input
          name="country"
          required
          value={form.country}
          onChange={change("country")}
          className="portal-input"
        />
      </label>
      <label className="portal-label">
        Zip code
        <input
          name="zip_code"
          value={form.zip_code}
          onChange={change("zip_code")}
          className="portal-input"
        />
      </label>
      <input type="hidden" name="latitude" value={position?.lat ?? ""} />
      <input type="hidden" name="longitude" value={position?.lng ?? ""} />
    </>
  );
}
