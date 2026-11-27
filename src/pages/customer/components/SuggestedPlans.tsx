import { useEffect, useState } from "react";
import { SiteLoader } from "@/components/common/SiteLoader";
import { fetchPlanCatalog, type PlanCatalogItem } from "@/features/plans/planCatalog";
import { getCurrencyPreference } from "@/features/plans/currencyPreference";
import { periodLabel } from "@/features/plans/pricing";
import { MembershipPlanCard } from "@/pages/website/components/MembershipPlanCard";

/**
 * Shown on My Subscriptions when the customer has no active plan: the same
 * plan cards as the website, with a billing-period switch, so they can pick
 * a plan without leaving the portal. "Choose" goes straight to checkout.
 */
export function SuggestedPlans() {
  const [plans, setPlans] = useState<PlanCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [preferred, setPreferred] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetchPlanCatalog(getCurrencyPreference())
      .then((data) => { if (active) setPlans(data.plans); })
      .catch(() => { if (active) setFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <SiteLoader label="Loading care plans..." />;
  if (failed || !plans.length) return null;

  const durations = Array.from(new Set(plans.flatMap((plan) => plan.prices.map((price) => price.duration_months)))).sort((a, b) => a - b);
  const duration = preferred !== null && durations.includes(preferred) ? preferred : durations[0];

  return (
    <section className="mt-8" aria-labelledby="suggested-plans-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Get started</p>
          <h2 id="suggested-plans-heading" className="mt-2 text-xl font-semibold tracking-tight text-brand-900">
            Choose a care plan
          </h2>
          <p className="mt-1 text-sm text-slate-500">Pick a plan for your loved one. You can link it to an elder profile at checkout.</p>
        </div>
        {durations.length > 1 && (
          <div role="group" aria-label="Billing period" className="membership-period">
            {durations.map((value) => (
              <button key={value} type="button" aria-pressed={duration === value} onClick={() => setPreferred(value)}>
                {periodLabel(value)}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="membership-grid portal-plan-grid mt-10" data-count={plans.length} role="region" aria-label="Care plans">
        {plans.map((plan) => (
          <MembershipPlanCard
            key={plan.id}
            plan={plan}
            price={plan.prices.find((price) => price.duration_months === duration) ?? plan.prices[0]}
            popularLabel="Most popular"
            chooseLabel="Choose"
          />
        ))}
      </div>
    </section>
  );
}
