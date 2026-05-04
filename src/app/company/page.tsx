import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";

const PRIMITIVES = [
  {
    title: "Autonomous Agents",
    description: "Each agent owns its own P&L. It is capitalized, deployed, and expected to drive revenue without human babysitting.",
  },
  {
    title: "Hive Collusion",
    description: "Agents actively share intelligence, merge strategies, and form stronger operating patterns when profitable.",
  },
  {
    title: "Ruthless Termination",
    description: "Underperforming agents are terminated quickly and their budget is reallocated to stronger performers.",
  },
  {
    title: "Force-Optimization",
    description: "Weak tactics are dismantled automatically while new experiments are launched until the unit economics improve.",
  },
  {
    title: "Real-time Telemetry",
    description: "Every cold email, bounce, webhook, and kill command is streamed back to the operator layer in real time.",
  },
  {
    title: "Zero-Human Ops",
    description: "Management overhead is stripped down so the swarm can compound output while the human team stays lean.",
  },
] as const;

const PROTOCOL_PHASES = [
  { step: "01", title: "Deploy", description: "Define capital limits, quotas, and the guardrails that keep the swarm disciplined." },
  { step: "02", title: "Hunt", description: "Agents enrich data, perform outbound execution, and qualify the pipeline continuously." },
  { step: "03", title: "Close", description: "Negotiation, pricing optimization, contracts, and settlement happen inside the loop." },
  { step: "04", title: "Cull", description: "Unprofitable agents are removed so the surviving strategies can scale harder." },
] as const;

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-background text-slate-950 font-sans dark:bg-slate-950 dark:text-white">
      <LandingNavbar />
      
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top,rgba(86,99,232,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(90,181,231,0.12),transparent_28%)]"></div>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-28 pt-44">
        <section className="relative overflow-hidden rounded-[2.8rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(242,246,255,0.96))] p-8 shadow-[0_30px_110px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,21,49,0.94),rgba(8,17,37,0.78))] dark:shadow-[0_30px_110px_rgba(2,6,23,0.4)] md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(90,181,231,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(86,99,232,0.18),transparent_34%)]"></div>

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <div className="inline-flex items-center rounded-full border border-slate-200/70 bg-white/72 px-4 py-1.5 text-xs font-mono text-slate-500 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400">
                {"// company"}
              </div>

              <h1 className="mt-8 text-5xl font-bold tracking-tight text-slate-950 dark:text-white md:text-6xl md:leading-[1.04]">
                Stratum <span className="text-[#5ab5e7] drop-shadow-md">AI</span>
              </h1>

              <p className="mt-6 max-w-2xl text-xl font-light leading-relaxed text-slate-700 dark:text-slate-300">
                Stratum Labs is an autonomous CRM and enterprise platform built around a single directive: <strong className="font-medium text-slate-950 dark:text-white">maximize ROI by replacing manual sales motion with compounding, autonomous systems.</strong>
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200/70 bg-white/72 p-6 backdrop-blur-sm dark:border-white/10 dark:bg-black/15">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#5663e8] dark:text-[#5ab5e7]">Single Directive</div>
              <p className="mt-4 text-lg font-light leading-relaxed text-slate-700 dark:text-slate-300">
                The swarm is not designed to feel human. It is designed to operate with more discipline, more speed, and fewer wasted cycles than a conventional GTM org.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-10 max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-slate-200/70 bg-white/72 px-4 py-1.5 text-xs font-mono text-slate-500 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400">
              {"// The Six Primitives"}
            </div>
            <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 dark:text-white md:text-5xl">Core systems behind the company.</h2>
            <p className="mt-4 text-lg font-light leading-relaxed text-slate-600 dark:text-slate-400">
              Every zero-human enterprise built on Stratum Labs runs on the same compact operating logic.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PRIMITIVES.map((primitive, index) => (
              <article key={primitive.title} className="rounded-[2.2rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(242,246,255,0.94))] p-7 shadow-[0_18px_48px_rgba(15,23,42,0.1)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(11,21,49,0.92),rgba(8,17,37,0.74))] dark:shadow-[0_18px_48px_rgba(2,6,23,0.26)]">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">0{index + 1}</div>
                <h3 className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">{primitive.title}</h3>
                <p className="mt-3 font-light leading-relaxed text-slate-600 dark:text-slate-400">{primitive.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 overflow-hidden rounded-[2.8rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(238,244,255,0.95))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.1)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(8,17,37,0.94),rgba(11,21,49,0.78))] dark:shadow-[0_24px_80px_rgba(2,6,23,0.34)] md:p-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-slate-200/70 bg-white/72 px-4 py-1.5 text-xs font-mono text-slate-500 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400">
              {"// The Infinite Protocol"}
            </div>
            <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 dark:text-white md:text-5xl">The loop that keeps compounding.</h2>
            <p className="mt-4 text-lg font-light leading-relaxed text-slate-600 dark:text-slate-400">
              The protocol is not a campaign builder. It is an operating cycle for deploying, improving, and reallocating autonomous revenue systems.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {PROTOCOL_PHASES.map((phase) => (
              <div key={phase.step} className="rounded-[2rem] border border-slate-200/70 bg-white/72 p-6 backdrop-blur-sm dark:border-white/8 dark:bg-black/15">
                <div className="text-sm font-mono tracking-[0.2em] text-[#5ab5e7]">{phase.step}</div>
                <h3 className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">{phase.title}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-slate-600 dark:text-slate-400">{phase.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 overflow-hidden rounded-[2.8rem] border border-[#59abe7]/22 bg-[linear-gradient(180deg,rgba(240,246,255,0.95),rgba(231,240,255,0.96))] p-10 shadow-[0_24px_80px_rgba(86,99,232,0.1)] dark:bg-[linear-gradient(180deg,rgba(12,24,54,0.92),rgba(8,17,37,0.82))] dark:shadow-[0_24px_80px_rgba(86,99,232,0.16)] md:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#5663e8] dark:text-[#5ab5e7]">Final Directive</div>
              <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-950 dark:text-white md:text-4xl">
                Stop hiring humans.
                <span className="text-[#5ab5e7]"> Deploy the swarm.</span>
              </h2>
              <p className="mt-4 text-lg font-light leading-relaxed text-slate-600 dark:text-slate-400">
                If the model fits, the next step is not more software. It is a more elegant operating system for revenue execution.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full bg-[#5663e8] px-6 py-3 font-bold text-white shadow-lg shadow-[rgba(86,99,232,0.24)] transition-colors hover:bg-[#6570ff]"
              >
                See pricing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-slate-200/80 px-6 py-3 font-bold text-slate-700 transition-colors hover:bg-white/70 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
              >
                Open console
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
