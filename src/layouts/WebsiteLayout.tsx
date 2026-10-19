import { WebsiteSmoothScroll } from "@/components/common/WebsiteSmoothScroll";
import { WebsiteSeo } from '@/features/seo/WebsiteSeo'
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
  const blogJournal = useBlogJournal(isBlog, blogArticle, search);
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
  ].includes(pathname) || isBlog;
  return (
    <div className="relative flex min-h-screen flex-col">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <WebsiteSeo override={isBlog ? blogSeo(blogPage, blogJournal, blogArticle, search) : homePage?.seo ?? aboutPage?.seo ?? howItWorksPage?.seo ?? testimonialsPage?.seo ?? servicesPage?.seo ?? addonsPage?.seo ?? plansPage?.seo ?? doctorsPage?.seo ?? faqsPage?.seo ?? privacyPage?.seo ?? termsPage?.seo ?? enquiryPage?.seo ?? contactPage?.seo} />
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
        <Outlet context={{ homePage, aboutPage, howItWorksPage, testimonialsPage, servicesPage, addonsPage, plansPage, doctorsPage, blogPage, blogJournal, contactPage, enquiryPage, faqsPage, privacyPage, termsPage }} />
      </main>
      <Footer />
      <FloatingActions key={pathname} />
    </div>
  );
}
