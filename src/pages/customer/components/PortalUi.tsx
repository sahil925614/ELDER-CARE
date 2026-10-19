import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  X,
} from "lucide-react";

/* =========================================================
   PAGE HEADING
========================================================= */

export function PageHeading({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-5 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="section-eyebrow">
          Your care space
        </p>

        <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-tight text-brand-900 sm:text-3xl">
          {title}
        </h1>

        <p className="mt-3 max-w-2xl text-sm font-normal leading-6 text-slate-500">
          {text}
        </p>
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </header>
  );
}

/* =========================================================
   BADGE
========================================================= */

export function Badge({
  children,
}: {
  children: string;
}) {
  const value = children.toLowerCase();

  let style =
    "border-amber-200/70 bg-amber-50 text-amber-800";

  if (
    [
      "paid",
      "active",
      "completed",
    ].includes(value)
  ) {
    style =
      "border-brand-100 bg-brand-50 text-primary";
  }

  if (
    [
      "failed",
      "cancelled",
      "expired",
    ].includes(value)
  ) {
    style =
      "border-rose-100 bg-rose-50 text-rose-700";
  }

  if (
    [
      "upcoming",
      "pending",
    ].includes(value)
  ) {
    style =
      "border-amber-200/70 bg-amber-50 text-amber-800";
  }

  return (
    <span
      className={
        "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold leading-none " +
        style
      }
    >
      {children}
    </span>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

export function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="px-5 py-10 text-center sm:px-8 sm:py-12">
      <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-brand-50 text-primary">
        <Inbox
          size={20}
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </span>

      <p className="mx-auto mt-4 max-w-md text-sm font-normal leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   PAGINATION
========================================================= */

export function Pagination({
  page,
  total,
  size = 5,
  onChange,
}: {
  page: number;
  total: number;
  size?: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(
    1,
    Math.ceil(total / size),
  );

  const start =
    total > 0
      ? (page - 1) * size + 1
      : 0;

  const end = Math.min(
    page * size,
    total,
  );

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"
    >
      <p aria-live="polite">
        {total > 0 ? (
          <>
            Showing{" "}
            <span className="font-semibold text-brand-900">
              {start}–{end}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-brand-900">
              {total}
            </span>{" "}
            records
          </>
        ) : (
          "No records"
        )}
      </p>

      <div className="flex items-center gap-2">
        <PaginationButton
          label="Previous page"
          disabled={page <= 1}
          onClick={() =>
            onChange(page - 1)
          }
        >
          <ChevronLeft
            size={16}
            aria-hidden="true"
          />
        </PaginationButton>

        <span className="min-w-[82px] text-center text-xs font-medium text-slate-500">
          Page{" "}
          <span className="text-brand-900">
            {page}
          </span>{" "}
          of{" "}
          <span className="text-brand-900">
            {pages}
          </span>
        </span>

        <PaginationButton
          label="Next page"
          disabled={page >= pages}
          onClick={() =>
            onChange(page + 1)
          }
        >
          <ChevronRight
            size={16}
            aria-hidden="true"
          />
        </PaginationButton>
      </div>
    </nav>
  );
}

function PaginationButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="
        inline-flex size-9
        items-center justify-center
        rounded-lg
        border border-brand-100
        bg-white text-primary
        transition-colors
        hover:bg-brand-50
        disabled:cursor-not-allowed
        disabled:text-slate-300
        disabled:hover:bg-white
      "
    >
      {children}
    </button>
  );
}

/* =========================================================
   MODAL
========================================================= */

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref =
    useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    const previousOverflow =
      document.body.style.overflow;

    if (
      dialog &&
      !dialog.open
    ) {
      dialog.showModal();
    }

    document.body.style.overflow =
      "hidden";

    return () => {
      if (dialog?.open) {
        dialog.close();
      }

      document.body.style.overflow =
        previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="portal-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
      className="portal-dialog"
    >
      <div className="overflow-hidden rounded-[22px] bg-white sm:rounded-[24px]">
        {/* HEADER */}

        <div className="flex items-center justify-between gap-4 border-b border-brand-100 px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
              Your care space
            </p>

            <h2
              id="portal-modal-title"
              className="mt-1 truncate text-lg font-semibold tracking-tight text-brand-900 sm:text-xl"
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="
              flex size-9 shrink-0
              items-center justify-center
              rounded-xl
              border border-brand-100
              text-slate-400
              transition-colors
              hover:bg-brand-50
              hover:text-primary
            "
          >
            <X
              size={18}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* CONTENT */}

        <div className="max-h-[min(72vh,650px)] overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </dialog>
  );
}