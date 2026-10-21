import loginImage from "@/assets/elder-care.webp";
import registerImage from "@/assets/about-family.jpg";
import resetImage from "@/assets/about-connection.jpg";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, ArrowUpRight, CircleAlert, CircleCheck } from "lucide-react";
import { ApiError } from "@/services/api/client";
import {
  loginCustomer,
  registerCustomer,
  requestCustomerPasswordReset,
  resetCustomerPassword,
} from "@/features/auth/customerAuth";

const accountImages = {
  login: { src: loginImage, alt: "A caregiver spending time with an older person" },
  register: { src: registerImage, alt: "Family connection and elder care" },
  reset: { src: resetImage, alt: "Connection and support for older adults" },
  resetPassword: { src: resetImage, alt: "Connection and support for older adults" },
};

export function AccountForm({
  mode,
}: {
  mode: "login" | "register" | "reset" | "resetPassword";
}) {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState("");
  const [statusIsError, setStatusIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const image = accountImages[mode];
  const register = mode === "register";
  const forgot = mode === "reset";
  const passwordReset = mode === "resetPassword";
  const emailFromLink = searchParams.get("email") || "";

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;

    const data = new FormData(e.currentTarget);

    if ((register || passwordReset) && data.get("password") !== data.get("confirmPassword")) {
      setStatusIsError(true);
      setStatus("Your passwords do not match. Please check both fields.");
      return;
    }

    setBusy(true);
    setStatus("");
    setStatusIsError(false);

    try {
      if (register) {
        await registerCustomer({
          name: String(data.get("name") || ""),
          email: String(data.get("email") || ""),
          phone: String(data.get("phone") || ""),
          password: String(data.get("password") || ""),
          password_confirmation: String(data.get("confirmPassword") || ""),
        });
        navigate("/customer");
        return;
      }

      if (forgot) {
        const response = await requestCustomerPasswordReset(String(data.get("email") || ""));
        setStatus(response?.message || "If this email exists, a reset link has been sent.");
        return;
      }

      if (passwordReset) {
        const response = await resetCustomerPassword({
          email: String(data.get("email") || ""),
          token: params.token || "",
          password: String(data.get("password") || ""),
          password_confirmation: String(data.get("confirmPassword") || ""),
        });
        setStatus(response?.message || "Password reset successfully. You can now sign in.");
        setTimeout(() => navigate("/login"), 900);
        return;
      }

      await loginCustomer({
        email: String(data.get("email") || ""),
        password: String(data.get("password") || ""),
      });
      navigate("/customer");
    } catch (error) {
      setStatusIsError(true);
      setStatus(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid overflow-hidden rounded-[28px] border border-brand-100 lg:grid-cols-2">
      <div className="flex min-w-0 flex-col justify-center p-7 sm:p-10 lg:col-start-2 lg:row-start-1">
        <h2 className="text-2xl font-semibold text-brand-900">
          {register ? "Create your account" : forgot || passwordReset ? "Reset your password" : "Customer login"}
        </h2>
        {status && statusIsError ? (
          <div role="alert" className="mt-3 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <CircleAlert size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{mode === "login" ? "Unable to sign in" : "Please check your details"}</p>
              <p className="mt-1 text-sm leading-6">{status}</p>
            </div>
          </div>
        ) : (
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {forgot
            ? "Enter your account email address."
            : passwordReset
              ? "Choose a new password for your customer account."
              : register
                ? "Enter your details to create your customer account."
                : "Sign in with your email address and password."}
        </p>
        )}

        <form className="mt-6 space-y-5" onSubmit={submit} onChange={() => setStatus("")}>
          {register && (
            <label className="extra-label">
              Full name
              <input className="extra-field" name="name" autoComplete="name" required minLength={2} maxLength={100} />
            </label>
          )}

          <label className="extra-label">
            Email address
            <input
              className="extra-field"
              type="email"
              name="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="you@example.com"
              defaultValue={passwordReset ? emailFromLink : ""}
              readOnly={passwordReset && Boolean(emailFromLink)}
            />
          </label>

          {register && (
            <label className="extra-label">
              Phone number (optional)
              <input className="extra-field" type="tel" name="phone" autoComplete="tel" maxLength={25} />
            </label>
          )}

          {!forgot && (
            <div>
              <label htmlFor="account-password" className="extra-label">
                {passwordReset ? "New password" : "Password"}
              </label>
              <div className="relative">
                <input
                  id="account-password"
                  className="extra-field pr-14"
                  type={show ? "text" : "password"}
                  name="password"
                  autoComplete={register || passwordReset ? "new-password" : "current-password"}
                  required
                  minLength={register || passwordReset ? 8 : 1}
                  maxLength={128}
                  aria-describedby={register || passwordReset ? "password-help" : undefined}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1 rounded-lg p-2.5 text-primary"
                  aria-label={show ? "Hide password" : "Show password"}
                  aria-pressed={show}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {(register || passwordReset) && (
                <p id="password-help" className="mt-2 text-xs text-slate-500">
                  Use at least 8 characters.
                </p>
              )}
            </div>
          )}

          {(register || passwordReset) && (
            <>
              <label className="extra-label">
                Confirm password
                <input
                  className="extra-field"
                  type={show ? "text" : "password"}
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                />
              </label>

              {register && (
                <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                  <input type="checkbox" required className="mt-1 size-4 shrink-0 accent-primary" />
                  <span>
                    I have read the{" "}
                    <Link className="text-primary underline" to="/terms">Terms</Link>{" "}
                    and{" "}
                    <Link className="text-primary underline" to="/privacy-policy">Privacy Policy</Link>.
                  </span>
                </label>
              )}
            </>
          )}

          {!register && !forgot && !passwordReset && (
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm font-semibold text-primary">
                Forgot password?
              </Link>
            </div>
          )}

          <button type="submit" disabled={busy} className="button-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-70">
            {register
              ? busy ? "Creating account..." : "Create account"
              : forgot
                ? busy ? "Sending reset link..." : "Request reset link"
                : passwordReset
                  ? busy ? "Updating password..." : "Update password"
                  : busy ? "Signing in..." : "Sign in"}
            <ArrowUpRight size={17} aria-hidden="true" />
          </button>

          {status && !statusIsError && (
            <div
              role={statusIsError ? "alert" : "status"}
              className={"flex items-start gap-3 rounded-2xl border p-4 " +
                (statusIsError ? "border-rose-200 bg-rose-50 text-rose-800" : "border-brand-200 bg-brand-50 text-primary")}
            >
              {statusIsError
                ? <CircleAlert size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
                : <CircleCheck size={20} className="mt-0.5 shrink-0" aria-hidden="true" />}
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  {statusIsError
                    ? mode === "login" ? "Unable to sign in" : "Please check your details"
                    : "Request successful"}
                </p>
                <p className="mt-1 text-sm leading-6">{status}</p>
              </div>
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {register
            ? "Already have an account? "
            : forgot || passwordReset
              ? "Remember your password? "
              : "New to Elder Care? "}
          <Link className="font-semibold text-primary hover:underline" to={register || forgot || passwordReset ? "/login" : "/register"}>
            {register || forgot || passwordReset ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>

      <div className="flex min-w-0 flex-col bg-brand-50 p-7 sm:p-10 lg:col-start-1 lg:row-start-1">
        <p className="section-eyebrow">Care that feels like family</p>
        <h1 className="mt-5 text-3xl font-semibold leading-tight text-brand-900 sm:text-4xl">
          {register
            ? "A more connected care journey starts here."
            : forgot || passwordReset
              ? "Find your way back to your care circle."
              : "Welcome back to your care circle."}
        </h1>
        <p className="my-6 leading-7 text-slate-600">
          Keep the people you love and the care they need connected in one thoughtful space.
        </p>
        <div className={"relative overflow-hidden rounded-[22px] lg:flex-1 " + (register ? "min-h-72" : forgot || passwordReset ? "min-h-40" : "min-h-56")}>
          <img src={image.src} alt={image.alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
        </div>
        <p className="mt-7 text-sm text-primary">
          Profiles, plans, and appointments. Together.
        </p>
      </div>
    </section>
  );
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const details = error.details as { message?: string; errors?: Record<string, string[]> } | undefined;
    const firstError = details?.errors ? Object.values(details.errors)[0]?.[0] : null;
    return firstError || details?.message || "The request could not be completed.";
  }

  if (error instanceof Error) return error.message;

  return "Something went wrong. Please try again.";
}
