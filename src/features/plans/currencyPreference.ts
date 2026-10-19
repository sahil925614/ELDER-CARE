export type CurrencyCode = "INR" | "USD";

const storageKey = "elder-care-currency";

export function getCurrencyPreference(): CurrencyCode {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved === "USD" ? "USD" : "INR";
  } catch {
    return "INR";
  }
}

export function setCurrencyPreference(currency: CurrencyCode) {
  try {
    localStorage.setItem(storageKey, currency);
    window.dispatchEvent(new CustomEvent("elder-care-currency-changed", { detail: currency }));
  } catch {
    // The current checkout still works if browser storage is unavailable.
  }
}
