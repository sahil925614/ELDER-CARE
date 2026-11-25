import { createContext, useContext, useEffect } from "react";
import type { SeoSettings } from "./settings";

type PageSeo = Pick<Partial<SeoSettings>, "title" | "description" | "image" | "imageAlt"> | null;

/**
 * Lets a page (for example a single service or plan) set its own title and
 * description through the layout's <WebsiteSeo>, instead of writing to
 * document.title directly (which left stale titles on the next page).
 */
export const PageSeoContext = createContext<(seo: PageSeo) => void>(() => {});

export function usePageSeo(seo: PageSeo) {
  const setPageSeo = useContext(PageSeoContext);
  const title = seo?.title;
  const description = seo?.description;
  const image = seo?.image;
  const imageAlt = seo?.imageAlt;
  useEffect(() => {
    if (!title) return;
    setPageSeo({ title, description, image, imageAlt });
    return () => setPageSeo(null);
  }, [setPageSeo, title, description, image, imageAlt]);
}
