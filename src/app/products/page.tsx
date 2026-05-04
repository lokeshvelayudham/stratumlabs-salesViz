import Link from "next/link";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { ArrowRight, Bot, Workflow, DollarSign, LayoutDashboard, Briefcase, Database } from "lucide-react";

const PRODUCT_HIGHLIGHTS = [
  {
    label: "Operating Surface",
    value: "One refined workspace",
    description: "Strategy, execution, telemetry, and workflow control in a single system.",
  },
  {
    label: "Stack Coverage",
    value: "6 native modules",
    description: "Console, agents, protocol, negotiation, tooling, and lead intelligence.",
  },
  {
    label: "Designed For",
    value: "Lean revenue teams",
    description: "High-output GTM without stitching together a patchwork of vendors.",
  },
] as const;

export default function ProductsPage() {
  const products = [
    {
      icon: LayoutDashboard,
      title: "The Console",
      desc: "Your centralized command center. View live telemetry, active agents, current ARR run rate, and pipeline value. This is the only UI you will ever need.",
    },
    {
      icon: Bot,
      title: "Swarm Agents",
      desc: "Deploy autonomous intelligence nodes that hunt leads, enrich data, draft hyper-personalized copy, and handle multi-touch outbound sequences.",
    },
    {
      icon: Workflow,
      title: "The Protocol",
      desc: "The infinite loop execution engine. It manages agent lifecycles, handles automated deployments, and executes ruthless culling algorithms for underperforming nodes.",
    },
    {
      icon: DollarSign,
      title: "Autonomous Closing",
      desc: "Agents negotiate contracts, optimize discount ladders dynamically to secure deals, and integrate directly with Stripe to finalize payments.",
    },
    {
      icon: Briefcase,
      title: "Native Sales Tools",
      desc: "Forget juggling subscriptions for sequencing, data, and CRM. Stratum Labs includes an entire built-in suite of sales tools designed exclusively for autonomous agents to use natively.",
    },
    {
      icon: Database,
      title: "Global Lead Intelligence",
      desc: "The swarm doesn't just send emails. It natively connects to global B2B databases to continuously hunt, enrich, and qualify leads without human data-entry.",
    }
  ];

  return (
    <div className="min-h-screen bg-background text-slate-950 font-sans dark:bg-slate-950 dark:text-white">
      <LandingNavbar />
      
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top_left,rgba(86,99,232,0.2),transparent_34%),radial-gradient(circle_at_top_right,rgba(90,181,231,0.12),transparent_28%)]"></div>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-28 pt-44">
        <section className="relative overflow-hidden rounded-[2.8rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(242,246,255,0.96))] p-8 shadow-[0_30px_110px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,21,49,0.94),rgba(8,17,37,0.78))] dark:shadow-[0_30px_110px_rgba(2,6,23,0.4)] md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(90,181,231,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(86,99,232,0.2),transparent_34%)]"></div>

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <div className="inline-flex items-center rounded-full border border-slate-200/70 bg-white/72 px-4 py-1.5 text-xs font-mono text-slate-500 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400">
                {"// product suite"}
              </div>

              <h1 className="mt-8 text-5xl font-bold tracking-tight text-slate-950 dark:text-white md:text-6xl md:leading-[1.04]">
                Everything required to
                <span className="text-[#5ab5e7] drop-shadow-md"> run the hive.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-slate-600 dark:text-slate-400 md:text-xl">
                Stratum Labs provides the raw infrastructure to replace your GTM stack with a more disciplined, more unified swarm of digital agents.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-full bg-[#5663e8] px-6 py-3 font-bold text-white shadow-lg shadow-[rgba(86,99,232,0.24)] transition-colors hover:bg-[#6570ff]"
                >
                  Explore pricing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200/80 px-6 py-3 font-bold text-slate-700 transition-colors hover:bg-white/70 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
                >
                  Open the console
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {PRODUCT_HIGHLIGHTS.map((highlight) => (
                <div key={highlight.label} className="rounded-[1.8rem] border border-slate-200/70 bg-white/72 p-5 backdrop-blur-sm dark:border-white/10 dark:bg-black/15">
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">{highlight.label}</div>
                  <div className="mt-3 text-xl font-semibold text-slate-950 dark:text-white">{highlight.value}</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-10 max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-slate-200/70 bg-white/72 px-4 py-1.5 text-xs font-mono text-slate-500 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400">
              {"// native modules"}
            </div>
            <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 dark:text-white md:text-5xl">A cleaner stack with sharper edges.</h2>
            <p className="mt-4 text-lg font-light leading-relaxed text-slate-600 dark:text-slate-400">
              Each product surface is built to feel like part of the same operating system, not another disconnected SaaS tile.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-[2.2rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(242,246,255,0.94))] p-8 shadow-[0_18px_48px_rgba(15,23,42,0.1)] transition-all duration-300 hover:-translate-y-1 hover:border-[#59abe7]/30 hover:shadow-[0_24px_68px_rgba(86,99,232,0.12)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(11,21,49,0.92),rgba(8,17,37,0.74))] dark:shadow-[0_18px_48px_rgba(2,6,23,0.26)] dark:hover:shadow-[0_24px_68px_rgba(86,99,232,0.18)]"
              >
                <div className="absolute inset-0 bg-linear-to-br from-[#5663e8]/10 via-transparent to-[#59abe7]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                
                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 transition-colors group-hover:bg-[#5663e8]/10 dark:border-white/10 dark:bg-slate-800/90 dark:group-hover:bg-[#5663e8]/15">
                    <product.icon className="h-6 w-6 text-[#5ab5e7]" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-slate-950 dark:text-white">{product.title}</h3>
                  <p className="font-light leading-relaxed text-slate-600 dark:text-slate-400">{product.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 overflow-hidden rounded-[2.8rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(238,244,255,0.95))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.1)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(8,17,37,0.94),rgba(11,21,49,0.78))] dark:shadow-[0_24px_80px_rgba(2,6,23,0.34)] md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#5663e8] dark:text-[#5ab5e7]">Refined GTM Infrastructure</div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">
                Fewer moving parts. Better control. Stronger margins.
              </h2>
              <p className="mt-4 text-lg font-light leading-relaxed text-slate-600 dark:text-slate-400">
                The product suite is designed to feel less noisy, more intentional, and easier to operate when revenue systems need to move fast.
              </p>
            </div>

            <Link
              href="/pricing"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#5663e8] px-6 py-3 font-bold text-white shadow-lg shadow-[rgba(86,99,232,0.24)] transition-colors hover:bg-[#6570ff]"
            >
              Compare plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
