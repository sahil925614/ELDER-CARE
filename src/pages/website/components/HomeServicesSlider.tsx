import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, ArrowUpRight, ChevronLeft, ChevronRight, FlaskConical, HeartHandshake, House, Pill, Stethoscope,
} from "lucide-react";
import type { HomeService } from "@/features/cms/homeSections";
import { ContentImage } from "./ContentImage";
import "./HomeServicesSlider.css";

const icons: Record<string, typeof HeartHandshake> = {
  stethoscope: Stethoscope, activity: Activity, "heart-handshake": HeartHandshake,
  house: House, "flask-conical": FlaskConical, pill: Pill,
};
const fallbackIcons = [Stethoscope, HeartHandshake, Activity, House];

/**
 * Home page "Our services" slider: every service from the catalogue, each card
 * opening its own service page. 4 cards per view on desktop, 2 on tablets,
 * 1 (with the next peeking in) on phones; arrows + swipe.
 */
export function HomeServicesSlider({ services, itemLabel }: { services: HomeService[]; itemLabel: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update, services.length]);

  const move = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".home-service-card");
    const step = card ? card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "20") : el.clientWidth;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <div className="home-services-slider mt-10">
      <div ref={track} className="home-services-track" onScroll={update} role="region" aria-label="Our services" tabIndex={0}>
        {services.map((service, index) => {
          const Icon = (service.icon && icons[service.icon]) || fallbackIcons[index % fallbackIcons.length];
          return (
            <Link
              key={service.id}
              to={service.url}
              aria-label={`${itemLabel}: ${service.name}`}
              className="home-service-card group relative flex flex-col overflow-hidden rounded-[24px] border border-brand-100 bg-white transition-all duration-300 hover:border-brand-200 hover:shadow-[0_18px_45px_rgba(20,127,121,0.10)]"
            >
              <div className="relative h-[205px] overflow-hidden">
                <ContentImage
                  key={service.image_url}
                  name={service.name}
                  src={service.image_url}
                  alt={service.image_alt || service.name}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-900/10 via-transparent to-transparent" />
              </div>
              <div className="relative z-10 -mt-7 px-6">
                <span className="grid size-14 place-items-center rounded-2xl border-[5px] border-white bg-brand-50 text-primary shadow-sm transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                  <Icon size={23} strokeWidth={1.5} aria-hidden="true" />
                </span>
              </div>
              <div className="flex flex-1 flex-col px-6 pb-6 pt-4">
                <h3 className="text-lg font-semibold tracking-[-0.01em] text-brand-900 transition-colors group-hover:text-primary">{service.name}</h3>
                <p className="home-service-text mt-3 text-sm leading-6 text-slate-600">{service.text}</p>
                <div className="mt-auto pt-6">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    {itemLabel}
                    <span className="grid size-7 place-items-center rounded-full bg-brand-50 transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                      <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {!(edges.start && edges.end) && (
        <div className="home-services-nav">
          <button type="button" onClick={() => move(-1)} disabled={edges.start} aria-label="Previous services">
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => move(1)} disabled={edges.end} aria-label="Next services">
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
