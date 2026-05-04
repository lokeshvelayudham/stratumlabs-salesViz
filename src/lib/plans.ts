export const PLAN_OPTIONS = [
  {
    name: "Launch",
    monthlySpend: 990,
    activeSwarms: 2,
    summary: "2 active swarms · 2,500 enrichments · 1 pipeline",
  },
  {
    name: "Operator",
    monthlySpend: 2490,
    activeSwarms: 8,
    summary: "8 active swarms · 15,000 enrichments · CRM + closing workflows",
  },
  {
    name: "Sovereign",
    monthlySpend: 6900,
    activeSwarms: 30,
    summary: "30 active swarms · custom data volume · multi-brand orchestration",
  },
] as const;

export function getPlanSnapshot(planName?: string | null) {
  const match = PLAN_OPTIONS.find((plan) => plan.name.toLowerCase() === planName?.toLowerCase());
  return match ?? PLAN_OPTIONS[0];
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}