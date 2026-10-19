import { Fragment } from "react";
import "./components/HomeHeroMotion.css";
import careHeroImage from "@/assets/care-hero.png";
import { Link, useOutletContext } from "react-router-dom";
import { ChevronRight, HeartHandshake, House } from "lucide-react";
import { HomeSections } from "./components/HomeSections";
import { defaultHomeBanner, type HomePageContent } from '@/features/cms/websitePages';

export function HomePage() {
  const { homePage } = useOutletContext<{ homePage: HomePageContent | null }>();
  const banner = homePage?.banner ?? defaultHomeBanner;
  const headingLines = [banner.heading_line_1, banner.heading_line_2].filter((line): line is string => Boolean(line));
  const benefitIcons = [HeartHandshake, House];
  return (
    <>
      {/* HERO */}
      <section className="hero-stage" aria-labelledby="hero-heading">
        <div className="care-hero page-entrance">
          <img
            src={banner.image_url || careHeroImage}
            alt={banner.image_alt}
            className="care-hero-photo"
            fetchPriority="high"
            onError={(event) => {
              if (event.currentTarget.src !== new URL(careHeroImage, window.location.href).href) event.currentTarget.src = careHeroImage;
            }}
          />
          <div className="care-hero-content">
            <h1 id="hero-heading" className="care-hero-heading" aria-label={headingLines.join(' ')}>
              <span aria-hidden="true">
                {headingLines.map((line, lineIndex) => (
                  <Fragment key={lineIndex}>
                    {lineIndex > 0 && <br />}
                    {line.split(" ").map((word, wordIndex, words) => {
                      const offset = headingLines.slice(0, lineIndex).join(' ').length
                        + words.slice(0, wordIndex).join(" ").length
                        + (wordIndex > 0 ? 1 : 0);
                      return (
                        <Fragment key={wordIndex}>
                          {wordIndex > 0 && " "}
                          <span className="home-hero-word">
                            {Array.from(word).map((letter, index) => (
                              <span key={index} className="home-hero-letter"
                                style={{ animationDelay: `${100 + (offset + index) * 32}ms` }}>
                                {letter}
                              </span>
                            ))}
                          </span>
                        </Fragment>
                      );
                    })}
                  </Fragment>
                ))}
              </span>
            </h1>
            <p className="care-hero-copy">
              {banner.description}
            </p>
            <div className="home-hero-actions mt-7 flex flex-wrap items-center gap-6">
              <Link
                to={banner.primary_url}
                className="max-w-full break-words rounded-full bg-white px-8 py-3 text-center text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
              >
                {banner.primary_label}
              </Link>
              {banner.secondary_label && banner.secondary_url && <Link
                to={banner.secondary_url}
                className="flex min-w-0 max-w-full items-center gap-1 py-3 text-sm font-medium text-white hover:underline"
              >
                <span className="break-words">{banner.secondary_label}</span> <ChevronRight size={14} className="shrink-0" aria-hidden="true" />
              </Link>}
            </div>
            <div className="hero-benefits">
              {banner.benefits.map((benefit, index) => {
                const Icon = benefitIcons[index] ?? HeartHandshake;
                return <article className="hero-benefit" key={index}>
                  <span className="hero-benefit-icon"><Icon size={27} strokeWidth={1.3} aria-hidden="true" /></span>
                  <h2 className="break-words text-sm font-bold">{benefit.title}</h2>
                  <p className="mt-2 break-words text-sm leading-5">{benefit.description}</p>
                </article>;
              })}
            </div>
          </div>
        </div>
      </section>

      <HomeSections />
    </>
  );
}
