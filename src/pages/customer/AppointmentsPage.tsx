import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, Clock3, Eye, Loader2, MapPin, Plus, RefreshCw, Search, X } from 'lucide-react';
import { fetchCustomerElders, refreshCustomerNotifications } from '@/features/auth/customerAuth';
import {
  cancelCustomerAppointment, fetchAppointmentDetail, fetchAppointmentList, fetchAppointmentOptions,
  requestCustomerAppointment, rescheduleCustomerAppointment,
  type AppointmentDetail, type BookingOption, type CustomerAppointment, type VisitAddress,
} from '@/features/appointments/customerAppointments';
import { ApiError } from '@/services/api/client';
import { TimeInput } from '@/components/common/TimeInput';
import { formatTime, formatTimeRange } from '@/utils/time';
import { Badge, EmptyState, Modal, PageHeading, Pagination } from './components/PortalUi';

const fieldClass = 'mt-2 h-11 w-full min-w-0 rounded-lg border border-brand-100 bg-white px-3 text-sm';
const tabs = ['Upcoming', 'Requests', 'History'] as const;
const statuses = ['pending', 'scheduled', 'confirmed', 'provider-assigned', 'in-progress', 'completed', 'rescheduled', 'cancelled', 'no-show'];
const emptyAddress: VisitAddress = { address: '', city: '', state: '', pincode: '' };
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

