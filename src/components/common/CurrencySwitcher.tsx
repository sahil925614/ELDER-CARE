import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { CurrencyCode } from "@/features/plans/currencyPreference";
import "./CurrencySwitcher.css";

/** Small inline flags (emoji flags do not show on Windows). */
function Flag({ code }: { code: CurrencyCode }) {
  if (code === "INR") {
    return (
      <svg className="currency-flag" viewBox="0 0 30 20" aria-hidden="true">
        <rect width="30" height="20" fill="#fff" />
        <rect width="30" height="6.67" fill="#ff9933" />
        <rect y="13.33" width="30" height="6.67" fill="#138808" />
        <circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" strokeWidth="0.7" />
        <circle cx="15" cy="10" r="0.5" fill="#000080" />
      </svg>
    );
  }
  return (
    <svg className="currency-flag" viewBox="0 0 30 20" aria-hidden="true">
      <rect width="30" height="20" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((row) => (
        <rect key={row} y={(row * 20) / 13} width="30" height={20 / 13} fill="#b22234" />
      ))}
      <rect width="13" height={(7 * 20) / 13} fill="#3c3b6e" />
      {[2.2, 5.4, 8.6].map((x) =>
        [2, 5.4, 8.8].map((y) => <circle key={x + "-" + y} cx={x + 0.6} cy={y} r="0.55" fill="#fff" />),
      )}
    </svg>
  );
}

const currencies: { code: CurrencyCode; symbol: string; name: string }[] = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
];

/**
 * Currency picker for the website header: flag + symbol + code, with the
 * full currency name in the list. Replaces the plain browser select.
 */
export function CurrencySwitcher({
  value,
  onChange,
  wide = false,
}: {
  value: CurrencyCode;
  onChange: (next: CurrencyCode) => void;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const current = currencies.find((item) => item.code === value) ?? currencies[0];

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  return (
    <div
      ref={root}
      className={"currency-switcher" + (wide ? " currency-switcher--wide" : "")}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <button
        ref={button}
        type="button"
        className="currency-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={"Currency: " + current.name}
        onClick={() => setOpen(!open)}
      >
        <Flag code={current.code} />
        <span className="currency-code">
          <span className="currency-symbol">{current.symbol}</span> {current.code}
        </span>
        <ChevronDown size={14} aria-hidden="true" className={"currency-chevron" + (open ? " is-open" : "")} />
      </button>
      {open && (
        <ul className="currency-menu" role="listbox" aria-label="Choose currency">
          {currencies.map((item) => {
            const selected = item.code === value;
            return (
              <li key={item.code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={"currency-option" + (selected ? " is-selected" : "")}
                  onClick={() => {
                    onChange(item.code);
                    setOpen(false);
                    button.current?.focus();
                  }}
                >
                  <Flag code={item.code} />
                  <span className="currency-option-text">
                    <strong>
                      {item.symbol} {item.code}
                    </strong>
                    <small>{item.name}</small>
                  </span>
                  {selected && <Check size={15} aria-hidden="true" className="currency-check" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
