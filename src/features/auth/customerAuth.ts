import { apiRequest } from "@/services/api/client";
import { env } from "@/config/env";
import {
  clearCustomerSession,
  getCustomerToken,
  storeCustomerSession,
  storeCustomerUser,
} from "./customerSession";

export interface CustomerUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zip_code?: string | null;
  profile_photo_url?: string | null;
  status: string;
  role: "Customer";
}

export interface CustomerElder {
  id: number;
  name: string;
  gender: string;
  date_of_birth: string;
  age?: number | null;
  phone: string;
  email?: string | null;
  relationship: string;
  blood_group?: string | null;
  address: string;
  city: string;
  state?: string | null;
  country: string;
  zip_code?: string | null;
  care_type: string;
  mobility_level: string;
  medical_conditions?: string | null;
  allergies?: string | null;
  medications?: string | null;
  dietary_notes?: string | null;
  preferred_doctor?: string | null;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation?: string | null;
  status: string;
  notes?: string | null;
  profile_photo_url?: string | null;
}

export interface CustomerSubscriptionSummary {
  total: number;
  active: number;
  history: number;
  pending_payment: number;
}

export interface CustomerSubscription {
  id: number;
  subscription_number: string;
  plan: {
    id?: number | null;
    name?: string | null;
    code?: string | null;
    description?: string | null;
    badge_label?: string | null;
    features: Array<{ title: string; description?: string | null }>;
  };
  elder: {
    id?: number | null;
    name?: string | null;
    relationship?: string | null;
    photo_url?: string | null;
  };
  status: { name: string; slug: string; color?: string | null };
  payment_status: string;
  start_date?: string | null;
  end_date?: string | null;
  duration: {
    paid_months: number;
    free_months: number;
    total_months: number;
    label: string;
  };
  amounts: {
    paid_amount: number;
    discount_amount: number;
    tax_amount: number;
    final_amount: number;
    formatted_final_amount: string;
  };
  auto_renew: boolean;
  days_remaining?: number | null;
  services: Array<{
    id: number;
    service_name: string;
    service_id: number;
    requires_appointment: boolean;
    reserved_quantity: number;
    period_start: string;
    period_end: string;
    included_quantity?: number | null;
    used_quantity: number;
    remaining_quantity?: number | null;
    usage_period: string;
    is_unlimited: boolean;
    notes?: string | null;
  }>;
  invoices: Array<{
    id: number;
    invoice_number: string;
    invoice_date?: string | null;
    due_date?: string | null;
    total_amount: number;
    paid_amount: number;
    balance_amount: number;
    formatted_total_amount: string;
    status: string;
    payment_status: string;
  }>;
  payments: Array<{
    id: number;
    payment_number: string;
    payment_date?: string | null;
    amount: number;
    formatted_amount: string;
    method?: string | null;
    status: string;
    transaction_id?: string | null;
  }>;
  history: Array<{
    id: number;
    action: string;
    description: string;
    performed_by?: string | null;
    created_at?: string | null;
  }>;
  notes?: string | null;
}

export interface CustomerInvoice {
  id: number;
  invoice_number: string;
  subscription_number?: string | null;
  plan_name?: string | null;
  elder_name?: string | null;
  invoice_date?: string | null;
  due_date?: string | null;
  currency: string;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  formatted_total_amount: string;
  formatted_balance_amount: string;
  status: string;
  payment_status: string;
  items: Array<{
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    tax_amount: number;
    total_amount: number;
  }>;
}

export interface CustomerPayment {
  id: number;
  payment_number: string;
  invoice_id: number;
  invoice_number?: string | null;
  subscription_number?: string | null;
  plan_name?: string | null;
  payment_date?: string | null;
  amount: number;
  formatted_amount: string;
  method?: string | null;
  gateway?: string | null;
  transaction_id?: string | null;
  reference_number?: string | null;
  status: string;
  notes?: string | null;
}

export interface CustomerPaymentSummary {
  invoiced_total: number;
  paid_total: number;
  balance_total: number;
  pending_invoices: number;
  payment_records: number;
}

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  category: string;
  action?: string | null;
  url?: string | null;
  read: boolean;
  created_at?: string | null;
}

