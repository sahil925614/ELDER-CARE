import { SiteLoader } from "@/components/common/SiteLoader";
import { Link, useParams } from 'react-router-dom';
import {
  Activity, ArrowLeft, ArrowUpRight, CalendarCheck, Check, Clock3, FlaskConical, HeartHandshake, House,
  MessageCircle, Pill, RotateCw, ShieldCheck, Stethoscope, UserRoundCheck,
} from 'lucide-react';
import { useServiceDetail, useServicesPageContent } from '@/features/cms/servicesPage';
import { usePageSeo } from '@/features/seo/PageSeoContext';
import bannerImage from '@/assets/service.jpg';
import { PageHero } from './components/PageSections';
import { ContentImage } from './components/ContentImage';
import './ServiceDetailPage.css';

const serviceIcons: Record<string, typeof HeartHandshake> = {
  'stethoscope': Stethoscope, 'activity': Activity, 'heart-handshake': HeartHandshake,
  'house': House, 'flask-conical': FlaskConical, 'pill': Pill,
};

/** "2 a month", "1 for the whole subscription"... in plain words. */
function allowance(plan: { quantity: number | null; is_unlimited: boolean; usage_period: string }) {
  const period: Record<string, string> = {
    per_day: 'a day', per_week: 'a week', per_month: 'a month', per_3_months: 'every 3 months',
    per_6_months: 'every 6 months', per_year: 'a year', per_subscription: 'during the subscription',
  };
  const amount = plan.is_unlimited ? 'Unlimited' : String(plan.quantity ?? 0);
  return amount + ' ' + (period[plan.usage_period] ?? plan.usage_period.replace(/_/g, ' '));
}

function duration(minutes: number | null) {
  if (!minutes) return null;
  if (minutes < 60) return minutes + ' minutes';
  const hours = minutes / 60;
  return (Number.isInteger(hours) ? hours : hours.toFixed(1)) + (hours === 1 ? ' hour' : ' hours');
}

const steps = [
  { title: 'Tell us what is needed', text: 'Share a few details about your loved one and what support would help.' },
  { title: 'We arrange the care', text: 'Our care team confirms the service, the timing, and the right professional.' },
  { title: 'Care at home, followed up', text: 'The visit takes place, and you are kept informed afterwards.' },
];

