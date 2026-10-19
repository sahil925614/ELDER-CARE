import { ContentImage } from "./components/ContentImage";
import bannerImage from "@/assets/careplan.webp";

import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { CmsLink } from '@/features/cms/CmsLink';
import { defaultPlansSections, usePlansCatalogue, type PlansPageContent } from '@/features/cms/plansPage';
import { getCurrencyPreference } from "@/features/plans/currencyPreference";

import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  HeartHandshake,
  ListChecks,
  MessageCircle,
  ShieldCheck,
  RotateCw,
} from "lucide-react";

import { PageHero, PageCta, PageFaq } from "./components/PageSections";
import './PlansPage.css';

export function PlansPage() {
  const { plansPage } = useOutletContext<{ plansPage: PlansPageContent | null }>();
  const sections = plansPage?.sections ?? defaultPlansSections;
  const [preferredDuration, setDuration] = useState<number | null>(null);
  const [currency, setCurrency] = useState(() => getCurrencyPreference());
  const { plans, loading, error, retry } = usePlansCatalogue(currency);

  useEffect(() => {
    const syncCurrency = () => setCurrency(getCurrencyPreference());
    window.addEventListener("elder-care-currency-changed", syncCurrency);
    window.addEventListener('storage', syncCurrency);
    window.addEventListener('focus', syncCurrency);
    return () => {
      window.removeEventListener("elder-care-currency-changed", syncCurrency);
      window.removeEventListener('storage', syncCurrency);
      window.removeEventListener('focus', syncCurrency);
    };
  }, []);
  const durations = Array.from(new Set(plans.flatMap(plan => plan.prices.map(price => price.duration_months)))).sort((a, b) => a - b);
  const duration = preferredDuration !== null && durations.includes(preferredDuration) ? preferredDuration : durations[0] ?? null;

  return (
    <>
      

      {/* =====================================================
          SHARED BANNER — KEEP UNCHANGED
      ===================================================== */}

      <PageHero
        image={plansPage?.images.banner || bannerImage}
        imageFallback={bannerImage}
        imageAlt={sections.banner.image_alt}
        label={sections.banner.label}
        title={sections.banner.title}
        text={sections.banner.text}
      >
        <a href={sections.banner.button_url} className="button-primary">
          {sections.banner.button_label}
          <ArrowUpRight size={18} />
        </a>
      </PageHero>

      {/* =====================================================
          PLAN INTRO + DURATION
      ===================================================== */}

      <section id="care-plans" className="scroll-mt-28 py-16 sm:py-24" aria-busy={loading}>
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:gap-20">
          <div className="max-w-2xl">
            <p className="section-eyebrow">{sections.introduction.label}</p>

            <h2 className="section-title">
              {sections.introduction.title}
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-slate-600">
              {sections.introduction.text}
            </p>
          </div>

          {/* DURATION SELECTOR */}

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {sections.introduction.duration_label}
            </p>

            <div
              role="group"
              aria-label="Preferred subscription duration"
              className="flex flex-wrap gap-2"
            >
              {durations.map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={duration === value}
                  onClick={() => setDuration(value)}
                  className={
                    "rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors " +
                    (duration === value
                      ? "border-primary bg-primary text-white"
                      : "border-brand-100 bg-white text-brand-900 hover:bg-brand-50")
                  }
                >
                  {value} {sections.introduction.months_label}
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              {sections.introduction.help_text}
            </p>
          </div>
        </div>

        {/* =================================================
            PLANS — NEW DESIGN
        ================================================= */}

        {/* =================================================
    CARE PLAN PACKAGES — COMPACT VERSION
================================================= */}

        {loading && (
          <div className="mt-10 rounded-[24px] border border-brand-100 bg-white p-7 text-sm text-slate-500">
            <span role="status">{sections.catalogue.loading_text}</span>
          </div>
        )}

        {!loading && (error || !plans.length) && (
          <div className="mt-10 flex items-center gap-3 rounded-[24px] border border-brand-100 bg-white p-7 text-sm text-slate-500" role="status">
            <span>{error ? sections.catalogue.error_text : sections.catalogue.empty_text}</span>
            {error && <button type="button" onClick={retry} title="Retry loading plans" aria-label="Retry loading plans" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-brand-200 bg-white text-primary"><RotateCw size={18} aria-hidden="true" /></button>}
          </div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {plans.map((plan, index) => {
            const isPopular = plan.is_featured || index === 1;
            const selectedPrice =
              plan.prices.find((price) => price.duration_months === duration) ??
              plan.prices[0];
            const features = plan.features.map((feature) => feature.title).slice(0, 4);

            return (
              <article
                key={plan.id}
                className={
                  "relative flex flex-col overflow-hidden rounded-[28px] border transition-all duration-300 " +
                  (isPopular
                    ? "border-primary bg-primary text-white shadow-[0_18px_45px_rgba(20,127,121,0.14)]"
                    : "border-brand-100 bg-white text-brand-900 hover:border-brand-200 hover:shadow-[0_16px_40px_rgba(20,127,121,0.06)]")
                }
              >
                {/* POPULAR LABEL */}

                {isPopular && (
                  <div className="border-b border-white/15 bg-white/[0.08] px-7 py-2.5 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                      {sections.catalogue.popular_label}
                    </p>
                  </div>
                )}

                {/* PACKAGE HEADER */}

                <div className="px-7 pb-5 pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        className={
                          "text-[11px] font-semibold uppercase tracking-[0.17em] " +
                          (isPopular ? "text-brand-100" : "text-primary")
                        }
                      >
                        {plan.label || plan.code}
                      </p>

                      <h3 className="mt-2 text-3xl font-semibold tracking-[-0.025em]">
                        {plan.name}
                      </h3>
                    </div>

                    <span
                      className={
                        "flex size-11 shrink-0 items-center justify-center rounded-2xl " +
                        (isPopular
                          ? "bg-white/10 text-white"
                          : "bg-brand-50 text-primary")
                      }
                    >
                      <HeartHandshake
                        size={23}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </span>
                  </div>

                  <p
                    className={
                      "mt-4 text-sm leading-6 " +
                      (isPopular ? "text-white/80" : "text-slate-600")
                    }
                  >
                    {plan.short_description || plan.description}
                  </p>
                </div>

                {/* DIVIDER */}

                <div
                  className={
                    "mx-7 border-t " +
                    (isPopular ? "border-white/20" : "border-brand-100")
                  }
                />

                {/* PACKAGE DETAILS */}

                <div className="flex flex-1 flex-col px-7 pb-6 pt-5">
                  <div
                    className={
                      "rounded-2xl border px-4 py-3.5 " +
                      (isPopular
                        ? "border-white/20 bg-white/10"
                        : "border-brand-100 bg-brand-50/70")
                    }
                  >
                    <p
                      className={
                        "text-[10px] font-semibold uppercase tracking-[0.16em] " +
                        (isPopular ? "text-white/60" : "text-slate-400")
                      }
                    >
                      {sections.catalogue.price_label}
                    </p>
                    <p className="mt-1.5 text-3xl font-semibold tracking-tight sm:text-[34px]">
                      {selectedPrice?.formatted_price || sections.catalogue.price_pending_label}
                    </p>
                    <p
                      className={
                        "mt-1 text-[11px] leading-5 " +
                        (isPopular ? "text-white/70" : "text-slate-500")
                      }
                    >
                      {selectedPrice?.label || sections.catalogue.select_duration_label}
                      {selectedPrice?.exchange_source && selectedPrice.currency !== "INR"
                        ? " \u2022 " + sections.catalogue.converted_rate_label
                        : ""}
                    </p>
                  </div>

                  <p
                    className={
                      "mt-5 text-[11px] font-semibold uppercase tracking-[0.15em] " +
                      (isPopular ? "text-white/65" : "text-slate-400")
                    }
                  >
                    {sections.catalogue.services_label}
                  </p>

                  <ul className="mt-3 space-y-2.5">
                    {plan.services.map((service) => (
                      <li
                        key={service.id || service.name}
                        className={
                          "rounded-2xl border px-3 py-2.5 " +
                          (isPopular
                            ? "border-white/15 bg-white/[0.06] text-white/90"
                            : "border-brand-100 bg-white text-slate-600")
                        }
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={
                              "mt-px flex size-6 shrink-0 items-center justify-center rounded-full " +
                              (isPopular ? "bg-white/15" : "bg-brand-50")
                            }
                          >
                            <Check
                              size={12}
                              strokeWidth={2.2}
                              className={isPopular ? "text-white" : "text-primary"}
                              aria-hidden="true"
                            />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold leading-5">
                              {service.name}
                            </p>
                            <p
                              className={
                                "mt-1 text-[11px] leading-4 " +
                                (isPopular ? "text-white/65" : "text-slate-400")
                              }
                            >
                              {service.is_unlimited
                                ? sections.catalogue.unlimited_label
                                : (service.quantity ?? 0) + " " + sections.catalogue.included_label}{" "}
                              {service.usage_period
                                ? service.usage_period.replace(/_/g, " ")
                                : ""}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {(plan.addon_services ?? []).length > 0 && <div className="mt-4 border-t border-current/20 pt-4"><p className="text-xs font-semibold">{sections.catalogue.addons_label}</p><ul className="mt-2 space-y-1 text-xs">{plan.addon_services.map((service) => <li key={service.id}>{service.name} - {service.pricing_type === 'custom' ? sections.catalogue.quote_label : service.formatted_price}</li>)}</ul></div>}
                  {features.length > 0 && (
                    <div
                      className={
                        "mt-4 border-t pt-4 " +
                        (isPopular ? "border-white/20" : "border-brand-100")
                      }
                    >
                      <p
                        className={
                          "text-[10px] font-semibold uppercase tracking-[0.14em] " +
                          (isPopular ? "text-white/55" : "text-slate-400")
                        }
                      >
                        {sections.catalogue.benefits_label}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {features.map((feature) => (
                          <span
                            key={feature}
                            className={
                              "rounded-full px-3 py-1.5 text-[11px] font-semibold " +
                              (isPopular
                                ? "bg-white/10 text-white/80"
                                : "bg-brand-50 text-primary")
                            }
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* DURATION */}

                  <div
                    className={
                      "mt-4 border-y py-3 " +
                      (isPopular ? "border-white/20" : "border-brand-100")
                    }
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p
                          className={
                            "text-[10px] font-semibold uppercase tracking-[0.14em] " +
                            (isPopular ? "text-white/60" : "text-slate-400")
                          }
                        >
                          {sections.catalogue.duration_label}
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {selectedPrice?.label || sections.catalogue.duration_pending_label}
                        </p>
                      </div>

                      <CalendarDays
                        size={19}
                        strokeWidth={1.5}
                        className={
                          isPopular ? "text-brand-100" : "text-primary"
                        }
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* NOTE */}

                  {currency !== "INR" && (
                    <p
                      className={
                        "mt-4 text-[11px] leading-5 " +
                        (isPopular ? "text-white/65" : "text-slate-500")
                      }
                    >
                      {sections.catalogue.international_text}
                    </p>
                  )}

                  {/* CTA */}

                  {selectedPrice ? <Link
                    to={
                      "/customer/checkout?plan=" +
                      encodeURIComponent(plan.slug) +
                      (selectedPrice ? "&price=" + selectedPrice.id : "")
                    }
                    className={
                      "group mt-4 flex items-center justify-between rounded-full px-5 py-3 text-sm font-semibold transition-colors " +
                      (isPopular
                        ? "bg-white text-primary hover:bg-brand-50"
                        : "bg-primary text-white hover:bg-brand-900")
                    }
                  >
                    {sections.catalogue.choose_label} {plan.name}
                    <ArrowUpRight
                      size={16}
                      className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link> : <button type="button" disabled className="mt-4 flex items-center justify-between rounded-full border border-current/20 px-5 py-3 text-sm font-semibold opacity-60">{sections.catalogue.price_pending_label}</button>}
                </div>
              </article>
            );
          })}
        </div>

        {/* PACKAGE NOTE */}

        <div className="mt-5 flex items-center justify-center gap-3">
          <MessageCircle
            size={15}
            className="mt-0.5 shrink-0 text-primary"
            aria-hidden="true"
          />

          <p className="max-w-2xl text-start text-xs leading-5 text-slate-500">
            {sections.catalogue.text}
          </p>
        </div>
      </section>

      {/* =====================================================
          CARE PLANNING STORY
      ===================================================== */}

      <section className="pb-16 sm:pb-24">
        <div className="overflow-hidden rounded-[28px] bg-brand-50">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            {/* IMAGE */}

            <div className="plans-story-photo relative grid min-h-[340px] items-end p-5 sm:px-7 lg:min-h-[520px]">
              <ContentImage
                name="Care planning"
                key={plansPage?.images.story || 'original'}
                src={plansPage?.images.story}
                alt={sections.story.image_alt}
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="plans-story-caption relative z-10 bg-white/95 p-5 shadow-sm backdrop-blur-sm sm:max-w-sm">
                <div className="flex items-center gap-4">
                  <HeartHandshake
                    size={27}
                    strokeWidth={1.5}
                    className="shrink-0 text-primary"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="font-semibold text-brand-900">
                      {sections.story.photo_title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {sections.story.photo_text}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENT */}

            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
              <p className="section-eyebrow">{sections.story.label}</p>

              <h2 className="section-title max-w-xl">
                {sections.story.title}
              </h2>

              <p className="mt-6 max-w-xl leading-8 text-slate-600">
                {sections.story.text}
              </p>

              {/* QUESTIONS */}

              <div className="mt-8 border-y border-brand-100">
                {sections.story.questions.map((question, index) => (
                  <div
                    key={index}
                    className={
                      "flex items-center gap-4 py-4 " +
                      (index !== 2 ? "border-b border-brand-100" : "")
                    }
                  >
                    <span className="shrink-0 text-xs font-semibold text-primary">
                      0{index + 1}
                    </span>

                    <p className="text-sm font-medium text-brand-900">
                      {question}
                    </p>
                  </div>
                ))}
              </div>

              <CmsLink
                to={sections.story.button_url}
                className="text-link mt-7"
              >
                {sections.story.button_label}
                <ArrowUpRight size={17} aria-hidden="true" />
              </CmsLink>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          BEFORE YOU CHOOSE
      ===================================================== */}

      <section className="border-y border-brand-100 py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          {/* LEFT */}

          <div>
            <p className="section-eyebrow">{sections.checklist.label}</p>

            <h2 className="section-title">{sections.checklist.title}</h2>

            <p className="mt-5 max-w-md leading-7 text-slate-600">
              {sections.checklist.text}
            </p>

            <CmsLink to={sections.checklist.button_url} className="text-link mt-7">
              {sections.checklist.button_label}
              <ArrowUpRight size={17} aria-hidden="true" />
            </CmsLink>
          </div>

          {/* CHECKLIST */}

          <div className="border-t border-brand-100">
            {sections.checklist.items.map(({ title, text }, index) => {
              const Icon = [ListChecks, CalendarDays, MessageCircle][index];
              return (
              <div
                key={index}
                className="grid gap-4 border-b border-brand-100 py-7 sm:grid-cols-[50px_55px_0.7fr_1fr] sm:items-start sm:gap-5"
              >
                <Icon
                  size={22}
                  strokeWidth={1.5}
                  className="text-primary"
                  aria-hidden="true"
                />

                <span className="text-xs font-semibold tracking-wider text-slate-400">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <h3 className="font-semibold text-brand-900">{title}</h3>

                <p className="text-sm leading-7 text-slate-600">{text}</p>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* =====================================================
          SMALL REASSURANCE STRIP
      ===================================================== */}

      <section className="py-12">
        <div className="grid gap-5 border-b border-brand-100 pb-12 sm:grid-cols-3">
          <div className="flex items-start gap-4">
            <CheckCircle2
              size={22}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0 text-primary"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-brand-900">
                {sections.reassurance.items[0].title}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {sections.reassurance.items[0].text}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MessageCircle
              size={22}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0 text-primary"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-brand-900">
                {sections.reassurance.items[1].title}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {sections.reassurance.items[1].text}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <ShieldCheck
              size={22}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0 text-primary"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-brand-900">
                {sections.reassurance.items[2].title}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {sections.reassurance.items[2].text}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FAQ
      ===================================================== */}

      <PageFaq content={sections.faq} items={sections.faq.items.map(item => [item.question, item.answer] as const)} />

      <PageCta content={sections.newsletter} />
    </>
  );
}
