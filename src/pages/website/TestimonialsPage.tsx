import { useOutletContext } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Pause,
  Play,
  Quote,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { ExtraHero, EditorialPhoto, Intro } from "./components/WebsiteExtras";
import { PageCta } from "./components/PageSections";
import { CmsLink } from "@/features/cms/CmsLink";
import {
  defaultTestimonialsSections,
  usePublishedTestimonials,
  type PublishedTestimonial,
  type TestimonialsPageContent,
  type TestimonialsSectionsContent,
} from "@/features/cms/testimonialsPage";
import "./TestimonialsPage.css";

function TestimonialAvatar({
  testimonial,
}: {
  testimonial: PublishedTestimonial;
}) {
  const [failed, setFailed] = useState(false);
  const initials = testimonial.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => Array.from(part)[0])
    .join("")
    .toUpperCase();
  return (
    <div className="size-11 shrink-0 overflow-hidden rounded-full border-2 border-white bg-brand-50 shadow-sm">
      {testimonial.image_url && !failed ? (
        <img
          src={testimonial.image_url}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover object-center"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center text-xs font-semibold text-primary"
        >
          {initials}
        </span>
      )}
    </div>
  );
}

function StoriesHeading({
  content,
}: {
  content: TestimonialsSectionsContent["stories"];
}) {
  return (
    <div>
      <p className="section-eyebrow">{content.label}</p>
      <h2 id="testimonials-heading" className="section-title max-w-xl">
        {content.title}
      </h2>
    </div>
  );
}

