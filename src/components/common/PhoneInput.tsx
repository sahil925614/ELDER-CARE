import { useState } from "react";
import IntlTelInput from "intl-tel-input/reactWithUtils";
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

  return (
    <div className="phone-input">
      <IntlTelInput
        initialValue={(defaultValue ?? "").trim()}
        onChangeNumber={setNumber}
        onChangeValidity={setValid}
        initOptions={{
          initialCountry: defaultCountry,
          separateDialCode: true,
          countrySearch: true,
          nationalMode: true,
          strictMode: false,
          containerClass: "phone-input-box",
        }}
        inputProps={{ id, required, className, autoComplete: "tel", "aria-invalid": !valid }}
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
