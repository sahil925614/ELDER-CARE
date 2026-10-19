import { useEffect, useMemo, useRef, useState } from "react";
import "./HomePlansCarousel.css";
import { AddOnServiceSlider } from "./AddOnServiceSlider";
import { ContentImage } from "./ContentImage";
import { Link, useOutletContext } from "react-router-dom";
import { apiRequest } from "@/services/api/client";
import type { HomePageContent } from "@/features/cms/websitePages";
import { defaultHomeSections, type HomeService } from "@/features/cms/homeSections";
import { fetchPlanCatalog, type PlanCatalogItem } from "@/features/plans/planCatalog";
import { getCurrencyPreference } from "@/features/plans/currencyPreference";
import {
  ArrowUpRight,
  Check,
  HeartHandshake,
  Stethoscope,
  Activity,
  House,
  CalendarDays,
  Layers,
  CreditCard,
  Heart,
  UserRound,
  ChevronDown,
  ShieldCheck,
  CalendarCheck,
  MessageCircle,
  Search,
} from "lucide-react";
// import careImage from '@/assets/care-hero.png'
import elderCare from "@/assets/elder-care.webp";

function SectionHeading({
  label,
  title,
  text,
}: {
  label: string;
  title: string;
  text?: string;
}) {
  return (
    <>
      <p className="section-eyebrow">{label}</p>
      <h2 className="section-title">{title}</h2>
      {text && (
        <p className="mt-5 max-w-2xl leading-7 text-slate-600">{text}</p>
      )}
    </>
  );
}

