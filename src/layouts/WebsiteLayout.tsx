import { useState } from "react";
import { WebsiteSmoothScroll } from "@/components/common/WebsiteSmoothScroll";
import { WebsiteSeo } from '@/features/seo/WebsiteSeo'
import { PageSeoContext } from '@/features/seo/PageSeoContext'
import type { SeoSettings } from '@/features/seo/settings'
import { useContentMotion } from "@/pages/website/components/useContentMotion";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { FloatingActions } from "@/components/common/FloatingActions";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { useHomePageContent } from '@/features/cms/websitePages';
import { useAboutPageContent } from '@/features/cms/aboutPage';
import { useHowItWorksPageContent } from '@/features/cms/howItWorksPage';
import { useTestimonialsPageContent } from '@/features/cms/testimonialsPage';
import { useServicesPageContent } from '@/features/cms/servicesPage';
import { useAddonsPageContent } from '@/features/cms/addonsPage';
import { usePlansPageContent } from '@/features/cms/plansPage';
import { useDoctorsPageContent } from '@/features/cms/doctorsPage';
import { blogSeo, useBlogJournal, useBlogPageContent } from '@/features/cms/blogPage';
import { useContactPageContent } from '@/features/cms/contactPage';
import { useEnquiryPageContent } from '@/features/cms/enquiryPage';
import { useInformationPageContent } from '@/features/cms/informationPages';

export function WebsiteLayout() {
  const { pathname, search } = useLocation();
  const { slug } = useParams();
  const isBlog = pathname === '/blog' || pathname.startsWith('/blog/');
  const blogArticle = isBlog ? slug || new URLSearchParams(search).get('article') : null;
  const blogPage = useBlogPageContent(isBlog);
  // Blog search text is kept here (not in the URL), so typing does not change
  // the address or scroll the page. It is cleared when leaving the blog.
  const [blogQuery, setBlogQuery] = useState(() => new URLSearchParams(search).get('q') ?? '');
  const [blogQueryPath, setBlogQueryPath] = useState(pathname);
  if (blogQueryPath !== pathname) {
    setBlogQueryPath(pathname);
    if (!isBlog && blogQuery) setBlogQuery('');
  }
  const journalSearch = (() => {
    const next = new URLSearchParams(search);
    next.delete('q');
    if (blogQuery.trim()) next.set('q', blogQuery.trim());
    return next.toString() ? '?' + next : '';
  })();
  const blogJournal = useBlogJournal(isBlog, blogArticle, journalSearch);
  useContentMotion(pathname);
  const isHome = pathname === "/";
  const homePage = useHomePageContent(isHome);
  const aboutPage = useAboutPageContent(pathname === '/about');
  const howItWorksPage = useHowItWorksPageContent(pathname === '/how-it-works');
  const testimonialsPage = useTestimonialsPageContent(pathname === '/testimonials');
  const servicesPage = useServicesPageContent(pathname === '/services');
  const addonsPage = useAddonsPageContent(pathname === '/add-ons');
  const plansPage = usePlansPageContent(pathname === '/plans');
  const doctorsPage = useDoctorsPageContent(pathname === '/doctors');
  const contactPage = useContactPageContent(pathname === '/contact');
  const enquiryPage = useEnquiryPageContent(pathname === '/enquiry');
  const faqsPage = useInformationPageContent('faqs', pathname === '/faqs');
  const privacyPage = useInformationPageContent('privacy-policy', pathname === '/privacy-policy');
  const termsPage = useInformationPageContent('terms', pathname === '/terms');
  // Title/description set by a single page (service or plan details).
  const [pageSeoOverride, setPageSeoOverride] = useState<Partial<SeoSettings> | null>(null);
  const hasPhotoBanner = [
    "/about",
    "/services",
    "/plans", "/plans/basic", "/plans/standard", "/plans/premium",
    "/doctors",
    "/doctors/doctors", "/doctors/physiotherapists", "/doctors/nursing-professionals",
    "/contact",
    "/add-ons",
    "/how-it-works",
    "/blog",
    "/faqs",
    "/testimonials",
    "/privacy-policy",
    "/terms",
    "/enquiry",
    "/become-a-partner",
  ].includes(pathname) || isBlog || pathname.startsWith('/plans/') || pathname.startsWith('/services/');
  return (
    <PageSeoContext.Provider value={setPageSeoOverride}>
    <div className="relative flex min-h-screen flex-col">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <WebsiteSeo override={{ ...(isBlog ? blogSeo(blogPage, blogJournal, blogArticle, journalSearch) : homePage?.seo ?? aboutPage?.seo ?? howItWorksPage?.seo ?? testimonialsPage?.seo ?? servicesPage?.seo ?? addonsPage?.seo ?? plansPage?.seo ?? doctorsPage?.seo ?? faqsPage?.seo ?? privacyPage?.seo ?? termsPage?.seo ?? enquiryPage?.seo ?? contactPage?.seo), ...pageSeoOverride }} />
      <ScrollToTop />
      <WebsiteSmoothScroll />
      <Header overlay={isHome || hasPhotoBanner} />
      <main
        id="main-content"
        tabIndex={-1}
        className={
          (isBlog ? 'blog-layout ' : ['/contact', '/enquiry'].includes(pathname) ? 'contact-layout ' : ['/faqs', '/privacy-policy', '/terms'].includes(pathname) ? 'information-layout ' : '') + (isHome
            ? "w-full flex-1"
            : hasPhotoBanner
              ? "inner-banner-layout content-page flex-1 pb-12"
              : "page-container content-page flex-1 pb-12 pt-32") + (pathname === '/about' ? ' about-page' : pathname === '/how-it-works' ? ' how-it-works-page' : pathname === '/testimonials' ? ' testimonials-page' : pathname === '/services' ? ' services-page' : pathname === '/add-ons' ? ' addons-page' : pathname === '/plans' ? ' plans-page' : pathname === '/doctors' ? ' doctors-page' : '')
        }
      >
        <Outlet context={{ homePage, aboutPage, howItWorksPage, testimonialsPage, servicesPage, addonsPage, plansPage, doctorsPage, blogPage, blogJournal, blogQuery, setBlogQuery, contactPage, enquiryPage, faqsPage, privacyPage, termsPage }} />
      </main>
      <Footer />
      <FloatingActions key={pathname} />
    </div>
    </PageSeoContext.Provider>
  );
}