export function ServiceDetailPage() {
  const { slug } = useParams();
  const { service, status, retry } = useServiceDetail(slug);
  // Banner: the service's own image, then the Services page banner from settings, then the built-in picture.
  const servicesPage = useServicesPageContent(true);

  usePageSeo(service ? {
    title: service.seo.title || service.name + ' | Elder Care',
    description: service.seo.description || service.text || undefined,
  } : null);

  if (status !== 'ready' || !service) {
    return (
      <section className="pb-24 pt-44 text-center" aria-busy={status === 'loading'}>
        {status === 'loading' ? <SiteLoader label="Loading service..." /> : <p role="status" className="text-sm text-slate-600">
          {status === 'missing' ? 'This service is not available.' : 'This service could not be loaded.'}
        </p>}
        {status === 'error' && (
          <button type="button" onClick={retry} aria-label="Try loading again" className="mx-auto mt-4 flex size-11 items-center justify-center rounded-full border border-brand-200 bg-white text-primary">
            <RotateCw size={18} aria-hidden="true" />
          </button>
        )}
        <Link to="/services" className="text-link mt-6 inline-flex">
          <ArrowLeft size={16} aria-hidden="true" /> All services
        </Link>
      </section>
    );
  }

  const Icon = serviceIcons[service.icon] ?? HeartHandshake;
  const enquiry = '/enquiry?interest=' + encodeURIComponent(service.name);
  const length = duration(service.duration_minutes);
  const facts = [
    { icon: Clock3, label: 'Typical visit', value: length },
    { icon: CalendarCheck, label: 'How it is arranged', value: service.requires_appointment ? 'By appointment, at a time that suits you' : 'Arranged by our care team' },
    { icon: UserRoundCheck, label: 'Who provides it', value: service.requires_provider ? 'A verified care professional is assigned' : null },
    { icon: ShieldCheck, label: 'Price', value: service.price ? service.price.label + (service.price.type ? ' ' + service.price.type.replace(/_/g, ' ') : '') : 'Included in our plans, or confirmed for your needs' },
  ].filter((fact): fact is { icon: typeof Clock3; label: string; value: string } => Boolean(fact.value));

  return (
    <>
      <PageHero
        image={service.image_url || servicesPage?.images.banner || bannerImage}
        imageFallback={bannerImage}
        imageAlt={service.image_alt}
        label="Services"
        title={service.name}
        text={service.text}
      >
        <Link to={enquiry} className="button-primary">
          Enquire about this service <ArrowUpRight size={18} />
        </Link>
        <Link to="/plans" className="button-outline">View care plans</Link>
      </PageHero>

      <section className="service-detail py-14 sm:py-20">
        <div className="service-detail__grid">
          <div className="service-detail__main">
            <p className="section-eyebrow">{service.category_name}</p>
            <h2 className="section-title">About {service.name}</h2>
            <div className="service-detail__prose">
              {(service.paragraphs.length ? service.paragraphs : [service.text]).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>

            {service.highlights.length > 0 && (
              <>
                <h3 className="service-detail__subhead">What is included</h3>
                <ul className="service-detail__checks">
                  {service.highlights.map((point, index) => (
                    <li key={index}><Check size={18} aria-hidden="true" /><span>{point}</span></li>
                  ))}
                </ul>
              </>
            )}

            <h3 className="service-detail__subhead">How it works</h3>
            <ol className="service-detail__steps">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <span aria-hidden="true">{index + 1}</span>
                  <div><strong>{step.title}</strong><p>{step.text}</p></div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="service-detail__side">
            <div className="service-detail__card">
              <span className="icon-bubble"><Icon size={27} strokeWidth={1.5} aria-hidden="true" /></span>
              <h3>At a glance</h3>
              <dl>
                {facts.map(({ icon: FactIcon, label, value }) => (
                  <div key={label}>
                    <dt><FactIcon size={16} aria-hidden="true" />{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <Link to={enquiry} className="button-primary w-full justify-center">
                Enquire now <ArrowUpRight size={17} />
              </Link>
              <Link to="/contact" className="service-detail__link"><MessageCircle size={16} aria-hidden="true" /> Talk to our care team</Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="service-detail__plans inner-page-full-width border-y border-brand-100 bg-brand-50/55 py-14 sm:py-16">
        <div className="page-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-eyebrow">Care plans</p>
          <h2 className="section-title">{service.plans.length ? 'Included in our care plans' : 'Add this service when you need it'}</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
            {service.plans.length
              ? 'Subscribe to a care plan and this service is part of your yearly or monthly allowance.'
              : 'This service can be arranged on request. Tell us what you need and we will confirm the details.'}
          </p>
        </div>
        {service.plans.length > 0 && (
          <div className="service-detail__plan-list">
            {service.plans.map((plan) => (
              <Link key={plan.slug} to={'/plans/' + plan.slug} className="service-detail__plan">
                <strong>{plan.name}</strong>
                <span>{allowance(plan)}</span>
                <small>View plan <ArrowUpRight size={14} aria-hidden="true" /></small>
              </Link>
            ))}
          </div>
        )}
        </div>
      </section>

      {service.related.length > 0 && (
        <section className="py-14 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="section-eyebrow">More support</p><h2 className="section-title">Other services you may need</h2></div>
            <Link to="/services" className="text-link">All services <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
          <div className="service-detail__related-list mt-8" data-count={service.related.length}>
            {service.related.map((item) => (
              <Link key={item.slug} to={'/services/' + item.slug} className="care-card service-detail__related">
                <ContentImage key={item.image_url ?? item.name} name={item.name} src={item.image_url} alt={item.name} className="content-photo--card" />
                <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-primary">{item.category_name}</p>
                <h3 className="mt-2 text-xl font-semibold text-brand-900">{item.name}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                <span className="text-link mt-auto pt-4">View details <ArrowUpRight size={16} aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