export function HomeSections() {
  const { homePage } = useOutletContext<{ homePage: HomePageContent | null }>();
  const content = homePage?.sections ?? defaultHomeSections;
  const careHighlights = content.highlights.items.map((item, index) => ({ ...item, icon: [Heart, UserRound, House, HeartHandshake, ShieldCheck, CalendarCheck][index] || Heart }));
  const [services, setServices] = useState<HomeService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState('');
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState('');
  const plansTrack = useRef<HTMLDivElement>(null);
  const [centerPlan, setCenterPlan] = useState(1);
  const [dynamicPlans, setDynamicPlans] = useState<PlanCatalogItem[]>([]);
  const [currency, setCurrency] = useState(() => getCurrencyPreference());
  const addonServices = useMemo(() => Array.from(new Map(dynamicPlans.flatMap((plan) => plan.addon_services.map((service) => [service.id, service] as const))).values()), [dynamicPlans]);
  const homePlans = dynamicPlans.slice(0, 3).map((plan, index) => ({
        name: plan.name,
        slug: plan.slug,
        number: String(index + 1).padStart(2, "0"),
        eyebrow: plan.label || plan.code || "Care plan",
        description: plan.short_description || plan.description || "Ongoing support for your loved one's care needs.",
        features: (
          plan.features.length
            ? plan.features.map((feature) => feature.title)
            : plan.services.map((service) => service.name)
        ).slice(0, 3),
        services: plan.services,
        price: plan.prices[0]?.formatted_price,
        duration: plan.prices[0]?.label,
        priceId: plan.prices[0]?.id,
      }));

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const alignPlans = () => {
      const track = plansTrack.current;
      if (!track) return;
      if (!media.matches) {
        track.scrollLeft = 0;
        return;
      }
      const cards = track.querySelectorAll<HTMLElement>('article');
      const index = Math.min(1, cards.length - 1);
      const card = cards[index];
      if (card) {
        track.scrollLeft = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
        setCenterPlan(index);
      }
    };
    alignPlans();
    media.addEventListener("change", alignPlans);
    return () => media.removeEventListener("change", alignPlans);
  }, [dynamicPlans]);

  useEffect(() => {
    let active = true;
    let revision = 0;
    const refresh = () => {
      const current = ++revision;
      setPlansLoading(true);
      setPlansError('');
      void fetchPlanCatalog(currency)
        .then((data) => { if (active && current === revision) setDynamicPlans(data.plans); })
        .catch(() => { if (active && current === revision) { setDynamicPlans([]); setPlansError('Care plans could not be loaded. Please try again later.'); } })
        .finally(() => { if (active && current === revision) setPlansLoading(false); });
    };
    refresh();
    window.addEventListener('focus', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); };
  }, [currency]);

  useEffect(() => {
    let active = true;
    let revision = 0;
    const refresh = () => {
      const current = ++revision;
      setServicesLoading(true);
      setServicesError('');
      void apiRequest<{ services: HomeService[] }>('website/home-services')
        .then((data) => { if (active && current === revision) setServices(data?.services ?? []); })
        .catch(() => { if (active && current === revision) { setServices([]); setServicesError('Services could not be loaded. Please try again later.'); } })
        .finally(() => { if (active && current === revision) setServicesLoading(false); });
    };
    refresh();
    window.addEventListener('focus', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); };
  }, []);

  useEffect(() => {
    const syncCurrency = () => setCurrency(getCurrencyPreference());
    window.addEventListener("elder-care-currency-changed", syncCurrency);
    return () => window.removeEventListener("elder-care-currency-changed", syncCurrency);
  }, []);

  function updateCenterPlan() {
    const track = plansTrack.current;
    if (!track || !window.matchMedia("(max-width: 767px)").matches) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let distance = Infinity;
    Array.from(track.querySelectorAll<HTMLElement>('article')).forEach((card, index) => {
      const next = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (next < distance) { distance = next; closest = index; }
    });
    setCenterPlan(closest);
  }

  return (
    <div className="home-dynamic-content">
      <section className="page-container border-b border-brand-100 py-9">
        <div className="care-ticker">
          <div className="care-ticker-track">
            {/* First set */}
            {careHighlights.map(({ icon: Icon, title, text }, index) => (
              <div key={`first-${index}`} className="care-ticker-item">
                <span className="icon-bubble">
                  <Icon size={23} strokeWidth={1.5} aria-hidden="true" />
                </span>

                <div>
                  <p className="whitespace-nowrap text-sm font-semibold text-brand-900">
                    {title}
                  </p>

                  <p className="mt-1 whitespace-nowrap text-sm text-slate-500">
                    {text}
                  </p>
                </div>
              </div>
            ))}

            {/* Duplicate set for infinite animation */}
            {careHighlights.map(({ icon: Icon, title, text }, index) => (
              <div
                key={`second-${index}`}
                className="care-ticker-item"
                aria-hidden="true"
              >
                <span className="icon-bubble">
                  <Icon size={23} strokeWidth={1.5} aria-hidden="true" />
                </span>

                <div>
                  <p className="whitespace-nowrap text-sm font-semibold text-brand-900">
                    {title}
                  </p>

                  <p className="mt-1 whitespace-nowrap text-sm text-slate-500">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="page-container">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <SectionHeading
                {...content.services}
              />
            </div>
            <Link to={content.services.button_url} className="text-link">
              {content.services.button_label} <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(servicesLoading || servicesError || !services.length) && <p role="status" className="text-sm text-slate-600">{servicesLoading ? 'Loading services...' : servicesError || 'No services are currently available.'}</p>}
            {services.map((service, index) => {
              const Icon = [Stethoscope, HeartHandshake, Activity, House][index % 4];
              return (
              <Link
                key={service.id}
                to={service.url}
                aria-label={`Explore ${service.name}`}
                className="group relative flex min-h-full flex-col overflow-hidden rounded-[24px] border border-brand-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_18px_45px_rgba(20,127,121,0.10)]"
              >
                {/* =========================
          IMAGE
      ========================== */}
                <div className="relative h-[205px] overflow-hidden">
                  <ContentImage
                    key={service.image_url}
                    name={service.name}
                    src={service.image_url}
                    alt={service.name}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />

                  {/* subtle gradient */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-900/10 via-transparent to-transparent"
                  />
                </div>

                {/* =========================
          ICON
      ========================== */}
                <div className="relative z-10 -mt-7 px-6">
                  <span className="grid size-14 place-items-center rounded-2xl border-[5px] border-white bg-brand-50 text-primary shadow-sm transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                    <Icon size={23} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                </div>

                {/* =========================
          CONTENT
      ========================== */}
                <div className="flex flex-1 flex-col px-6 pb-6 pt-4">
                  <h3 className="text-lg font-semibold tracking-[-0.01em] text-brand-900 transition-colors group-hover:text-primary">
                    {service.name}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {service.text}
                  </p>

                  {/* pushes CTA to bottom */}
                  <div className="mt-auto pt-6">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      {content.services.item_label}
                      <span className="grid size-7 place-items-center rounded-full bg-brand-50 transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                        <ArrowUpRight
                          size={14}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            ); })}
          </div>
        </div>
      </section>

      <section className="section-space overflow-hidden bg-brand-50">
        <div className="page-container">
          <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
            {/* ==================================================
          LEFT — IMAGE
      =================================================== */}
            <div className="relative">
              {/* Decorative shape behind image */}
              <div
                aria-hidden="true"
                className="absolute -left-8 -top-8 size-36 rounded-full border border-brand-200/70"
              />

              <div
                aria-hidden="true"
                className="absolute -bottom-8 right-4 size-28 rounded-full bg-brand-100"
              />

              {/* Image */}
              <div className="relative overflow-hidden rounded-[32px] bg-white">
                <img
                  src={content.approach.image_url || elderCare}
                  loading="lazy"
                  alt={content.approach.image_alt}
                  onError={(event) => { if (event.currentTarget.src !== new URL(elderCare, window.location.href).href) event.currentTarget.src = elderCare; }}
                  className="aspect-[5/4] w-full object-cover object-[80%_center] transition-transform duration-700 hover:scale-[1.02]"
                />

                {/* Very subtle image gradient */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-900/15 via-transparent to-transparent"
                />

                {/* Small label over image */}
                <div className="absolute left-5 top-5 rounded-full border border-white/40 bg-white/90 px-4 py-2 backdrop-blur-sm">
                  <span className="flex items-center gap-2 text-xs font-semibold text-brand-900">
                    <span className="size-2 rounded-full bg-primary" />
                    {content.approach.image_badge}
                  </span>
                </div>
              </div>

              {/* Floating connection card */}
              <div className="relative z-10 -mt-12 ml-auto mr-5 flex max-w-[340px] items-center gap-4 rounded-[20px] border border-brand-100 bg-white p-5 shadow-[0_16px_40px_rgba(20,127,121,0.10)] sm:mr-[-18px]">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-primary">
                  <HeartHandshake
                    size={24}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <p className="text-sm font-semibold text-brand-900">
                    {content.approach.image_title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {content.approach.image_text}
                  </p>
                </div>
              </div>
            </div>

            {/* ==================================================
          RIGHT — CONTENT
      =================================================== */}
            <div className="lg:pl-3">
              <SectionHeading
                {...content.approach}
              />

              {/* ==================================================
            BENEFITS
        =================================================== */}
              <div className="mt-9 divide-y divide-brand-100 border-y border-brand-100">
                {/* Benefit 01 */}
                <div className="group flex gap-5 py-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    01
                  </span>

                  <div>
                    <h3 className="text-sm font-semibold text-brand-900">
                      {content.approach.items[0].title}
                    </h3>

                    <p className="mt-1.5 text-sm leading-6 text-slate-500">
                      {content.approach.items[0].text}
                    </p>
                  </div>
                </div>

                {/* Benefit 02 */}
                <div className="group flex gap-5 py-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    02
                  </span>

                  <div>
                    <h3 className="text-sm font-semibold text-brand-900">
                      {content.approach.items[1].title}
                    </h3>

                    <p className="mt-1.5 text-sm leading-6 text-slate-500">
                      {content.approach.items[1].text}
                    </p>
                  </div>
                </div>

                {/* Benefit 03 */}
                <div className="group flex gap-5 py-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    03
                  </span>

                  <div>
                    <h3 className="text-sm font-semibold text-brand-900">
                      {content.approach.items[2].title}
                    </h3>

                    <p className="mt-1.5 text-sm leading-6 text-slate-500">
                      {content.approach.items[2].text}
                    </p>
                  </div>
                </div>
              </div>

              {/* ==================================================
            CTA
        =================================================== */}
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <Link to={content.approach.button_url} className="button-primary group">
                  {content.approach.button_label}
                  <ArrowUpRight
                    size={17}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>

                <p className="max-w-[220px] text-xs leading-5 text-slate-500">
                  {content.approach.button_note}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space overflow-hidden">
        <div className="page-container">
          {/* =========================
        HEADING
    ========================== */}
          <div className="mx-auto max-w-2xl text-center">
            <SectionHeading
              label={content.journey.label}
              title={content.journey.title}
            />

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-600">
              {content.journey.text}
            </p>
          </div>

          {/* =========================
        JOURNEY
    ========================== */}
          <div className="relative mt-16">
            {/* Desktop connecting line */}
            <div
              aria-hidden="true"
              className="absolute left-[16%] right-[16%] top-[58px] hidden h-px bg-brand-200 lg:block"
            />

            {/* dots on connecting line */}
            <div
              aria-hidden="true"
              className="absolute left-[16%] right-[16%] top-[54px] hidden items-center justify-between lg:flex"
            >
              <span className="size-2.5 rounded-full border-2 border-primary bg-white" />
              <span className="size-2.5 rounded-full border-2 border-primary bg-white" />
              <span className="size-2.5 rounded-full border-2 border-primary bg-white" />
            </div>

            <ol className="relative z-10 grid gap-6 md:grid-cols-3">
              {/* ==================================================
            STEP 01
        =================================================== */}
              <li className="group relative pt-8">
                <div className="relative h-full overflow-hidden rounded-[26px] border border-brand-100 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(20,127,121,0.08)] sm:p-8">
                  {/* Big background number */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-7 text-[110px] font-semibold leading-none text-brand-50"
                  >
                    01
                  </span>

                  {/* Icon */}
                  <div className="relative">
                    <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                      <MessageCircle
                        size={25}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </span>
                  </div>

                  {/* Step label */}
                  <p className="relative mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    {content.journey.items[0].label}
                  </p>

                  <h3 className="relative mt-3 text-xl font-semibold tracking-tight text-brand-900">
                    {content.journey.items[0].title}
                  </h3>

                  <p className="relative mt-4 text-sm leading-7 text-slate-600">
                    {content.journey.items[0].text}
                  </p>

                  {/* Bottom accent */}
                  <div className="relative mt-7 flex items-center gap-3">
                    <span className="h-px w-8 bg-brand-200 transition-all duration-300 group-hover:w-12 group-hover:bg-primary" />

                    <span className="text-xs font-medium text-slate-400">
                      {content.journey.items[0].note}
                    </span>
                  </div>
                </div>
              </li>

              {/* ==================================================
            STEP 02
        =================================================== */}
              <li className="group relative lg:pt-0">
                <div className="relative h-full overflow-hidden rounded-[26px] bg-primary p-7 text-white shadow-[0_18px_45px_rgba(20,127,121,0.12)] transition-transform duration-300 hover:-translate-y-1 sm:p-8">
                  {/* Big background number */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-7 text-[110px] font-semibold leading-none text-white/[0.07]"
                  >
                    02
                  </span>

                  {/* Icon */}
                  <div className="relative">
                    <span className="grid size-14 place-items-center rounded-2xl bg-white/12 text-white">
                      <Search size={25} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                  </div>

                  <p className="relative mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-100">
                    {content.journey.items[1].label}
                  </p>

                  <h3 className="relative mt-3 text-xl font-semibold tracking-tight">
                    {content.journey.items[1].title}
                  </h3>

                  <p className="relative mt-4 text-sm leading-7 text-white/80">
                    {content.journey.items[1].text}
                  </p>

                  <div className="relative mt-7 flex items-center gap-3">
                    <span className="h-px w-8 bg-white/40 transition-all duration-300 group-hover:w-12" />

                    <span className="text-xs font-medium text-white/60">
                      {content.journey.items[1].note}
                    </span>
                  </div>
                </div>
              </li>

              {/* ==================================================
            STEP 03
        =================================================== */}
              <li className="group relative pt-8">
                <div className="relative h-full overflow-hidden rounded-[26px] border border-brand-100 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(20,127,121,0.08)] sm:p-8">
                  {/* Big background number */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-7 text-[110px] font-semibold leading-none text-brand-50"
                  >
                    03
                  </span>

                  {/* Icon */}
                  <div className="relative">
                    <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                      <HeartHandshake
                        size={25}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </span>
                  </div>

                  <p className="relative mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    {content.journey.items[2].label}
                  </p>

                  <h3 className="relative mt-3 text-xl font-semibold tracking-tight text-brand-900">
                    {content.journey.items[2].title}
                  </h3>

                  <p className="relative mt-4 text-sm leading-7 text-slate-600">
                    {content.journey.items[2].text}
                  </p>

                  <div className="relative mt-7 flex items-center gap-3">
                    <span className="h-px w-8 bg-brand-200 transition-all duration-300 group-hover:w-12 group-hover:bg-primary" />

                    <span className="text-xs font-medium text-slate-400">
                      {content.journey.items[2].note}
                    </span>
                  </div>
                </div>
              </li>
            </ol>
          </div>

          {/* =========================
        CTA
    ========================== */}
          <div className="mt-12 flex justify-center">
            <Link
              to={content.journey.button_url}
              className="group inline-flex items-center gap-3 rounded-full border border-brand-100 bg-white px-6 py-3 text-sm font-semibold text-primary transition-all hover:border-primary/30 hover:bg-brand-50"
            >
              {content.journey.button_label}
              <span className="grid size-7 place-items-center rounded-full bg-brand-50 transition-all group-hover:bg-primary group-hover:text-white">
                <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-space bg-brand-50">
        <div className="page-container">
          {/* =========================
        SECTION HEADING
    ========================== */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <SectionHeading
                {...content.plans}
              />
            </div>

            <Link
              to={content.plans.button_url}
              className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary"
            >
              {content.plans.button_label}
              <ArrowUpRight
                size={17}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

        
          <div className="home-plans-panel mt-12 overflow-hidden rounded-[28px] border border-brand-100 bg-white">
            <div ref={plansTrack} onScroll={updateCenterPlan} className="home-plans-track grid lg:grid-cols-3" role="region" aria-label="Care plans" tabIndex={0}>
              {(plansLoading || plansError || !homePlans.length) && <p role="status" className="p-7 text-sm text-slate-600 lg:col-span-3">{plansLoading ? 'Loading care plans...' : plansError || 'No care plans are currently available.'}</p>}
              {homePlans.map((plan, index) => (
                <article
                  key={plan.name}
                  data-centered={centerPlan === index}
                  className={
                    "group relative flex flex-col p-7 sm:p-9 lg:p-10 " +
                    (index !== 2
                      ? "border-b border-brand-100 lg:border-b-0 lg:border-r"
                      : "")
                  }
                >
                  {/* =====================
                TOP
            ====================== */}

                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                        {plan.eyebrow}
                      </p>

                      <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-brand-900">
                        {plan.name}
                      </h3>
                    </div>

                    <span className="text-5xl font-semibold leading-none text-brand-100 transition-colors duration-300 group-hover:text-brand-200">
                      {plan.number}
                    </span>
                  </div>

                  {/* =====================
                DESCRIPTION
            ====================== */}

                  <p className="mt-5 min-h-[58px] text-sm leading-6 text-slate-600">
                    {plan.description}
                  </p>

                  <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50/75 px-4 py-3.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {content.plans.price_label}
                    </p>
                    <p className="mt-1.5 text-3xl font-semibold tracking-tight text-brand-900">
                      {plan.price || "Price pending"}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-slate-500">
                      {plan.duration || "Duration will be confirmed"}
                    </p>
                  </div>

                  {/* =====================
                DIVIDER
            ====================== */}

                  <div className="my-5 h-px bg-brand-100" />

                  {/* =====================
                FEATURES
            ====================== */}

                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-900">
                    {content.plans.services_label}
                  </p>

                  <ul className="mt-3 space-y-2.5">
                    {(plan.services.length ? plan.services : plan.features.map((feature) => ({
                      name: feature,
                      is_unlimited: false,
                      quantity: null,
                      usage_period: null,
                    }))).map((service) => (
                      <li
                        key={service.name}
                        className="rounded-2xl border border-brand-100 bg-white px-3 py-2.5 text-sm text-slate-600"
                      >
                        <div className="flex items-start gap-3">
                          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-primary">
                            <Check size={13} strokeWidth={2} aria-hidden="true" />
                          </span>
                          <div>
                            <p className="font-semibold text-brand-900">{service.name}</p>
                            <p className="mt-1 text-[11px] text-slate-400">
                              {service.is_unlimited
                                ? "Unlimited"
                                : service.quantity
                                  ? service.quantity + " included"
                                  : "Included"}
                              {service.usage_period
                                ? " per " + service.usage_period.replace(/_/g, " ")
                                : ""}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {plan.features.length > 0 && plan.services.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-900">
                        {content.plans.benefits_label}
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {plan.features.map((feature) => (
                          <span
                            key={feature}
                            className="rounded-full bg-brand-50 px-3 py-1.5 text-[11px] font-semibold text-primary"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* =====================
                CTA
            ====================== */}

                  <div className="mt-auto pt-6">
                    <Link
                      to={plan.priceId ?
                        "/customer/checkout?plan=" +
                        encodeURIComponent(plan.slug) +
                        "&price=" + plan.priceId : content.plans.button_url
                      }
                      aria-label={`Choose ${plan.name} plan`}
                      className="group/button flex items-center justify-between border-t border-brand-100 pt-5 text-sm font-semibold text-primary"
                    >
                      {content.plans.choose_label} {plan.name}
                      <span className="grid size-9 place-items-center rounded-full bg-brand-50 transition-all duration-300 group-hover/button:bg-primary group-hover/button:text-white">
                        <ArrowUpRight
                          size={16}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* =========================
          BOTTOM INFORMATION BAR
      ========================== */}

            <div className="flex flex-col gap-5 border-t border-brand-100 bg-brand-50/60 px-7 py-6 sm:px-9 lg:flex-row lg:items-center lg:justify-between lg:px-10">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-primary">
                  <HeartHandshake
                    size={19}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <p className="text-sm font-semibold text-brand-900">
                    {content.plans.help_title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {content.plans.help_text}
                  </p>
                </div>
              </div>

              <Link
                to={content.plans.help_url}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-900"
              >
                {content.plans.help_label}
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* <section className="section-space">
        <div className="page-container grid gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <SectionHeading
              label="Additional support"
              title="A little extra care, when it matters."
              text="Explore services beyond your main subscription. Availability and pricing are confirmed for each service."
            />
            <Link to="/add-ons" className="button-outline mt-8">
              Discover add-on services <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: FlaskConical, title: "Lab tests" },
              { icon: Pill, title: "Medicine delivery" },
              { icon: Activity, title: "Physiotherapy" },
              { icon: Stethoscope, title: "Doctor visits" },
            ].map(({ icon: Icon, title }) => (
              <Link
                key={title}
                to="/add-ons"
                className="flex items-center gap-4 rounded-2xl border border-brand-100 p-6 text-brand-900 hover:bg-brand-50"
              >
                <Icon
                  className="shrink-0 text-brand-700"
                  size={25}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="font-semibold">{title}</span>
                <ArrowUpRight
                  size={16}
                  className="ml-auto shrink-0"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>
      </section> */}

      <section className="section-space">
        <div className="page-container">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div>
              <SectionHeading
                {...content.addons}
              />

              <Link to={content.addons.button_url} className="button-outline mt-8">
                {content.addons.button_label}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>

            <AddOnServiceSlider services={addonServices} loading={plansLoading} error={plansError} />
          </div>
        </div>
      </section>

      <section className="page-container" aria-labelledby="home-account-heading">
        <div className="overflow-hidden rounded-3xl border border-brand-100 bg-brand-50 sm:rounded-[28px]">
          <div className="grid lg:grid-cols-2">
            <div className="flex min-w-0 flex-col justify-center px-5 py-7 sm:p-9 lg:p-12">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-primary">
                  <HeartHandshake size={22} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary sm:text-[11px]">
                  {content.account.label}
                </p>
              </div>
              <h2 id="home-account-heading" className="mt-5 max-w-md text-[26px] font-semibold leading-tight tracking-tight text-brand-900 sm:text-3xl lg:text-4xl">
                {content.account.title_line_1}<br className="hidden sm:block" />{' '}{content.account.title_line_2}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
                {content.account.text}
              </p>
              <div className="mt-6 border-t border-brand-200 pt-5 sm:mt-8">
                <p className="text-sm font-semibold text-brand-900">{content.account.button_note}</p>
                <Link to={content.account.button_url} className="group mt-3 inline-flex w-full items-center justify-between gap-4 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-900 sm:w-auto">
                  {content.account.button_label}
                  <ArrowUpRight size={17} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="min-w-0 border-t border-brand-100 bg-white/60 px-5 py-6 sm:p-9 lg:flex lg:items-center lg:border-l lg:border-t-0 lg:p-10">
              <div className="grid w-full grid-cols-2 gap-3 sm:gap-4">
                {content.account.items.map(({ title, text }, index) => {
                  const Icon = [UserRound, Layers, CalendarDays, CreditCard][index % 4];
                  return (
                  <div key={index} className="min-w-0 rounded-2xl border border-brand-100 bg-white p-3.5 sm:p-5">
                    <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-primary sm:size-10">
                      <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 break-words text-xs font-semibold text-brand-900 sm:text-sm">{title}</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
                  </div>
                ); })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="page-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading
              {...content.faqs}
            />
            <Link to={content.faqs.button_url} className="text-link mt-6">
              {content.faqs.button_label} <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="space-y-3">
            {content.faqs.items.map(({ question, answer }, index) => (
              <details
                key={index}
                className="group rounded-2xl border border-brand-100 bg-brand-50/50 px-6 py-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-brand-900 [&::-webkit-details-marker]:hidden">
                  {question}
                  <ChevronDown
                    className="shrink-0 transition-transform group-open:rotate-180"
                    size={18}
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container pb-20">
        <div className="relative overflow-hidden rounded-[30px] bg-brand-700 text-white">
          {/* Subtle top highlight — no shapes/circles */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-white/25"
          />

          <div className="relative grid lg:grid-cols-[1.15fr_0.85fr]">
            {/* ==================================================
          LEFT CONTENT
      =================================================== */}
            <div className="px-7 py-11 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
              {/* Eyebrow */}
              <div className="flex items-center gap-4">
                <span className="h-px w-8 bg-brand-200" />

                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-100">
                  {content.enquiry.label}
                </p>
              </div>

              <h2 className="mt-6 max-w-xl text-3xl font-semibold leading-[1.14] tracking-[-0.03em] sm:text-4xl lg:text-[42px]">
                {content.enquiry.title}
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-white/75 sm:text-base">
                {content.enquiry.text}
              </p>

              {/* Small statement */}
              <div className="mt-9 flex max-w-lg items-start gap-4 border-t border-white/15 pt-6">
                <HeartHandshake
                  size={24}
                  strokeWidth={1.4}
                  className="mt-0.5 shrink-0 text-brand-100"
                  aria-hidden="true"
                />

                <div>
                  <p className="text-sm font-semibold text-white">
                    {content.enquiry.note_title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/60">
                    {content.enquiry.note_text}
                  </p>
                </div>
              </div>
            </div>

            {/* ==================================================
          RIGHT ACTION AREA
      =================================================== */}
            <div className="border-t border-white/15 bg-white/[0.045] px-7 py-10 sm:px-10 lg:flex lg:flex-col lg:justify-center lg:border-l lg:border-t-0 lg:px-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-100">
                {content.enquiry.action_label}
              </p>

              <h3 className="mt-4 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {content.enquiry.action_title}
              </h3>

              <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
                {content.enquiry.action_text}
              </p>

              {/* Actions */}
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to={content.enquiry.primary_url}
                  className="group inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                >
                  {content.enquiry.primary_label}
                  <ArrowUpRight
                    size={16}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  to={content.enquiry.secondary_url}
                  className="inline-flex items-center rounded-full border border-white/35 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/10"
                >
                  {content.enquiry.secondary_label}
                </Link>
              </div>

              {/* Bottom reassurance */}
              <p className="mt-7 border-t border-white/10 pt-5 text-xs leading-5 text-white/55">
                {content.enquiry.reassurance}
              </p>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
}
