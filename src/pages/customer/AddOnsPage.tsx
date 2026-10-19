import { useCallback, useEffect, useState } from "react";
import { TimeInput } from '@/components/common/TimeInput';
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  CreditCard,
  Loader2,
  PackagePlus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  createCustomerAddonOrder,
  fetchCustomerAddons,
  type CustomerAddonOrder,
  type CustomerAddonService,
  type CustomerAddonSubscription,
} from "@/features/auth/customerAuth";
import {
  capturePaypalPayment,
  createInvoicePaymentOrder,
  type PaymentOrder,
  verifyRazorpayPayment,
} from "@/features/plans/planCatalog";
import { getCurrencyPreference } from "@/features/plans/currencyPreference";
import { withGatewayCheckout } from "@/features/plans/gatewayCheckout";
import { ApiError } from "@/services/api/client";
import { Badge, EmptyState, Modal, PageHeading } from "./components/PortalUi";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
    paypal?: {
      Buttons: (options: Record<string, unknown>) => { render: (selector: string) => Promise<void> };
    };
  }
}

export function AddOnsPage() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<"Explore services" | "My services">("Explore services");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscriptions, setSubscriptions] = useState<CustomerAddonSubscription[]>([]);
  const [subscriptionId, setSubscriptionId] = useState(Number(params.get('subscription')) || 0);
  const [orders, setOrders] = useState<CustomerAddonOrder[]>([]);
  const [currency, setCurrency] = useState(() => getCurrencyPreference());
  const [selectedService, setSelectedService] = useState<CustomerAddonService | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const loadAddons = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const addonData = await fetchCustomerAddons(currency);
      setSubscriptions(addonData.subscriptions);
      setSubscriptionId((id) => addonData.subscriptions.some((item) => item.id === id) ? id : addonData.subscriptions[0]?.id ?? 0);
      setOrders(addonData.orders);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    void loadAddons();
  }, [loadAddons]);

  useEffect(() => {
    const syncCurrency = () => setCurrency(getCurrencyPreference());
    window.addEventListener("elder-care-currency-changed", syncCurrency);
    return () => window.removeEventListener("elder-care-currency-changed", syncCurrency);
  }, []);

  const selectedSubscription = subscriptions.find((item) => item.id === subscriptionId);
  const services = selectedSubscription?.services ?? [];
  const categories = ["All categories", ...Array.from(new Set(services.map((service) => service.category)))];

  const visible = services.filter(
    (service) =>
      (category === "All categories" || service.category === category) &&
      [service.name, service.description, service.category]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <>
      <PageHeading
        title="My add-ons"
        text="Extra care available with your elder's active subscription."
      />

      <div className="mb-7 flex items-end justify-between gap-5 border-b border-brand-100">
        <div className="flex" role="group" aria-label="Add-on view">
          {(["Explore services", "My services"] as const).map((item) => {
            const selected = tab === item;

            return (
              <button
                type="button"
                key={item}
                aria-pressed={selected}
                onClick={() => setTab(item)}
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

        <p className="hidden pb-4 text-xs text-slate-400 sm:block">
          {tab === "Explore services"
            ? `${services.length} services available`
            : `${orders.length} purchased service${orders.length === 1 ? "" : "s"}`}
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
          Loading add-ons...
        </div>
      )}

      {!loading && tab === "Explore services" && (
        <>
          {subscriptions.length ? (
            <label className="mb-6 block text-sm font-semibold text-brand-900">
              Elder and subscription
              <select value={subscriptionId} onChange={(event) => { setSubscriptionId(Number(event.target.value)); setCategory('All categories'); setSelectedService(null); }} className="mt-2 h-12 w-full rounded-lg border border-brand-100 bg-white px-4">
                {subscriptions.map((item) => <option key={item.id} value={item.id}>{item.elder.name} - {item.plan_name} ({item.subscription_number})</option>)}
              </select>
            </label>
          ) : (
            <div className="mb-6 border-b border-brand-100 py-6">
              <p className="mb-4 text-sm text-slate-600">An active, paid subscription is required to purchase add-ons for an elder.</p>
              <Link to="/customer/checkout" className="button-primary">Purchase a subscription <ArrowUpRight size={16} /></Link>
            </div>
          )}
          <div className="mb-7 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                strokeWidth={1.7}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                aria-label="Search add-ons"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search services"
                className="h-12 w-full rounded-xl border border-brand-100 bg-white pl-11 pr-10 text-sm text-brand-900 outline-none transition-colors placeholder:text-slate-400 focus:border-primary"
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

            <div className="relative sm:w-[220px]">
              <SlidersHorizontal
                size={16}
                strokeWidth={1.7}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                aria-hidden="true"
              />
              <select
                aria-label="Service category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-brand-100 bg-white pl-11 pr-9 text-sm font-medium text-brand-900 outline-none transition-colors focus:border-primary"
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          {visible.length ? (
            <section
              aria-label="Available add-on services"
              className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              {visible.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onPurchase={() => setSelectedService(service)}
                />
              ))}
            </section>
          ) : (
            subscriptions.length > 0 && <EmptyState text="No add-ons are available for this subscription and selection." />
          )}
        </>
      )}

      {!loading && tab === "My services" && (
        <section className="overflow-hidden rounded-[24px] border border-brand-100 bg-white">
          {orders.length ? (
            <div className="divide-y divide-brand-100">
              {orders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <EmptyState text="No add-on services purchased yet." />
          )}
        </section>
      )}

      {selectedService && selectedSubscription && (
        <PurchaseModal
          service={selectedService}
          subscription={selectedSubscription}
          currency={currency}
          onClose={() => setSelectedService(null)}
          onDone={() => {
            setSelectedService(null);
            setSuccessOpen(true);
            setTab("My services");
            void loadAddons();
          }}
        />
      )}

      {successOpen && (
        <SuccessPopup onClose={() => setSuccessOpen(false)} />
      )}
    </>
  );
}

