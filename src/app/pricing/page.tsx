"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  Database,
  FileText,
  Headphones,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";

const PLANS = [
  {
    name: "Launch",
    monthlyPrice: 990,
    annualMonthlyEquivalent: 825,
    annualTotal: 9900,
    description:
      "Founder-led outbound for lean teams validating outbound motion before scaling headcount or tooling.",
    detail: "2 active agents · 2,500 enrichments · 1 pipeline",
    icon: Sparkles,
    ctaLabel: "Start Launch",
    ctaHref: "/login",
    featured: false,
    annualNote: "Save $1,980 with annual ramp",
    features: [
      "Autonomous prospecting and email sequencing",
      "Lead enrichment with ICP filters",
      "Daily telemetry and campaign health",
      "One shared workspace",
    ],
  },
  {
    name: "Operator",
    monthlyPrice: 2490,
    annualMonthlyEquivalent: 2075,
    annualTotal: 24900,
    description:
      "The best efficiency point for lean revenue teams selling mid-four to low-five figure ACV deals. Enough capacity to replace the outbound stack without enterprise overhead.",
    detail: "8 active agents · 15,000 enrichments · CRM + closing workflows",
    icon: BarChart3,
    ctaLabel: "Deploy Operator",
    ctaHref: "/login",
    featured: true,
    annualNote: "Save $4,980 with annual ramp",
    features: [
      "Autonomous multichannel sequencing",
      "Negotiation support and pricing workflows",
      "CRM sync and Stripe-ready handoff",
      "Priority optimization reviews",
    ],
  },
  {
    name: "Sovereign",
    monthlyPrice: 6900,
    annualMonthlyEquivalent: 5750,
    annualTotal: 69000,
    description:
      "Multi-market orchestration for enterprise GTM teams that need governance, procurement support, and bespoke routing controls.",
    detail: "30 active agents · custom data volume · multi-brand orchestration",
    icon: ShieldCheck,
    ctaLabel: "Plan Enterprise Rollout",
    ctaHref: "#enterprise-flow",
    featured: false,
    annualNote: "Annual terms include rollout planning and governance workshops",
    features: [
      "Dedicated swarm guardrails",
      "Custom routing, scoring, and agent policies",
      "Advanced workspace segmentation",
      "Executive rollout and enablement",
    ],
  },
] as const;

const BILLING_OPTIONS = [
  {
    id: "monthly",
    label: "Monthly",
    detail: "Flexible ramp",
  },
  {
    id: "annual",
    label: "Annual",
    detail: "2 months free",
  },
] as const;

const INCLUDED_CAPABILITIES = [
  {
    title: "Prospecting Engine",
    description: "Always-on list building, enrichment, and qualification with no extra seat tax.",
    icon: Database,
  },
  {
    title: "Outbound Execution",
    description: "Autonomous sequencing across campaigns, copy tests, and objection handling loops.",
    icon: Bot,
  },
  {
    title: "Revenue Telemetry",
    description: "Real-time pipeline, ROI, and kill-switch visibility for every active swarm.",
    icon: BarChart3,
  },
];

const OPERATOR_EDGE = [
  "Enough active agents to cover prospecting, enrichment, outreach, follow-up, and qualification in parallel.",
  "Included lead volume is large enough for repeatable pipeline testing before you hit enterprise-only spend.",
  "CRM and closing workflows are already bundled, so you avoid stacking separate sequencing and ops subscriptions.",
];

const ENTERPRISE_FLOW = [
  {
    title: "Architecture Review",
    description: "Map business units, territories, routing rules, and approval requirements before deployment.",
    icon: MessageSquareQuote,
  },
  {
    title: "Security And Rollout Plan",
    description: "Align procurement, governance, integrations, and guardrails around a phased launch plan.",
    icon: FileText,
  },
  {
    title: "Pilot To Expansion",
    description: "Launch one controlled swarm, prove ROI, then expand by market, segment, or brand.",
    icon: Headphones,
  },
];