export interface CustomerDashboard {
  customer: CustomerUser;
  summary: {
    elder_profiles: number;
    upcoming_appointments: number;
    active_subscriptions: number;
    unread_notifications: number;
  };
  current_subscription?: {
    id: number;
    subscription_number: string;
    plan_name?: string | null;
    elder_name?: string | null;
    status: string;
    start_date?: string | null;
    end_date?: string | null;
  } | null;
  upcoming_appointments: Array<{
    id: number;
    appointment_number: string;
    service: string;
    elder: string;
    provider?: string | null;
    date?: string | null;
    time: string;
    status: string;
  }>;
  notifications: CustomerNotification[];
}

export interface CustomerAddonService {
  id: number;
  name: string;
  code?: string | null;
  category: string;
  description?: string | null;
  pricing_type?: string | null;
  price: number;
  base_price: number;
  tax_percentage: number;
  currency: string;
  formatted_price: string;
  duration_minutes?: number | null;
  duration_unit?: string | null;
  requires_appointment: boolean;
  requires_provider: boolean;
  image_url?: string | null;
  notes?: string | null;
  included_allowance?: { remaining_quantity: number | null; reserved_quantity: number; is_unlimited: boolean; period_end: string } | null;
}

export interface CustomerAddonSubscription {
  id: number;
  subscription_number: string;
  elder: { id: number; name: string };
  plan_name: string;
  end_date: string;
  services: CustomerAddonService[];
}

export interface CustomerAddonOrder {
  id: number;
  addon_order_number: string;
  subscription?: { id: number; subscription_number: string; plan_name: string } | null;
  service: { id?: number | null; name?: string | null; category?: string | null; requires_appointment?: boolean; pricing_type?: string | null };
  elder: { id?: number | null; name?: string | null; relationship?: string | null };
  quantity: number;
  status: string;
  payment_status: string;
  requested_date?: string | null;
  requested_time?: string | null;
  amounts: {
    unit_price: number;
    tax_amount: number;
    total_amount: number;
    formatted_total_amount: string;
  };
  invoice?: {
    id: number;
    invoice_number: string;
    payment_status: string;
    balance_amount: number;
  } | null;
  created_at?: string | null;
}

interface AuthResponse {
  message: string;
  token: string;
  user: CustomerUser;
  email_warning?: string | null;
}

interface MessageResponse {
  message: string;
}

