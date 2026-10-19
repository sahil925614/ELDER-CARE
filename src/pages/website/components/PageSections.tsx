import "./InnerPageBanner.css";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronDown, Mail } from "lucide-react";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { defaultNewsletterContent, type NewsletterContent } from "@/features/cms/newsletterContent";
import { CmsLink } from "@/features/cms/CmsLink";

export function PageHero({
  label,
  title,
  text,
  children,
  image,
  imageAlt,
  imageFallback,
  headingLevel = 'h1',
}: {
  label: string;
  title: string;
  text: string;
  children?: ReactNode;
  image: string;
  imageAlt: string;
  imageFallback?: string;
  headingLevel?: 'h1' | 'h2';
  animation?:
    | "banner-fade"
    | "banner-rise"
    | "banner-slide"
    | "banner-zoom"
    | "banner-reveal"
    | "banner-soft-focus";
}) {
  const Heading = headingLevel;
  return (
    <section className="inner-page-banner">
      <img
        src={image}
        alt={imageAlt}
        fetchPriority="high"
        className="inner-page-banner__image"
        onError={imageFallback ? (event) => {
          if (event.currentTarget.src !== new URL(imageFallback, window.location.href).href) event.currentTarget.src = imageFallback;
        } : undefined}
      />
      <div className="inner-page-banner__shade" aria-hidden="true" />
      <div className="inner-page-banner__content">
        <nav aria-label="Breadcrumb" className="inner-banner-breadcrumb">
          <Link to="/" className="rounded-sm hover:text-white">
            Home
          </Link>
          <span aria-hidden="true" className="text-white/50">
            /
          </span>
          <span aria-current="page">{label}</span>
        </nav>
        <Heading className="mx-auto max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </Heading>
        <span
          aria-hidden="true"
          className="mx-auto mt-6 block h-1 w-12 rounded-full bg-secondary"
        />
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/90 sm:text-lg sm:leading-8">
          {text}
        </p>
        {children && (
          <div className="inner-page-banner__actions mt-8 flex flex-wrap justify-center gap-3">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
export function PageCta({ content = defaultNewsletterContent }: { content?: NewsletterContent }) {
  const emailId = useId();
  const [message, setMessage] = useState("");

  function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Connect the newsletter API here when its contract is available.
    // Do not store addresses or report success until the server confirms it.
    setMessage(
      "Your email is valid, but newsletter subscriptions are not connected yet. Your address has not been sent or saved.",
    );
  }

  return (
    <section
      className="mb-6 sm:mb-8 sm:pt-8"
      aria-labelledby={emailId + "-heading"}
    >
      <div className="overflow-hidden rounded-[22px] bg-primary text-white sm:rounded-[28px]">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="px-5 py-7 sm:px-10 sm:py-12 lg:px-12">
            <div className="flex items-center gap-3 sm:gap-5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-100 sm:size-12 sm:rounded-2xl">
                <Mail size={25} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-100">
                  {content.label}
                </p>
                <h2
                  id={emailId + "-heading"}
                  className="mt-3 text-[22px] font-semibold leading-[1.25] tracking-tight sm:text-3xl lg:text-[34px]"
                >
                  {content.title}
                </h2>
                <p className="mt-3 max-w-xl text-[13px] leading-6 text-white/80 sm:mt-4 sm:text-base sm:leading-7">
                  {content.text}
                </p>
              </div>
            </div>
          </div>
          <div className="min-w-0 border-t border-white/15 bg-white/[0.045] px-5 py-6 sm:px-10 sm:py-8 lg:flex lg:items-center lg:border-l lg:border-t-0">
            <form
              className="w-full"
              onSubmit={subscribe}
              onChange={() => setMessage("")}
            >
              <label
                htmlFor={emailId}
                className="text-sm font-semibold sm:text-base"
              >
                {content.form_label}
              </label>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <input
                  id={emailId}
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder={content.email_placeholder}
                  aria-describedby={emailId + "-note"}
                  className="min-w-0 flex-1 rounded-full border border-white/30 bg-white px-5 py-3 text-base text-slate-800 placeholder:text-slate-500 focus-visible:outline-white"
                />
                <button
                  type="submit"
                  className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-brand-50 focus-visible:outline-white"
                >
                  {content.button_label} <ArrowUpRight size={17} aria-hidden="true" />
                </button>
              </div>
              <p
                id={emailId + "-note"}
                className="mt-4 text-xs leading-6 text-white/80"
              >
                Preview only: subscriptions are not yet connected. Read our{" "}
                <CmsLink
                  to={content.privacy_url}
                  className="underline underline-offset-2 hover:text-white focus-visible:outline-white"
                >
                  {content.privacy_label}
                </CmsLink>
                .
              </p>
              <p
                role="status"
                aria-live="polite"
                className="mt-2 text-sm leading-6 text-white"
              >
                {message}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
export function PageFaq({
  items,
  content,
}: {
  items: readonly (readonly [string, string])[];
  content?: { label: string; title_line_1: string; title_line_2: string; button_label: string; button_url: string };
}) {
  return (
    <section className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p className="section-eyebrow">{content?.label ?? 'A little clarity'}</p>
        <h2 className="section-title">
          {content?.title_line_1 ?? 'Your questions,'}
          <br />
          {content?.title_line_2 ?? 'thoughtfully answered.'}
        </h2>
        <CmsLink to={content?.button_url ?? '/faqs'} className="text-link mt-6">
          {content?.button_label ?? 'Explore all FAQs'} <ArrowUpRight size={18} aria-hidden="true" />
        </CmsLink>
      </div>
      <div className="space-y-3">
        {items.map(([question, answer]) => (
          <details
            key={question}
            className="group rounded-2xl border border-brand-100 bg-brand-50/50 p-6"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-brand-900 [&::-webkit-details-marker]:hidden">
              {question}
              <ChevronDown
                size={19}
                className="shrink-0 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-4 text-sm leading-7 text-slate-600">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