function ServiceCard({
  service,
  onPurchase,
}: {
  service: CustomerAddonService;
  onPurchase: () => void;
}) {
  return (
    <article className="flex flex-col rounded-[24px] border border-brand-100 bg-white p-6 transition-colors hover:border-primary/35">
      <div className="flex items-start justify-between gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-primary">
          <PackagePlus size={21} strokeWidth={1.6} aria-hidden="true" />
        </span>
        <Badge>{service.category}</Badge>
      </div>

      <h2 className="mt-5 text-xl font-semibold tracking-tight text-brand-900">
        {service.name}
      </h2>
      <p className="mt-3 min-h-[70px] text-sm leading-6 text-slate-500">
        {service.description || "Extra care support for your elder profile."}
      </p>

      <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50/65 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Price
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-brand-900">
          {service.formatted_price}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Tax {service.tax_percentage}% {service.requires_appointment ? "| Appointment needed" : ""}
        </p>
      </div>

      <button
        type="button"
        onClick={onPurchase}
        className="button-primary mt-5"
      >
        {service.pricing_type === 'custom' ? 'View quote details' : 'Purchase add-on'}
        <ArrowUpRight size={16} aria-hidden="true" />
      </button>
      {service.pricing_type === 'custom' && <Link to={'/enquiry?interest=' + encodeURIComponent(service.name)} className="text-link mt-3">Request quote <ArrowUpRight size={15} /></Link>}
    </article>
  );
}