function TestimonialsCarousel({
  testimonials,
  heading,
}: {
  testimonials: PublishedTestimonial[];
  heading: TestimonialsSectionsContent["stories"];
}) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [autoplayStopped, setAutoplayStopped] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const totalPages = Math.max(testimonials.length - cardsPerPage + 1, 1);

  const getCardStep = useCallback(() => {
    const slider = sliderRef.current;
    const firstCard = slider?.querySelector<HTMLElement>("article");
    if (!slider || !firstCard) return 0;
    const styles = window.getComputedStyle(slider);
    return (
      firstCard.offsetWidth + (parseFloat(styles.columnGap || styles.gap) || 0)
    );
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const count =
        window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
      setCardsPerPage(count);
      setActivePage((current) =>
        Math.min(current, Math.max(testimonials.length - count, 0)),
      );
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const slider = sliderRef.current;
        if (slider)
          slider.scrollTo({
            left: getCardStep() * Number(slider.dataset.position || 0),
            behavior: "instant",
          });
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
    };
  }, [testimonials.length, getCardStep]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const scrollToPage = useCallback(
    (position: number) => {
      const safePosition = ((position % totalPages) + totalPages) % totalPages;
      sliderRef.current?.scrollTo({
        left: getCardStep() * safePosition,
        behavior: reducedMotion ? "instant" : "smooth",
      });
      setActivePage(safePosition);
    },
    [totalPages, getCardStep, reducedMotion],
  );

  useEffect(() => {
    if (
      isHovering ||
      isFocused ||
      autoplayStopped ||
      reducedMotion ||
      totalPages <= 1
    )
      return;
    const timer = window.setTimeout(() => scrollToPage(activePage + 1), 5000);
    return () => window.clearTimeout(timer);
  }, [
    isHovering,
    isFocused,
    autoplayStopped,
    reducedMotion,
    totalPages,
    activePage,
    scrollToPage,
  ]);

  const handleScroll = () => {
    const step = getCardStep();
    if (step > 0)
      setActivePage(
        Math.min(
          Math.max(Math.round((sliderRef.current?.scrollLeft || 0) / step), 0),
          totalPages - 1,
        ),
      );
  };

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setIsFocused(false);
      }}
      onTouchStart={() => setIsHovering(true)}
      onTouchEnd={() => setIsHovering(false)}
    >
      <div className="flex flex-wrap items-end justify-between gap-7">
        <StoriesHeading content={heading} />
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollToPage(activePage - 1)}
              aria-label={heading.previous_label}
              title={heading.previous_label}
              className="flex size-11 items-center justify-center rounded-full border border-brand-200 bg-white text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollToPage(activePage + 1)}
              aria-label={heading.next_label}
              title={heading.next_label}
              className="flex size-11 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-brand-900"
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            {/* {!reducedMotion && (
              <button
                type="button"
                onClick={() => setAutoplayStopped((current) => !current)}
                aria-label={
                  autoplayStopped ? heading.play_label : heading.pause_label
                }
                title={
                  autoplayStopped ? heading.play_label : heading.pause_label
                }
                className="flex size-11 items-center justify-center rounded-full border border-brand-200 bg-white text-primary"
              >
                {autoplayStopped ? (
                  <Play size={17} aria-hidden="true" />
                ) : (
                  <Pause size={17} aria-hidden="true" />
                )}
              </button>
            )} */}
          </div>
        )}
      </div>
      <div
        ref={sliderRef}
        data-position={activePage}
        onScroll={handleScroll}
        tabIndex={0}
        aria-label={heading.slider_label}
        onKeyDown={(event) => {
          if (
            event.target !== event.currentTarget ||
            !["ArrowLeft", "ArrowRight"].includes(event.key)
          )
            return;
          event.preventDefault();
          scrollToPage(activePage + (event.key === "ArrowRight" ? 1 : -1));
        }}
        className="testimonial-slider mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {testimonials.map((testimonial) => (
          <article
            key={testimonial.id}
            className="flex min-h-[290px] shrink-0 snap-start flex-col rounded-[24px] border border-brand-100 bg-white p-7 basis-[88%] sm:basis-[calc(50%-12px)] lg:basis-[calc(33.333%-16px)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block rounded-full bg-brand-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                  {testimonial.tag || heading.default_tag}
                </span>
                {testimonial.is_sample && (
                  <p className="mt-2 text-xs text-slate-500">
                    {heading.sample_label}
                  </p>
                )}
              </div>
              <Quote
                size={27}
                strokeWidth={1.2}
                className="shrink-0 text-brand-200"
                aria-hidden="true"
              />
            </div>
            <blockquote className="mt-6 text-[16px] font-normal leading-7 text-brand-900">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <div className="mt-auto pt-6">
              <div className="border-t border-brand-100 pt-5">
                <div className="flex items-center gap-3">
                  <TestimonialAvatar
                    key={testimonial.image_url || testimonial.id}
                    testimonial={testimonial}
                  />
                  <div>
                    <p className="text-sm font-semibold text-brand-900">
                      {testimonial.name}
                    </p>
                    {testimonial.relation && (
                      <p className="mt-0.5 text-xs font-normal text-slate-500">
                        {testimonial.relation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollToPage(index)}
              aria-label={`${heading.group_label} ${index + 1}`}
              aria-current={activePage === index ? "true" : undefined}
              className={
                "h-2 rounded-full transition-all duration-300 " +
                (activePage === index
                  ? "w-7 bg-primary"
                  : "w-2 bg-brand-200 hover:bg-brand-300")
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TestimonialsPage() {
  const { testimonialsPage } = useOutletContext<{
    testimonialsPage: TestimonialsPageContent | null;
  }>();
  const content = testimonialsPage?.sections ?? defaultTestimonialsSections;
  const images = testimonialsPage?.images;
  const stories = usePublishedTestimonials();
  return (
    <>
      <ExtraHero
        label={content.banner.label}
        title={content.banner.title}
        text={content.banner.text}
        image={images?.banner}
        imageAlt={content.banner.image_alt}
      />
      <section className="py-14 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="relative">
            <EditorialPhoto
              image={images?.introduction}
              imageAlt={content.introduction.image_alt}
            />
            <div className="relative mt-4 rounded-xl bg-white/95 px-5 py-4 shadow-lg backdrop-blur-sm sm:absolute sm:bottom-5 sm:left-5 sm:right-auto sm:mt-0 sm:max-w-[280px] sm:rounded-none">
              <Quote
                size={20}
                strokeWidth={1.5}
                className="text-primary"
                aria-hidden="true"
              />
              <p className="mt-2 text-sm font-normal leading-6 text-brand-900">
                {content.introduction.quote}
              </p>
            </div>
          </div>
          <div>
            <Intro
              eyebrow={content.introduction.label}
              title={content.introduction.title}
            >
              {content.introduction.text}
            </Intro>
            <div className="mt-6 flex items-start gap-3">
              <ShieldCheck
                size={18}
                strokeWidth={1.5}
                className="mt-0.5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <p className="max-w-lg text-xs font-normal leading-5 text-slate-500">
                {content.introduction.permission_text}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section
        aria-labelledby="testimonials-heading"
        className="testimonial-stories relative inner-page-full-width border-y border-brand-100 bg-brand-50 py-14 sm:py-20"
      >
        <div className="page-container">
          {stories.loading || stories.error || !stories.items.length ? (
            <>
              <StoriesHeading content={content.stories} />
              <div className="mt-10 flex min-h-[290px] items-center justify-center gap-3 border-y border-brand-100 text-sm text-slate-600">
                <p role="status">
                  {stories.loading
                    ? content.stories.loading_text
                    : stories.error
                      ? content.stories.error_text
                      : content.stories.empty_text}
                </p>
                {stories.error && (
                  <button
                    type="button"
                    onClick={stories.refresh}
                    title={content.stories.retry_label}
                    aria-label={content.stories.retry_label}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full border border-brand-200 bg-white text-primary"
                  >
                    <RefreshCw size={18} aria-hidden="true" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <TestimonialsCarousel
              key={stories.items.map((item) => item.id).join("-")}
              testimonials={stories.items}
              heading={content.stories}
            />
          )}
        </div>
      </section>
      <section className="py-14 sm:py-20">
        <div className="testimonial-share flex flex-col gap-7 border-b border-brand-100 pb-14 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-eyebrow">{content.share.label}</p>
            <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-brand-900 sm:text-3xl">
              {content.share.title}
            </h2>
            <p className="mt-3 max-w-xl text-sm font-normal leading-7 text-slate-600">
              {content.share.text}
            </p>
          </div>
          <CmsLink
            to={content.share.button_url}
            className="button-primary shrink-0"
          >
            {content.share.button_label}
            <ArrowUpRight size={17} aria-hidden="true" />
          </CmsLink>
        </div>
      </section>
      <PageCta content={content.newsletter} />
    </>
  );
}
