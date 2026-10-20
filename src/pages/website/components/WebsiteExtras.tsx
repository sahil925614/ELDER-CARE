import type { ReactNode } from "react";
import { PageHero } from "./PageSections";
import careHero from "@/assets/care-hero.png";
import bannerPhoto from "@/assets/Medicine delivery.jpg";
import "./WebsiteExtras.css";

// Replace these imports with your own photos from src/assets.
export function ExtraHero({
  label,
  title,
  text,
  image = bannerPhoto,
  imageAlt = "Care and connection for older people",
  headingLevel,
}: {
  label: string;
  title: string;
  text: string;
  image?: string;
  imageAlt?: string;
  headingLevel?: 'h1' | 'h2';
}) {
  return (
    <PageHero
      label={label}
      title={title}
      text={text}
      image={image}
      imageAlt={imageAlt}
      imageFallback={bannerPhoto}
      headingLevel={headingLevel}
    />
  );
}
export function EditorialPhoto({ className = "", image = careHero, imageAlt = "A caregiver spending time with an older person" }: { className?: string; image?: string; imageAlt?: string }) {
  return (
    <div className={"extra-photo " + className}>
      <img
        src={image}
        alt={imageAlt}
        onError={(event) => {
          if (event.currentTarget.src !== new URL(careHero, window.location.href).href) event.currentTarget.src = careHero;
        }}
        width={800}
        height={600}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
export function Intro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-9 max-w-2xl">
      <p className="section-eyebrow">{eyebrow}</p>
      <h2 className="section-title">{title}</h2>
      {children && <p className="mt-5 leading-7 text-slate-600">{children}</p>}
    </div>
  );
}
