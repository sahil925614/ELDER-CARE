import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CreditCard,
  HeartHandshake,
  Loader2,
  ReceiptText,
  Users,
} from "lucide-react";

import { fetchCustomerElders, type CustomerElder } from "@/features/auth/customerAuth";
import {
  createCustomerCheckout,
  capturePaypalPayment,
  activatePaypalSubscription,
  fetchPlanCatalog,
  type PaymentOrder,
  previewCustomerCheckout,
  type PlanCatalogItem,
  verifyRazorpayPayment,
  verifyRazorpaySubscription,
} from "@/features/plans/planCatalog";
import { getCurrencyPreference } from "@/features/plans/currencyPreference";
import { ApiError } from "@/services/api/client";
import { Badge, PageHeading } from "./components/PortalUi";

type CheckoutStep = "plan" | "elder" | "review" | "done";
type CheckoutPreview = NonNullable<Awaited<ReturnType<typeof previewCustomerCheckout>>>["preview"];
type CreatedCheckout = NonNullable<Awaited<ReturnType<typeof createCustomerCheckout>>>;

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
    paypal?: {
      Buttons: (options: Record<string, unknown>) => { render: (selector: string) => Promise<void> };
    };
  }
}

export function CheckoutPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<CheckoutStep>("plan");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [plans, setPlans] = useState<PlanCatalogItem[]>([]);
  const [elders, setElders] = useState<CustomerElder[]>([]);
  const [currency, setCurrency] = useState(() => getCurrencyPreference());
  const [planSlug, setPlanSlug] = useState(params.get("plan") || "");
  const [priceId, setPriceId] = useState<number | null>(
    params.get("price") ? Number(params.get("price")) : null,
  );
  const [elderId, setElderId] = useState<number | null>(null);
  const [autoRenew, setAutoRenew] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [created, setCreated] = useState<CreatedCheckout | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [catalog, elderList] = await Promise.all([
          fetchPlanCatalog(currency),
          fetchCustomerElders(),
        ]);
        setPlans(catalog.plans);
        setElders(elderList);

        const initialPlan =
          catalog.plans.find((plan) => plan.slug === planSlug) ?? catalog.plans[0];
        if (initialPlan) {
          setPlanSlug(initialPlan.slug);
          if (!priceId) setPriceId(initialPlan.prices[0]?.id ?? null);
        }
        if (elderList[0]) setElderId(elderList[0].id);
      } catch (caught) {
        setError(errorMessage(caught));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  useEffect(() => {
    if (!plans.length) return;
    fetchPlanCatalog(currency)
      .then((catalog) => {
        setPlans(catalog.plans);
        const refreshedPlan = catalog.plans.find((plan) => plan.slug === planSlug) ?? catalog.plans[0];
        if (refreshedPlan) {
          setPlanSlug(refreshedPlan.slug);
          const matchingPrice = refreshedPlan.prices.find((price) => price.duration_months === selectedPrice?.duration_months);
          setPriceId(matchingPrice?.id ?? refreshedPlan.prices[0]?.id ?? null);
        }
      })
      .catch(() => undefined);
  }, [currency]);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.slug === planSlug) ?? plans[0],
    [plans, planSlug],
  );
  const selectedPrice = selectedPlan?.prices.find((price) => price.id === priceId) ?? selectedPlan?.prices[0];
  const selectedElder = elders.find((elder) => elder.id === elderId);

  async function loadPreview() {
    if (!selectedPrice || !elderId) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await previewCustomerCheckout({
        elder_profile_id: elderId,
        subscription_plan_price_id: selectedPrice.id,
        currency,
        auto_renew: autoRenew,
      });
      setPreview(response?.preview ?? null);
      setStep("review");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  async function createCheckout() {
    if (!selectedPrice || !elderId) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await createCustomerCheckout({
        elder_profile_id: elderId,
        subscription_plan_price_id: selectedPrice.id,
        currency,
        auto_renew: autoRenew,
      });
      if (response) {
        setCreated(response);
        setStep("done");
      }
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  async function payNow(order?: PaymentOrder) {
    if (!order || !created?.invoice.id) return;

    if (!order.enabled) {
      setPaymentMessage(order.message || "Online payment is not configured yet.");
      return;
    }

    setSubmitting(true);
    setPaymentMessage("");
    try {
      if (order.gateway === "razorpay") {
        await payWithRazorpay(order, created.invoice.id);
      } else {
        await payWithPaypal(order, created.invoice.id);
      }
      setSuccessOpen(true);
      window.setTimeout(() => navigate("/customer/subscriptions", { replace: true }), 1800);
    } catch (caught) {
      setPaymentMessage(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeading
        title="Purchase subscription"
        text="Choose a plan, link it to an elder profile, review the billing snapshot, and create the checkout."
      />

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 rounded-[24px] border border-brand-100 bg-white p-6 text-sm text-slate-500">
          <Loader2 className="animate-spin text-primary" size={18} />
          Loading checkout options...
        </div>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[0.9fr_0.55fr]">
          <div className="rounded-[28px] border border-brand-100 bg-white p-5 sm:p-7">
            <StepHeader step={step} />

            {step === "plan" && (
              <div className="mt-7 space-y-5">
                <div className="grid gap-4 lg:grid-cols-3">
                  {plans.map((plan) => {
                    const active = selectedPlan?.id === plan.id;
                    const price = plan.prices[0];

                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => {
                          setPlanSlug(plan.slug);
                          setPriceId(price?.id ?? null);
                        }}
                        className={
                          "rounded-2xl border p-5 text-left transition-colors " +
                          (active
                            ? "border-primary bg-brand-50"
                            : "border-brand-100 bg-white hover:border-primary")
                        }
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                          {plan.label || plan.code}
                        </p>
                        <h2 className="mt-2 text-xl font-semibold text-brand-900">
                          {plan.name}
                        </h2>
                        <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                          {plan.short_description || plan.description}
                        </p>
                        <p className="mt-4 text-sm font-semibold text-brand-900">
                          {price?.formatted_price || "Pricing pending"}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {selectedPlan && (
                  <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Duration
                    </label>
                    <select
                      value={priceId ?? ""}
                      onChange={(event) => setPriceId(Number(event.target.value))}
                      className="mt-2 w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                    >
                      {selectedPlan.prices.map((price) => (
                        <option key={price.id} value={price.id}>
                          {price.label} - {price.formatted_price}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={!selectedPrice}
                    onClick={() => setStep("elder")}
                    className="button-primary disabled:opacity-50"
                  >
                    Continue
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            )}

            {step === "elder" && (
              <div className="mt-7 space-y-5">
                {elders.length ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {elders.map((elder) => (
                      <button
                        key={elder.id}
                        type="button"
                        onClick={() => setElderId(elder.id)}
                        className={
                          "rounded-2xl border p-5 text-left transition-colors " +
                          (elderId === elder.id
                            ? "border-primary bg-brand-50"
                            : "border-brand-100 bg-white hover:border-primary")
                        }
                      >
                        <p className="text-lg font-semibold text-brand-900">
                          {elder.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {elder.relationship} • {elder.city || "Location not set"}
                        </p>
                        <Badge>{elder.status}</Badge>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6 text-sm text-slate-600">
                    Add an elder profile before purchasing a subscription.
                    <Link to="/customer/elders" className="text-link mt-3">
                      Add elder profile
                    </Link>
                  </div>
                )}

                <label className="flex items-center gap-3 rounded-2xl border border-brand-100 p-4 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={autoRenew}
                    onChange={(event) => setAutoRenew(event.target.checked)}
                    className="size-4 accent-primary"
                  />
                  Enable auto renew request for this plan
                </label>

                <div className="flex flex-wrap justify-between gap-3">
                  <button type="button" onClick={() => setStep("plan")} className="button-outline">
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!elderId || submitting}
                    onClick={loadPreview}
                    className="button-primary disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={17} /> : <ReceiptText size={17} />}
                    Review
                  </button>
                </div>
              </div>
            )}

            {step === "review" && preview && (
              <div className="mt-7 space-y-5">
                <SummaryGrid
                  items={[
                    ["Plan", selectedPlan?.name || "Plan"],
                    ["Elder", selectedElder?.name || "Elder"],
                    ["Period", preview.start_date + " to " + preview.end_date],
                    ["Amount", preview.amounts.formatted_final_amount],
                    ["Gateway", preview.gateway.gateway.toUpperCase()],
                    ["Currency", preview.gateway.currency],
                  ]}
                />

                <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5 text-sm leading-6 text-slate-600">
                  {preview.gateway.message}
                </div>

                <div className="flex flex-wrap justify-between gap-3">
                  <button type="button" onClick={() => setStep("elder")} className="button-outline">
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={createCheckout}
                    className="button-primary disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={17} /> : <CreditCard size={17} />}
                    Create checkout
                  </button>
                </div>
              </div>
            )}

            {step === "done" && created && (
              <div className="mt-7 rounded-2xl border border-brand-100 bg-brand-50 p-6">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-white">
                  <Check size={22} />
                </span>
                <h2 className="mt-5 text-2xl font-semibold text-brand-900">
                  Checkout created
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {created.subscription.subscription_number} is pending payment.
                  Invoice {created.invoice.invoice_number} is ready.
                </p>
                {created.payment_order && (
                  <div className="mt-5 rounded-2xl border border-brand-100 bg-white p-4">
                    <p className="text-sm font-semibold text-brand-900">
                      {created.payment_order.gateway === "razorpay" ? "Razorpay" : "PayPal"} checkout
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {created.payment_order.currency} {created.payment_order.amount.toFixed(2)}
                    </p>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => payNow(created.payment_order)}
                      className="button-primary mt-4 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="animate-spin" size={17} /> : <CreditCard size={17} />}
                      Pay now
                    </button>
                    {paymentMessage && (
                      <p className="mt-3 text-xs font-medium text-primary">{paymentMessage}</p>
                    )}
                  </div>
                )}
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to="/customer/subscriptions" className="button-primary">
                    View subscription
                  </Link>
                  <Link to="/customer/payments" className="button-outline">
                    View invoice
                  </Link>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            {(selectedPlan?.addon_services ?? []).length > 0 && <section className="border-b border-brand-100 pb-5"><h2 className="text-base font-semibold text-brand-900">Optional extra care</h2><ul className="mt-3 space-y-2 text-sm text-slate-600">{selectedPlan?.addon_services.map((addon) => <li key={addon.id}>{addon.name} - {addon.pricing_type === 'custom' ? 'Quote required' : addon.formatted_price}</li>)}</ul><p className="mt-3 text-xs text-slate-500">Charged separately. Available from My add-ons after this subscription is active and paid.</p></section>}
            <SideCard icon={<HeartHandshake size={20} />} title="Selected plan">
              <p className="text-lg font-semibold text-brand-900">
                {selectedPlan?.name || "Choose a plan"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {selectedPrice?.label || "Choose duration"}
                {selectedPrice ? " • " + selectedPrice.formatted_price : ""}
              </p>
            </SideCard>
            <SideCard icon={<Users size={20} />} title="Elder profile">
              <p className="text-lg font-semibold text-brand-900">
                {selectedElder?.name || "Select elder"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {selectedElder?.relationship || "Plan will be linked to one elder profile."}
              </p>
            </SideCard>
            <SideCard icon={<CreditCard size={20} />} title="Payment route">
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value === "USD" ? "USD" : "INR")}
                className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="INR">INR - Razorpay</option>
                <option value="USD">USD - PayPal</option>
              </select>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Plan amounts are currently stored in INR. USD/PayPal selection is saved as a payment preference for international checkout.
              </p>
            </SideCard>
          </aside>
        </section>
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

function StepHeader({ step }: { step: CheckoutStep }) {
  const steps: CheckoutStep[] = ["plan", "elder", "review", "done"];
  const labels = { plan: "Plan", elder: "Elder", review: "Review", done: "Created" };
  const current = steps.indexOf(step);

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {steps.map((item, index) => (
        <div
          key={item}
          className={
            "rounded-2xl border px-4 py-3 text-sm font-semibold " +
            (index <= current
              ? "border-primary bg-brand-50 text-primary"
              : "border-brand-100 text-slate-400")
          }
        >
          {index + 1}. {labels[item]}
        </div>
      ))}
    </div>
  );
}

function SummaryGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-brand-100 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-sm font-semibold text-brand-900">{value}</p>
        </div>
      ))}
    </div>
  );
}

function SideCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-brand-100 bg-white p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-primary">
          {icon}
        </span>
        <h2 className="font-semibold text-brand-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError && typeof error.details === "object" && error.details) {
    const details = error.details as { message?: string; errors?: Record<string, string[]> };
    return details.message || Object.values(details.errors ?? {})[0]?.[0] || "Checkout request failed.";
  }

  return error instanceof Error ? error.message : "Checkout request failed.";
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
            container?.remove();
            resolve();
          } catch (caught) {
            reject(caught);
          }
        },
        onCancel: () => {
          container?.remove();
          reject(new Error("Payment was cancelled."));
        },
        onError: (caught: unknown) => {
          container?.remove();
          reject(caught);
        },
      })
      .render("#paypal-buttons")
      .catch(reject);
  });
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
    script.onerror = () => reject(new Error("Unable to load payment script."));
    document.body.appendChild(script);
  });
}
