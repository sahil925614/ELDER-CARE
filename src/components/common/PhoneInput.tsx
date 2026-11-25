import { useEffect, useRef, useState } from "react";
import IntlTelInput, { type IntlTelInputRef } from "intl-tel-input/reactWithUtils";
import "intl-tel-input/build/css/intlTelInput.css";
import "./PhoneInput.css";

/**
 * Phone number with a country dropdown (flag + dial code, searchable).
 * The person types the local number; the form receives the FULL international number (for example +919876543210)
 * in a hidden field called `name`, so a form read with FormData needs no other change.
 */
export function PhoneInput({
  name,
  defaultValue,
  required,
  className,
  id,
  defaultCountry = "in",
}: {
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  className?: string;
  id?: string;
  defaultCountry?: string;
}) {
  const [number, setNumber] = useState((defaultValue ?? "").trim());
  const [valid, setValid] = useState(true);
  const phoneRef = useRef<IntlTelInputRef>(null);

  // Block form submission for a wrong number (not only show the message).
  // An empty field is handled by the native `required` check.
  useEffect(() => {
    phoneRef.current
      ?.getInput()
      ?.setCustomValidity(
        !valid && number.trim() !== "" ? "Enter a valid phone number for the chosen country." : "",
      );
  }, [valid, number]);

  return (
    <div
      className="phone-input"
      // The field sits inside a <label>: a click in the country list would be
      // passed on to the flag button and reopen the list straight after a
      // country is chosen. Stop that label behaviour for clicks in the list.
      onClick={(event) => {
        if ((event.target as HTMLElement).closest(".iti__dropdown-content")) event.preventDefault();
      }}
    >
      <IntlTelInput
        ref={phoneRef}
        initialValue={(defaultValue ?? "").trim()}
        onChangeNumber={setNumber}
        onChangeValidity={setValid}
        initOptions={{
          initialCountry: defaultCountry,
          i18n: { searchPlaceholder: "Search country or code" },
          separateDialCode: true,
          countrySearch: true,
          nationalMode: true,
          strictMode: false,
          containerClass: "phone-input-box",
        }}
        // Only red when a wrong number was typed, not while the box is still empty.
        inputProps={{ id, required, className, autoComplete: "tel", "aria-invalid": !valid && number.trim() !== "" }}
      />
      <input type="hidden" name={name} value={number} />
      {!valid && number.trim() !== "" && (
        <p role="alert" style={{ margin: "4px 0 0", fontSize: ".8rem", color: "#b42318" }}>
          Enter a valid phone number for the chosen country.
        </p>
      )}
    </div>
  );
}
