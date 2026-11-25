import { env } from "@/config/env";

export interface AddressSuggestion {
  label: string;
  address: string;
  city: string;
  state: string;
  country: string;
  country_code?: string;
  postcode: string;
  lat: number;
  lng: number;
}

/** Address suggestions from the backend (free OpenStreetMap search). Never throws: an error just means no suggestions. */
export async function searchAddresses(
  query: string,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> {
  const text = query.trim();
  if (text.length < 3) return [];
  try {
    const response = await fetch(
      env.apiBaseUrl + "/geo/search?q=" + encodeURIComponent(text),
      { signal, headers: { Accept: "application/json" } },
    );
    if (!response.ok) return [];
    const data = (await response.json()) as { results?: AddressSuggestion[] };
    return data.results ?? [];
  } catch {
    return [];
  }
}
