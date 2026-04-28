import { LandingNavbar } from "@/components/layout/LandingNavbar";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <LandingNavbar />
      
      <main className="relative pt-40 pb-24 px-6 max-w-4xl mx-auto z-10 font-mono text-sm">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 text-slate-400 text-xs font-mono bg-slate-900/50 backdrop-blur-sm mb-8">
          // legal
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-12 text-[#5ab5e7]">
          terms_of_service.md
        </h1>

        <div className="space-y-8 text-slate-400 leading-relaxed">
          <p>LAST_UPDATED: 2026-04-27<br/>STATUS: ENFORCED</p>

          <section>
            <h2 className="text-white font-bold mb-2">1. PLATFORM USAGE</h2>
            <p>Stratum Labs provides an autonomous agent infrastructure. By initializing the swarm, you accept full liability for all agent actions, emails sent, and contracts generated. The hive operates autonomously; we do not guarantee the swarm will not be overly aggressive in pursuing ROI.</p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-2">2. DATA AND TELEMETRY</h2>
            <p>All data processed by the Stratum swarm is encrypted at rest. Telemetry (kill commands, ROI data, outbound metrics) is retained for 90 days to train the core models. Hive collusion data is strictly segmented by tenant.</p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-2">3. BILLING AND CULLING</h2>
            <p>You are billed for compute consumed by the swarm. Agents that are culled during the force-optimization phase still incur compute costs up to the point of termination. Stripe integrations are final.</p>
          </section>

          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-[#59abe7]/60">&gt; EOF.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