export async function registerCustomer(payload: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}) {
  const response = await apiRequest<AuthResponse>("customer/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response) throw new Error("Registration failed.");
  storeCustomerSession(response.token, response.user);
  return response;
}

export async function loginCustomer(payload: { email: string; password: string }) {
  const response = await apiRequest<AuthResponse>("customer/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response) throw new Error("Login failed.");
  storeCustomerSession(response.token, response.user);
  return response;
}

export async function requestCustomerPasswordReset(email: string) {
  return apiRequest<MessageResponse>("customer/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetCustomerPassword(payload: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}) {
  return apiRequest<MessageResponse>("customer/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchCustomerMe() {
  const token = getCustomerToken();
  const response = await apiRequest<{ user: CustomerUser }>("customer/me");
  if (response?.user && token && getCustomerToken() === token) {
    storeCustomerUser(response.user);
  }
  return response?.user ?? null;
}

export async function updateCustomerProfile(formData: FormData) {
  const response = await apiRequest<{ message: string; user: CustomerUser }>(
    "customer/profile",
    {
      method: "POST",
      body: formData,
    },
  );
  if (response?.user) {
    storeCustomerUser(response.user);
  }
  return response;
}

export async function fetchCustomerElders() {
  const response =
    await apiRequest<{ elders: CustomerElder[] }>("customer/elders");
  return response?.elders ?? [];
}

export async function saveCustomerElder(formData: FormData, elderId?: number) {
  const response = await apiRequest<{ message: string; elder: CustomerElder }>(
    elderId ? "customer/elders/" + elderId : "customer/elders",
    {
      method: "POST",
      body: formData,
    },
  );
  return response;
}

export async function deleteCustomerElder(elderId: number) {
  return apiRequest<MessageResponse>("customer/elders/" + elderId, {
    method: "DELETE",
  });
}

export async function fetchCustomerSubscriptions() {
  const response = await apiRequest<{
    summary: CustomerSubscriptionSummary;
    subscriptions: {
      active: CustomerSubscription[];
      history: CustomerSubscription[];
    };
  }>("customer/subscriptions");
  return (
    response ?? {
      summary: { total: 0, active: 0, history: 0, pending_payment: 0 },
      subscriptions: { active: [], history: [] },
    }
  );
}

export async function updateCustomerSubscriptionAutoRenew(
  subscriptionId: number,
  autoRenew: boolean,
) {
  return apiRequest<{ message: string; subscription: CustomerSubscription }>(
    "customer/subscriptions/" + subscriptionId + "/auto-renew",
    {
      method: "PATCH",
      body: JSON.stringify({ auto_renew: autoRenew }),
    },
  );
}

export async function updateCustomerSubscriptionAction(
  subscriptionId: number,
  action: "pause" | "resume" | "cancel",
  note?: string,
) {
  return apiRequest<{ message: string; subscription: CustomerSubscription }>(
    "customer/subscriptions/" + subscriptionId + "/action",
    {
      method: "PATCH",
      body: JSON.stringify({ action, note }),
    },
  );
}

export async function renewCustomerSubscription(subscriptionId: number) {
  return apiRequest<{
    message: string;
    subscription: CustomerSubscription;
    invoice: {
      id: number;
      invoice_number: string;
      total_amount: number;
      currency: string;
    };
  }>("customer/subscriptions/" + subscriptionId + "/renew", {
    method: "POST",
  });
}

export async function fetchCustomerPayments() {
  const response = await apiRequest<{
    summary: CustomerPaymentSummary;
    invoices: CustomerInvoice[];
    payments: CustomerPayment[];
  }>("customer/payments");
  return (
    response ?? {
      summary: {
        invoiced_total: 0,
        paid_total: 0,
        balance_total: 0,
        pending_invoices: 0,
        payment_records: 0,
      },
      invoices: [],
      payments: [],
    }
  );
}

export async function fetchCustomerAddons(currency = "INR") {
  const response = await apiRequest<{
    services: CustomerAddonService[];
    subscriptions: CustomerAddonSubscription[];
    orders: CustomerAddonOrder[];
  }>("customer/add-ons?currency=" + encodeURIComponent(currency));

  return response ?? { services: [], orders: [], subscriptions: [] };
}

export async function createCustomerAddonOrder(payload: {
  subscription_id: number;
  service_id: number;
  elder_profile_id: number;
  quantity: number;
  currency: string;
  requested_date?: string;
  requested_time?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  customer_note?: string;
}) {
  return apiRequest<{
    message: string;
    order: CustomerAddonOrder;
    invoice: {
      id: number;
      invoice_number: string;
      total_amount: number;
      currency: string;
    };
    payment_order?: import("@/features/plans/planCatalog").PaymentOrder;
  }>("customer/add-ons", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function customerInvoicePdfUrl(invoiceId: number) {
  const token = getCustomerToken();
  const url =
    env.apiBaseUrl + "/customer/invoices/" + invoiceId + "/pdf";

  return token ? url + "?token=" + encodeURIComponent(token) : url;
}

export async function fetchCustomerDashboard() {
  return apiRequest<CustomerDashboard>("customer/dashboard");
}

export async function fetchCustomerNotifications() {
  const response = await apiRequest<{
    unread_count: number;
    notifications: CustomerNotification[];
  }>("customer/notifications");
  return response ?? { unread_count: 0, notifications: [] };
}

export const CUSTOMER_NOTIFICATIONS_CHANGED = "customer-notifications-changed";

export function refreshCustomerNotifications() {
  window.dispatchEvent(new Event(CUSTOMER_NOTIFICATIONS_CHANGED));
}

export async function markCustomerNotificationRead(notificationId: string) {
  const response = await apiRequest<MessageResponse>(
    "customer/notifications/" + notificationId + "/read",
    { method: "PATCH" },
  );
  refreshCustomerNotifications();
  return response;
}

export async function markCustomerNotificationUnread(notificationId: string) {
  const response = await apiRequest<MessageResponse>(
    "customer/notifications/" + notificationId + "/unread",
    { method: "PATCH" },
  );
  refreshCustomerNotifications();
  return response;
}

export async function markAllCustomerNotificationsRead() {
  const response = await apiRequest<MessageResponse>("customer/notifications/read-all", {
    method: "PATCH",
  });
  refreshCustomerNotifications();
  return response;
}

export async function logoutCustomer() {
  try {
    await apiRequest<MessageResponse>("customer/logout", { method: "POST" });
  } finally {
    clearCustomerSession();
  }
}
