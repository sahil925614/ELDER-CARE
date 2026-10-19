import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ApiError, apiRequest } from '@/services/api/client';

interface SubmissionState {
  status: 'idle' | 'sending' | 'success' | 'error';
  message: 'error_text' | 'validation_text' | 'rate_limit_text'; reference: string; errors: Record<string, string>;
}
const initial: SubmissionState = { status: 'idle', message: 'error_text', reference: '', errors: {} };

export function useWebsiteEnquiry(source: 'contact' | 'enquiry') {
  const [state, setState] = useState<SubmissionState>(initial);
  const inFlight = useRef(false);
  const attempt = useRef<{ fingerprint: string; id: string } | null>(null);
  const invalidField = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (state.status !== 'error') return;
    invalidField.current?.focus();
    invalidField.current = null;
  }, [state]);
  const clear = () => { if (!inFlight.current) setState(initial); };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const value = (key: string) => String(fields.get(key) ?? '').trim();
    const content = {
      name: value('name'), email: value('email').toLowerCase(), phone: value('phone'), city: value('city') || value('location'),
      care_for: value('careFor'), interest: value('interest'), message: value('message'), source, consent: fields.has('consent'), website: value('website'),
    };
    const fingerprint = JSON.stringify(content);
    inFlight.current = true;
    setState({ ...initial, status: 'sending' });
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 25000);
    try {
      if (attempt.current?.fingerprint !== fingerprint) attempt.current = { fingerprint, id: crypto.randomUUID() };
      const response = await apiRequest<{ reference: string }>('website/enquiries', { method: 'POST', signal: controller.signal, body: JSON.stringify({ ...content, request_id: attempt.current.id }) });
      if (!response?.reference) throw new Error('Missing enquiry reference');
      setState({ ...initial, status: 'success', reference: response.reference });
      attempt.current = null;
      form.reset();
    } catch (error) {
      const details = error instanceof ApiError ? error.details as { errors?: Record<string, string[]> } : null;
      const errors: Record<string, string> = {};
      if (details?.errors && typeof details.errors === 'object') {
        for (const [key, values] of Object.entries(details.errors)) if (Array.isArray(values) && typeof values[0] === 'string') errors[key] = values[0];
      }
      if (error instanceof ApiError && [409, 422].includes(error.status)) attempt.current = null;
      setState({ ...initial, status: 'error', errors, message: error instanceof ApiError && error.status === 429 ? 'rate_limit_text' : Object.keys(errors).length ? 'validation_text' : 'error_text' });
      const key = Object.keys(errors)[0];
      const input = key ? form.elements.namedItem(key === 'city' && source === 'enquiry' ? 'location' : key === 'care_for' ? 'careFor' : key) : null;
      invalidField.current = input instanceof HTMLElement ? input : null;
    } finally { window.clearTimeout(timeout); inFlight.current = false; }
  }
  return { state, submit, clear };
}
