import { apiRequest } from '@/services/api/client';

export interface CustomerAppointment {
  id: number;
  appointment_number: string;
  service: string;
  elder: string;
  provider?: string | null;
  date: string;
  time: string;
  status: string;
  status_slug: string;
  funding: string;
  elder_id: number;
  start_time: string;
  end_time: string;
  can_cancel: boolean;
  can_reschedule: boolean;
  pending_reschedule?: RescheduleRequest | null;
  addon_order_id?: number | null;
  subscription_id?: number | null;
}

export interface RescheduleRequest {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  reason: string;
  review_note?: string | null;
  created_at: string;
}

export interface VisitAddress {
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
}

export interface BookingOption {
  key: string;
  subscription_id: number | null;
  addon_order_id: number | null;
  service_id: number;
  service_name: string;
  label: string;
  elder: VisitAddress & { id: number; name: string };
  funding: string;
  duration_minutes: number;
  hourly: boolean;
  remaining_quantity: number | null;
  is_unlimited: boolean;
  available: boolean;
  unavailable_reason: string;
  end_date?: string | null;
  period_end?: string;
}

export interface AppointmentDetail extends CustomerAppointment {
  address: VisitAddress;
  customer_note?: string | null;
  cancellation_reason?: string | null;
  timeline: { status: string; at: string }[];
  visit_notes: { note: string; at: string }[];
  reschedule_requests: RescheduleRequest[];
}

export async function fetchAppointmentList(filters: { view: string; page: number; search: string; elder_id: string; status: string }) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value !== '') params.set(key, String(value)); });
  return apiRequest<{ appointments: CustomerAppointment[]; pagination: { page: number; total: number; per_page: number } }>('customer/appointments?' + params);
}

export async function fetchAppointmentOptions(date: string) {
  return apiRequest<{ options: BookingOption[]; today: string; timezone: string; now: string }>('customer/appointments/options?date=' + encodeURIComponent(date));
}

export async function fetchAppointmentDetail(id: number) {
  return (await apiRequest<{ appointment: AppointmentDetail }>('customer/appointments/' + id))?.appointment;
}

export async function fetchCustomerAppointments() {
  return (await apiRequest<{ appointments: CustomerAppointment[] }>('customer/appointments'))?.appointments ?? [];
}

export function requestCustomerAppointment(payload: {
  subscription_id?: number;
  addon_order_id?: number;
  service_id: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  customer_note?: string;
  hours?: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}) {
  return apiRequest<{ message: string; appointment: CustomerAppointment }>('customer/appointments', { method: 'POST', body: JSON.stringify(payload) });
}

export function cancelCustomerAppointment(id: number, reason?: string) {
  return apiRequest<{ message: string }>(`customer/appointments/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) });
}

export function rescheduleCustomerAppointment(id: number, payload: { appointment_date: string; start_time: string; reason: string }) {
  return apiRequest<{ message: string; reschedule_request: RescheduleRequest }>(`customer/appointments/${id}/reschedule`, { method: 'POST', body: JSON.stringify(payload) });
}
