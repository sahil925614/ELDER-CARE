import { useOutletContext } from "react-router-dom";
import { CmsLink } from "@/features/cms/CmsLink";
import { defaultHowItWorksSections, type HowItWorksPageContent, type HowItWorksImageKey } from "@/features/cms/howItWorksPage";
import "./HowItWorksPage.css";
import {
  ArrowUpRight,
  Search,
  MessageCircle,
  ClipboardCheck,
  HeartHandshake,
  Check,
} from "lucide-react";

import {
  ExtraHero,
  EditorialPhoto,
} from "./components/WebsiteExtras";

import { PageCta } from "./components/PageSections";

const stepIcons = [Search, MessageCircle, ClipboardCheck, HeartHandshake];

/* =========================================================
   HOW IT WORKS
========================================================= */

export function HowItWorksPage() {
  const { howItWorksPage } = useOutletContext<{ howItWorksPage: HowItWorksPageContent | null }>();
  const content = howItWorksPage?.sections ?? defaultHowItWorksSections;
  const images = howItWorksPage?.images;
  const steps = content.journey.items.map((item, index) => ({
    ...item, number: String(index + 1).padStart(2, '0'), icon: stepIcons[index],
  }));
  const preparationItems = content.preparation.items;
  return (
    <>
      

      {/* =====================================================
          EXISTING BANNER — UNCHANGED
      ===================================================== */}

      <ExtraHero
        label={content.banner.label}
        title={content.banner.title}
        text={content.banner.text}
        image={images?.banner}
        imageAlt={content.banner.image_alt}
      />

      {/* =====================================================
          INTRODUCTION
      ===================================================== */}

      <section className="py-16 sm:py-20">
        <div className="grid gap-8 border-b border-brand-100 pb-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="section-eyebrow">
              {content.introduction.label}
            </p>

            <h2 className="section-title max-w-lg">
              {content.introduction.title}
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-2xl text-base font-normal leading-8 text-slate-600">
              {content.introduction.text}
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          PROCESS JOURNEY
      ===================================================== */}

      <section className="pb-20 sm:pb-24">
        <div className="relative">
          {/* Vertical timeline — desktop only */}

          <div
            className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-brand-100 lg:block"
            aria-hidden="true"
          />

          <ol className="space-y-16 sm:space-y-20 lg:space-y-28">
            {steps.map(
              (
                {
                  number,
                  icon: Icon,
                  label,
                  title,
                  text,
                  points,
                  button_url,
                  button_label,
                  image_alt,
                },
                index,
              ) => {
                const imageOnLeft = index % 2 === 0;

                return (
                  <li
                    key={index}
                    className="relative"
                  >
                    {/* Timeline number */}

                    <div
                      className="
                        absolute left-1/2 top-1/2 z-10
                        hidden size-12
                        -translate-x-1/2 -translate-y-1/2
                        items-center justify-center
                        rounded-full
                        border border-brand-100
                        bg-white
                        text-xs font-semibold
                        tracking-[0.12em]
                        text-primary
                        lg:flex
                      "
                    >
                      {number}
                    </div>

                    <div className="grid items-center gap-9 lg:grid-cols-2 lg:gap-24">
                      {/* =====================================
                          IMAGE
                      ===================================== */}

                      <div
                        className={
                          imageOnLeft
                            ? "lg:order-1"
                            : "lg:order-2"
                        }
                      >
                        <div className="relative">
                          <div className="overflow-hidden rounded-[24px]">
                            <div className="relative aspect-[5/4] w-full">
                              <EditorialPhoto className="absolute inset-0 h-full w-full object-cover"
                                image={images?.[`step_${index + 1}` as HowItWorksImageKey]} imageAlt={image_alt} />
                            </div>
                          </div>

                          {/* Mobile step indicator */}

                          <div className="absolute left-5 top-5 flex items-center gap-3 rounded-full bg-white/95 px-4 py-2.5 shadow-sm lg:hidden">
                            <span className="text-xs font-semibold tracking-[0.12em] text-primary">
                              STEP {number}
                            </span>
                          </div>

                          {/* Image icon panel */}

                          <div className="journey-photo-label absolute bottom-0 right-0 flex items-center gap-3 bg-white px-5 py-4">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-primary">
                              <Icon
                                size={21}
                                strokeWidth={1.6}
                                aria-hidden="true"
                              />
                            </span>

                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                                Step {number}
                              </p>

                              <p className="mt-0.5 text-sm font-semibold text-brand-900">
                                {label}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* =====================================
                          CONTENT
                      ===================================== */}

                      <div
                        className={
                          imageOnLeft
                            ? "lg:order-2"
                            : "lg:order-1"
                        }
                      >
                        <div className="max-w-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                              {label}
                            </span>

                            <span className="h-px w-10 bg-brand-200" />
                          </div>

                          <h3 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-brand-900 sm:text-[34px]">
                            {title}
                          </h3>

                          <p className="mt-5 text-base font-normal leading-8 text-slate-600">
                            {text}
                          </p>

                          {/* Points */}

                          <ul className="mt-7 border-y border-brand-100">
                            {points.map((point, pointIndex) => (
                              <li
                                key={pointIndex}
                                className="flex items-center gap-3 border-b border-brand-100 py-3.5 text-sm font-normal text-slate-600 last:border-b-0"
                              >
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-primary">
                                  <Check
                                    size={13}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                  />
                                </span>

                                {point}
                              </li>
                            ))}
                          </ul>

                          <CmsLink
                            to={button_url}
                            className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-brand-900"
                          >
                            {button_label}

                            <ArrowUpRight
                              size={17}
                              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              aria-hidden="true"
                            />
                          </CmsLink>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              },
            )}
          </ol>
        </div>
      </section>

      {/* =====================================================
          BEFORE FIRST ENQUIRY
      ===================================================== */}

      <section className="border-y border-brand-100 py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          {/* LEFT */}

          <div>
            <p className="section-eyebrow">
              {content.preparation.label}
            </p>

            <h2 className="section-title max-w-md">
              {content.preparation.title}
            </h2>

            <p className="mt-5 max-w-md text-sm font-normal leading-7 text-slate-600">
              {content.preparation.text}
            </p>

            <CmsLink
              to={content.preparation.button_url}
              className="button-outline mt-7"
            >
              {content.preparation.button_label}

              <ArrowUpRight
                size={17}
                aria-hidden="true"
              />
            </CmsLink>
          </div>

          {/* RIGHT */}

          <div className="border-t border-brand-100">
            {preparationItems.map(
              ({ title, text }, index) => (
                <div
                  key={index}
                  className="grid gap-4 border-b border-brand-100 py-6 sm:grid-cols-[55px_190px_1fr] sm:items-start"
                >
                  <span className="text-xs font-semibold tracking-[0.12em] text-brand-300">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <h3 className="text-base font-semibold leading-6 text-brand-900">
                    {title}
                  </h3>

                  <p className="text-sm font-normal leading-7 text-slate-600">
                    {text}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          SMALL REASSURANCE SECTION
      ===================================================== */}

      <section className="py-16 sm:py-20">
        <div className="journey-reassurance grid items-center gap-10 bg-brand-50 px-7 py-9 sm:px-10 sm:py-11 lg:grid-cols-[1fr_auto] lg:px-12">
          <div className="flex items-center gap-5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-primary">
              <HeartHandshake
                size={24}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {content.reassurance.label}
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-900">
                {content.reassurance.title}
              </h2>

              <p className="mt-2 max-w-2xl text-sm font-normal leading-7 text-slate-600">
                {content.reassurance.text}
              </p>
            </div>
          </div>

          <CmsLink
            to={content.reassurance.button_url}
            className="button-primary shrink-0"
          >
            {content.reassurance.button_label}

            <ArrowUpRight
              size={17}
              aria-hidden="true"
            />
          </CmsLink>
        </div>
      </section>

      <PageCta content={content.newsletter} />
    </>
  );
}
