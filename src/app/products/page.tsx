import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { Terminal, Bot, Workflow, DollarSign, LayoutDashboard, Briefcase, Database } from "lucide-react";

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
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <LandingNavbar />
      
      <div className="absolute top-0 right-0 w-150 h-150 bg-[#5663e8]/12 rounded-full blur-[150px] pointer-events-none"></div>

      <main className="relative pt-40 pb-24 px-6 max-w-5xl mx-auto z-10">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 text-slate-400 text-xs font-mono bg-slate-900/50 backdrop-blur-sm mb-8">
          // product suite
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Everything required <br/>to <span className="text-[#5ab5e7] drop-shadow-md">run the hive.</span>
        </h1>
        
        <p className="text-xl text-slate-400 font-light max-w-2xl mb-16">
          Stratum Labs provides the raw infrastructure to replace your entire GTM team with a scalable, ruthless swarm of digital agents.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, i) => (
            <div key={i} className="p-8 rounded-[2rem] bg-slate-900/50 border border-white/5 hover:border-[#59abe7]/30 transition-colors group relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-[#5663e8]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-[#5663e8]/15 transition-colors">
                  <product.icon className="text-[#5ab5e7] w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{product.title}</h3>
                <p className="text-slate-400 leading-relaxed font-light">{product.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
