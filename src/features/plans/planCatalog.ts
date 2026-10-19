import { apiRequest } from "@/services/api/client";

export interface PlanPrice {
  id: number;
  duration_months: number;
  free_months: number;
  label: string;
  price: number;
  base_price: number;
  currency: string;
  exchange_rate: number;
  exchange_source: string;
  formatted_price: string;
  discount_type?: string | null;
  discount_value: number;
  tax_percentage: number;
}

export interface PlanCatalogItem {
  id: number;
  code?: string | null;
  name: string;
  slug: string;
  label?: string | null;
  short_description?: string | null;
  description?: string | null;
  is_featured: boolean;
  minimum_duration_months: number;
  prices: PlanPrice[];
  features: Array<{ title: string; description?: string | null }>;
  addon_services: Array<{
    id: number;
    name: string;
    category?: string | null;
    category_id?: number | null;
    description?: string | null;
    image_url?: string | null;
    image_alt?: string | null;
    price: number;
    formatted_price: string;
    pricing_type?: string | null;
    tax_percentage: number;
    notes?: string | null;
  }>;
  services: Array<{
    id?: number | null;
    name: string;
    quantity?: number | null;
    usage_period?: string | null;
    is_unlimited: boolean;
    notes?: string | null;
  }>;
}

export interface CurrencyOption {
  code: "INR" | "USD";
  label: string;
  gateway: "razorpay" | "paypal";
  enabled: boolean;
}

export interface PlanCatalogResponse {
  currency: string;
  base_currency: string;
  currencies: CurrencyOption[];
  plans: PlanCatalogItem[];
}

export async function fetchPlanCatalog(currency = "INR") {
  const response = await apiRequest<PlanCatalogResponse>(
    "subscription-plans?currency=" + encodeURIComponent(currency),
  );
  return response ?? { currency: "INR", base_currency: "INR", currencies: [], plans: [] };
}

export async function previewCustomerCheckout(payload: {
  elder_profile_id: number;
  subscription_plan_price_id: number;
  currency: string;
  auto_renew?: boolean;
}) {
  return apiRequest<{
    preview: {
      start_date: string;
      end_date: string;
      duration: {
        paid_months: number;
        free_months: number;
        total_months: number;
      };
      amounts: {
        paid_amount: number;
        discount_amount: number;
        tax_amount: number;
        final_amount: number;
        formatted_final_amount: string;
      };
      gateway: {
        currency: string;
        gateway: string;
        enabled: boolean;
        mode: string;
        message: string;
      };
      services: Array<{
        name: string;
        quantity?: number | null;
        usage_period?: string | null;
        is_unlimited: boolean;
      }>;
    };
  }>("customer/checkout/preview", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createCustomerCheckout(payload: {
  elder_profile_id: number;
  subscription_plan_price_id: number;
  currency: string;
  auto_renew?: boolean;
}) {
  return apiRequest<{
    message: string;
    subscription: {
      id: number;
      subscription_number: string;
      plan_name?: string | null;
      elder_name?: string | null;
      status?: string | null;
      payment_status?: string | null;
      amounts: {
        final_amount: number;
        formatted_final_amount: string;
      };
    };
    invoice: {
      id: number;
      invoice_number: string;
      total_amount: number;
      currency: string;
    };
    gateway: {
      currency: string;
      gateway: string;
      enabled: boolean;
      mode: string;
      message: string;
    };
    payment_order?: PaymentOrder;
  }>("customer/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface PaymentOrder {
  gateway: "razorpay" | "paypal";
  type?: "manual" | "one_time" | "recurring";
  enabled: boolean;
  key_id?: string;
  client_id?: string;
  order_id?: string;
  subscription_id?: string;
  plan_id?: string;
  amount: number;
  amount_minor?: number;
  currency: string;
  message?: string;
  customer?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
}

export async function createInvoicePaymentOrder(invoiceId: number) {
  const response = await apiRequest<{ payment_order: PaymentOrder }>(
    "customer/payments/invoices/" + invoiceId + "/order",
    { method: "POST" },
  );
  return response?.payment_order;
}

export async function verifyRazorpayPayment(payload: {
  invoice_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  return apiRequest<{ message: string }>("customer/payments/razorpay/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyRazorpaySubscription(payload: {
  invoice_id: number;
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}) {
  return apiRequest<{ message: string }>("customer/payments/razorpay/subscription/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function capturePaypalPayment(payload: {
  invoice_id: number;
  order_id: string;
}) {
  return apiRequest<{ message: string }>("customer/payments/paypal/capture", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function activatePaypalSubscription(payload: {
  invoice_id: number;
  subscription_id: string;
}) {
  return apiRequest<{ message: string }>(
    "customer/payments/paypal/subscription/activate",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
