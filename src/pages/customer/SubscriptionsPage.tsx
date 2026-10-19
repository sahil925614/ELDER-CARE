import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  FileText,
  Layers,
  Loader2,
  ReceiptText,
  Sparkles,
  Users,
} from "lucide-react";

import {
  fetchCustomerSubscriptions,
  renewCustomerSubscription,
  type CustomerSubscription,
  type CustomerSubscriptionSummary,
  updateCustomerSubscriptionAction,
  updateCustomerSubscriptionAutoRenew,
} from "@/features/auth/customerAuth";
import { ApiError } from "@/services/api/client";
import { Badge, EmptyState, PageHeading } from "./components/PortalUi";

export function SubscriptionsPage() {
  const [tab, setTab] = useState<"Active" | "History">("Active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<CustomerSubscriptionSummary>({
    total: 0,
    active: 0,
    history: 0,
    pending_payment: 0,
  });
  const [active, setActive] = useState<CustomerSubscription[]>([]);
  const [history, setHistory] = useState<CustomerSubscription[]>([]);

  async function loadSubscriptions() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchCustomerSubscriptions();
      setSummary(data.summary);
      setActive(data.subscriptions.active);
      setHistory(data.subscriptions.history);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSubscriptions();
  }, []);

  const subscriptions = tab === "Active" ? active : history;
  const selected = subscriptions[0];

  const latestInvoice = selected?.invoices[0];
  const latestPayment = selected?.payments[0];
  const expiringSoon = useMemo(
    () =>
      active.filter(
        (subscription) =>
          typeof subscription.days_remaining === "number" &&
          subscription.days_remaining <= 30,
      ).length,
    [active],
  );

  return (
    <>
      <PageHeading
        title="My subscriptions"
        text="Your care plans, elder coverage, included services, invoices, and payment status."
        action={
          <Link to="/plans" className="button-outline group">
            Explore plans
            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
        }
      />

      <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<Layers size={19} />} label="Active plans" value={summary.active} />
        <MetricCard icon={<Clock3 size={19} />} label="Previous plans" value={summary.history} />
        <MetricCard icon={<CreditCard size={19} />} label="Pending payment" value={summary.pending_payment} />
        <MetricCard icon={<CalendarDays size={19} />} label="Expiring soon" value={expiringSoon} />
      </section>

      <div className="mb-6 flex items-center justify-between gap-5 border-b border-brand-100">
        <div className="flex" role="group" aria-label="Subscription status">
          {(["Active", "History"] as const).map((item) => {
            const selectedTab = tab === item;

            return (
              <button
                key={item}
                type="button"
                aria-pressed={selectedTab}
                onClick={() => setTab(item)}
                className={
                  "relative px-1 pb-4 pr-7 text-sm font-semibold transition-colors " +
                  (selectedTab
                    ? "text-primary"
                    : "text-slate-400 hover:text-brand-900")
                }
              >
                {item}
                {selectedTab && (
                  <span
                    className="absolute bottom-[-1px] left-0 h-0.5 w-[calc(100%-28px)] rounded-full bg-primary"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        <p className="hidden text-xs text-slate-400 sm:block">
          {subscriptions.length} {tab.toLowerCase()} subscription
          {subscriptions.length === 1 ? "" : "s"}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 rounded-[24px] border border-brand-100 bg-white p-6 text-sm text-slate-500">
          <Loader2 className="animate-spin text-primary" size={18} />
          Loading subscriptions...
        </div>
      )}

      {!loading && !subscriptions.length && (
        <div className="rounded-[26px] border border-brand-100 bg-white">
          <EmptyState
            text={
              tab === "Active"
                ? "No active subscriptions are linked to your customer account yet."
                : "No previous subscriptions are available yet."
            }
          />
        </div>
      )}

      {!loading && selected && (
        <section className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
          <div className="space-y-6">
            {subscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onChanged={loadSubscriptions}
              />
            ))}
          </div>

          <aside className="space-y-6">
            <InfoPanel title="Latest invoice" icon={<ReceiptText size={19} />}>
              {latestInvoice ? (
                <div className="space-y-4">
                  <InfoRow label="Invoice" value={latestInvoice.invoice_number} />
                  <InfoRow label="Date" value={latestInvoice.invoice_date || "Not set"} />
                  <InfoRow label="Amount" value={latestInvoice.formatted_total_amount} />
                  <div className="flex flex-wrap gap-2">
                    <Badge>{latestInvoice.status}</Badge>
                    <Badge>{latestInvoice.payment_status}</Badge>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-6 text-slate-500">
                  No invoice has been generated for this subscription yet.
                </p>
              )}
            </InfoPanel>

            <InfoPanel title="Latest payment" icon={<CreditCard size={19} />}>
              {latestPayment ? (
                <div className="space-y-4">
                  <InfoRow label="Payment" value={latestPayment.payment_number} />
                  <InfoRow label="Date" value={latestPayment.payment_date || "Not set"} />
                  <InfoRow label="Amount" value={latestPayment.formatted_amount} />
                  <InfoRow label="Method" value={latestPayment.method || "Not set"} />
                  <Badge>{latestPayment.status}</Badge>
                </div>
              ) : (
                <p className="text-sm leading-6 text-slate-500">
                  Payment details will appear here after admin records them.
                </p>
              )}

              <Link to="/customer/payments" className="text-link group mt-5">
                Go to payments
                <ArrowUpRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
            </InfoPanel>

            <InfoPanel title="Recent activity" icon={<Sparkles size={19} />}>
              {selected.history.length ? (
                <div className="space-y-4">
                  {selected.history.slice(0, 5).map((item) => (
                    <div key={item.id} className="border-b border-brand-100 pb-4 last:border-0 last:pb-0">
                      <p className="text-xs font-semibold text-brand-900">
                        {item.description}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {item.created_at || "Date not set"}
                        {item.performed_by ? " by " + item.performed_by : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-slate-500">
                  Subscription history will appear after admin updates.
                </p>
              )}
            </InfoPanel>
          </aside>
        </section>
      )}
    </>
  );
}

function SubscriptionCard({
  subscription,
  onChanged,
}: {
  subscription: CustomerSubscription;
  onChanged: () => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const statusSlug = subscription.status.slug.toLowerCase();

  async function runAction(action: "pause" | "resume" | "cancel") {
    const note =
      action === "cancel"
        ? window.prompt("Optional cancellation note", "") || undefined
        : undefined;

    setBusy(action);
    setMessage("");
    try {
      const response = await updateCustomerSubscriptionAction(subscription.id, action, note);
      setMessage(response?.message || "Subscription updated.");
      await onChanged();
    } catch (caught) {
      setMessage(errorMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  async function runRenew() {
    setBusy("renew");
    setMessage("");
    try {
      const response = await renewCustomerSubscription(subscription.id);
      setMessage(response?.message || "Renewal created.");
      await onChanged();
    } catch (caught) {
      setMessage(errorMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  async function setAutoRenew(value: boolean) {
    setBusy("auto-renew");
    setMessage("");
    try {
      const response = await updateCustomerSubscriptionAutoRenew(subscription.id, value);
      setMessage(response?.message || "Auto renew updated.");
      await onChanged();
    } catch (caught) {
      setMessage(errorMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="overflow-hidden rounded-[26px] border border-brand-100 bg-white">
      <div className="border-b border-brand-100 px-6 py-6 sm:px-8 sm:py-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-primary">
              <Layers size={23} strokeWidth={1.6} aria-hidden="true" />
            </span>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-400">
                {subscription.subscription_number}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-900 sm:text-[28px]">
                {subscription.plan.name || "Subscription plan"}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <Users size={14} className="text-primary" aria-hidden="true" />
                {subscription.elder.name || "Elder not linked"}
                {subscription.elder.relationship
                  ? " - " + subscription.elder.relationship
                  : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge>{subscription.status.name}</Badge>
            <Badge>{subscription.payment_status}</Badge>
          </div>
        </div>

        {subscription.plan.description && (
          <p className="mt-5 max-w-2xl text-sm font-normal leading-7 text-slate-500">
            {stripHtml(subscription.plan.description)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 border-b border-brand-100 lg:grid-cols-4">
        <PlanDetail
          label="Plan reference"
          value={subscription.plan.code || subscription.subscription_number}
          icon={<FileText size={15} />}
        />
        <PlanDetail
          label="Duration"
          value={subscription.duration.label}
          icon={<Clock3 size={15} />}
        />
        <PlanDetail
          label="Start date"
          value={subscription.start_date || "Not set"}
          icon={<CalendarDays size={15} />}
        />
        <PlanDetail
          label="End date"
          value={subscription.end_date || "Not set"}
          icon={<CalendarDays size={15} />}
          last
        />
      </div>

      <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[1fr_0.8fr]">
        <section>
          <h3 className="text-sm font-semibold text-brand-900">
            Included services
          </h3>
          <div className="mt-4 space-y-3">
            {subscription.services.length ? (
              subscription.services.map((service) => (
                <div key={service.id}>
                  <ServiceUsage service={service} />
                  {service.requires_appointment && statusSlug === 'active' && subscription.payment_status === 'Paid' && (service.is_unlimited || (service.remaining_quantity ?? 0) > 0) && <Link to={`/customer/appointments?subscription=${subscription.id}&service=${service.service_id}`} className="text-link mt-2">Book included visit <ArrowUpRight size={15} /></Link>}
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-slate-500">
                No service entitlement snapshot is attached yet.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-brand-50/35 p-5">
          <h3 className="text-sm font-semibold text-brand-900">
            Billing summary
          </h3>
          <div className="mt-4 space-y-3">
            <InfoRow label="Plan amount" value={money(subscription.amounts.paid_amount)} />
            <InfoRow label="Discount" value={money(subscription.amounts.discount_amount)} />
            <InfoRow label="Tax" value={money(subscription.amounts.tax_amount)} />
            <div className="border-t border-brand-100 pt-3">
              <InfoRow
                label="Final amount"
                value={subscription.amounts.formatted_final_amount}
              />
            </div>
            <InfoRow label="Auto renew" value={subscription.auto_renew ? "Enabled" : "Disabled"} />
          </div>

          <fieldset className="mt-5 border-t border-brand-100 pt-4">
            <legend className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Auto renew
            </legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[true, false].map((value) => (
                <label
                  key={String(value)}
                  className={
                    "flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors " +
                    (subscription.auto_renew === value
                      ? "border-primary bg-primary text-white"
                      : "border-brand-100 bg-white text-brand-900 hover:border-primary")
                  }
                >
                  <input
                    type="radio"
                    name={"auto-renew-" + subscription.id}
                    checked={subscription.auto_renew === value}
                    disabled={busy === "auto-renew"}
                    onChange={() => setAutoRenew(value)}
                    className="sr-only"
                  />
                  {value ? "Enabled" : "Disabled"}
                </label>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              Enabled plans are renewed automatically after the current period ends.
            </p>
          </fieldset>
        </section>
      </div>

      <div className="flex flex-col gap-5 border-t border-brand-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-primary">
            <Check size={14} strokeWidth={2} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold text-brand-900">
              {subscription.days_remaining === 0
                ? "Current period has ended"
                : subscription.days_remaining
                  ? subscription.days_remaining + " days remaining"
                  : "Subscription period available"}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Current period ends {subscription.end_date || "when set by admin"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {statusSlug === "active" && (
            <ActionPill disabled={!!busy} loading={busy === "pause"} onClick={() => runAction("pause")}>
              Pause
            </ActionPill>
          )}
          {statusSlug === "paused" && (
            <ActionPill disabled={!!busy} loading={busy === "resume"} onClick={() => runAction("resume")}>
              Resume
            </ActionPill>
          )}
          {!["cancelled", "expired"].includes(statusSlug) && (
            <ActionPill disabled={!!busy} tone="danger" loading={busy === "cancel"} onClick={() => runAction("cancel")}>
              Cancel
            </ActionPill>
          )}
          <ActionPill disabled={!!busy} loading={busy === "renew"} onClick={runRenew}>
            Renew
          </ActionPill>
          <Link to="/contact?interest=Subscription%20question" className="button-primary group">
            Ask
            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
          {statusSlug === 'active' && subscription.payment_status === 'Paid' && <Link to={`/customer/add-ons?subscription=${subscription.id}`} className="text-link">Extra care <ArrowUpRight size={15} /></Link>}
        </div>
      </div>

      {message && (
        <div className="border-t border-brand-100 bg-brand-50/55 px-6 py-3 text-xs font-medium text-primary sm:px-8">
          {message}
        </div>
      )}
    </article>
  );
}

function ActionPill({
  children,
  disabled,
  loading,
  tone = "default",
  onClick,
}: {
  children: ReactNode;
  disabled: boolean;
  loading?: boolean;
  tone?: "default" | "danger";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-xs font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 " +
        (tone === "danger"
          ? "border border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100"
          : "border border-brand-100 bg-white text-primary hover:border-primary hover:bg-brand-50")
      }
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

function ServiceUsage({
  service,
}: {
  service: CustomerSubscription["services"][number];
}) {
  const limit = service.is_unlimited
    ? "Unlimited"
    : String(service.included_quantity ?? 0);
  const progress =
    service.is_unlimited || !service.included_quantity
      ? 0
      : Math.min(100, Math.round((service.used_quantity / service.included_quantity) * 100));

  return (
    <div className="rounded-2xl border border-brand-100 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-900">
            {service.service_name}
          </p>
          <p className="mt-1 text-[11px] capitalize text-slate-400">
            {service.usage_period}
          </p>
        </div>
        <p className="text-xs font-semibold text-primary">
          {service.is_unlimited
            ? "Unlimited"
            : service.remaining_quantity + " left"}
        </p>
      </div>

      {!service.is_unlimited && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-brand-50">
            <span
              className="block h-full rounded-full bg-primary"
              style={{ width: progress + "%" }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {service.used_quantity} used, {service.reserved_quantity} reserved of {limit}
          </p>
        </div>
      )}
      <p className="mt-2 text-[11px] text-slate-500">Period: {service.period_start} to {service.period_end}</p>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-[22px] border border-brand-100 bg-white p-5">
      <div className="flex items-center gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-primary">
          {icon}
        </span>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-brand-900">{value}</p>
        </div>
      </div>
    </article>
  );
}

function InfoPanel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[26px] border border-brand-100 bg-white p-6 sm:p-7">
      <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-primary">
        {icon}
      </span>
      <h2 className="mt-5 text-lg font-semibold leading-6 text-brand-900">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-brand-900">{value}</span>
    </div>
  );
}

function PlanDetail({
  label,
  value,
  icon,
  last = false,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={
        "min-w-0 px-5 py-5 sm:px-6 " +
        (!last ? "border-brand-100 lg:border-r " : "") +
        "border-b even:border-l lg:border-b-0 even:lg:border-l-0"
      }
    >
      <div className="flex items-center gap-2 text-slate-400">
        <span className="text-primary">{icon}</span>
        <p className="text-[10px] font-medium uppercase tracking-[0.12em]">
          {label}
        </p>
      </div>
      <p className="mt-2 truncate text-sm font-semibold text-brand-900">
        {value}
      </p>
    </div>
  );
}

function money(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const details = error.details as { message?: string };
    return details.message || "Subscriptions could not be loaded.";
  }

  return "Subscriptions could not be loaded.";
}
