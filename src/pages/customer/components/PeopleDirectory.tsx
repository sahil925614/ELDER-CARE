import { useState } from "react";
import type { FormEvent } from "react";

import {
  Check,
  MapPin,
  Pencil,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";

import { useDemo } from "@/features/customer-portal/demoState";
import type { Person } from "@/features/customer-portal/demoState";

import {
  EmptyState,
  Modal,
  PageHeading,
} from "./PortalUi";

export function PeopleDirectory({
  kind,
}: {
  kind: "elders" | "family";
}) {
  const demo = useDemo();

  const people =
    kind === "elders" ? demo.elders : demo.family;

  const update =
    kind === "elders" ? demo.setElders : demo.setFamily;

  const [search, setSearch] = useState("");
  const [editor, setEditor] =
    useState<Person | "new" | null>(null);

  const [message, setMessage] = useState("");

  const isElders = kind === "elders";

  const visible = people.filter((person) =>
    (
      person.name +
      " " +
      person.relationship +
      " " +
      person.city
    )
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();

    if (!name) return;

    const person = {
      id:
        editor !== "new" && editor
          ? editor.id
          : crypto.randomUUID(),

      name,

      relationship: String(
        data.get("relationship"),
      ).trim(),

      city: String(data.get("city")).trim(),
    };

    update((current) =>
      current.some((p) => p.id === person.id)
        ? current.map((p) =>
            p.id === person.id ? person : p,
          )
        : [...current, person],
    );

    setEditor(null);

    setMessage(
      "Profile updated in this demo session. No invitation or account was created.",
    );
  }

  const current =
    editor && editor !== "new"
      ? editor
      : undefined;

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
      {/* =====================================================
          PAGE HEADING
      ===================================================== */}

      <PageHeading
        title={
          isElders
            ? "Elder profiles"
            : "Family members"
        }
        text={
          isElders
            ? "A personal space for the people at the heart of your care journey."
            : "Keep the people who support your family connected."
        }
        action={
          <button
            type="button"
            onClick={() => {
              setEditor("new");
              setMessage("");
            }}
            className="button-primary"
          >
            <Plus
              size={17}
              aria-hidden="true"
            />

            Add{" "}
            {isElders
              ? "elder"
              : "family member"}
          </button>
        }
      />

      {/* =====================================================
          DIRECTORY TOOLBAR
      ===================================================== */}

      <section className="mb-6">
        <div className="flex flex-col gap-4 border-b border-brand-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          {/* SEARCH */}

          <div className="relative w-full sm:max-w-md">
            <Search
              size={18}
              strokeWidth={1.7}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />

            <input
              type="search"
              aria-label="Search profiles"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search name, relationship, or city"
              className="
                h-12 w-full rounded-xl
                border border-brand-100
                bg-white
                pl-11 pr-11
                text-sm text-brand-900
                outline-none
                transition-colors
                placeholder:text-slate-400
                focus:border-primary
              "
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="
                  absolute right-2 top-1/2
                  grid size-8 -translate-y-1/2
                  place-items-center rounded-lg
                  text-slate-400
                  transition-colors
                  hover:bg-brand-50
                  hover:text-primary
                "
              >
                <X
                  size={15}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>

          {/* COUNT */}

          <div className="flex shrink-0 items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-primary">
              <Users
                size={17}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </span>

            <div>
              <p className="text-sm font-semibold text-brand-900">
                {people.length}{" "}
                {people.length === 1
                  ? "profile"
                  : "profiles"}
              </p>

              <p className="text-[11px] text-slate-400">
                {isElders
                  ? "In your care circle"
                  : "Connected to your family"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATUS MESSAGE
      ===================================================== */}

      {message && (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3"
        >
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <Check
              size={12}
              strokeWidth={2}
              aria-hidden="true"
            />
          </span>

          <p className="text-xs leading-5 text-brand-900">
            {message}
          </p>
        </div>
      )}

      {/* =====================================================
          PROFILES
      ===================================================== */}

      {visible.length > 0 && (
        <section
          aria-label={
            isElders
              ? "Elder profiles"
              : "Family member profiles"
          }
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {visible.map((person) => (
            <article
              key={person.id}
              className="
                group overflow-hidden
                rounded-[22px]
                border border-brand-100
                bg-white
                transition-all duration-200
                hover:border-brand-200
                hover:shadow-[0_12px_35px_rgba(15,118,110,0.07)]
              "
            >
              {/* PROFILE MAIN */}

              <div className="p-6">
                <div className="flex items-start justify-between gap-5">
                  {/* AVATAR */}

                  <span
                    className="
                      grid size-14 shrink-0
                      place-items-center
                      rounded-2xl
                      bg-brand-50
                      text-base font-semibold
                      tracking-wide text-primary
                      transition-colors
                      group-hover:bg-brand-100
                    "
                    aria-hidden="true"
                  >
                    {getInitials(person.name)}
                  </span>

                  {/* EDIT */}

                  <button
                    type="button"
                    aria-label={
                      "Edit " + person.name
                    }
                    onClick={() => {
                      setEditor(person);
                      setMessage("");
                    }}
                    className="
                      flex items-center gap-2
                      rounded-full
                      border border-brand-100
                      px-3 py-2
                      text-xs font-medium
                      text-slate-500
                      transition-colors
                      hover:border-brand-200
                      hover:bg-brand-50
                      hover:text-primary
                    "
                  >
                    <Pencil
                      size={14}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />

                    <span className="hidden sm:inline">
                      Edit
                    </span>
                  </button>
                </div>

                {/* IDENTITY */}

                <div className="mt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {isElders
                      ? "Elder profile"
                      : "Family member"}
                  </p>

                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-brand-900">
                    {person.name}
                  </h2>

                  <p className="mt-1.5 text-sm text-slate-500">
                    {person.relationship ||
                      "Relationship not added"}
                  </p>
                </div>
              </div>

              {/* LOCATION */}

              <div className="flex items-center gap-3 border-t border-brand-100 bg-brand-50/35 px-6 py-4">
                <MapPin
                  size={16}
                  strokeWidth={1.7}
                  className="shrink-0 text-primary"
                  aria-hidden="true"
                />

                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                    Location
                  </p>

                  <p className="mt-0.5 truncate text-xs font-medium text-brand-900">
                    {person.city ||
                      "City not added"}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* =====================================================
          EMPTY / SEARCH RESULT
      ===================================================== */}

      {!visible.length && (
        <EmptyState
          text={
            search
              ? "No matching profiles. Try another name, relationship, or city."
              : isElders
                ? "No elder profiles have been added yet."
                : "No family members have been added yet."
          }
        />
      )}

      {/* =====================================================
          SUPPORTING NOTE
      ===================================================== */}

      <section className="mt-8 border-t border-brand-100 pt-7">
        <div className="grid gap-5 sm:grid-cols-[44px_1fr] sm:items-start">
          <span
            className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-primary"
            aria-hidden="true"
          >
            <Users
              size={19}
              strokeWidth={1.6}
            />
          </span>

          <div>
            <h2 className="text-sm font-semibold text-brand-900">
              {isElders
                ? "Care starts with understanding."
                : "An invitation to be involved."}
            </h2>

            <p className="mt-2 max-w-3xl text-xs font-normal leading-6 text-slate-500 sm:text-sm sm:leading-7">
              {isElders
                ? "Use this preview to organise basic profile information. Medical records and care permissions will be managed through the future secure account flow."
                : "These are profile entries only. Secure invitations and shared account permissions will be available after backend integration."}
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {editor && (
        <Modal
          title={
            (editor === "new"
              ? "Add"
              : "Edit") + " profile"
          }
          onClose={() =>
            setEditor(null)
          }
        >
          <form
            onSubmit={save}
            className="space-y-5"
          >
            <label className="portal-label">
              Full name

              <input
                autoComplete="off"
                name="name"
                required
                maxLength={100}
                defaultValue={current?.name}
                className="portal-input"
              />
            </label>

            <label className="portal-label">
              Relationship

              <select
                name="relationship"
                defaultValue={
                  current?.relationship ||
                  "Parent"
                }
                className="portal-input"
              >
                {[
                  "Parent",
                  "Partner",
                  "Sibling",
                  "Relative",
                  "Self",
                  "Other",
                ].map((relationship) => (
                  <option
                    key={relationship}
                  >
                    {relationship}
                  </option>
                ))}
              </select>
            </label>

            <label className="portal-label">
              City

              <input
                name="city"
                maxLength={100}
                defaultValue={current?.city}
                className="portal-input"
              />
            </label>

            <div className="border-t border-brand-100 pt-4">
              <p className="text-xs font-normal leading-6 text-slate-500">
                Demo only. Please use sample
                details; changes are cleared on
                refresh.
              </p>
            </div>

            <button
              className="button-primary"
              type="submit"
            >
              {editor === "new"
                ? "Add demo profile"
                : "Save changes"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}