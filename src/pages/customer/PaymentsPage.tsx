import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Check,
  Clock3,
  CreditCard,
  Download,
  FileText,
  Loader2,
  ReceiptText,
  Search,
  SlidersHorizontal,
  Wallet,
  X,
} from "lucide-react";

import {
  customerInvoicePdfUrl,
  fetchCustomerPayments,
  type CustomerInvoice,
  type CustomerPayment,
  type CustomerPaymentSummary,
} from "@/features/auth/customerAuth";
import { ApiError } from "@/services/api/client";
import { withGatewayCheckout } from "@/features/plans/gatewayCheckout";
import {
  activatePaypalSubscription,
  capturePaypalPayment,
  createInvoicePaymentOrder,
  type PaymentOrder,
  verifyRazorpayPayment,
  verifyRazorpaySubscription,
} from "@/features/plans/planCatalog";
import {
  Badge,
  EmptyState,
  Modal,
  PageHeading,
  Pagination,
} from "./components/PortalUi";

export function PaymentsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"Invoices" | "Payments">("Invoices");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<CustomerPaymentSummary>({
    invoiced_total: 0,
    paid_total: 0,
    balance_total: 0,
    pending_invoices: 0,
    payment_records: 0,
  });
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<CustomerPayment | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  async function loadPayments() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchCustomerPayments();
      setSummary(data.summary);
      setInvoices(data.invoices);
      setPayments(data.payments);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPayments();
  }, []);

  const records = tab === "Invoices" ? invoices : payments;
  const statuses = tab === "Invoices"
    ? ["All", "Unpaid", "Partial", "Paid", "Cancelled", "Refunded"]
    : ["All", "Completed", "Pending", "Failed", "Refunded"];

  const filtered = useMemo(
    () =>
      records.filter((record) => {
        const recordStatus =
          tab === "Invoices"
            ? (record as CustomerInvoice).payment_status
            : (record as CustomerPayment).status;
        const haystack =
          tab === "Invoices"
            ? [
                (record as CustomerInvoice).invoice_number,
                (record as CustomerInvoice).subscription_number,
                (record as CustomerInvoice).plan_name,
                (record as CustomerInvoice).elder_name,
              ].join(" ")
            : [
                (record as CustomerPayment).payment_number,
                (record as CustomerPayment).invoice_number,
                (record as CustomerPayment).subscription_number,
                (record as CustomerPayment).plan_name,
              ].join(" ");

        return (
          (status === "All" || recordStatus === status) &&
          haystack.toLowerCase().includes(search.toLowerCase())
        );
      }),
    [records, search, status, tab],
  );

  const paginated = filtered.slice((page - 1) * 5, page * 5);

  function changeTab(nextTab: "Invoices" | "Payments") {
    setTab(nextTab);
    setStatus("All");
    setSearch("");
    setPage(1);
  }

  return (
    <>
      <PageHeading
        title="Payments"
        text="Review invoices, recorded payments, balances, and open invoice PDFs."
      />

      <section
        aria-label="Payment summary"
        className="mb-7 overflow-hidden rounded-[22px] border border-brand-100 bg-white"
      >
        <div className="grid sm:grid-cols-3 lg:grid-cols-5">
          <SummaryItem icon={Wallet} label="Invoiced" value={money(summary.invoiced_total)} />
          <SummaryItem icon={CreditCard} label="Paid" value={money(summary.paid_total)} />
          <SummaryItem icon={Clock3} label="Balance" value={money(summary.balance_total)} />
          <SummaryItem icon={FileText} label="Pending invoices" value={summary.pending_invoices} />
          <SummaryItem icon={ReceiptText} label="Payment records" value={summary.payment_records} last />
        </div>
      </section>

      <div className="mb-6 flex items-center justify-between gap-5 border-b border-brand-100">
        <div className="flex" role="group" aria-label="Billing records">
          {(["Invoices", "Payments"] as const).map((item) => {
            const selected = tab === item;

            return (
              <button
                key={item}
                type="button"
                aria-pressed={selected}
                onClick={() => changeTab(item)}
                className={
                  "relative px-1 pb-4 pr-7 text-sm font-semibold transition-colors " +
                  (selected ? "text-primary" : "text-slate-400 hover:text-brand-900")
                }
              >
                {item}
                {selected && (
                  <span
                    className="absolute bottom-[-1px] left-0 h-0.5 w-[calc(100%-28px)] rounded-full bg-primary"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-[24px] border border-brand-100 bg-white">
        <div className="border-b border-brand-100 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={17}
                strokeWidth={1.7}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                aria-label="Search billing records"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search reference, plan, elder, or invoice"
                className="h-12 w-full rounded-xl border border-brand-100 bg-white pl-11 pr-10 text-sm text-brand-900 outline-none transition-colors placeholder:text-slate-400 focus:border-primary"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-brand-50 hover:text-primary"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative sm:min-w-[175px]">
                <SlidersHorizontal
                  size={16}
                  strokeWidth={1.7}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                  aria-hidden="true"
                />
                <select
                  aria-label="Billing status"
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setPage(1);
                  }}
                  className="h-12 w-full appearance-none rounded-xl border border-brand-100 bg-white pl-11 pr-9 text-sm font-medium text-brand-900 outline-none transition-colors focus:border-primary"
                >
                  {statuses.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                >
                  v
                </span>
              </div>

              <p className="whitespace-nowrap text-xs text-slate-400">
                {filtered.length} {filtered.length === 1 ? "record" : "records"}
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-3 p-6 text-sm text-slate-500">
            <Loader2 className="animate-spin text-primary" size={18} />
            Loading billing records...
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-brand-100 bg-brand-50/35">
                  <TableHeading>{tab === "Invoices" ? "Invoice" : "Payment"}</TableHeading>
                  <TableHeading>Date</TableHeading>
                  <TableHeading>{tab === "Invoices" ? "Amount / Balance" : "Amount"}</TableHeading>
                  <TableHeading>Status</TableHeading>
                  <th className="px-6 py-4"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((record) =>
                  tab === "Invoices" ? (
                    <InvoiceRow
                      key={(record as CustomerInvoice).id}
                      invoice={record as CustomerInvoice}
                      onView={setSelectedInvoice}
                    />
                  ) : (
                    <PaymentRow
                      key={(record as CustomerPayment).id}
                      payment={record as CustomerPayment}
                      onView={setSelectedPayment}
                    />
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="divide-y divide-brand-100 md:hidden">
            {paginated.map((record) =>
              tab === "Invoices" ? (
                <InvoiceMobileCard
                  key={(record as CustomerInvoice).id}
                  invoice={record as CustomerInvoice}
                  onView={setSelectedInvoice}
                />
              ) : (
                <PaymentMobileCard
                  key={(record as CustomerPayment).id}
                  payment={record as CustomerPayment}
                  onView={setSelectedPayment}
                />
              ),
            )}
          </div>
        )}

        {!loading && !filtered.length && (
          <div className="p-6">
            <EmptyState text="No billing records match your filters." />
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="border-t border-brand-100 px-5 py-5 sm:px-6">
            <Pagination page={page} total={filtered.length} onChange={setPage} />
          </div>
        )}
      </section>

      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onPaid={() => {
            setSelectedInvoice(null);
            setSuccessOpen(true);
            void loadPayments();
            window.setTimeout(() => navigate("/customer/subscriptions", { replace: true }), 1800);
          }}
        />
      )}

      {selectedPayment && (
        <PaymentModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}

      {successOpen && <PaymentSuccessPopup />}
    </>
  );
}

function PaymentSuccessPopup() {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-brand-100 bg-white p-7 text-center shadow-[0_24px_90px_rgba(15,23,42,0.25)]">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-50 text-primary">
          <Check size={30} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-brand-900">
          Payment successful
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
          Your subscription is active now. Redirecting you to My Subscriptions.
        </p>
        <div className="mx-auto mt-6 h-1.5 w-28 overflow-hidden rounded-full bg-brand-50">
          <span className="block h-full w-full animate-pulse rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

function InvoiceRow({
  invoice,
  onView,
}: {
  invoice: CustomerInvoice;
  onView: (invoice: CustomerInvoice) => void;
}) {
  return (
    <tr className="group border-b border-brand-100 transition-colors last:border-b-0 hover:bg-brand-50/25">
      <td className="px-6 py-5">
        <RecordTitle
          icon={ReceiptText}
          title={invoice.invoice_number}
          subtitle={[invoice.plan_name, invoice.elder_name].filter(Boolean).join(" | ")}
        />
      </td>
      <td className="px-6 py-5 text-sm text-slate-600">{invoice.invoice_date || "Not set"}</td>
      <td className="px-6 py-5">
        <p className="text-sm font-semibold text-brand-900">{invoice.formatted_total_amount}</p>
        <p className="mt-1 text-[11px] text-slate-400">Balance {invoice.formatted_balance_amount}</p>
      </td>
      <td className="px-6 py-5">
        <div className="flex flex-wrap gap-2">
          <Badge>{invoice.payment_status}</Badge>
          <Badge>{invoice.status}</Badge>
        </div>
      </td>
      <td className="px-6 py-5 text-right">
        <ActionButton label={"View " + invoice.invoice_number} onClick={() => onView(invoice)} />
      </td>
    </tr>
  );
}

function PaymentRow({
  payment,
  onView,
}: {
  payment: CustomerPayment;
  onView: (payment: CustomerPayment) => void;
}) {
  return (
    <tr className="group border-b border-brand-100 transition-colors last:border-b-0 hover:bg-brand-50/25">
      <td className="px-6 py-5">
        <RecordTitle
          icon={CreditCard}
          title={payment.payment_number}
          subtitle={[payment.invoice_number, payment.plan_name].filter(Boolean).join(" | ")}
        />
      </td>
      <td className="px-6 py-5 text-sm text-slate-600">{payment.payment_date || "Not set"}</td>
      <td className="px-6 py-5 text-sm font-semibold text-brand-900">{payment.formatted_amount}</td>
      <td className="px-6 py-5"><Badge>{payment.status}</Badge></td>
      <td className="px-6 py-5 text-right">
        <ActionButton label={"View " + payment.payment_number} onClick={() => onView(payment)} />
      </td>
    </tr>
  );
}

function InvoiceMobileCard({
  invoice,
  onView,
}: {
  invoice: CustomerInvoice;
  onView: (invoice: CustomerInvoice) => void;
}) {
  return (
    <article className="p-5">
      <RecordTitle icon={ReceiptText} title={invoice.invoice_number} subtitle={invoice.plan_name || "Invoice"} />
      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-brand-100 pt-4">
        <MiniStat label="Date" value={invoice.invoice_date || "Not set"} />
        <MiniStat label="Amount" value={invoice.formatted_total_amount} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge>{invoice.payment_status}</Badge>
        <Badge>{invoice.status}</Badge>
      </div>
      <button type="button" onClick={() => onView(invoice)} className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-primary">
        View invoice <ArrowRight size={13} aria-hidden="true" />
      </button>
    </article>
  );
}

function PaymentMobileCard({
  payment,
  onView,
}: {
  payment: CustomerPayment;
  onView: (payment: CustomerPayment) => void;
}) {
  return (
    <article className="p-5">
      <RecordTitle icon={CreditCard} title={payment.payment_number} subtitle={payment.invoice_number || "Payment"} />
      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-brand-100 pt-4">
        <MiniStat label="Date" value={payment.payment_date || "Not set"} />
        <MiniStat label="Amount" value={payment.formatted_amount} />
      </div>
      <div className="mt-4"><Badge>{payment.status}</Badge></div>
      <button type="button" onClick={() => onView(payment)} className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-primary">
        View payment <ArrowRight size={13} aria-hidden="true" />
      </button>
    </article>
  );
}

function InvoiceModal({
  invoice,
  onClose,
  onPaid,
}: {
  invoice: CustomerInvoice;
  onClose: () => void;
  onPaid: () => void;
}) {
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");

  async function payInvoice() {
    setPaying(true);
    setMessage("");
    try {
      const order = await createInvoicePaymentOrder(invoice.id);
      if (!order) throw new Error("Unable to start payment.");
      if (!order.enabled) {
        setMessage(order.message || "Online payment is not configured.");
        return;
      }
      if (order.gateway === "razorpay") {
        await withGatewayCheckout(() => payWithRazorpay(order, invoice.id));
      } else {
        await withGatewayCheckout(() => payWithPaypal(order, invoice.id));
      }
      onPaid();
    } catch (caught) {
      setMessage(errorMessage(caught));
    } finally {
      setPaying(false);
    }
  }

  return (
    <Modal title="Invoice details" onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Invoice total
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-brand-900">
            {invoice.formatted_total_amount}
          </p>
        </div>
        <Badge>{invoice.payment_status}</Badge>
      </div>

      <dl className="mt-6 divide-y divide-brand-100 border-y border-brand-100">
        <PaymentDetail label="Invoice" value={invoice.invoice_number} />
        <PaymentDetail label="Subscription" value={invoice.subscription_number || "Not linked"} />
        <PaymentDetail label="Plan" value={invoice.plan_name || "Not set"} />
        <PaymentDetail label="Elder" value={invoice.elder_name || "Not set"} />
        <PaymentDetail label="Invoice date" value={invoice.invoice_date || "Not set"} />
        <PaymentDetail label="Due date" value={invoice.due_date || "Not set"} />
        <PaymentDetail label="Balance" value={invoice.formatted_balance_amount} />
      </dl>

      {invoice.items.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-brand-900">Invoice items</p>
          <div className="mt-3 space-y-3">
            {invoice.items.map((item) => (
              <div key={item.id} className="rounded-xl border border-brand-100 p-3">
                <p className="text-xs font-semibold text-brand-900">{item.description}</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Qty {item.quantity} | Total {money(item.total_amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <a
        href={customerInvoicePdfUrl(invoice.id)}
        target="_blank"
        rel="noreferrer"
        className="button-primary mt-6"
      >
        <Download size={16} aria-hidden="true" />
        View invoice PDF
      </a>

      {!["Paid", "Cancelled", "Refunded"].includes(invoice.payment_status) && (
        <button
          type="button"
          disabled={paying}
          onClick={payInvoice}
          className="button-outline mt-3 disabled:opacity-50"
        >
          {paying ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={16} />}
          Pay now
        </button>
      )}

      {message && (
        <p className="mt-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-xs font-medium text-primary">
          {message}
        </p>
      )}
    </Modal>
  );
}

function PaymentModal({
  payment,
  onClose,
}: {
  payment: CustomerPayment;
  onClose: () => void;
}) {
  return (
    <Modal title="Payment record" onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Paid amount
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-brand-900">
            {payment.formatted_amount}
          </p>
        </div>
        <Badge>{payment.status}</Badge>
      </div>

      <dl className="mt-6 divide-y divide-brand-100 border-y border-brand-100">
        <PaymentDetail label="Payment" value={payment.payment_number} />
        <PaymentDetail label="Invoice" value={payment.invoice_number || "Not linked"} />
        <PaymentDetail label="Subscription" value={payment.subscription_number || "Not linked"} />
        <PaymentDetail label="Date" value={payment.payment_date || "Not set"} />
        <PaymentDetail label="Method" value={formatMethod(payment.method)} />
        <PaymentDetail label="Gateway" value={payment.gateway || "Not set"} />
        <PaymentDetail label="Transaction ID" value={payment.transaction_id || payment.reference_number || "Not set"} />
      </dl>
    </Modal>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
  last = false,
}: {
  icon: typeof Wallet;
  label: string;
  value: string | number;
  last?: boolean;
}) {
  return (
    <div className={"px-5 py-5 sm:px-6 " + (!last ? "border-b border-brand-100 sm:border-r sm:border-b-0" : "")}>
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-primary">
          <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>
          <p className="mt-1 truncate text-lg font-semibold text-brand-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function RecordTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof CreditCard;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-primary">
        <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-brand-900">{title}</p>
        <p className="mt-1 truncate text-[11px] text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-brand-900"
    >
      View <ArrowRight size={14} aria-hidden="true" />
    </button>
  );
}

function TableHeading({ children }: { children: string }) {
  return (
    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
      {children}
    </th>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 text-xs font-medium text-brand-900">{value}</p>
    </div>
  );
}

function PaymentDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[0.85fr_1.15fr] gap-5 py-3 text-xs">
      <dt className="text-slate-400">{label}</dt>
      <dd className="break-words text-right font-semibold text-brand-900">{value}</dd>
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

function formatMethod(value?: string | null) {
  return value
    ? value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "Not set";
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const details = error.details as { message?: string; errors?: Record<string, string[]> };
    return details.message || Object.values(details.errors ?? {})[0]?.[0] || "Billing records could not be loaded.";
  }

  return error instanceof Error ? error.message : "Billing records could not be loaded.";
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
    paypal?: {
      Buttons: (options: Record<string, unknown>) => { render: (selector: string) => Promise<void> };
    };
  }
}

async function payWithRazorpay(order: PaymentOrder, invoiceId: number) {
  await loadScript("https://checkout.razorpay.com/v1/checkout.js", "razorpay-checkout-js");

  if (!window.Razorpay || !order.key_id || (!order.order_id && !order.subscription_id)) {
    throw new Error("Razorpay checkout could not be loaded.");
  }
  const RazorpayCheckout = window.Razorpay;

  await new Promise<void>((resolve, reject) => {
    const checkout = new RazorpayCheckout({
      key: order.key_id,
      amount: order.amount_minor,
      currency: order.currency,
      name: "Elder Care",
      description: "Subscription invoice payment",
      ...(order.type === "recurring"
        ? { subscription_id: order.subscription_id }
        : { order_id: order.order_id }),
      prefill: {
        name: order.customer?.name || "",
        email: order.customer?.email || "",
        contact: order.customer?.phone || "",
      },
      handler: async (response: {
        razorpay_order_id?: string;
        razorpay_payment_id: string;
        razorpay_subscription_id?: string;
        razorpay_signature: string;
      }) => {
        try {
          if (order.type === "recurring" && response.razorpay_subscription_id) {
            await verifyRazorpaySubscription({
              invoice_id: invoiceId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            });
          } else {
            await verifyRazorpayPayment({
              invoice_id: invoiceId,
              razorpay_order_id: response.razorpay_order_id || "",
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          }
          resolve();
        } catch (caught) {
          reject(caught);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Payment was cancelled.")),
      },
    });

    checkout.open();
  });
}

async function payWithPaypal(order: PaymentOrder, invoiceId: number) {
  if (!order.client_id || (!order.order_id && !order.plan_id)) {
    throw new Error("PayPal checkout is not configured.");
  }

  const containerId = "paypal-checkout-container";
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    container.style.position = "fixed";
    container.style.inset = "0";
    container.style.zIndex = "9999";
    container.style.display = "grid";
    container.style.placeItems = "center";
    container.style.background = "rgba(15, 23, 42, 0.45)";
    container.innerHTML = '<div style="width:min(420px, calc(100vw - 32px));border-radius:24px;background:#fff;padding:24px;box-shadow:0 24px 80px rgba(15,23,42,.25)"><div id="paypal-buttons"></div></div>';
    document.body.appendChild(container);
  }

  try {
    await loadScript(
      "https://www.paypal.com/sdk/js?client-id=" +
        encodeURIComponent(order.client_id) +
        "&currency=" +
        encodeURIComponent(order.currency) +
        (order.type === "recurring" ? "&vault=true&intent=subscription" : ""),
      "paypal-sdk-js-" + order.currency,
    );

    if (!window.paypal) {
      throw new Error("PayPal checkout could not be loaded.");
    }

    await new Promise<void>((resolve, reject) => {
      window.paypal
        ?.Buttons({
          ...(order.type === "recurring"
            ? {
                createSubscription: (_data: unknown, actions: { subscription: { create: (payload: { plan_id: string }) => Promise<string> } }) =>
                  actions.subscription.create({ plan_id: order.plan_id || "" }),
              }
            : { createOrder: () => order.order_id }),
          onApprove: async (data: { orderID?: string; subscriptionID?: string }) => {
            try {
              if (order.type === "recurring" && data.subscriptionID) {
                await activatePaypalSubscription({ invoice_id: invoiceId, subscription_id: data.subscriptionID });
              } else {
                await capturePaypalPayment({ invoice_id: invoiceId, order_id: data.orderID || order.order_id || "" });
              }
              resolve();
            } catch (caught) {
              reject(caught);
            }
          },
          onCancel: () => reject(new Error("Payment was cancelled.")),
          onError: (caught: unknown) => reject(caught),
        })
        .render("#paypal-buttons")
        .catch(reject);
    });
  } finally {
    container?.remove();
  }
}

function loadScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error("Unable to load payment script."));
    };
    document.body.appendChild(script);
  });
}
