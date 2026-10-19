import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";

import bannerImage from "@/assets/Medicine delivery.jpg";

import { careCategories } from "./components/careCategories";
import { ContentImage } from "./components/ContentImage";
import {
  PageHero,
  PageFaq,
} from "./components/PageSections";

export function CareCategoryPage({
  category,
}: {
  category: (typeof careCategories)[number]["slug"];
}) {
  const details = careCategories.find(
    (item) => item.slug === category,
  )!;

  const enquiry =
    "/enquiry?interest=" +
    encodeURIComponent(details.topic);

  const faqs: [string, string][] =
    category === "doctors"
      ? [
          [
            "Can I choose a particular doctor?",
            "Individual profiles are not published yet. Once available, discuss qualifications, area of practice, and schedule before choosing.",
          ],
          [
            "Can a doctor visit at home?",
            "Home visits depend on your location and professional availability. Confirm the format and applicable charges when enquiring.",
          ],
        ]
      : category === "physiotherapists"
        ? [
            [
              "How many sessions will be needed?",
              "Frequency and duration depend on the professional assessment and agreed goals. No fixed programme is promised before that conversation.",
            ],
            [
              "Can sessions be arranged at home?",
              "Availability varies by location and professional. Explain your preferred setting and confirm the arrangements before booking.",
            ],
          ]
        : [
            [
              "Can I arrange regular nursing visits?",
              "Discuss available schedules and continuity of support. Regular visits depend on availability and the agreed scope of care.",
            ],
            [
              "Is nursing included in a plan?",
              "Inclusions vary by subscription. Check plan details and any separately charged services before booking.",
            ],
          ];

  const areaDescriptions = [
    "Share what matters most to your loved one and the questions you would like to explore.",
    "Discuss available options around location, schedule, preferences, and individual needs.",
    "Understand the practical next steps before any care arrangement is confirmed.",
  ];

  return (
    <>
      {/* =====================================================
          HERO — KEEP SHARED BANNER UNCHANGED
      ===================================================== */}

      <PageHero
        label={details.label}
        title={details.title}
        text={details.intro}
        image={bannerImage}
        imageAlt="Care and support for older people"
      >
        <Link
          to={enquiry}
          className="button-primary"
        >
          Enquire about care
          <ArrowUpRight
            size={18}
            aria-hidden="true"
          />
        </Link>

        <Link
          to="/doctors"
          className="button-outline"
        >
          Explore all care experts
        </Link>
      </PageHero>

      {/* =====================================================
          INTRODUCTION
      ===================================================== */}

      <section className="py-14 sm:py-20">
        <Link
          to="/doctors"
          className="text-link mb-9 sm:mb-12"
        >
          <ArrowLeft
            size={16}
            aria-hidden="true"
          />
          Back to Care Experts
        </Link>

        <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 xl:gap-20">
          {/* IMAGE */}

          <div className="relative">
            <div className="overflow-hidden rounded-[26px]">
              <ContentImage
                name={details.label}
              />
            </div>

            <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px w-8 bg-brand-200" />
              Personal support, thoughtfully arranged
            </div>
          </div>

          {/* CONTENT */}

          <div>
            <p className="section-eyebrow">
              Understanding your needs
            </p>

            <h2 className="section-title max-w-xl">
              Care starts with understanding
              the person.
            </h2>

            <p className="mt-6 max-w-xl text-[15px] leading-8 text-slate-600">
              {details.text}
            </p>

            <div className="mt-8 border-l-2 border-brand-200 pl-5">
              <p className="max-w-lg text-sm leading-7 text-slate-500">
                Every enquiry begins with a
                conversation about the person,
                their circumstances, and the
                support your family is looking
                for.
              </p>
            </div>

            <Link
              to={enquiry}
              className="group mt-8 inline-flex items-center gap-3 text-sm font-semibold text-primary"
            >
              Discuss your requirements

              <span className="flex size-8 items-center justify-center rounded-full border border-brand-100 transition-colors group-hover:bg-brand-50">
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          AREAS OF SUPPORT
      ===================================================== */}

      <section className="border-y border-brand-100 py-14 sm:py-18">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
          {/* SECTION INTRO */}

          <div>
            <p className="section-eyebrow">
              Explore the support
            </p>

            <h2 className="section-title max-w-sm">
              What would you like to discuss?
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-500">
              Start with the areas most relevant
              to your family. We can use these
              topics to guide the first
              conversation.
            </p>
          </div>

          {/* SUPPORT LIST */}

          <div className="border-t border-brand-100">
            {details.areas.map(
              (title, index) => (
                <article
                  key={title}
                  className="grid gap-4 border-b border-brand-100 py-6 sm:grid-cols-[52px_0.72fr_1.28fr] sm:items-start sm:gap-5 sm:py-7"
                >
                  <span className="text-xs font-semibold tracking-[0.12em] text-primary">
                    0{index + 1}
                  </span>

                  <h3 className="text-lg font-semibold leading-6 text-brand-900">
                    {title}
                  </h3>

                  <p className="text-sm leading-7 text-slate-500">
                    {areaDescriptions[index] ??
                      areaDescriptions[
                        areaDescriptions.length -
                          1
                      ]}
                  </p>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          PREPARE FOR ENQUIRY
      ===================================================== */}

      <section className="py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          {/* HEADING */}

          <div>
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-primary">
              <ClipboardCheck
                size={21}
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </span>

            <p className="section-eyebrow mt-6">
              Before you enquire
            </p>

            <h2 className="section-title max-w-sm">
              A few details make a helpful
              start.
            </h2>
          </div>

          {/* CHECKLIST */}

          <div>
            <div className="border-t border-brand-100">
              {details.prepare.map(
                (text, index) => (
                  <div
                    key={text}
                    className="flex items-start gap-4 border-b border-brand-100 py-5 sm:gap-5 sm:py-6"
                  >
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-primary">
                      <Check
                        size={14}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </span>

                    <div className="flex min-w-0 flex-1 gap-4">
                      <p className="flex-1 text-sm leading-7 text-slate-600">
                        {text}
                      </p>

                      <span className="hidden text-[10px] font-semibold tracking-[0.12em] text-slate-300 sm:block">
                        0{index + 1}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>

            <p className="mt-5 max-w-2xl text-xs leading-6 text-slate-400">
              Keep detailed medical information
              for the agreed care process. An
              enquiry does not confirm an
              appointment.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          BOOKING GUIDANCE
      ===================================================== */}

      <section className="mb-16 overflow-hidden rounded-[26px] bg-primary text-white sm:mb-20">
        <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
          {/* LABEL */}

          <div className="border-b border-white/15 px-6 py-7 sm:px-9 lg:border-b-0 lg:border-r lg:px-10 lg:py-10">
            <ShieldCheck
              size={25}
              strokeWidth={1.5}
              className="text-brand-100"
              aria-hidden="true"
            />

            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.17em] text-brand-100">
              Before arranging care
            </p>
          </div>

          {/* CONTENT */}

          <div className="px-6 py-7 sm:px-9 lg:px-10 lg:py-10">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Confirm the details before
                  you book.
                </h2>

                <p className="mt-4 text-sm leading-7 text-white/75">
                  Check professional
                  credentials, availability,
                  location, fees, and service
                  inclusions. Individual
                  professional profiles are
                  still being prepared.
                </p>
              </div>

              <Link
                to={enquiry}
                className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-brand-50"
              >
                Make an enquiry

                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FAQ
      ===================================================== */}

      <PageFaq items={faqs} />

      {/* =====================================================
          OTHER PROFESSIONALS
      ===================================================== */}

      <section className="mb-10 border-t border-brand-100 pt-12 sm:pt-14">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12">
          <div>
            <p className="section-eyebrow">
              Continue exploring
            </p>

            <h2 className="section-title max-w-sm">
              Other care professionals
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-500">
              Explore another area of support
              to understand which type of care
              may suit your family's needs.
            </p>
          </div>

          <div className="border-t border-brand-100">
            {careCategories
              .filter(
                (item) =>
                  item.slug !== category,
              )
              .map((item) => (
                <Link
                  key={item.slug}
                  to={
                    "/doctors/" +
                    item.slug
                  }
                  className="group flex items-center justify-between gap-6 border-b border-brand-100 py-6 transition-colors hover:bg-brand-50/35 sm:px-3"
                >
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                      Care professional
                    </p>

                    <h3 className="mt-1.5 text-lg font-semibold text-brand-900 transition-colors group-hover:text-primary">
                      {item.label}
                    </h3>
                  </div>

                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-brand-100 text-primary transition-colors group-hover:bg-brand-100">
                    <ArrowUpRight
                      size={17}
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}