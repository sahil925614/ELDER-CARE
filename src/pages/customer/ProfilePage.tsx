import { useState } from "react";
import type { FormEvent } from "react";

import {
  Camera,
  Check,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { updateCustomerProfile } from "@/features/auth/customerAuth";
import { useDemo } from "@/features/customer-portal/demoState";
import { ApiError } from "@/services/api/client";
import { PageHeading } from "./components/PortalUi";

export function ProfilePage() {
  const { profile, setProfile } = useDemo();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(profile.profilePhotoUrl);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await updateCustomerProfile(data);
      const user = response?.user;

      if (user) {
        setProfile({
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          address: user.address || "",
          city: user.city || "",
          state: user.state || "",
          country: user.country || "",
          zipCode: user.zip_code || "",
          profilePhotoUrl: user.profile_photo_url || "",
          emailUpdates: data.get("emailUpdates") === "on",
        });
        setPreview(user.profile_photo_url || "");
      }

      setSaved(true);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  function getInitials(name: string) {
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  return (
    <>
      <PageHeading
        title="My profile"
        text="Keep your customer account, location, and photo up to date."
      />

      <div className="grid items-start gap-7 xl:grid-cols-[0.72fr_1.28fr]">
        <aside className="overflow-hidden rounded-[24px] border border-brand-100 bg-white">
          <div className="p-6 sm:p-7">
            <div className="flex items-center gap-4">
              <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-brand-100 text-base font-semibold tracking-wide text-primary">
                {profile.profilePhotoUrl ? (
                  <img
                    src={profile.profilePhotoUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  getInitials(profile.name)
                )}
              </span>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Customer account
                </p>
                <h2 className="mt-1.5 truncate text-lg font-semibold text-brand-900">
                  {profile.name}
                </h2>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold text-primary">
                  <Check size={11} strokeWidth={2} aria-hidden="true" />
                  Active customer
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-brand-100">
            <AccountDetail
              icon={Mail}
              label="Email"
              value={profile.email || "Email not added"}
            />
            <AccountDetail
              icon={Phone}
              label="Phone"
              value={profile.phone || "Phone not added"}
            />
            <AccountDetail
              icon={MapPin}
              label="Location"
              value={
                [profile.city, profile.state, profile.country]
                  .filter(Boolean)
                  .join(", ") || "Location not added"
              }
              last
            />
          </div>

          <div className="border-t border-brand-100 bg-brand-50/35 p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={18}
                strokeWidth={1.6}
                className="mt-0.5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold text-brand-900">
                  Secure account
                </p>
                <p className="mt-1.5 text-xs font-normal leading-6 text-slate-500">
                  Your details are saved to your customer account and used for
                  care coordination.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <form
          onSubmit={save}
          onChange={() => {
            setSaved(false);
            setError("");
          }}
          className="overflow-hidden rounded-[24px] border border-brand-100 bg-white"
        >
          <section className="p-6 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-primary">
                <UserRound size={17} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-brand-900">
                  Personal details
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Update your contact details and profile image.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-x-5 gap-y-6 sm:grid-cols-2">
              <label className="portal-label sm:col-span-2">
                Profile image
                <div className="mt-2 flex items-center gap-4">
                  <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-brand-50 text-sm font-semibold text-primary">
                    {preview ? (
                      <img
                        src={preview}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <Camera size={20} aria-hidden="true" />
                    )}
                  </span>
                  <input
                    name="profile_photo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="portal-input"
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      if (file) setPreview(URL.createObjectURL(file));
                    }}
                  />
                </div>
              </label>

              <label className="portal-label">
                Full name
                <input
                  name="name"
                  required
                  maxLength={255}
                  defaultValue={profile.name}
                  className="portal-input"
                />
              </label>

              <label className="portal-label">
                Email address
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={255}
                  defaultValue={profile.email}
                  className="portal-input"
                />
              </label>

              <label className="portal-label">
                Phone
                <input
                  name="phone"
                  type="tel"
                  maxLength={30}
                  defaultValue={profile.phone}
                  className="portal-input"
                />
              </label>

              <label className="portal-label">
                Address
                <input
                  name="address"
                  maxLength={255}
                  defaultValue={profile.address}
                  className="portal-input"
                />
              </label>

              <label className="portal-label">
                City
                <input
                  name="city"
                  maxLength={120}
                  defaultValue={profile.city}
                  className="portal-input"
                />
              </label>

              <label className="portal-label">
                State
                <input
                  name="state"
                  maxLength={120}
                  defaultValue={profile.state}
                  className="portal-input"
                />
              </label>

              <label className="portal-label">
                Country
                <input
                  name="country"
                  maxLength={120}
                  defaultValue={profile.country}
                  className="portal-input"
                />
              </label>

              <label className="portal-label">
                Zip code
                <input
                  name="zip_code"
                  maxLength={20}
                  defaultValue={profile.zipCode}
                  className="portal-input"
                />
              </label>
            </div>
          </section>

          <section className="border-t border-brand-100 p-6 sm:p-7">
            <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-brand-100 px-4 py-4 transition-colors hover:bg-brand-50/30">
              <input
                name="emailUpdates"
                type="checkbox"
                defaultChecked={profile.emailUpdates}
                className="peer sr-only"
              />
              <span
                className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-white transition-colors peer-checked:border-primary peer-checked:bg-primary"
                aria-hidden="true"
              >
                <Check size={13} strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-sm font-semibold text-brand-900">
                  Email updates
                </p>
                <p className="mt-1 text-xs font-normal leading-6 text-slate-500">
                  Keep me informed about care, subscriptions, and account
                  updates.
                </p>
              </div>
            </label>
          </section>

          <div className="border-t border-brand-100 bg-brand-50/25 px-6 py-5 sm:px-7">
            {error && (
              <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                {error}
              </p>
            )}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-[11px] font-normal leading-5 text-slate-500">
                Images can be JPG, PNG, or WebP up to 2 MB.
              </p>

              <button
                type="submit"
                className="button-primary shrink-0"
                disabled={saving}
              >
                <Save size={16} aria-hidden="true" />
                {saving ? "Saving..." : "Update profile"}
              </button>
            </div>

            {saved && (
              <div
                role="status"
                className="mt-4 flex items-center gap-2 border-t border-brand-100 pt-4 text-xs font-medium text-primary"
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-brand-100">
                  <Check size={12} strokeWidth={2} aria-hidden="true" />
                </span>
                Profile updated successfully.
              </div>
            )}
          </div>
        </form>
      </div>
    </>
  );
}

function AccountDetail({
  icon: Icon,
  label,
  value,
  last = false,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={
        "flex items-start gap-3 px-6 py-4 " +
        (!last ? "border-b border-brand-100" : "")
      }
    >
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-primary">
        <Icon size={15} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.11em] text-slate-400">
          {label}
        </p>
        <p className="mt-1 break-words text-xs font-medium leading-5 text-brand-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const details = error.details as {
      message?: string;
      errors?: Record<string, string[]>;
    };
    return details.errors
      ? Object.values(details.errors)[0]?.[0] ||
          details.message ||
          "Please check the form."
      : details.message || "Please check the form.";
  }

  return "Profile could not be saved right now.";
}