function initialTime() {
  const hour = Number(new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', hourCycle: 'h23' }));
  const day = today();
  if (hour < 22) return { date: day, start: String(hour + 1).padStart(2, '0') + ':00' };
  const next = new Date(day + 'T12:00:00');
  next.setDate(next.getDate() + 1);
  return { date: next.toLocaleDateString('en-CA'), start: '09:00' };
}

function endTime(start: string, minutes: number) {
  const [hour, minute] = start.split(':').map(Number);
  const total = hour * 60 + minute + minutes;
  return total >= 1440 || !Number.isFinite(total) ? '' : String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
}

function label(value: string) { return value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function timestamp(value: string) { return new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short', hour12: true }).replace(/\b(am|pm)\b/g, (period) => period.toUpperCase()); }

export function AppointmentsPage() {
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<typeof tabs[number]>('Upcoming');
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [elders, setElders] = useState<{ id: number; name: string }[]>([]);
  const [elderId, setElderId] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, per_page: 15 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const [booking, setBooking] = useState(params.has('subscription') || params.has('addon') || params.has('request'));
  const detailId = Number(params.get('appointment')) || 0;

  useEffect(() => {
    let active = true;
    void fetchCustomerElders().then((data) => { if (active) setElders(data); }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { setQuery(search); setPage(1); }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void fetchAppointmentList({ view: view.toLowerCase(), page, search: query, elder_id: elderId, status })
      .then((data) => { if (active && data) { setAppointments(data.appointments); setPagination(data.pagination); setError(''); } })
      .catch((caught) => { if (active) setError(message(caught)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [view, page, query, elderId, status, revision]);

  const refresh = useCallback((text: string) => { setNotice(text); setRevision((value) => value + 1); refreshCustomerNotifications(); }, []);
  function openDetails(id: number) { setParams((current) => { const next = new URLSearchParams(current); next.set('appointment', String(id)); return next; }); }
  function closeDetails() { setParams((current) => { const next = new URLSearchParams(current); next.delete('appointment'); return next; }); }

  return <>
    <PageHeading title="Appointments" text="Care visits for your elder profiles." action={<button className="button-primary" onClick={() => setBooking(true)}><Plus size={17} />Request visit</button>} />
    {notice && <p role="status" className="mb-5 border-l-2 border-primary bg-brand-50 px-4 py-3 text-sm text-brand-900">{notice}</p>}
    {error && <p role="alert" className="mb-5 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div role="tablist" aria-label="Appointment views" className="mb-5 flex border-b border-brand-100">
      {tabs.map((tab) => <button key={tab} role="tab" aria-selected={view === tab} onClick={() => { setView(tab); setPage(1); setStatus(''); }} className={'border-b-2 px-4 py-3 text-sm font-semibold ' + (view === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500')}>{tab}</button>)}
    </div>
    <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_170px]">
      <label className="relative"><Search className="absolute left-3 top-3.5 text-slate-400" size={17} /><input aria-label="Search appointments" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search elder, service, or reference" className="h-11 w-full min-w-0 rounded-lg border border-brand-100 bg-white pl-10 pr-3 text-sm" /></label>
      <select aria-label="Filter elder" value={elderId} onChange={(event) => { setElderId(event.target.value); setPage(1); }} className="h-11 min-w-0 rounded-lg border border-brand-100 bg-white px-3 text-sm"><option value="">All elders</option>{elders.map((elder) => <option key={elder.id} value={elder.id}>{elder.name}</option>)}</select>
      <select aria-label="Appointment status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-11 min-w-0 rounded-lg border border-brand-100 bg-white px-3 text-sm"><option value="">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select>
    </div>
    {loading ? <p className="flex items-center gap-2 py-8 text-sm text-slate-500"><Loader2 size={18} className="animate-spin" />Loading visits...</p> : appointments.length ?
      <div className="divide-y divide-brand-100 border-y border-brand-100 bg-white">{appointments.map((visit) => <article key={visit.id} className="flex flex-col gap-4 px-2 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0"><p className="font-semibold text-brand-900">{visit.service}</p><p className="mt-1 break-words text-xs text-slate-500">{visit.appointment_number} | {visit.elder}</p><p className="mt-2 text-xs text-primary">{visit.funding}</p><p className="mt-1 text-xs text-slate-500">{visit.provider || 'Awaiting provider assignment'}</p>{visit.pending_reschedule && <p className="mt-2 text-xs font-medium text-amber-700">Reschedule awaiting review</p>}</div>
        <div className="flex flex-wrap items-center gap-4"><div><p className="text-sm text-brand-900">{visit.date}</p><p className="mt-1 text-xs text-slate-500">{formatTimeRange(visit.time)}</p></div><Badge>{visit.status}</Badge><button title="View appointment" aria-label={'View ' + visit.appointment_number} onClick={() => openDetails(visit.id)} className="grid size-10 shrink-0 place-items-center rounded-lg border border-brand-100 text-primary hover:bg-brand-50"><Eye size={18} /></button></div>
      </article>)}</div> : <EmptyState text={'No ' + view.toLowerCase() + ' appointments match this selection.'} />}
    {!loading && pagination.total > 0 && <div className="mt-5"><Pagination page={page} total={pagination.total} size={pagination.per_page} onChange={setPage} /></div>}
    {booking && <BookingModal initialKey={params.has('addon') ? 'addon-' + params.get('addon') : 'subscription-' + params.get('subscription') + '-' + params.get('service')} onClose={() => setBooking(false)} onDone={(text) => { setBooking(false); setView('Requests'); setPage(1); refresh(text); }} />}
    {!!detailId && !booking && <DetailModal key={detailId} id={detailId} onClose={closeDetails} onRefresh={refresh} />}
  </>;
}

function BookingModal({ initialKey, onClose, onDone }: { initialKey: string; onClose: () => void; onDone: (text: string) => void }) {
  const [initial] = useState(initialTime);
  const [date, setDate] = useState(initial.date);
  const [start, setStart] = useState(initial.start);
  const [key, setKey] = useState(initialKey);
  const [options, setOptions] = useState<BookingOption[]>([]);
  const [hours, setHours] = useState(1);
  const [address, setAddress] = useState<VisitAddress>(emptyAddress);
  const locationKey = useRef('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [serverToday, setServerToday] = useState(today());
  const selected = options.find((option) => option.key === key);
  const minutes = selected?.hourly ? hours * 60 : selected?.duration_minutes ?? 60;
  const end = endTime(start, minutes);
  const elders = Array.from(new Map(options.map((option) => [option.elder.id, option.elder])).values());

  useEffect(() => {
    if (!date || date < today()) return;
    let active = true;
    setLoading(true);
    void fetchAppointmentOptions(date).then((data) => {
      if (!active || !data) return;
      setOptions(data.options); setTimezone(data.timezone); setServerToday(data.today); setError('');
      const option = data.options.find((item) => item.key === key) ?? data.options.find((item) => item.available) ?? data.options[0];
      if (option) {
        if (option.key !== key) setKey(option.key);
        if (locationKey.current !== option.key) { setAddress(option.elder); locationKey.current = option.key; }
      }
    }).catch((caught) => { if (active) setError(message(caught)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [date, key]);

  function changeOption(nextKey: string) { setKey(nextKey); setHours(1); setError(''); }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected || !selected.available || !end) return;
    setBusy(true); setError('');
    try {
      const data = await requestCustomerAppointment({ subscription_id: selected.subscription_id ?? undefined, addon_order_id: selected.addon_order_id ?? undefined,
        service_id: selected.service_id, appointment_date: date, start_time: start, end_time: end,
        hours: selected.hourly ? hours : undefined, customer_note: note,
        address: address.address ?? '', city: address.city ?? '', state: address.state ?? '', pincode: address.pincode ?? '',
      });
      onDone(data?.message ?? 'Visit requested. Awaiting care-team confirmation.');
    } catch (caught) { setError(message(caught)); }
    finally { setBusy(false); }
  }

  return <Modal title="Request a visit" onClose={busy ? () => {} : onClose}>
    <form onSubmit={(event) => void submit(event)} className="space-y-4">
      <fieldset disabled={busy} className="space-y-4">
        <label className="block text-sm font-semibold text-brand-900">Preferred date<input className={fieldClass} required type="date" min={serverToday} max={selected?.end_date ?? undefined} value={date} onChange={(event) => setDate(event.target.value)} /></label>
        {loading && <p className="flex items-center gap-2 text-xs text-slate-500"><Loader2 size={15} className="animate-spin" />Checking service availability...</p>}
        {options.length > 0 && <>
          <label className="block text-sm font-semibold text-brand-900">Elder<select className={fieldClass} value={selected?.elder.id ?? ''} onChange={(event) => changeOption(options.find((item) => item.elder.id === Number(event.target.value))?.key ?? '')}>{elders.map((elder) => <option key={elder.id} value={elder.id}>{elder.name}</option>)}</select></label>
          <label className="block text-sm font-semibold text-brand-900">Service and funding<select className={fieldClass} value={key} onChange={(event) => changeOption(event.target.value)}>{options.filter((option) => option.elder.id === selected?.elder.id).map((option) => <option key={option.key} value={option.key}>{option.service_name} - {option.funding}{!option.available ? ' (unavailable)' : ''}</option>)}</select></label>
          {selected && <div className={'border-l-2 px-3 py-2 text-sm ' + (selected.available ? 'border-primary bg-brand-50 text-primary' : 'border-amber-400 bg-amber-50 text-amber-800')}>
            {selected.available ? selected.is_unlimited ? 'Unlimited included visits' : `${selected.remaining_quantity} ${selected.hourly ? 'paid hours' : 'visits'} available` : selected.unavailable_reason}
            {selected.period_end && <p className="mt-1 text-xs">Period ends {selected.period_end}</p>}
          </div>}
          {selected?.hourly && <label className="block text-sm font-semibold text-brand-900">Hours<input className={fieldClass} type="number" min={1} max={Math.min(20, selected.remaining_quantity ?? 20)} required value={hours} onChange={(event) => setHours(Number(event.target.value))} /></label>}
          <div className="grid gap-4 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"><div className="min-w-0 text-sm font-semibold text-brand-900">From<TimeInput label="From" required value={start} onChange={setStart} /></div><label className="min-w-0 text-sm font-semibold text-brand-900">Until<input className={fieldClass} readOnly value={formatTime(end)} aria-label="Visit end time" /></label></div>
          <p className="text-xs text-slate-500">{minutes} minutes | {timezone}</p>
          <AddressFields value={address} onChange={setAddress} />
          <label className="block text-sm font-semibold text-brand-900">Notes<textarea className="mt-2 w-full rounded-lg border border-brand-100 p-3 text-sm" maxLength={1000} rows={2} value={note} onChange={(event) => setNote(event.target.value)} /></label>
        </>}
      </fieldset>
      {!loading && !options.length && <><p className="text-sm text-slate-600">No active subscription or paid appointment service is available.</p><Link className="text-link" to="/customer/checkout">View subscriptions <ArrowUpRight size={16} /></Link></>}
      {!!selected && !selected.available && <Link to="/customer/add-ons" className="text-link">View extra care <ArrowUpRight size={15} /></Link>}
      {selected && !end && <p role="alert" className="text-sm text-red-700">Choose a time that finishes before midnight.</p>}
      <p className="text-xs text-slate-500">Awaiting care-team confirmation. Preferred time is not yet a confirmed booking.</p>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button className="button-primary w-full justify-center" disabled={busy || loading || !selected?.available || !end || hours < 1}>{busy ? <Loader2 size={16} className="animate-spin" /> : <CalendarDays size={16} />}Request visit</button>
    </form>
  </Modal>;
}

function AddressFields({ value, onChange }: { value: VisitAddress; onChange: (value: VisitAddress) => void }) {
  const fields = ['address', 'city', 'state', 'pincode'] as const;
  return <div className="grid grid-cols-2 gap-3">{fields.map((field) => <label key={field} className={'min-w-0 text-sm font-semibold text-brand-900 ' + (field === 'address' ? 'col-span-2' : '')}>{field === 'pincode' ? 'PIN code' : label(field)}<input className={fieldClass} required={field === 'address' || field === 'city'} maxLength={field === 'address' ? 255 : field === 'pincode' ? 20 : 120} value={value[field] ?? ''} onChange={(event) => onChange({ ...value, [field]: event.target.value })} /></label>)}</div>;
}

function DetailModal({ id, onClose, onRefresh }: { id: number; onClose: () => void; onRefresh: (text: string) => void }) {
  const [detail, setDetail] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'details' | 'cancel' | 'reschedule'>('details');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(today());
  const [start, setStart] = useState('09:00');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const data = await fetchAppointmentDetail(id);
    if (!data) throw new Error('Appointment could not be loaded.');
    setDetail(data);
  }, [id]);
  useEffect(() => {
    let active = true;
    void fetchAppointmentDetail(id).then((data) => { if (active && data) { setDetail(data); setDate(data.date); setStart(data.start_time); } })
      .catch((caught) => { if (active) setError(message(caught)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = mode === 'cancel' ? await cancelCustomerAppointment(id, reason)
        : await rescheduleCustomerAppointment(id, { appointment_date: date, start_time: start, reason });
      await load(); setMode('details'); setReason(''); onRefresh(response?.message ?? 'Appointment updated.');
    } catch (caught) { setError(message(caught)); }
    finally { setBusy(false); }
  }

  return <Modal title={mode === 'cancel' ? 'Cancel visit' : mode === 'reschedule' ? 'Request reschedule' : 'Appointment details'} onClose={busy ? () => {} : onClose}>
    {loading ? <p className="flex items-center gap-2 text-sm"><Loader2 size={17} className="animate-spin" />Loading appointment...</p> : detail && <>
      <div className="border-b border-brand-100 pb-4"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-semibold text-brand-900">{detail.service}</h3><Badge>{detail.status}</Badge></div><p className="mt-2 break-words text-xs text-slate-500">{detail.appointment_number} | {detail.elder}</p><p className="mt-2 text-sm text-primary">{detail.funding}</p></div>
      {mode !== 'details' ? <form onSubmit={(event) => void submit(event)} className="mt-5 space-y-4">
        <fieldset disabled={busy} className="space-y-4">
          {mode === 'reschedule' && <><label className="block text-sm font-semibold text-brand-900">New preferred date<input type="date" required min={today()} className={fieldClass} value={date} onChange={(event) => setDate(event.target.value)} /></label><div className="text-sm font-semibold text-brand-900">New preferred start time<TimeInput label="New preferred start time" required value={start} onChange={setStart} /></div><p className="text-xs text-slate-500">Your original visit stays booked until the care team approves the new time.</p></>}
          <label className="block text-sm font-semibold text-brand-900">Reason<textarea required maxLength={1000} rows={3} className="mt-2 w-full rounded-lg border border-brand-100 p-3 text-sm" value={reason} onChange={(event) => setReason(event.target.value)} /></label>
        </fieldset>
        {mode === 'cancel' && <p className="text-xs text-slate-500">Reserved service units will be released. Cancelling this visit does not refund a paid add-on purchase.</p>}
        <div className="flex flex-wrap gap-3"><button disabled={busy} className="button-primary">{busy ? <Loader2 size={16} className="animate-spin" /> : mode === 'cancel' ? <X size={16} /> : <RefreshCw size={16} />}{mode === 'cancel' ? 'Confirm cancellation' : 'Submit reschedule request'}</button><button type="button" disabled={busy} onClick={() => { setMode('details'); setError(''); }} className="text-link">Back</button></div>
      </form> : <>
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-xs text-slate-500">Date</dt><dd className="mt-1 font-medium text-brand-900">{detail.date}</dd></div><div><dt className="text-xs text-slate-500">Time</dt><dd className="mt-1 font-medium text-brand-900">{formatTimeRange(detail.time)}</dd></div><div className="col-span-2"><dt className="text-xs text-slate-500">Provider</dt><dd className="mt-1 font-medium text-brand-900">{detail.provider || 'Awaiting provider assignment'}</dd></div></dl>
        <p className="mt-4 flex items-start gap-2 text-sm text-slate-600"><MapPin size={17} className="mt-0.5 shrink-0" />{Object.values(detail.address).filter(Boolean).join(', ') || 'Care team will confirm the location'}</p>
        {detail.customer_note && <p className="mt-4 whitespace-pre-wrap break-words text-sm text-slate-600">{detail.customer_note}</p>}
        {detail.cancellation_reason && <p className="mt-4 text-sm text-slate-600">Cancellation: {detail.cancellation_reason}</p>}
        {detail.pending_reschedule && <div className="mt-4 border-l-2 border-amber-400 bg-amber-50 p-3 text-sm text-amber-800"><p>Reschedule awaiting review</p><p className="mt-1">{detail.pending_reschedule.date} | {formatTime(detail.pending_reschedule.start_time)} - {formatTime(detail.pending_reschedule.end_time)}</p></div>}
        <div className="mt-5 flex flex-wrap gap-3">{detail.can_reschedule && <button onClick={() => { setMode('reschedule'); setError(''); }} className="text-link"><RefreshCw size={16} />Request reschedule</button>}{detail.can_cancel && <button onClick={() => { setMode('cancel'); setError(''); }} className="inline-flex items-center gap-2 text-sm font-semibold text-red-600"><X size={16} />Cancel visit</button>}</div>
        {detail.visit_notes.length > 0 && <section className="mt-6 border-t border-brand-100 pt-4"><h3 className="text-sm font-semibold text-brand-900">Visit summaries</h3>{detail.visit_notes.map((note, index) => <div key={index} className="mt-3"><p className="whitespace-pre-wrap break-words text-sm text-slate-600">{note.note}</p><p className="mt-1 text-xs text-slate-400">{timestamp(note.at)}</p></div>)}</section>}
        {detail.reschedule_requests.length > 0 && <section className="mt-6 border-t border-brand-100 pt-4"><h3 className="text-sm font-semibold text-brand-900">Reschedule history</h3>{detail.reschedule_requests.map((request) => <div key={request.id} className="mt-3 text-sm"><p className="text-brand-900">{request.date} | {formatTime(request.start_time)} - {formatTime(request.end_time)} | {label(request.status)}</p>{request.review_note && <p className="mt-1 break-words text-slate-600">{request.review_note}</p>}</div>)}</section>}
        <section className="mt-6 border-t border-brand-100 pt-4"><h3 className="text-sm font-semibold text-brand-900">Status timeline</h3>{detail.timeline.map((event, index) => <p key={index} className="mt-3 flex items-start gap-2 text-xs text-slate-500"><Clock3 size={14} className="shrink-0" /><span>{event.status} | {timestamp(event.at)}</span></p>)}</section>
      </>}
    </>}
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
  </Modal>;
}

function message(error: unknown) {
  if (error instanceof ApiError) {
    const details = error.details as { message?: string; errors?: Record<string, string[]> };
    return Object.values(details.errors ?? {}).flat()[0] ?? details.message ?? 'The request could not be completed.';
  }
  return error instanceof Error ? error.message : 'The request could not be completed.';
}
