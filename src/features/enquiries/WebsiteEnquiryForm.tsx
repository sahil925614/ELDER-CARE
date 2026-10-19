import { ArrowUpRight, LoaderCircle, MessageCircle } from 'lucide-react';
import type { ContactSectionsContent } from '@/features/cms/contactPage';
import type { EnquirySectionsContent } from '@/features/cms/enquiryPage';
import { CmsLink } from '@/features/cms/CmsLink';
import { useWebsiteEnquiry } from './useWebsiteEnquiry';
import { EnquiryFeedback, EnquiryHoneypot } from './EnquiryFeedback';

const inputClass = 'mt-2 w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-base font-normal text-slate-800 transition-colors hover:border-brand-200';
const careValues = { myself: 'Myself', parent: 'A parent', family: 'A family member', other: 'Someone else' } as const;
type Props = { interest: string } & (
  { source: 'contact'; content: ContactSectionsContent['form'] } |
  { source: 'enquiry'; content: EnquirySectionsContent['form'] }
);

export function WebsiteEnquiryForm(props: Props) {
  const { source, content, interest } = props;
  const details = props.source === 'enquiry' ? props.content : null;
  const { state, submit, clear } = useWebsiteEnquiry(source);
  const sending = state.status === 'sending';
  const errorId = (name: string) => source + '-' + name + '-error';
  const error = (name: string) => state.errors[name] ? <span id={errorId(name)} className="mt-2 block text-sm font-normal text-red-700">{state.errors[name]}</span> : null;
  const attributes = (name: string) => ({ 'aria-invalid': Boolean(state.errors[name]), 'aria-describedby': state.errors[name] ? errorId(name) : undefined });
  return <div className="min-w-0 rounded-[28px] border border-brand-100 bg-brand-50/60 p-6 sm:p-9">
    <MessageCircle className="text-primary" size={30} aria-hidden="true" /><h2 className="mt-5 text-2xl font-semibold text-brand-900">{content.title}</h2><p id={source + '-form-note'} className="mt-3 text-sm leading-7 text-slate-600">{content.text}</p>
    <form onSubmit={submit} onChange={clear} aria-describedby={source + '-form-note'} className="relative mt-7 space-y-5" aria-busy={sending}>
      <EnquiryHoneypot />
      <fieldset disabled={sending} className="min-w-0 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block min-w-0 text-sm font-semibold text-brand-900">{content.name_label}<input name="name" autoComplete="name" required minLength={2} maxLength={100} className={inputClass} placeholder={content.name_placeholder} {...attributes('name')} />{error('name')}</label>
          <label className="block min-w-0 text-sm font-semibold text-brand-900">{content.email_label}<input name="email" type="email" autoComplete="email" required maxLength={254} className={inputClass} placeholder={content.email_placeholder} {...attributes('email')} />{error('email')}</label>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block min-w-0 text-sm font-semibold text-brand-900">{content.phone_label} <span className="font-normal text-slate-500">{content.optional_label}</span><input name="phone" type="tel" autoComplete="tel" maxLength={25} className={inputClass} placeholder={content.phone_placeholder} {...attributes('phone')} />{error('phone')}</label>
          <label className="block min-w-0 text-sm font-semibold text-brand-900">{content.city_label} {!details && <span className="font-normal text-slate-500">{content.optional_label}</span>}<input name={details ? 'location' : 'city'} autoComplete="address-level2" required={Boolean(details)} maxLength={100} className={inputClass} placeholder={content.city_placeholder} {...attributes('city')} />{error('city')}</label>
        </div>
        {details && <label className="block text-sm font-semibold text-brand-900">{details.care_for_label}<select name="careFor" required defaultValue="" className={inputClass} {...attributes('care_for')}>
          <option value="" disabled>{details.care_for_placeholder}</option>
          {Object.entries(careValues).map(([key, value]) => <option key={key} value={value}>{details.care_options[key as keyof typeof careValues]}</option>)}
        </select>{error('care_for')}</label>}
        <label className="block text-sm font-semibold text-brand-900">{content.interest_label}<input name="interest" defaultValue={interest} required maxLength={200} list={details ? source + '-interests' : undefined} className={inputClass} placeholder={content.interest_placeholder} {...attributes('interest')} />{error('interest')}</label>
        {details && <datalist id={source + '-interests'}>{details.interest_options.map((item, index) => <option key={index} value={item.label} />)}</datalist>}
        <label className="block text-sm font-semibold text-brand-900">{content.message_label}<textarea name="message" required minLength={10} maxLength={2000} rows={5} className={inputClass + ' resize-y'} placeholder={content.message_placeholder} {...attributes('message')} />{error('message')}</label>
        <p className="text-xs leading-6 text-slate-500">{content.privacy_text} <CmsLink to={content.privacy_url} className="text-primary underline">{content.privacy_label}</CmsLink></p>
        <div><label className="flex items-start gap-3 text-sm leading-6 text-slate-600"><input name="consent" type="checkbox" required className="mt-1 size-4 shrink-0 accent-primary" {...attributes('consent')} /><span className="min-w-0">{content.consent_label}</span></label>{error('consent')}</div>
        <button type="submit" className="button-primary w-full disabled:cursor-wait disabled:opacity-60" disabled={sending}>{sending ? <LoaderCircle size={18} className="shrink-0 animate-spin" aria-hidden="true" /> : <ArrowUpRight size={18} className="shrink-0" aria-hidden="true" />}{sending ? content.sending_label : content.button_label}</button>
      </fieldset>
      <EnquiryFeedback state={state} content={content} />
    </form>
  </div>;
}
