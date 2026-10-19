import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, HeartHandshake } from "lucide-react";
import type { PlanCatalogItem } from "@/features/plans/planCatalog";

type AddonService = PlanCatalogItem['addon_services'][number];

export function AddOnServiceSlider({ services, loading, error }: { services: AddonService[]; loading: boolean; error: string }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.25),
      { threshold: 0.25 },
    );
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reducedMotion || focused || services.length < 4) return;
    // Two identical sets make the wrap seamless. Each row is 104px high.
    const animation = track.animate(
      [{ transform: "translateY(0)" }, { transform: `translateY(-${services.length * 104}px)` }],
      { duration: services.length * 5500, iterations: Infinity, easing: "linear" },
    );
    animation.pause();
    animationRef.current = animation;
    return () => {
      animation.cancel();
      animationRef.current = null;
    };
  }, [reducedMotion, focused, services]);

  useEffect(() => {
    const animation = animationRef.current;
    if (!animation) return;
    if (visible && !hovered && !focused) animation.play();
    else animation.pause();
  }, [visible, hovered, focused, reducedMotion, services]);

  return (
    <div
      ref={viewportRef}
      role="region"
      aria-label="Additional care services"
      className={`h-[416px] min-w-0 border-brand-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${reducedMotion || focused ? "overflow-y-auto" : "overflow-hidden"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          if (viewportRef.current) viewportRef.current.scrollTop = 0;
          setFocused(false);
        }
      }}
    >
      <div ref={trackRef}>
        {(loading || error || !services.length) && <p role="status" className="py-6 text-sm text-slate-600">{loading ? 'Loading services...' : error || 'No additional services are currently available.'}</p>}
        {(reducedMotion || focused || services.length < 4 ? [0] : [0, 1]).map((copy) => (
          <div key={copy} aria-hidden={copy === 1 ? true : undefined}>
            {services.map((service) => (
              <Link
                key={service.id}
                to="/add-ons"
                tabIndex={copy === 1 ? -1 : undefined}
                className="group grid h-[104px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-brand-200 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:gap-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <HeartHandshake size={22} strokeWidth={1.5} className="shrink-0 text-primary" aria-hidden="true" />
                  <h3 className="line-clamp-2 break-words font-semibold text-brand-900">{service.name}</h3>
                </div>
                <p className="hidden line-clamp-2 text-sm leading-6 text-slate-500 sm:block">{service.description || service.category}</p>
                <span className="grid size-9 place-items-center rounded-full border border-brand-100 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <ArrowUpRight size={15} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
