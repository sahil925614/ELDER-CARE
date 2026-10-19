import { Link, useOutletContext } from "react-router-dom";
import type { ReactNode, SyntheticEvent } from "react";
import { defaultAboutSections, type AboutPageContent } from "@/features/cms/aboutPage";
import "./AboutPage.css";
import {
  ArrowUpRight,
  Check,
  Heart,
  MessageCircle,
  Sprout,
  Users,
} from "lucide-react";
import { PageHero } from "./components/PageSections";
import careImage from "@/assets/care-hero.png";

import aboutPurpose from "@/assets/about-purpose.jpg";
import aboutFamily from "@/assets/about-family.jpg";
import aboutConnection from "@/assets/about-connection.jpg";
import aboutSupport from "@/assets/about-support.jpg";

const valueIcons = [Heart, Sprout, Users, MessageCircle];

function AboutLink({ to, children, className }: { to: string; children: ReactNode; className: string }) {
  return to.startsWith('/') ? <Link to={to} className={className}>{children}</Link> : <a href={to} className={className}>{children}</a>;
}

function fallbackImage(event: SyntheticEvent<HTMLImageElement>, fallback: string) {
  if (event.currentTarget.src !== new URL(fallback, window.location.href).href) event.currentTarget.src = fallback;
}

export function AboutPage() {
  const { aboutPage } = useOutletContext<{ aboutPage: AboutPageContent | null }>();
  const content = aboutPage?.sections ?? defaultAboutSections;
  const images = aboutPage?.images;
  const values = content.values.items.map((item, index) => ({ ...item, icon: valueIcons[index] }));
  const approach = content.approach.items;
  return (
    <>
      

      

       <PageHero
        animation="banner-soft-focus"
        label={content.banner.label}
        title={content.banner.title}
        text={content.banner.text}
        image={images?.banner || careImage}
        imageFallback={careImage}
        imageAlt={content.banner.image_alt}
      >
        <AboutLink to={content.banner.button_url} className="button-primary">
          {content.banner.button_label}{" "}
          <ArrowUpRight size={18} aria-hidden="true" />
        </AboutLink>
      </PageHero>

      {/* =========================================================
          BREADCRUMB
      ========================================================= */}

      

      {/* =========================================================
          HERO
      ========================================================= */}

      

      {/* =========================================================
          PURPOSE — EDITORIAL IMAGE LAYOUT
      ========================================================= */}

      <section
        aria-labelledby="purpose-heading"
        className="section-space max-sm:py-10"
      >
        <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          {/* IMAGE COMPOSITION */}
          <div className="relative sm:pb-12 sm:pr-14">
            <img
              src={images?.purpose || aboutPurpose}
              onError={(event) => fallbackImage(event, aboutPurpose)}
              loading="lazy"
              alt={content.purpose.image_alt}
              className="aspect-[4/3] w-full rounded-[24px] object-cover sm:aspect-[4/5] sm:w-[88%]"
            />

            <img
              src={images?.connection || aboutConnection}
              onError={(event) => fallbackImage(event, aboutConnection)}
              loading="lazy"
              alt={content.purpose.connection_image_alt}
              className="absolute bottom-0 right-0 hidden aspect-[4/3] w-[48%] border-[8px] border-white object-cover sm:block"
            />

            <div className="relative mx-4 -mt-6 max-w-[calc(100%-2.5rem)] rounded-xl bg-white px-5 py-4 shadow-lg shadow-brand-900/5 sm:absolute sm:bottom-7 sm:left-5 sm:mx-0 sm:mt-0 sm:rounded-none">
              <p className="text-xs font-semibold uppercase tracking-[0.17em] text-primary">
                {content.purpose.badge_label}
              </p>

              <p className="mt-1 text-sm font-semibold text-brand-900">
                {content.purpose.badge_text}
              </p>
            </div>
          </div>

          {/* CONTENT */}
          <div>
            <p className="section-eyebrow">{content.purpose.label}</p>

            <h2 id="purpose-heading" className="section-title max-w-xl">
              {content.purpose.heading_line_1}
              <br />
              {content.purpose.heading_line_2}
            </h2>

            <div className="mt-6 max-w-xl space-y-5 leading-8 text-slate-600">
              <p>
                {content.purpose.paragraph_1}
              </p>

              <p>
                {content.purpose.paragraph_2}
              </p>
            </div>

            <div className="mt-8 border-l-2 border-primary pl-6">
              <p className="text-lg font-medium leading-8 text-brand-900">
                {content.purpose.quote}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          VALUES — NOT FOUR LARGE CARDS
      ========================================================= */}

      {/* =========================================================
    VALUES — FULL WIDTH / EDITORIAL
========================================================= */}

<section
  aria-labelledby="values-heading"
  className="
    relative inner-page-full-width
    border-y border-brand-100
    bg-brand-50
  "
>
  <div className="page-container py-16 sm:py-20 lg:py-24">
    <div
      className="
        grid gap-12
        lg:grid-cols-[0.82fr_1.18fr]
        lg:gap-16
        xl:gap-20
      "
    >
      {/* =====================================================
          LEFT CONTENT
      ===================================================== */}

      <div className="flex flex-col lg:min-h-[430px]">
        <div>
          <p className="section-eyebrow">
            {content.values.label}
          </p>

          <h2
            id="values-heading"
            className="section-title max-w-md"
          >
            {content.values.title}
          </h2>

          <p className="mt-5 max-w-md leading-7 text-slate-600">
            {content.values.text}
          </p>
        </div>


        {/* QUIET BRAND STATEMENT */}

        <div
          className="
            mt-10
            border-l-2 border-primary
            pl-5
            lg:mt-auto
            lg:max-w-sm
          "
        >
          <p
            className="
              text-lg font-medium
              leading-8 tracking-tight
              text-brand-900
            "
          >
            {content.values.statement}
          </p>

          <p
            className="
              mt-3
              text-xs font-semibold
              uppercase tracking-[0.16em]
              text-primary
            "
          >
            {content.values.statement_label}
          </p>
        </div>
      </div>


      {/* =====================================================
          VALUES GRID
      ===================================================== */}

      <div
        className="
          grid
          border-t border-brand-200
          sm:grid-cols-2
        "
      >
        {values.map(
          ({ icon: Icon, title, text }, index) => (
            <article
              key={index}
              className={
                `
                  group
                  flex min-h-[210px]
                  flex-col
                  border-b border-brand-200
                  py-7
                  sm:p-8
                  lg:min-h-[215px]
                ` +
                (index % 2 === 0
                  ? " sm:border-r"
                  : "")
              }
            >
              {/* ICON */}

              <Icon
                size={25}
                strokeWidth={1.4}
                className="
                  text-primary
                  transition-transform
                  duration-300
                  group-hover:-translate-y-1
                "
                aria-hidden="true"
              />


              {/* CONTENT */}

              <div className="mt-auto pt-8">
                <h3
                  className="
                    text-lg font-semibold
                    text-brand-900
                  "
                >
                  {title}
                </h3>

                <p
                  className="
                    mt-3
                    max-w-xs
                    text-sm leading-7
                    text-slate-600
                  "
                >
                  {text}
                </p>
              </div>
            </article>
          ),
        )}
      </div>
    </div>
  </div>
</section>

      {/* =========================================================
          WHOLE PERSON — LARGE PHOTO + CONTENT
      ========================================================= */}

      <section
        aria-labelledby="family-heading"
        className="section-space max-sm:py-10"
      >
        <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          {/* CONTENT */}
          <div className="order-2 lg:order-1">
            <p className="section-eyebrow">{content.family.label}</p>

            <h2
              id="family-heading"
              className="section-title max-w-xl"
            >
              {content.family.title}
            </h2>

            <p className="mt-6 max-w-xl leading-8 text-slate-600">
              {content.family.text}
            </p>

            <ul className="mt-8 max-w-lg divide-y divide-brand-100 border-y border-brand-100">
              {content.family.items.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-4 py-4 text-sm leading-6 text-slate-600"
                >
                  <Check
                    size={18}
                    strokeWidth={1.8}
                    className="mt-0.5 shrink-0 text-primary"
                    aria-hidden="true"
                  />

                  {item}
                </li>
              ))}
            </ul>

            <AboutLink to={content.family.button_url} className="text-link mt-8">
              {content.family.button_label}

              <ArrowUpRight size={17} aria-hidden="true" />
            </AboutLink>
          </div>

          {/* IMAGE */}
          <div className="order-1 relative lg:order-2">
            <img
              src={images?.family || aboutFamily}
              onError={(event) => fallbackImage(event, aboutFamily)}
              loading="lazy"
              alt={content.family.image_alt}
              className="aspect-[5/4] w-full rounded-[26px] object-cover"
            />

            <div className="relative mt-4 rounded-xl bg-white px-1 py-2 sm:absolute sm:bottom-0 sm:left-0 sm:mt-0 sm:max-w-sm sm:rounded-none sm:px-7 sm:py-5">
              <p className="text-lg font-medium leading-7 tracking-tight text-brand-900 sm:text-xl">
                {content.family.caption_title}
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {content.family.caption_text}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          HUMAN CONNECTION — FULL WIDTH PHOTO BREAK
      ========================================================= */}

      <section className="pb-16 sm:pb-24">
        <div className="relative min-h-[400px] overflow-hidden rounded-[28px] sm:min-h-[480px]">
          <img
            src={images?.support || aboutSupport}
            onError={(event) => fallbackImage(event, aboutSupport)}
            loading="lazy"
            alt={content.connection.image_alt}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-brand-900/85 via-brand-900/45 to-transparent" />

          <div className="relative flex min-h-[400px] items-end p-7 sm:min-h-[480px] sm:p-12">
            <div className="max-w-xl text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-100">
                {content.connection.label}
              </p>

              <blockquote className="mt-5 text-2xl font-medium leading-[1.35] tracking-tight sm:text-3xl">
                &ldquo;{content.connection.quote}&rdquo;
              </blockquote>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/75">
                {content.connection.text}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          OUR APPROACH — TIMELINE
      ========================================================= */}

      <section
        aria-labelledby="approach-heading"
        className="border-t border-brand-100 py-10 sm:border-b sm:py-20"
      >
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="section-eyebrow">{content.approach.label}</p>

            <h2 id="approach-heading" className="section-title">
              {content.approach.heading_line_1}
              <br />
              {content.approach.heading_line_2}
            </h2>

            <p className="mt-5 max-w-md leading-7 text-slate-600">
              {content.approach.text}
            </p>

            <AboutLink to={content.approach.button_url} className="text-link mt-7">
              {content.approach.button_label}

              <ArrowUpRight size={17} aria-hidden="true" />
            </AboutLink>
          </div>

          {/* Timeline */}
          <ol className="border-t border-brand-100">
            {approach.map(({ title, text }, index) => (
              <li
                key={index}
                className="grid gap-4 border-b border-brand-100 py-7 sm:grid-cols-[70px_180px_1fr] sm:items-start sm:gap-6"
              >
                <span className="text-xs font-semibold tracking-wider text-primary">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <h3 className="text-lg font-semibold text-brand-900">
                  {title}
                </h3>

                <p className="max-w-lg text-sm leading-7 text-slate-600">
                  {text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* =========================================================
          NEXT STEP
      ========================================================= */}

      <section
        aria-labelledby="care-options-heading"
        className="pb-10 pt-0 sm:py-20"
      >
        <div className="about-care-options grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <p className="section-eyebrow">{content.options.label}</p>

            <h2
              id="care-options-heading"
              className="section-title"
            >
              {content.options.heading_line_1}
              <br />
              {content.options.heading_line_2}
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-slate-600">
              {content.options.text}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <AboutLink to={content.options.primary_url} className="button-primary">
              {content.options.primary_label}

              <ArrowUpRight size={17} aria-hidden="true" />
            </AboutLink>

            <AboutLink to={content.options.secondary_url} className="button-outline">
              {content.options.secondary_label}
            </AboutLink>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}

      <section className="pb-10 sm:pb-20">
        <div className="overflow-hidden rounded-[30px] bg-brand-700 text-white">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">

            {/* LEFT */}
            <div className="px-5 py-7 sm:px-10 sm:py-14 lg:px-14">
              <div className="flex items-center gap-4">
                <span className="h-px w-8 bg-brand-200" />

                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-100">
                  {content.enquiry.label}
                </p>
              </div>

              <h2 className="mt-6 max-w-xl text-3xl font-semibold leading-[1.15] tracking-[-0.03em] sm:text-4xl">
                {content.enquiry.title}
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-white/75 sm:text-base">
                {content.enquiry.text}
              </p>
            </div>

            {/* RIGHT */}
            <div className="border-t border-white/15 bg-white/[0.045] px-5 py-7 sm:px-10 sm:py-10 lg:flex lg:flex-col lg:justify-center lg:border-l lg:border-t-0 lg:px-12">
              <p className="text-sm font-semibold">
                {content.enquiry.action_title}
              </p>

              <p className="mt-2 max-w-sm text-sm leading-6 text-white/65">
                {content.enquiry.action_text}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <AboutLink
                  to={content.enquiry.primary_url}
                  className="group inline-flex items-center gap-3 max-sm:w-full max-sm:justify-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-brand-50"
                >
                  {content.enquiry.primary_label}

                  <ArrowUpRight
                    size={16}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </AboutLink>

                <AboutLink
                  to={content.enquiry.secondary_url}
                  className="inline-flex items-center max-sm:w-full max-sm:justify-center rounded-full border border-white/35 px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-white/10"
                >
                  {content.enquiry.secondary_label}
                </AboutLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
