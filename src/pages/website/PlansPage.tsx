import { ContentImage } from "./components/ContentImage";
import { SiteLoader } from "@/components/common/SiteLoader";
import bannerImage from "@/assets/careplan.webp";

import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CmsLink } from '@/features/cms/CmsLink';
import { defaultPlansSections, usePlansCatalogue, type PlansPageContent } from '@/features/cms/plansPage';
import { getCurrencyPreference } from "@/features/plans/currencyPreference";

import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  ListChecks,
  MessageCircle,
  ShieldCheck,
  RotateCw,
} from "lucide-react";

import { PageHero, PageCta, PageFaq } from "./components/PageSections";
import { MembershipPlanCard } from "./components/MembershipPlanCard";
import { periodLabel } from "@/features/plans/pricing";
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

          <div className="lg:flex lg:max-w-sm lg:flex-col lg:items-end lg:justify-self-end lg:text-right">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {sections.introduction.duration_label}
            </p>

            <div
              role="group"
              aria-label="Preferred subscription duration"
              className="membership-period"
            >
              {durations.map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={duration === value}
                  onClick={() => setDuration(value)}
                >
                  {periodLabel(value)}
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              {sections.introduction.help_text}
            </p>
          </div>
        </div>

        {loading && <SiteLoader label={sections.catalogue.loading_text} className="mt-10" />}

        {!loading && (error || !plans.length) && (
          <div className="mt-10 flex items-center gap-3 rounded-[24px] border border-brand-100 bg-white p-7 text-sm text-slate-500" role="status">
            <span>{error ? sections.catalogue.error_text : sections.catalogue.empty_text}</span>
            {error && <button type="button" onClick={retry} title="Retry loading plans" aria-label="Retry loading plans" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-brand-200 bg-white text-primary"><RotateCw size={18} aria-hidden="true" /></button>}
          </div>
        )}

        <div
          className="membership-grid mt-12"
          data-count={plans.length}
          role="region"
          aria-label="Care plans"
        >
          {plans.map((plan) => (
            <MembershipPlanCard
              key={plan.id}
              plan={plan}
              price={plan.prices.find((price) => price.duration_months === duration) ?? plan.prices[0]}
              popularLabel={sections.catalogue.popular_label}
              chooseLabel={sections.catalogue.choose_label}
            />
          ))}
        </div>

        {currency !== "INR" && plans.length > 0 && (
          <p className="mt-4 text-center text-xs leading-5 text-slate-500">{sections.catalogue.international_text}</p>
        )}

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
