import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  Camera,
  Check,
  HeartPulse,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  deleteCustomerElder,
  fetchCustomerElders,
  saveCustomerElder,
} from "@/features/auth/customerAuth";
import type { CustomerElder } from "@/features/auth/customerAuth";
import { ApiError } from "@/services/api/client";
import { EmptyState, Modal, PageHeading } from "./components/PortalUi";

const genders = ["Male", "Female", "Other"];
const relationships = [
  "Father",
  "Mother",
  "Spouse",
  "Grandfather",
  "Grandmother",
  "Uncle",
  "Aunt",
  "Other",
];
const bloodGroups = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const careTypes = [
  "Assisted Living",
  "Home Care",
  "Medical Care",
  "Post Surgery",
  "Memory Care",
  "Physiotherapy",
  "Companionship",
  "Other",
];
const mobilityLevels = [
  "Independent",
  "Needs Assistance",
  "Walker",
  "Wheelchair",
  "Bedridden",
];

export function EldersPage() {
  const [elders, setElders] = useState<CustomerElder[]>([]);
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<CustomerElder | "new" | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadElders();
  }, []);

  async function loadElders() {
    setLoading(true);
    setError("");
    try {
      setElders(await fetchCustomerElders());
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  const visible = useMemo(
    () =>
      elders.filter((elder) =>
        [
          elder.name,
          elder.relationship,
          elder.city,
          elder.care_type,
          elder.mobility_level,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [elders, search],
  );

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const current = editor && editor !== "new" ? editor : undefined;

    try {
      const response = await saveCustomerElder(
        new FormData(event.currentTarget),
        current?.id,
      );

      if (response?.elder) {
        setElders((existing) =>
          existing.some((elder) => elder.id === response.elder.id)
            ? existing.map((elder) =>
                elder.id === response.elder.id ? response.elder : elder,
              )
            : [response.elder, ...existing],
        );
      }

      setEditor(null);
      setMessage(response?.message || "Elder profile saved successfully.");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  async function remove(elder: CustomerElder) {
    if (!confirm("Delete " + elder.name + " from your elder profiles?")) return;

    setError("");
    setMessage("");
    try {
      await deleteCustomerElder(elder.id);
      setElders((existing) => existing.filter((item) => item.id !== elder.id));
      setMessage("Elder profile deleted successfully.");
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  return (
    <>
      <PageHeading
        title="Elder profiles"
        text="Add the people receiving care, including medical, location, and emergency details."
        action={
          <button
            type="button"
            onClick={() => {
              setEditor("new");
              setMessage("");
              setError("");
            }}
            className="button-primary"
          >
            <Plus size={17} aria-hidden="true" />
            Add elder
          </button>
        }
      />

      <section className="mb-6">
        <div className="flex flex-col gap-4 border-b border-brand-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={18}
              strokeWidth={1.7}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Search elder profiles"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, care type, relationship, or city"
              className="h-12 w-full rounded-xl border border-brand-100 bg-white pl-11 pr-11 text-sm text-brand-900 outline-none transition-colors placeholder:text-slate-400 focus:border-primary"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-brand-50 hover:text-primary"
              >
                <X size={15} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-primary">
              <Users size={17} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-brand-900">
                {elders.length} {elders.length === 1 ? "profile" : "profiles"}
              </p>
              <p className="text-[11px] text-slate-400">
                Linked to your customer account
              </p>
            </div>
          </div>
        </div>
      </section>

      {(message || error) && (
        <div
          role="status"
          className={
            "mb-6 rounded-xl border px-4 py-3 text-xs font-medium " +
            (error
              ? "border-red-100 bg-red-50 text-red-700"
              : "border-brand-100 bg-brand-50 text-brand-900")
          }
        >
          {error || message}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 rounded-[22px] border border-brand-100 bg-white p-6 text-sm text-slate-500">
          <Loader2 className="animate-spin text-primary" size={18} />
          Loading elder profiles...
        </div>
      )}

      {!loading && visible.length > 0 && (
        <section
          aria-label="Elder profiles"
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {visible.map((elder) => (
            <article
              key={elder.id}
              className="group overflow-hidden rounded-[22px] border border-brand-100 bg-white transition-all duration-200 hover:border-brand-200 hover:shadow-[0_12px_35px_rgba(15,118,110,0.07)]"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-5">
                  <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-brand-50 text-base font-semibold tracking-wide text-primary transition-colors group-hover:bg-brand-100">
                    {elder.profile_photo_url ? (
                      <img
                        src={elder.profile_photo_url}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      initials(elder.name)
                    )}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={"Edit " + elder.name}
                      onClick={() => {
                        setEditor(elder);
                        setMessage("");
                        setError("");
                      }}
                      className="grid size-9 place-items-center rounded-full border border-brand-100 text-slate-500 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-primary"
                    >
                      <Pencil size={14} strokeWidth={1.7} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={"Delete " + elder.name}
                      onClick={() => void remove(elder)}
                      className="grid size-9 place-items-center rounded-full border border-red-100 text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 size={14} strokeWidth={1.7} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {elder.relationship}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-brand-900">
                    {elder.name}
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500">
                    {elder.care_type} | {elder.mobility_level}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 border-t border-brand-100 bg-brand-50/35 px-6 py-4">
                <SmallLine
                  icon={MapPin}
                  label="Location"
                  value={elder.city || "City not added"}
                />
                <SmallLine
                  icon={HeartPulse}
                  label="Emergency"
                  value={
                    elder.emergency_contact_name +
                    " | " +
                    elder.emergency_contact_phone
                  }
                />
              </div>
            </article>
          ))}
        </section>
      )}

      {!loading && !visible.length && (
        <EmptyState
          text={
            search
              ? "No matching elder profiles. Try another search."
              : "No elder profiles have been added yet."
          }
        />
      )}

      {editor && (
        <Modal
          title={(editor === "new" ? "Add" : "Edit") + " elder profile"}
          onClose={() => setEditor(null)}
        >
          <ElderForm
            elder={editor === "new" ? undefined : editor}
            onSubmit={save}
            saving={saving}
          />
        </Modal>
      )}
    </>
  );
}

function ElderForm({
  elder,
  onSubmit,
  saving,
}: {
  elder?: CustomerElder;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  saving: boolean;
}) {
  const [preview, setPreview] = useState(elder?.profile_photo_url || "");

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="portal-label sm:col-span-2">
          Photo
          <div className="mt-2 flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-brand-50 text-primary">
              {preview ? (
                <img src={preview} alt="" className="size-full object-cover" />
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

        <Field name="name" label="Full name" value={elder?.name} required />
        <SelectField
          name="relationship"
          label="Relationship"
          value={elder?.relationship}
          options={relationships}
          required
        />
        <SelectField
          name="gender"
          label="Gender"
          value={elder?.gender}
          options={genders}
          required
        />
        <Field
          name="date_of_birth"
          label="Date of birth"
          type="date"
          value={elder?.date_of_birth}
          required
        />
        <Field name="phone" label="Phone" type="tel" value={elder?.phone} required />
        <Field name="email" label="Email" type="email" value={elder?.email} />
        <SelectField
          name="blood_group"
          label="Blood group"
          value={elder?.blood_group}
          options={bloodGroups}
        />
        <Field name="preferred_doctor" label="Preferred doctor" value={elder?.preferred_doctor} />
        <Field name="address" label="Address" value={elder?.address} required wide />
        <Field name="city" label="City" value={elder?.city} required />
        <Field name="state" label="State" value={elder?.state} />
        <Field name="country" label="Country" value={elder?.country || "India"} required />
        <Field name="zip_code" label="Zip code" value={elder?.zip_code} />
        <SelectField
          name="care_type"
          label="Care type"
          value={elder?.care_type}
          options={careTypes}
          required
        />
        <SelectField
          name="mobility_level"
          label="Mobility level"
          value={elder?.mobility_level}
          options={mobilityLevels}
          required
        />
        <Field
          name="emergency_contact_name"
          label="Emergency contact name"
          value={elder?.emergency_contact_name}
          required
        />
        <Field
          name="emergency_contact_phone"
          label="Emergency contact phone"
          type="tel"
          value={elder?.emergency_contact_phone}
          required
        />
        <Field
          name="emergency_contact_relation"
          label="Emergency relation"
          value={elder?.emergency_contact_relation}
        />
        <TextArea name="medical_conditions" label="Medical conditions" value={elder?.medical_conditions} />
        <TextArea name="allergies" label="Allergies" value={elder?.allergies} />
        <TextArea name="medications" label="Medications" value={elder?.medications} />
        <TextArea name="dietary_notes" label="Dietary notes" value={elder?.dietary_notes} />
        <TextArea name="notes" label="Care notes" value={elder?.notes} />
      </div>

      <button className="button-primary" type="submit" disabled={saving}>
        <Check size={16} aria-hidden="true" />
        {saving ? "Saving..." : elder ? "Save elder profile" : "Add elder profile"}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  value,
  type = "text",
  required = false,
  wide = false,
}: {
  name: string;
  label: string;
  value?: string | null;
  type?: string;
  required?: boolean;
  wide?: boolean;
}) {
  return (
    <label className={"portal-label " + (wide ? "sm:col-span-2" : "")}>
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={value || ""}
        className="portal-input"
      />
    </label>
  );
}

function SelectField({
  name,
  label,
  value,
  options,
  required = false,
}: {
  name: string;
  label: string;
  value?: string | null;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="portal-label">
      {label}
      <select
        name={name}
        required={required}
        defaultValue={value || ""}
        className="portal-input"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options
          .filter((option) => option !== "")
          .map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
      </select>
    </label>
  );
}

function TextArea({
  name,
  label,
  value,
}: {
  name: string;
  label: string;
  value?: string | null;
}) {
  return (
    <label className="portal-label sm:col-span-2">
      {label}
      <textarea
        name={name}
        rows={3}
        defaultValue={value || ""}
        className="portal-input min-h-24 py-3"
      />
    </label>
  );
}

function SmallLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon
        size={16}
        strokeWidth={1.7}
        className="shrink-0 text-primary"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-xs font-medium text-brand-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
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

  return "Something went wrong. Please try again.";
}
