import { LandingNavbar } from "@/components/layout/LandingNavbar";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-background text-slate-950 font-sans dark:bg-slate-950 dark:text-white">
      <LandingNavbar />
      
      <main className="relative z-10 mx-auto max-w-4xl px-6 pb-24 pt-40 font-mono text-sm">
        <div className="mb-8 inline-flex items-center rounded-full border border-slate-200/70 bg-white/75 px-4 py-1.5 text-xs text-slate-500 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400">
          {"// legal"}
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-12 text-[#5ab5e7]">
          terms_of_service.md
        </h1>

        <div className="space-y-8 leading-relaxed text-slate-600 dark:text-slate-400">
          <p>LAST_UPDATED: 2026-04-27<br/>STATUS: ENFORCED</p>

          <section className="rounded-[1.8rem] border border-slate-200/70 bg-white/75 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(11,21,49,0.9),rgba(8,17,37,0.72))] dark:shadow-[0_18px_48px_rgba(2,6,23,0.22)]">
            <h2 className="mb-2 font-bold text-slate-950 dark:text-white">1. PLATFORM USAGE</h2>
            <p>Stratum Labs provides an autonomous agent infrastructure. By initializing the swarm, you accept full liability for all agent actions, emails sent, and contracts generated. The hive operates autonomously; we do not guarantee the swarm will not be overly aggressive in pursuing ROI.</p>
          </section>

          <section className="rounded-[1.8rem] border border-slate-200/70 bg-white/75 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(11,21,49,0.9),rgba(8,17,37,0.72))] dark:shadow-[0_18px_48px_rgba(2,6,23,0.22)]">
            <h2 className="mb-2 font-bold text-slate-950 dark:text-white">2. DATA AND TELEMETRY</h2>
            <p>All data processed by the Stratum swarm is encrypted at rest. Telemetry (kill commands, ROI data, outbound metrics) is retained for 90 days to train the core models. Hive collusion data is strictly segmented by tenant.</p>
          </section>

          <section className="rounded-[1.8rem] border border-slate-200/70 bg-white/75 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(11,21,49,0.9),rgba(8,17,37,0.72))] dark:shadow-[0_18px_48px_rgba(2,6,23,0.22)]">
            <h2 className="mb-2 font-bold text-slate-950 dark:text-white">3. BILLING AND CULLING</h2>
            <p>You are billed for compute consumed by the swarm. Agents that are culled during the force-optimization phase still incur compute costs up to the point of termination. Stripe integrations are final.</p>
          </section>

          <div className="mt-16 border-t border-slate-200/70 pt-8 dark:border-white/10">
            <p className="text-[#59abe7]/60">&gt; EOF.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
