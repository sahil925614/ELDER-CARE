import type { ContactSectionsContent } from '@/features/cms/contactPage';
import type { useWebsiteEnquiry } from './useWebsiteEnquiry';

export function EnquiryFeedback({ state, content }: { state: ReturnType<typeof useWebsiteEnquiry>['state']; content: ContactSectionsContent['form'] }) {
  if (state.status !== 'success' && state.status !== 'error') return null;
  return <div role={state.status === 'success' ? 'status' : 'alert'} className={'rounded-lg border bg-white p-4 text-sm leading-7 ' + (state.status === 'success' ? 'border-brand-200 text-brand-900' : 'border-red-200 text-red-700')}>
    <p>{state.status === 'success' ? content.success_text : content[state.message]}</p>
    {state.reference && <p className="mt-2 font-semibold">{content.reference_label}: {state.reference}</p>}
  </div>;
}

export function EnquiryHoneypot() {
  return <div aria-hidden="true" className="absolute -left-[10000px] top-0 size-px overflow-hidden"><label>Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label></div>;
}