function PurchaseModal({
  service,
  subscription,
  currency,
  onClose,
  onDone,
}: {
  service: CustomerAddonService;
  subscription: CustomerAddonSubscription;
  currency: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [requestedDate, setRequestedDate] = useState("");
  const [requestedTime, setRequestedTime] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [createdOrder, setCreatedOrder] = useState<NonNullable<Awaited<ReturnType<typeof createCustomerAddonOrder>>> | null>(null);

  async function submit() {
    setBusy(true);
    setMessage("");
    try {
      const response = createdOrder ?? await createCustomerAddonOrder({
        service_id: service.id,
        subscription_id: subscription.id,
        elder_profile_id: subscription.elder.id,
        quantity,
        currency,
        requested_date: requestedDate || undefined,
        requested_time: requestedTime || undefined,
        customer_note: note || undefined,
      });
      if (!response) throw new Error('The order could not be created.');
      setCreatedOrder(response);

      const paymentOrder = createdOrder ? await createInvoicePaymentOrder(response.invoice.id) : response.payment_order;
      if (paymentOrder?.enabled && response.invoice) {
        if (paymentOrder.gateway === "razorpay") {
          await withGatewayCheckout(() => payWithRazorpay(paymentOrder, response.invoice.id));
        } else {
          await withGatewayCheckout(() => payWithPaypal(paymentOrder, response.invoice.id));
        }
      }

      onDone();
    } catch (caught) {
      setMessage(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Purchase add-on" onClose={onClose}>
      <div className="rounded-2xl border border-brand-100 bg-brand-50/65 p-4">
        <p className="text-lg font-semibold text-brand-900">{service.name}</p>
        <p className="mt-1 text-sm text-slate-500">
          {service.formatted_price} {service.pricing_type === 'hourly' ? 'per hour' : service.pricing_type === 'per_visit' ? 'per visit' : 'per unit'}
        </p>
      </div>

      <fieldset disabled={busy || !!createdOrder} className="mt-5 grid gap-4">
        <p className="text-sm font-semibold text-brand-900">{subscription.elder.name} - {subscription.plan_name}</p>
        {service.notes && <p className="text-sm text-slate-600">{service.notes}</p>}
        {service.included_allowance && (service.included_allowance.is_unlimited || (service.included_allowance.remaining_quantity ?? 0) > 0) && (
          <div className="border-l-2 border-primary pl-4 text-sm text-slate-600">
            <p>{service.included_allowance.is_unlimited ? 'This service is unlimited in your plan.' : `${service.included_allowance.remaining_quantity} included visits remain in this period.`}</p>
            <Link className="text-link mt-2" to={`/customer/appointments?subscription=${subscription.id}&service=${service.id}`}>Book an included visit <ArrowUpRight size={15} /></Link>
          </div>
        )}

        <label className="text-sm font-semibold text-brand-900">
          {service.pricing_type === 'hourly' ? 'Hours' : service.pricing_type === 'per_visit' ? 'Visits' : 'Quantity'}
          <input
            type="number"
            min={1}
            max={20}
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
            className="mt-2 h-12 w-full rounded-xl border border-brand-100 px-4 text-sm outline-none focus:border-primary"
          />
        </label>

        {service.requires_appointment && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-brand-900">
              Preferred date
              <input
                type="date"
                min={new Date().toLocaleDateString('en-CA')}
                max={subscription.end_date}
                value={requestedDate}
                onChange={(event) => setRequestedDate(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-brand-100 px-4 text-sm outline-none focus:border-primary"
              />
            </label>
            <div className="min-w-0 text-sm font-semibold text-brand-900">
              Preferred time
              <TimeInput label="Preferred time" value={requestedTime} onChange={setRequestedTime} />
            </div>
          </div>
        )}

        <label className="text-sm font-semibold text-brand-900">
          Notes
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-brand-100 px-4 py-3 text-sm outline-none focus:border-primary"
            placeholder="Any preference or context for this service"
          />
        </label>
      </fieldset>

      {message && (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {message}
        </p>
      )}

      <div className="mt-5 border-t border-brand-100 pt-4 text-sm text-brand-900">
        <p>Subtotal: {formatMoney(service.price * quantity, currency)}</p>
        <p className="mt-1 text-slate-500">Tax ({service.tax_percentage}%): {formatMoney(service.price * quantity * service.tax_percentage / 100, currency)}</p>
        <p className="mt-2 font-semibold">Total: {formatMoney(service.price * quantity * (1 + service.tax_percentage / 100), currency)}</p>
      </div>

      <button
        type="button"
        disabled={busy || service.pricing_type === 'custom'}
        onClick={submit}
        className="button-primary mt-6 w-full justify-center disabled:opacity-60"
      >
        {busy ? <Loader2 className="animate-spin" size={17} /> : <CreditCard size={17} />}
        {service.pricing_type === 'custom' ? 'Quote required' : createdOrder ? 'Retry payment' : 'Create and pay'}
      </button>
    </Modal>
  );
}

function OrderRow({ order }: { order: CustomerAddonOrder }) {
  return (
    <article className="p-6 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-primary">
            <PackagePlus size={20} strokeWidth={1.6} aria-hidden="true" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-base font-semibold text-brand-900 sm:text-lg">
                {order.service.name}
              </h2>
              <Badge>{order.status}</Badge>
              <Badge>{order.payment_status}</Badge>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {order.addon_order_number} | {order.elder.name || "Elder"} | Qty {order.quantity}
            </p>
            {order.subscription && <p className="mt-1 text-xs text-slate-500">{order.subscription.plan_name} - {order.subscription.subscription_number}</p>}
            <div className="mt-3 flex flex-wrap gap-4">
              {order.service.requires_appointment && order.payment_status === 'Paid' && !['Completed', 'Cancelled', 'Refunded'].includes(order.status) && <Link to={`/customer/appointments?addon=${order.id}`} className="text-link">Request a visit <ArrowUpRight size={15} /></Link>}
              {order.invoice && order.invoice.balance_amount > 0 && <Link to="/customer/payments" className="text-link">Complete payment <CreditCard size={15} /></Link>}
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-sm font-semibold text-brand-900">
            {order.amounts.formatted_total_amount}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {order.invoice?.invoice_number || "Invoice pending"}
          </p>
        </div>
      </div>
    </article>
  );
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency }).format(amount);
}

function SuccessPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-brand-100 bg-white p-7 text-center shadow-[0_24px_90px_rgba(15,23,42,0.25)]">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-50 text-primary">
          <Check size={30} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-brand-900">
          Add-on order created
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
          Your order is visible in My services. Paid services can be arranged with the care team; unpaid orders remain pending.
        </p>
        <button type="button" onClick={onClose} className="button-primary mt-6 justify-center">
          Continue
        </button>
      </div>
    </div>
  );
}

