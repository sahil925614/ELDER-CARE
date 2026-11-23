import type { PlanPrice } from "./planCatalog";

export function money(amount: number, currency: string) {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function periodLabel(months: number) {
  return months === 1 ? "Monthly" : months + " months";
}

/** The price of one month for the chosen billing period (free months are spread across the whole period). */
export function monthlyRate(price: PlanPrice) {
  const months = price.duration_months + (price.free_months || 0);
  return months > 0 ? price.price / months : price.price;
}

/** "2 a month", "Unlimited a year", "1 during the subscription" in plain words. */
export function allowanceText(service: { quantity?: number | null; is_unlimited: boolean; usage_period?: string | null }) {
  const period: Record<string, string> = {
    per_day: "a day", per_week: "a week", per_month: "a month", per_3_months: "every 3 months",
    per_6_months: "every 6 months", per_year: "a year", per_subscription: "during the subscription",
  };
  const amount = service.is_unlimited ? "Unlimited" : String(service.quantity ?? 0);
  const usage = service.usage_period ?? "";
  return amount + " " + (period[usage] ?? usage.replace(/_/g, " "));
}
