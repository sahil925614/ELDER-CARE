import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Check, MessageCircle } from 'lucide-react';
import { defaultEnquirySections, type EnquiryPageContent } from '@/features/cms/enquiryPage';
import { CmsLink } from '@/features/cms/CmsLink';
import { WebsiteEnquiryForm } from '@/features/enquiries/WebsiteEnquiryForm';
import { ExtraHero, EditorialPhoto, Intro } from './components/WebsiteExtras';
import './ContactPage.css';

export function EnquiryPage() {
  const [params] = useSearchParams();
  const { enquiryPage } = useOutletContext<{ enquiryPage: EnquiryPageContent | null }>();
  const content = enquiryPage?.sections ?? defaultEnquirySections;
  const interest = (params.get('interest') || '').slice(0, 200);
  return <>
    <ExtraHero label={content.banner.label} title={content.banner.title} text={content.banner.text}
      image={enquiryPage?.images.banner} imageAlt={content.banner.image_alt} />
    <section className="grid items-start gap-10 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="min-w-0">
        <Intro eyebrow={content.introduction.label} title={content.introduction.title}>{content.introduction.text}</Intro>
        <EditorialPhoto image={enquiryPage?.images.introduction} imageAlt={content.introduction.image_alt} />
        <ul className="my-7 space-y-4 text-sm text-slate-600">{content.introduction.items.map((item, index) => <li className="flex items-start gap-3" key={index}>
          <Check size={18} className="shrink-0 text-primary" aria-hidden="true" /><span className="min-w-0">{item.text}</span>
        </li>)}</ul>
        <CmsLink to={content.introduction.button_url} className="text-link"><MessageCircle size={18} className="shrink-0" aria-hidden="true" />{content.introduction.button_label}</CmsLink>
      </div>
      <WebsiteEnquiryForm key={interest} source="enquiry" content={content.form} interest={interest} />
    </section>
  </>;
}