const FAQS = [
  {
    question: "Why is Operator the optimal price?",
    answer:
      "It is the first plan where the swarm can run the full outbound loop in parallel. Below that, you are validating. Above that, you are buying scale and governance rather than better unit economics.",
  },
  {
    question: "Do you charge per seat or per user?",
    answer:
      "No. Pricing is based on swarm capacity and included data volume. Human seats are not the billing model here.",
  },
  {
    question: "Can we start smaller and expand later?",
    answer:
      "Yes. Teams usually start on Launch for message-market fit or Operator for live revenue. Upgrades are immediate when you need more agents or data volume.",
  },
] as const;

type BillingPeriod = (typeof BILLING_OPTIONS)[number]["id"];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("annual");
  const optimalPlan = PLANS[1];
  const isAnnual = billingPeriod === "annual";
  const optimalPlanPrice = isAnnual
    ? formatCurrency(optimalPlan.annualMonthlyEquivalent)
    : formatCurrency(optimalPlan.monthlyPrice);
  const optimalPlanBillingLabel = isAnnual ? "per month billed annually" : "per month";

  return (
    <div className="min-h-screen bg-background text-slate-950 font-sans dark:bg-slate-950 dark:text-white">
      <LandingNavbar />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-152 bg-[radial-gradient(circle_at_top_left,rgba(86,99,232,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(90,181,231,0.12),transparent_28%)]" />

      <main className="relative z-10 pb-8">
        <section className="mx-auto max-w-7xl px-6 pb-20 pt-44">
          <div className="relative overflow-hidden rounded-[2.8rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(242,246,255,0.96))] px-6 py-8 shadow-[0_30px_110px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,21,49,0.94),rgba(8,17,37,0.78))] dark:shadow-[0_30px_110px_rgba(2,6,23,0.4)] md:px-10 md:py-10 lg:px-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(90,181,231,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(86,99,232,0.2),transparent_34%)]"></div>

            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_420px] lg:items-start">
            <div>
              <div className="inline-flex items-center rounded-full border border-slate-200/70 bg-white/72 px-4 py-1.5 text-xs font-mono text-slate-500 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400">
                {"// pricing protocol"}
              </div>

              <h1 className="mt-8 text-4xl font-bold tracking-tight text-slate-950 dark:text-white md:text-6xl md:leading-[1.04]">
                Price the swarm by
                <span className="text-[#5ab5e7] drop-shadow-md"> output, not seats.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-slate-600 dark:text-slate-400 md:text-lg">
                Stratum is priced around the operating point where autonomous outbound becomes cheaper than stitching together tools, credits, and manual follow-up. For most lean B2B revenue teams, that point is Operator at {optimalPlanPrice} {isAnnual ? "with annual billing" : "on monthly terms"}.
              </p>

              <div className="mt-8 inline-flex items-center gap-0.5 rounded-full border border-slate-200/80 bg-white/78 p-0.5 shadow-[0_12px_28px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.68)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/65 dark:shadow-[0_14px_34px_rgba(2,6,23,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]">
                {BILLING_OPTIONS.map((option) => {
                  const isActive = option.id === billingPeriod;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setBillingPeriod(option.id)}
                      className={`min-w-27 rounded-full px-3 py-1.5 text-center leading-none transition-all duration-200 sm:min-w-29 sm:px-3.5 ${
                        isActive
                          ? "bg-[linear-gradient(135deg,#6876ff,#5663e8)] text-white shadow-[0_10px_20px_rgba(86,99,232,0.3)]"
                          : "text-slate-500 hover:bg-slate-100/85 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
                      }`}
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-[11px]">{option.label}</div>
                      <div className={`mt-1 text-[8px] font-mono uppercase tracking-[0.22em] ${isActive ? "text-white/68" : "text-slate-500/90"}`}>
                        {option.detail}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-10 flex flex-col gap-2.5 sm:flex-row sm:flex-nowrap sm:items-center">
                <Link
                  href={optimalPlan.ctaHref}
                  className="inline-flex items-center justify-center rounded-full bg-[#5663e8] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#6570ff] shadow-lg shadow-[rgba(86,99,232,0.24)] whitespace-nowrap sm:text-sm"
                >
                  {optimalPlan.ctaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="#plans"
                  className="inline-flex items-center justify-center rounded-full border border-[#59abe7]/30 px-4 py-2.5 text-xs font-bold text-[#5663e8] transition-colors hover:bg-[#5663e8]/8 whitespace-nowrap dark:text-[#5ab5e7] dark:hover:bg-[#5663e8]/10 sm:text-sm"
                >
                  Compare Plans
                </Link>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200/70 bg-white/74 p-5 backdrop-blur-sm dark:border-white/8 dark:bg-slate-900/55">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">Billing</div>
                  <div className="mt-3 text-xl font-bold text-slate-950 dark:text-white">{isAnnual ? "Annual" : "Monthly"}</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{isAnnual ? "Commit for the year and keep two months of capacity free." : "Scale swarm capacity when the pipeline proves out."}</p>
                </div>
                <div className="rounded-3xl border border-slate-200/70 bg-white/74 p-5 backdrop-blur-sm dark:border-white/8 dark:bg-slate-900/55">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">Seat Model</div>
                  <div className="mt-3 text-xl font-bold text-slate-950 dark:text-white">None</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Humans are not the pricing unit. Active agents and data volume are.</p>
                </div>
                <div className="rounded-3xl border border-slate-200/70 bg-white/74 p-5 backdrop-blur-sm dark:border-white/8 dark:bg-slate-900/55">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">Best Starting Point</div>
                  <div className="mt-3 text-xl font-bold text-slate-950 dark:text-white">Operator</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Best cost-to-pipeline ratio for live outbound teams.</p>
                </div>
              </div>
            </div>

            <aside className="rounded-[2.2rem] border border-[#59abe7]/25 bg-[linear-gradient(180deg,rgba(248,251,255,0.94),rgba(235,243,255,0.94))] p-8 shadow-2xl shadow-[rgba(86,99,232,0.08)] backdrop-blur-xl dark:bg-[linear-gradient(180deg,rgba(10,18,39,0.94),rgba(8,17,37,0.88))] dark:shadow-[rgba(86,99,232,0.12)]">
              <div className="inline-flex items-center rounded-full border border-[#59abe7]/30 bg-[#5663e8]/10 px-4 py-1.5 text-[10px] font-mono uppercase tracking-[0.24em] text-[#5ab5e7]">
                optimal price
              </div>

              <div className="mt-8 flex items-end gap-3">
                <div className="text-5xl font-bold leading-none tracking-tight text-slate-950 dark:text-white md:text-[3.4rem]">{optimalPlanPrice}</div>
                <div className="pb-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">{optimalPlanBillingLabel}</div>
              </div>

              {isAnnual ? (
                <div className="mt-3 text-sm font-mono uppercase tracking-[0.18em] text-[#5ab5e7]">
                  {formatCurrency(optimalPlan.annualTotal)} billed yearly
                </div>
              ) : null}

              <p className="mt-5 text-base leading-relaxed text-slate-700 dark:text-slate-300">
                The first plan with enough capacity to run prospecting, enrichment, outreach, and qualification in parallel while still staying below enterprise overhead.
              </p>

              <div className="mt-8 rounded-3xl border border-slate-200/70 bg-white/74 p-5 dark:border-white/8 dark:bg-[#081125]/80">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">Included at this price</div>
                <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5ab5e7]" />
                    8 active agents working the same pipeline in parallel
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5ab5e7]" />
                    15,000 lead enrichments for repeatable outbound tests
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5ab5e7]" />
                    CRM sync, pricing workflows, and closing handoff included
                  </li>
                </ul>
              </div>

              <Link
                href={optimalPlan.ctaHref}
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#5663e8] px-6 py-3 font-bold text-white transition-colors hover:bg-[#6570ff] shadow-lg shadow-[rgba(86,99,232,0.24)]"
              >
                {isAnnual ? "Deploy Annual Operator" : "Deploy The Operator Swarm"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </aside>
          </div>
          </div>
        </section>

        <section id="plans" className="scroll-mt-32 border-t border-slate-200/70 px-6 py-20 dark:border-white/5">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-2xl">
              <div className="inline-flex items-center rounded-full border border-slate-200/70 bg-white/72 px-4 py-1.5 text-xs font-mono text-slate-500 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400">
                {"// plans"}
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">Three ways to deploy the hive.</h2>
              <p className="mt-4 text-base font-light leading-relaxed text-slate-600 dark:text-slate-400 md:text-lg">
                Launch gets you moving, Operator is the most efficient plan for most revenue teams, and Sovereign is for organizations that need scale, policy, and bespoke routing.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {PLANS.map((plan) => {
                const Icon = plan.icon;
                const displayedPrice = isAnnual
                  ? formatCurrency(plan.annualMonthlyEquivalent)
                  : formatCurrency(plan.monthlyPrice);
                const billingLabel = isAnnual ? "per month billed annually" : "per month";

                return (
                  <article
                    key={plan.name}
                    className={`group relative overflow-hidden rounded-[2.2rem] border p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 ${
                      plan.featured
                        ? "border-[#59abe7]/35 bg-[linear-gradient(180deg,rgba(240,246,255,0.96),rgba(231,240,255,0.96))] shadow-2xl shadow-[rgba(86,99,232,0.1)] dark:bg-[linear-gradient(180deg,rgba(12,24,54,0.96),rgba(8,17,37,0.88))] dark:shadow-[rgba(86,99,232,0.16)]"
                        : "border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(242,246,255,0.94))] shadow-[0_18px_48px_rgba(15,23,42,0.1)] hover:border-[#59abe7]/25 dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(11,21,49,0.92),rgba(8,17,37,0.74))] dark:shadow-none dark:hover:border-white/12"
                    }`}
                  >
                    {plan.featured ? (
                      <div className="absolute right-5 top-5 rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-[#5ab5e7]">
                        most efficient
                      </div>
                    ) : null}

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 dark:border-white/10 dark:bg-slate-800/80">
                      <Icon className="h-5 w-5 text-[#5ab5e7]" />
                    </div>

                    <div className="mt-6">
                      <h3 className="text-xl font-bold text-slate-950 dark:text-white">{plan.name}</h3>
                      <div className="mt-4 flex items-end gap-2">
                        <div className="text-[2rem] font-bold leading-none tracking-tight text-slate-950 dark:text-white md:text-[2.35rem]">{displayedPrice}</div>
                        <div className="max-w-20 pb-1 text-[9px] font-mono uppercase tracking-[0.16em] text-slate-500">{billingLabel}</div>
                      </div>
                      {isAnnual ? (
                        <p className="mt-3 text-xs font-mono uppercase tracking-[0.18em] text-[#5ab5e7]">
                          {formatCurrency(plan.annualTotal)} billed yearly · {plan.annualNote}
                        </p>
                      ) : null}
                      <p className="mt-4 text-sm font-mono uppercase tracking-[0.18em] text-[#5ab5e7]">{plan.detail}</p>
                      <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 md:text-[15px]">{plan.description}</p>
                    </div>

                    <ul className="mt-8 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5ab5e7]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={plan.ctaHref}
                      className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold whitespace-nowrap transition-colors ${
                        plan.featured
                          ? "bg-[#5663e8] text-white hover:bg-[#6570ff] shadow-lg shadow-[rgba(86,99,232,0.24)]"
                          : "border border-slate-200/80 text-slate-700 hover:bg-white/70 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
                      }`}
                    >
                      {plan.ctaLabel}
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="enterprise-flow" className="scroll-mt-32 border-t border-slate-200/70 px-6 py-20 dark:border-white/5">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
              <div>
                <div className="inline-flex items-center rounded-full border border-slate-200/70 bg-white/72 px-4 py-1.5 text-xs font-mono text-slate-500 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400">
                  {"// enterprise flow"}
                </div>
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">A stronger path to Sovereign.</h2>
                <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-slate-600 dark:text-slate-400 md:text-lg">
                  Enterprise buyers usually do not want a generic pricing CTA. They want to see the path from evaluation to rollout. This flow gives procurement, RevOps, and sales leadership a cleaner next step.
                </p>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                  {ENTERPRISE_FLOW.map((step, index) => {
                    const Icon = step.icon;

                    return (
                      <article key={step.title} className="rounded-[2rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(242,246,255,0.94))] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.1)] backdrop-blur-sm dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(11,21,49,0.9),rgba(8,17,37,0.72))] dark:shadow-[0_18px_48px_rgba(2,6,23,0.24)]">
                        <div className="flex items-center justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 dark:border-white/10 dark:bg-slate-800/80">
                            <Icon className="h-5 w-5 text-[#5ab5e7]" />
                          </div>
                          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">0{index + 1}</div>
                        </div>
                        <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">{step.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.description}</p>
                      </article>
                    );
                  })}
                </div>
              </div>

              <aside className="rounded-[2.2rem] border border-[#59abe7]/25 bg-[linear-gradient(180deg,rgba(248,251,255,0.94),rgba(235,243,255,0.94))] p-8 shadow-2xl shadow-[rgba(86,99,232,0.08)] dark:bg-[linear-gradient(180deg,rgba(12,24,54,0.94),rgba(8,17,37,0.88))] dark:shadow-[rgba(86,99,232,0.16)]">
                <div className="inline-flex items-center rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 px-4 py-1.5 text-[10px] font-mono uppercase tracking-[0.22em] text-[#5ab5e7]">
                  sovereign conversion flow
                </div>
                <h3 className="mt-6 text-2xl font-bold text-slate-950 dark:text-white">Need enterprise terms, governance, or procurement support?</h3>
                <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
                  Sovereign is built for teams with multiple markets, approval layers, and security requirements. Start with a rollout review instead of a generic trial CTA.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5ab5e7]" />
                    Mutual rollout plan aligned to regions, segments, and guardrails
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5ab5e7]" />
                    Security and governance review before production access
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5ab5e7]" />
                    Pilot success criteria defined before expansion pricing
                  </li>
                </ul>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <a
                    href="mailto:sales@stratumlabs.ai?subject=Sovereign%20Rollout%20Review"
                    className="inline-flex items-center justify-center rounded-full bg-[#5663e8] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#6570ff] shadow-lg shadow-[rgba(86,99,232,0.24)] whitespace-nowrap sm:text-sm"
                  >
                    Request Rollout Review
                  </a>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200/80 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-white/70 whitespace-nowrap dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5 sm:text-sm"
                  >
                    Enter Buyer Workspace
                  </Link>
                </div>

                <div className="mt-6 rounded-3xl border border-slate-200/70 bg-white/74 p-5 dark:border-white/8 dark:bg-slate-900/60">
                  <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Typical enterprise motion</div>
                  <div className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">14 to 30 day pilot</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Controlled rollout, one business unit first, then expansion after ROI and compliance review.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200/70 px-6 py-20 dark:border-white/5">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
            <div>
              <div className="inline-flex items-center rounded-full border border-slate-200/70 bg-white/72 px-4 py-1.5 text-xs font-mono text-slate-500 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400">
                {"// operating point"}
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">Why Operator is the best price.</h2>
              <p className="mt-4 text-base font-light leading-relaxed text-slate-600 dark:text-slate-400 md:text-lg">
                You asked for the optimal price, not just a price table. Operator is the point where the platform stops behaving like a pilot and starts behaving like a revenue system.
              </p>

              <ul className="mt-8 space-y-4">
                {OPERATOR_EDGE.map((item) => (
                  <li key={item} className="flex items-start gap-4 rounded-3xl border border-slate-200/70 bg-white/74 p-5 text-slate-700 dark:border-white/8 dark:bg-slate-900/55 dark:text-slate-300">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#5ab5e7]" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {INCLUDED_CAPABILITIES.map((capability) => {
                const Icon = capability.icon;

                return (
                  <div key={capability.title} className="rounded-[2rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(242,246,255,0.94))] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.1)] backdrop-blur-sm dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(11,21,49,0.9),rgba(8,17,37,0.72))] dark:shadow-[0_18px_48px_rgba(2,6,23,0.24)]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 dark:border-white/10 dark:bg-slate-800/80">
                      <Icon className="h-5 w-5 text-[#5ab5e7]" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">{capability.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{capability.description}</p>
                  </div>
                );
              })}

              <div className="rounded-[2rem] border border-[#59abe7]/20 bg-[linear-gradient(180deg,rgba(240,246,255,0.94),rgba(231,240,255,0.94))] p-6 md:col-span-3 dark:bg-[linear-gradient(180deg,rgba(12,24,54,0.92),rgba(8,17,37,0.82))]">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">Modeled savings logic</div>
                <div className="mt-4 grid gap-4 sm:grid-cols-4">
                  <div>
                    <div className="text-sm text-slate-500">Sequencing + delivery tools</div>
                    <div className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">$400+</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Enrichment + data credits</div>
                    <div className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">$700+</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Ops glue and handoff work</div>
                    <div className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">$1.5k+</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Operator plan</div>
                    <div className="mt-2 text-2xl font-bold text-[#5ab5e7]">$2,490</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200/70 px-6 py-20 dark:border-white/5">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl">
              <div className="inline-flex items-center rounded-full border border-slate-200/70 bg-white/72 px-4 py-1.5 text-xs font-mono text-slate-500 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400">
                {"// faq"}
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">Pricing questions, answered.</h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {FAQS.map((faq) => (
                <article key={faq.question} className="rounded-[2rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(242,246,255,0.94))] p-7 shadow-[0_18px_48px_rgba(15,23,42,0.1)] backdrop-blur-sm dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(11,21,49,0.9),rgba(8,17,37,0.72))] dark:shadow-[0_18px_48px_rgba(2,6,23,0.22)]">
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white">{faq.question}</h3>
                  <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200/70 px-6 py-20 dark:border-white/5">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[3rem] border border-[#59abe7]/20 bg-[linear-gradient(180deg,rgba(240,246,255,0.95),rgba(231,240,255,0.96))] p-10 shadow-2xl shadow-[rgba(86,99,232,0.08)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(12,24,54,0.94),rgba(8,17,37,0.86))] dark:shadow-[rgba(86,99,232,0.14)] lg:p-14">
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center rounded-full border border-[#59abe7]/30 bg-[#5663e8]/10 px-4 py-1.5 text-[10px] font-mono uppercase tracking-[0.24em] text-[#5ab5e7]">
                  best starting point
                </div>
                <h2 className="mt-6 text-3xl font-bold leading-tight text-slate-950 dark:text-white md:text-4xl">
                  Start at {optimalPlanPrice}. Scale when the swarm proves itself.
                </h2>
                <p className="mt-4 text-base font-light leading-relaxed text-slate-600 dark:text-slate-400 md:text-lg">
                  If you want the strongest pricing page recommendation: begin on Operator. It is the lowest plan where the economics and the product both make sense for a serious sales motion, especially for lean teams selling repeatable B2B offers.
                </p>
              </div>

              <Link
                href={optimalPlan.ctaHref}
                className="inline-flex w-full items-center justify-center rounded-full bg-[#5663e8] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#6570ff] shadow-lg shadow-[rgba(86,99,232,0.24)] whitespace-nowrap sm:w-auto sm:shrink-0 sm:text-sm"
              >
                {isAnnual ? "Deploy Annual Operator" : "Deploy Operator"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}