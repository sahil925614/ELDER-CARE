import { useEffect } from "react";
import "./ContentMotion.css";

export function useContentMotion(pathname: string) {
  useEffect(() => {
    const main = document.getElementById("main-content");
    if (!main) return;
    main.classList.add("content-motion");
    const headings = main.querySelectorAll(".section-title");
    const elements = main.querySelectorAll(
      "section:not(.hero-stage):not(.inner-page-banner) article, .content-photo",
    );
    headings.forEach((heading) => heading.classList.add("content-heading-ready"));
    const headingObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("content-arrived", entry.isIntersecting);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -80px 0px" },
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("content-arrived");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    headings.forEach((heading) => headingObserver.observe(heading));
    elements.forEach((element) => observer.observe(element));
    return () => {
      headingObserver.disconnect();
      observer.disconnect();
      main.classList.remove("content-motion");
      headings.forEach((heading) => heading.classList.remove("content-heading-ready", "content-arrived"));
      elements.forEach((element) => element.classList.remove("content-arrived"));
    };
  }, [pathname]);
}
