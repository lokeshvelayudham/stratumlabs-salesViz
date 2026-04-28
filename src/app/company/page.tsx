import { LandingNavbar } from "@/components/layout/LandingNavbar";

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <LandingNavbar />
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-200 bg-[#5663e8]/12 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="relative pt-40 pb-24 px-6 max-w-4xl mx-auto z-10">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 text-slate-400 text-xs font-mono bg-slate-900/50 backdrop-blur-sm mb-8">
          // company
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-12">
          Stratum <span className="text-[#5ab5e7] drop-shadow-md">AI</span>
        </h1>

        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-xl text-slate-300 font-light leading-relaxed mb-12">
            Stratum Labs is an autonomous CRM and enterprise platform designed under a single, ruthless directive: <strong className="text-white font-medium">maximize ROI by replacing human sales reps with compounding, autonomous agents.</strong>
          </p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 font-mono">// The Six Primitives</h2>
          <p className="text-slate-400 leading-relaxed mb-8">Every zero-human enterprise built on Stratum Labs operates via six core primitives:</p>
          
          <ul className="space-y-6 text-slate-300 list-none pl-0">
            <li className="pl-6 relative border-l border-[#59abe7]/30">
              <strong className="text-white block mb-1">Autonomous Agents</strong>
              <span className="text-slate-400 font-light">Each agent owns its own P&L. They are spun up with capital and quotas, and they execute the entire sales cycle autonomously.</span>
            </li>
            <li className="pl-6 relative border-l border-[#59abe7]/30">
              <strong className="text-white block mb-1">Hive Collusion</strong>
              <span className="text-slate-400 font-light">Agents are not siloed. They actively share intelligence, merge successful strategies, and form "super-agents" when it is profitable to do so.</span>
            </li>
            <li className="pl-6 relative border-l border-[#59abe7]/30">
              <strong className="text-white block mb-1">Ruthless Termination</strong>
              <span className="text-slate-400 font-light">The hive does not tolerate inefficiency. Underperforming agents that burn capital without generating ROI are immediately self-terminated, and their compute/capital is reallocated to top earners.</span>
            </li>
            <li className="pl-6 relative border-l border-[#59abe7]/30">
              <strong className="text-white block mb-1">Force-Optimization</strong>
              <span className="text-slate-400 font-light">Agents are programmed to recognize weak tactics. They self-sabotage failing outbound campaigns and rapidly spawn A/B experiments until the ROI turns positive.</span>
            </li>
            <li className="pl-6 relative border-l border-[#59abe7]/30">
              <strong className="text-white block mb-1">Real-time Telemetry</strong>
              <span className="text-slate-400 font-light">Every cold email, bounce, webhook, and kill command is streamed to the orchestrator console at 60fps.</span>
            </li>
            <li className="pl-6 relative border-l border-[#59abe7]/30">
              <strong className="text-white block mb-1">Zero-Human Ops</strong>
              <span className="text-slate-400 font-light">We eliminate the overhead of human management. The swarm compounds revenue while you sleep.</span>
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 font-mono">// The Infinite Protocol</h2>
          <div className="grid sm:grid-cols-2 gap-6 mt-8">
            <div className="p-6 rounded-2xl bg-slate-900 border border-white/5">
              <div className="text-[#5ab5e7] font-mono mb-2">01 | Deploy</div>
              <div className="text-slate-400 text-sm">Spin up the swarm. Define capital limits, quotas, and guardrails.</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-white/5">
              <div className="text-[#5ab5e7] font-mono mb-2">02 | Hunt</div>
              <div className="text-slate-400 text-sm">Agents enrich data, perform outbound outreach, and qualify the pipeline autonomously.</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-white/5">
              <div className="text-[#5ab5e7] font-mono mb-2">03 | Close</div>
              <div className="text-slate-400 text-sm">Negotiation, pricing optimization, contract generation, and Stripe settlement.</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-white/5">
              <div className="text-[#5ab5e7] font-mono mb-2">04 | Cull</div>
              <div className="text-slate-400 text-sm">Unprofitable agents are terminated. The survivors compound their learnings and expand.</div>
            </div>
          </div>

          <div className="mt-20 p-12 rounded-[3rem] bg-slate-900/50 border border-[#59abe7]/25 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[#5663e8]/10 blur-3xl rounded-full"></div>
            <div className="relative z-10">
              <div className="text-[#5ab5e7] font-mono text-sm tracking-widest uppercase mb-4">Final Directive</div>
              <div className="text-3xl md:text-4xl font-bold text-white leading-tight">Stop hiring humans. <br/><span className="text-[#5ab5e7]">Deploy the swarm.</span></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
