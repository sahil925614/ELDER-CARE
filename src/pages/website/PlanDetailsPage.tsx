import { useEffect, useState } from "react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import {
  fetchPlanCatalog,
  type PlanCatalogItem,
} from "@/features/plans/planCatalog";
import { getCurrencyPreference } from "@/features/plans/currencyPreference";
import { allowanceText } from "@/features/plans/pricing";
import { usePlansPageContent } from "@/features/cms/plansPage";

import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
} from "lucide-react";

import bannerImage from "@/assets/careplan.webp";

import { PageHero, PageCta } from "./components/PageSections";

import { ContentImage } from "./components/ContentImage";
import { plans } from "./components/carePlans";

export function PlanDetailsPage({
  planName,
}: {
  planName?: "Basic" | "Standard" | "Premium";
}) {
  const { planSlug } = useParams();
  const [catalogPlan, setCatalogPlan] = useState<PlanCatalogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState(getCurrencyPreference);
  const [params] = useSearchParams();
  // Banner and photo come from the plan itself, then the Care Plans page settings, then the built-in picture.
  const plansPage = usePlansPageContent(true);

  const preference = params.get("duration");

  const [duration, setDuration] = useState(preference ?? "");
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchPlanCatalog(currency)
      .then((catalog) => {
        if (!active) return;
        const selected = catalog.plans.find(
          (item) => item.slug === (planSlug ?? planName?.toLowerCase()),
        );
        setCatalogPlan(selected ?? null);
        setDuration((value) =>
          selected?.prices.some((price) => price.label === value)
            ? value
            : (selected?.prices[0]?.label ?? ""),
        );
        setError(selected ? "" : "This plan is not currently available.");
      })
      .catch(() => {
        if (active)
          setError("Plan details could not be loaded. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currency, planName, planSlug]);
  useEffect(() => {
    const sync = () => setCurrency(getCurrencyPreference());
    window.addEventListener("elder-care-currency-changed", sync);
    return () =>
      window.removeEventListener("elder-care-currency-changed", sync);
  }, []);
  useEffect(() => {
    if (!catalogPlan) return;
    const previous = document.title;
    document.title = catalogPlan.name + " | Care Plans | Elder Care";
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content;
    const text = catalogPlan.best_for || catalogPlan.short_description;
    if (meta && text) meta.content = text;
    return () => {
      document.title = previous;
      if (meta && previousDescription !== undefined) meta.content = previousDescription;
    };
  }, [catalogPlan]);
  if (loading || error || !catalogPlan)
    return (
      <section className="pb-16 pt-40">
        <p role="status" className="text-sm text-slate-600">
          {loading ? "Loading plan..." : error}
        </p>
        <Link to="/plans" className="text-link mt-5">
          All care plans <ArrowLeft size={16} />
        </Link>
      </section>
    );
  const durations = catalogPlan.prices.map((price) => price.label);
  const selectedPrice =
    catalogPlan.prices.find((price) => price.label === duration) ??
    catalogPlan.prices[0];
  const plan = {
    name: catalogPlan.name,
    label: catalogPlan.label,
    description: catalogPlan.description ?? "",
    highlights: catalogPlan.features.length
      ? catalogPlan.features.map((feature) => feature.title)
      : catalogPlan.services.map(
          (service) =>
            service.name +
            " - " +
            (service.is_unlimited ? "Unlimited" : service.quantity + " included") +
            " " +
            (service.usage_period ?? "").replace(/_/g, " "),
        ),
  };

  const enquiry =
    "/enquiry?interest=" +
    encodeURIComponent(`${plan.name} plan - ${duration}`);

  return (
    <>
      {/* =====================================================
          HERO — KEEP UNCHANGED
      ===================================================== */}

      <PageHero
        label={`${plan.name} Plan`}
        title={`${plan.name} care, built around your family.`}
        text={plan.description}
        image={catalogPlan.image_url || plansPage?.images.banner || bannerImage}
        imageFallback={bannerImage}
        imageAlt={catalogPlan.image_alt || "Planning care for your loved ones"}
      >
        <Link to={enquiry} className="button-primary">
          Enquire about {plan.name}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>

        <Link to="/plans" className="button-outline">
          Compare all plans
        </Link>
      </PageHero>

      {/* =====================================================
          BACK
      ===================================================== */}

      <div className="pt-8 sm:pt-10">
        <Link to="/plans" className="text-link">
          <ArrowLeft size={16} aria-hidden="true" />
          All care plans
        </Link>
      </div>

      {/* =====================================================
          PLAN OVERVIEW
      ===================================================== */}

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="grid items-start gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 xl:gap-20">
          {/* ===============================================
              PLAN INFORMATION
          =============================================== */}

          <div>
            <div className="overflow-hidden rounded-[24px]">
              <ContentImage name="Care planning" key={catalogPlan.photo_url || plansPage?.images.story || "default"} src={catalogPlan.photo_url || plansPage?.images.story} alt={catalogPlan.photo_alt || catalogPlan.name} />
            </div>

            <div className="mt-8">
              <p className="section-eyebrow">{plan.label}</p>

              <h2 className="section-title max-w-2xl">
                A thoughtful starting point for {plan.name.toLowerCase()} care.
              </h2>

              <p className="mt-5 max-w-2xl text-[15px] leading-8 text-slate-600">
                {plan.description} Start with your loved one's routines,
                preferences, and the help your family is exploring.
              </p>
            </div>

            {/* =============================================
                WHAT IS INCLUDED (plan benefits)
            ============================================= */}

            {catalogPlan.features.length > 0 && (
              <div className="mt-10">
                <h3 className="text-xl font-semibold text-brand-900">What is included</h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {catalogPlan.features.map((feature) => (
                    <li
                      key={feature.title}
                      className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-white px-4 py-3.5 text-sm leading-6 text-slate-700"
                    >
                      <Check size={17} strokeWidth={2} className="mt-1 shrink-0 text-primary" aria-hidden="true" />
                      <span>
                        {feature.title}
                        {feature.description ? <small className="block text-slate-500">{feature.description}</small> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* =============================================
                INCLUDED SERVICES AND VISITS
            ============================================= */}

            {catalogPlan.services.length > 0 && (
              <div className="mt-10">
                <h3 className="text-xl font-semibold text-brand-900">Your included services and visits</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  These are covered by the subscription price. The allowance resets as shown, and visits are arranged
                  subject to provider availability.
                </p>
                <div className="mt-4 overflow-hidden rounded-2xl border border-brand-100 bg-white">
                  {catalogPlan.services.map((service, index) => (
                    <div
                      key={(service.id ?? service.name) + "-" + index}
                      className={"flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-4 " + (index ? "border-t border-brand-100" : "")}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-brand-900">{service.name}</p>
                        {service.notes ? <p className="mt-0.5 text-xs leading-5 text-slate-500">{service.notes}</p> : null}
                      </div>
                      <span className="shrink-0 rounded-full bg-brand-50 px-3.5 py-1.5 text-sm font-semibold text-primary">
                        {allowanceText(service)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NOTE */}

            <div className="mt-6 border-l-2 border-brand-200 pl-5">
              <p className="max-w-2xl text-xs leading-6 text-slate-500">
                Included services are covered by the subscription price. Visits
                are arranged subject to provider availability.
              </p>
            </div>
          </div>

          {/* ===============================================
              PLAN ENQUIRY PANEL
          =============================================== */}

          <aside className="lg:sticky lg:top-28">
            {(catalogPlan.addon_services ?? []).length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-semibold text-brand-900">
                  Optional add-ons
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {catalogPlan.addon_services.map((addon) => (
                    <li key={addon.id}>
                      {addon.name} -{" "}
                      {addon.pricing_type === "custom"
                        ? "Quote required"
                        : addon.formatted_price}
                      {addon.notes ? ". " + addon.notes : ""}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-slate-500">
                  Extra charges apply. Available after your subscription is
                  active and paid.
                </p>
              </section>
            )}
            <div className="overflow-hidden rounded-[24px] border border-brand-100 bg-white">
              {/* HEADER */}

              <div className="bg-brand-50/65 px-6 py-7 sm:px-8 sm:py-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Your plan preference
                </p>

                <div className="mt-4 flex items-end justify-between gap-5">
                  <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-brand-900">
                      {plan.name}
                    </h2>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Care plan
                    </p>
                  </div>

                  <span className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-primary">
                    Subscription
                  </span>
                </div>
              </div>

              {/* CONTENT */}

              <div className="px-6 py-7 sm:px-8">
                <p className="text-sm leading-7 text-slate-600">
                  {selectedPrice?.formatted_price ?? "Pricing unavailable"}
                  {selectedPrice && selectedPrice.tax_percentage > 0
                    ? ` + ${selectedPrice.tax_percentage}% tax before applicable discounts`
                    : ""}
                </p>

                {/* DURATION */}

                <div className="mt-7">
                  <label
                    htmlFor="plan-duration"
                    className="text-xs font-semibold text-brand-900"
                  >
                    Preferred duration
                  </label>

                  <div className="relative mt-2">
                    <CalendarDays
                      size={17}
                      strokeWidth={1.6}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                      aria-hidden="true"
                    />

                    <select
                      id="plan-duration"
                      value={duration}
                      onChange={(event) => setDuration(event.target.value)}
                      className="w-full appearance-none rounded-xl border border-brand-100 bg-white py-3.5 pl-11 pr-10 text-sm text-brand-900 outline-none transition-colors focus:border-primary"
                    >
                      {durations.map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>

                    <span
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                      aria-hidden="true"
                    >
                      ↓
                    </span>
                  </div>
                </div>

                {/* SELECTED SUMMARY */}

                <div className="mt-6 border-y border-brand-100">
                  <PlanMeta
                    icon={FileCheck2}
                    label="Selected plan"
                    value={`${plan.name} care`}
                  />

                  <PlanMeta
                    icon={Clock3}
                    label="Preferred period"
                    value={duration}
                    last
                  />
                </div>

                {/* TERM NOTE */}

                <p className="mt-5 text-xs leading-6 text-slate-500">
                  {catalogPlan.minimum_duration_months > 0
                    ? `Minimum subscription period: ${catalogPlan.minimum_duration_months} months.`
                    : ""}{" "}
                  Final charges are shown before payment.
                </p>

                {/* CTA */}

                <Link
                  to={
                    selectedPrice
                      ? `/customer/checkout?plan=${encodeURIComponent(catalogPlan.slug)}&price=${selectedPrice.id}`
                      : enquiry
                  }
                  className="button-primary mt-7 w-full justify-between"
                >
                  {selectedPrice
                    ? "Choose this plan"
                    : "Enquire about this plan"}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Link>

                <p className="mt-4 text-center text-[10px] leading-5 text-slate-400">
                  Select an elder and review your total before payment.
                </p>
              </div>
            </div>

            {/* SUPPORTING NOTE */}

            <div className="mt-5 flex items-start gap-3 px-2">
              <CheckCircle2
                size={17}
                strokeWidth={1.6}
                className="mt-0.5 shrink-0 text-primary"
                aria-hidden="true"
              />

              <p className="text-xs leading-6 text-slate-500">
                You'll have an opportunity to confirm services, availability,
                pricing, and terms before making a decision.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* =====================================================
          BEFORE YOU CHOOSE
      ===================================================== */}

      {/* =====================================================
          SIMPLE PROCESS
      ===================================================== */}

      {/* =====================================================
          FAQ
      ===================================================== */}

      {/* =====================================================
          OTHER PLANS
      ===================================================== */}

      <section className="pb-12 pt-4">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-14">
          <div>
            <p className="section-eyebrow">Continue exploring</p>

            <h2 className="section-title">Compare another care plan.</h2>

            <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
              Every family needs a different level of support. Explore the other
              plans before deciding what feels appropriate.
            </p>

            <Link to="/plans" className="text-link mt-6">
              Compare all plans
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="border-t border-brand-100">
            {plans
              .filter((item) => item.name !== planName)
              .map((item) => (
                <Link
                  key={item.name}
                  to={"/plans/" + item.name.toLowerCase()}
                  className="group flex items-center justify-between gap-6 border-b border-brand-100 py-6"
                >
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                      {item.label}
                    </p>

                    <h3 className="mt-2 text-lg font-semibold text-brand-900 transition-colors group-hover:text-primary">
                      {item.name} Plan
                    </h3>
                  </div>

                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-brand-100 text-primary transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                    <ArrowUpRight
                      size={17}
                      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <PageCta />
    </>
  );
}

/* =========================================================
   PLAN META
========================================================= */

function PlanMeta({
  icon: Icon,
  label,
  value,
  last = false,
}: {
  icon: typeof FileCheck2;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={
        "flex items-center gap-3 py-4 " +
        (!last ? "border-b border-brand-100" : "")
      }
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-primary">
        <Icon size={15} strokeWidth={1.6} aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-brand-900">{value}</p>
      </div>
    </div>
  );
}