async function payWithRazorpay(order: PaymentOrder, invoiceId: number) {
  await loadScript("https://checkout.razorpay.com/v1/checkout.js", "razorpay-checkout-js");

  if (!window.Razorpay || !order.key_id || !order.order_id) {
    throw new Error("Razorpay checkout could not be loaded.");
  }

  const RazorpayCheckout = window.Razorpay;

  await new Promise<void>((resolve, reject) => {
    const checkout = new RazorpayCheckout({
      key: order.key_id,
      amount: order.amount_minor,
      currency: order.currency,
      name: "Elder Care",
      description: "Add-on service payment",
      order_id: order.order_id,
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        try {
          await verifyRazorpayPayment({ invoice_id: invoiceId, ...response });
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
  if (!order.client_id || !order.order_id) {
    throw new Error("PayPal checkout is not configured.");
  }

  const containerId = "paypal-addon-checkout-container";
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
    container.innerHTML = '<div style="width:min(420px, calc(100vw - 32px));border-radius:24px;background:#fff;padding:24px;box-shadow:0 24px 80px rgba(15,23,42,.25)"><div id="paypal-addon-buttons"></div></div>';
    document.body.appendChild(container);
  }

  try {
    await loadScript(
      "https://www.paypal.com/sdk/js?client-id=" +
        encodeURIComponent(order.client_id) +
        "&currency=" +
        encodeURIComponent(order.currency),
      "paypal-sdk-js-" + order.currency,
    );

    if (!window.paypal) {
      throw new Error("PayPal checkout could not be loaded.");
    }

    await new Promise<void>((resolve, reject) => {
      window.paypal
        ?.Buttons({
          createOrder: () => order.order_id,
          onApprove: async (data: { orderID?: string }) => {
            try {
              await capturePaypalPayment({ invoice_id: invoiceId, order_id: data.orderID || order.order_id || "" });
              resolve();
            } catch (caught) {
              reject(caught);
            }
          },
          onCancel: () => {
            reject(new Error("Payment was cancelled."));
          },
          onError: (caught: unknown) => {
            reject(caught);
          },
        })
        .render("#paypal-addon-buttons")
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

function errorMessage(error: unknown) {
  if (error instanceof ApiError && typeof error.details === "object" && error.details) {
    const details = error.details as { message?: string; errors?: Record<string, string[]> };
    return details.message || Object.values(details.errors ?? {})[0]?.[0] || "Add-on request failed.";
  }

  return error instanceof Error ? error.message : "Add-on request failed.";
}

