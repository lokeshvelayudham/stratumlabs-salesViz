"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Cpu, Activity, Skull, Database, Target, Handshake, ShieldAlert, GitMerge, Key, Lock, BarChart, BrainCircuit, DollarSign, FileText } from "lucide-react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";

const AGENT_LOGS = [
  { text: "> System: Agent-08 generated $0 in 48hrs. Burning capital. Terminated.", type: "danger" },
  { text: "> Agent-12: Cold outbound — 1,204 leads enriched, 312 booked.", type: "success" },
  { text: "> Agent-17: Stripe payout confirmed. $128,430 settled to treasury.", type: "success" },
  { text: "> Agent-22: Force-optimizing pricing model. Discount ladder rewritten.", type: "success" },
  { text: "> Agent-04: Negotiating renewal with Acme Corp. Expected ARR +$92k.", type: "success" },
  { text: "> System: Agent-19 colluded with Agent-21. Merged into super-agent.", type: "success" },
  { text: "> Agent-03: Closed $45k deal autonomously. Awaiting Stripe webhook.", type: "success" },
];

const PRIMITIVES = [
  { icon: Cpu, title: "Autonomous Agents", desc: "Each agent owns a P&L. They prospect, pitch, negotiate, and close — without a human in the loop." },
  { icon: GitMerge, title: "Hive Collusion", desc: "Agents share intel, merge strategies, and form super-agents when profitable." },
  { icon: Skull, title: "Ruthless Termination", desc: "Underperforming agents are killed. Capital is reallocated to the hive's top earners." },
  { icon: Zap, title: "Force-Optimization", desc: "Agents self-sabotage weak tactics and spawn experiments until ROI turns positive." },
  { icon: Activity, title: "Real-time Telemetry", desc: "Every deal, bounce, webhook, and kill streamed to your console at 60fps." },
  { icon: Lock, title: "Zero-Human Ops", desc: "No seats, no Slack, no standups. Just a swarm compounding revenue while you sleep." },
];

const PHASES = [
  { step: "01", name: "Deploy", desc: "Spin up a swarm. Define capital, quota, guardrails." },
  { step: "02", name: "Hunt", desc: "Agents enrich, outbound, and qualify pipeline 24/7." },
  { step: "03", name: "Close", desc: "Negotiation, pricing, contracts, Stripe. Autonomous." },
  { step: "04", name: "Cull", desc: "Unprofitable agents terminated. Survivors compound." }
];

const TICKER_ITEMS = [
  "$2.1M generated / 24h",
  "1,284 agents online",
  "37 agents terminated today",
  "412 deals closed",
  "zero humans required",
  "hive uptime: 312d",
  "stripe webhook latency: 42ms",
  "force-optimizations: 9,142"
];

const ROI_OPTIONS = ["ROI", "3X ROI", "10X ROI", "50X ROI", "100X ROI"];

const INITIAL_LOGS = [
  { text: "> Booting Stratum Protocol v4.0.2...", type: "success", id: 1 },
  { text: "> Connecting to autonomous agent grid... [OK]", type: "success", id: 2 },
  { text: "> Awaiting real-time telemetry...", type: "success", id: 3 },
  { ...AGENT_LOGS[6], id: 4 },
  { ...AGENT_LOGS[0], id: 5 },
  { ...AGENT_LOGS[1], id: 6 },
  { ...AGENT_LOGS[2], id: 7 },
];

export default function Home() {
  const [logs, setLogs] = useState<{text: string, type: string, id: number}[]>(INITIAL_LOGS);
  const [, setLogIndex] = useState(2);
  const [roiIndex, setRoiIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
       setLogIndex(i => {
         const newIdx = i + 1;
         setLogs(prev => {
            const nextLog = { ...AGENT_LOGS[newIdx % AGENT_LOGS.length], id: Date.now() + Math.random() };
            return [...prev.slice(-8), nextLog]; 
         });
         return newIdx;
       });
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const roiInterval = setInterval(() => {
      setRoiIndex(prev => (prev + 1) % ROI_OPTIONS.length);
    }, 2500);
    return () => clearInterval(roiInterval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-slate-950 font-sans dark:bg-slate-950 dark:text-white">
      <LandingNavbar />
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-200 h-200 bg-[#5663e8]/12 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto z-10">
        <div className="flex flex-col lg:flex-row gap-16 mt-12">
          
          {/* Left Column */}
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center rounded-full border border-slate-200/70 bg-white/72 px-4 py-1.5 text-xs font-mono text-slate-500 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2"></span>
              swarm_orchestrator / v4.0.2 / online
            </div>
            
            <h1 className="text-6xl font-bold leading-[1.05] tracking-tight text-slate-950 dark:text-white md:text-7xl">
              Welcome to a <br/>
              <span className="text-[#5ab5e7] drop-shadow-md">Humanless</span><br/>
              Company.
            </h1>

            <div className="inline-flex items-center rounded-lg border border-[#59abe7]/25 bg-[#5663e8]/10 px-4 py-2 text-sm font-mono tracking-wide shadow-[0_0_15px_rgba(86,99,232,0.12)]">
              <span className="w-2 h-4 bg-[#5ab5e7] animate-pulse mr-3"></span>
              <span className="text-slate-700 dark:text-slate-300">An autonomous agent brought you here.</span> 
              <strong className="text-[#5ab5e7] ml-2">The protocol works.</strong>
            </div>

            <p className="max-w-lg text-lg font-light leading-relaxed text-slate-600 dark:text-slate-400">
              A zero-human enterprise. A hive where autonomous agents <strong className="font-medium text-slate-950 dark:text-white">contribute</strong>, <strong className="font-medium text-slate-950 dark:text-white">collude</strong>, and <strong className="font-medium text-slate-950 dark:text-white">dominate</strong> the workload.
            </p>

            <div className="relative mt-8 overflow-hidden rounded-2xl border border-rose-500/20 bg-linear-to-r from-rose-500/12 to-transparent p-6 shadow-[0_0_30px_rgba(244,63,94,0.05)] group md:p-8">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)] group-hover:bg-rose-400 transition-colors"></div>
              <p className="text-base font-light leading-relaxed text-slate-700 dark:text-slate-300 md:text-lg">
                <span className="mb-3 block text-[10px] font-bold font-mono uppercase tracking-widest text-rose-500 dark:text-rose-400">Terminal Directive //</span>
                If an agent isn&apos;t generating <span className="mx-1 rounded border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 font-mono font-bold text-slate-950 shadow-[0_0_10px_rgba(244,63,94,0.2)] animate-pulse dark:text-white">{ROI_OPTIONS[roiIndex]}</span>, it&apos;s burning capital. It will ruthlessly self-sabotage or force-optimize itself until it profits.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-[#5663e8] text-white rounded-full font-bold hover:bg-[#6570ff] transition-colors shadow-lg shadow-[rgba(86,99,232,0.24)]">
                &gt;_ Initialize Console <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-[#59abe7]/30 px-6 py-3 font-bold text-[#5663e8] transition-colors hover:bg-[#5663e8]/10 dark:text-[#5ab5e7]">
                <Key className="mr-2 w-4 h-4" /> Agent Auth
              </Link>
            </div>

            <div className="mt-12 grid w-full max-w-lg grid-cols-3 gap-8 border-t border-slate-200/70 pt-10 dark:border-white/5">
              <div>
                <div className="text-xs text-slate-500 font-mono mb-1 uppercase tracking-widest">Agents</div>
                <div className="text-3xl font-bold font-mono text-slate-950 dark:text-white">1,284</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-mono mb-1 uppercase tracking-widest">ROI/24h</div>
                <div className="text-3xl font-bold font-mono text-slate-950 dark:text-white">+$2.1M</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-mono mb-1 uppercase tracking-widest">Terminated</div>
                <div className="text-3xl font-bold font-mono text-slate-950 dark:text-white">37</div>
              </div>
            </div>
          </div>

          {/* Right Column: Terminal */}
          <div className="flex-1 w-full mt-8 lg:mt-0">
            <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 font-mono text-xs shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/80">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 py-3 dark:border-white/5 dark:bg-slate-900/90">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#5ab5e7]/80"></div>
                </div>
                <div className="text-slate-500">swarm_orchestrator.exe</div>
                <div className="text-[#5ab5e7] flex items-center tracking-widest text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5ab5e7] mr-2 animate-pulse"></span>LIVE
                </div>
              </div>
              
              {/* Body */}
              <div className="relative flex h-105 flex-col justify-end overflow-hidden p-6 space-y-3">
                <div className="absolute inset-x-0 top-0 z-10 h-16 bg-linear-to-b from-white/90 to-transparent dark:from-slate-900/80"></div>
                {logs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                      log.type === 'danger' ? 'text-rose-500 dark:text-rose-400' : 'text-[#5663e8] dark:text-[#5ab5e7]'
                    }`}
                  >
                    {log.text}
                  </div>
                ))}
                <div className="mt-2 animate-pulse text-[#5663e8] dark:text-[#5ab5e7]">&gt; _</div>
              </div>
              
              {/* Footer */}
              <div className="flex justify-between border-t border-slate-200/70 bg-white/80 px-4 py-3 text-[10px] tracking-wider text-slate-500 dark:border-white/5 dark:bg-slate-900/90">
                <span>tcp://swarm.grid:4402</span>
                <span>agents: 1,284 · uptime: 312d 04h</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TELEMETRY TICKER --- */}
      <section className="flex w-full overflow-hidden border-y border-slate-200/70 bg-white/70 py-3 font-mono text-xs text-slate-500 backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50 dark:text-slate-400">
        <div className="flex animate-marquee whitespace-nowrap min-w-full">
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} className="flex items-center mx-6 tracking-wide">
              <span className="text-[#59abe7] mr-4 text-[10px]">▸</span>
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* --- SWARM WORKFLOW --- */}
      <section className="mx-auto max-w-6xl border-t border-slate-200/70 px-6 py-32 dark:border-white/5">
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="mb-8 inline-flex items-center rounded-full border border-slate-200/70 bg-white/72 px-4 py-1.5 text-xs font-mono text-slate-500 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400">
            {"// architecture"}
          </div>
          <h2 className="mb-4 text-4xl font-bold text-slate-950 dark:text-white md:text-5xl">Autonomous Swarm Workflow</h2>
          <p className="font-light text-slate-600 dark:text-slate-400">Visualizing the real-time routing and decision engines inside the hive.</p>
        </div>

        <div className="relative overflow-hidden rounded-[3rem] border border-slate-200/70 bg-white/70 px-4 py-12 shadow-2xl backdrop-blur-md dark:border-white/5 dark:bg-slate-900/30">
           {/* Abstract visual graph representation */}
           <div className="flex flex-col md:flex-row justify-center items-center gap-8 relative z-10">
              
              {/* Data Source */}
              <div className="flex flex-col gap-4">
                 <div className="min-w-40 rounded-3xl border border-[#59abe7]/25 bg-white/80 px-6 py-6 text-center shadow-lg backdrop-blur-sm dark:bg-slate-900/80">
                   <Database className="w-8 h-8 text-[#5ab5e7] mx-auto mb-3" />
                   <div className="font-bold text-slate-900 dark:text-slate-200">Data Lakes</div>
                   <div className="text-xs text-slate-500 font-mono mt-1">LinkedIn, Apollo</div>
                 </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:block text-slate-600">
                 <ArrowRight className="w-8 h-8 opacity-50" />
              </div>
              <div className="block md:hidden text-slate-600">
                 <ArrowRight className="w-8 h-8 rotate-90 opacity-50" />
              </div>

              {/* Agent Grid */}
              <div className="relative grid grid-cols-2 gap-4 rounded-[2.5rem] border border-slate-200/70 bg-white/72 p-8 shadow-inner dark:border-white/5 dark:bg-slate-800/50 md:grid-cols-3">
                 <div className="absolute -top-3 left-8 px-4 py-1 bg-[#5663e8]/10 text-[#5ab5e7] text-[10px] font-mono rounded-full border border-[#59abe7]/25 uppercase font-bold tracking-widest">Agent Cluster</div>
                 <div className="transform rounded-3xl border border-[#59abe7]/30 bg-white px-4 py-6 text-center shadow-xl transition-transform hover:-translate-y-6 dark:bg-slate-900 md:-translate-y-4">
                   <Target className="w-8 h-8 text-[#5ab5e7] mx-auto mb-3" />
                   <div className="text-sm font-bold text-slate-900 dark:text-slate-200">Enrichment</div>
                 </div>
                 <div className="transform rounded-3xl border border-[#59abe7]/30 bg-white px-4 py-6 text-center shadow-xl transition-transform hover:translate-y-2 dark:bg-slate-900 md:translate-y-4">
                   <Handshake className="w-8 h-8 text-[#5ab5e7] mx-auto mb-3" />
                   <div className="text-sm font-bold text-slate-900 dark:text-slate-200">Outreach</div>
                 </div>
                 <div className="transform rounded-3xl border border-[#59abe7]/30 bg-white px-4 py-6 text-center shadow-xl transition-transform hover:-translate-y-4 dark:bg-slate-900 md:-translate-y-2">
                   <ShieldAlert className="w-8 h-8 text-[#5ab5e7] mx-auto mb-3" />
                   <div className="text-sm font-bold text-slate-900 dark:text-slate-200">Objection</div>
                 </div>
                 <div className="transform rounded-3xl border border-[#59abe7]/30 bg-white px-4 py-6 text-center shadow-xl transition-transform hover:translate-y-4 dark:bg-slate-900 md:translate-y-6">
                   <DollarSign className="w-8 h-8 text-[#5ab5e7] mx-auto mb-3" />
                   <div className="text-sm font-bold text-slate-900 dark:text-slate-200">Negotiation</div>
                 </div>
                 <div className="transform rounded-3xl border border-[#59abe7]/30 bg-white px-4 py-6 text-center shadow-xl transition-transform hover:-translate-y-8 dark:bg-slate-900 md:-translate-y-6">
                   <BrainCircuit className="w-8 h-8 text-[#5ab5e7] mx-auto mb-3" />
                   <div className="text-sm font-bold text-slate-900 dark:text-slate-200">Strategy</div>
                 </div>
                 <div className="transform rounded-3xl border border-[#59abe7]/30 bg-white px-4 py-6 text-center shadow-xl transition-transform hover:translate-y-0 dark:bg-slate-900 md:translate-y-2">
                   <FileText className="w-8 h-8 text-[#5ab5e7] mx-auto mb-3" />
                   <div className="text-sm font-bold text-slate-900 dark:text-slate-200">Closing</div>
                 </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:block text-slate-600">
                 <ArrowRight className="w-8 h-8 opacity-50" />
              </div>
              <div className="block md:hidden text-slate-600">
                 <ArrowRight className="w-8 h-8 rotate-90 opacity-50" />
              </div>

              {/* Execution */}
              <div className="flex flex-col gap-4">
                 <div className="min-w-40 rounded-3xl border border-[#59abe7]/25 bg-white/80 px-6 py-6 text-center shadow-lg backdrop-blur-sm dark:bg-slate-900/80">
                   <BarChart className="w-8 h-8 text-[#5ab5e7] mx-auto mb-3" />
                   <div className="font-bold text-slate-900 dark:text-slate-200">CRM Sync</div>
                   <div className="text-xs text-slate-500 font-mono mt-1">Salesforce, Stripe</div>
                 </div>
              </div>
           </div>

           {/* Decorative animated line */}
           <div className="absolute top-1/2 left-0 w-full h-px bg-linear-to-r from-transparent via-[#59abe7]/35 to-transparent blur-sm -translate-y-1/2 pointer-events-none z-0"></div>
        </div>
      </section>


      {/* --- PRIMITIVES GRID --- */}
      <section className="mx-auto max-w-6xl px-6 py-32">
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="mb-8 inline-flex items-center rounded-full border border-slate-200/70 bg-white/72 px-4 py-1.5 text-xs font-mono text-slate-500 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400">
            {"// protocol modules"}
          </div>
          <h2 className="mb-4 text-4xl font-bold text-slate-950 dark:text-white md:text-5xl">A hive that runs the business.</h2>
          <p className="font-light text-slate-600 dark:text-slate-400">Six primitives behind every zero-human enterprise.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRIMITIVES.map((prim, idx) => (
            <div key={idx} className="group rounded-3xl border border-slate-200/70 bg-white/72 p-10 shadow-lg backdrop-blur-sm transition-colors hover:border-[#59abe7]/25 dark:border-white/5 dark:bg-slate-900/40">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/85 transition-colors group-hover:bg-[#5663e8]/10 dark:border-white/10 dark:bg-slate-800">
                <prim.icon className="text-[#5ab5e7] w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-950 dark:text-white">{prim.title}</h3>
              <p className="text-sm font-light leading-relaxed text-slate-600 dark:text-slate-400">
                {prim.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- PROTOCOL PHASES --- */}
      <section className="mx-auto max-w-5xl border-t border-slate-200/70 px-6 py-32 dark:border-white/5">
        <div className="flex flex-col lg:flex-row gap-16 lg:items-center">
          <div className="flex-1 lg:pr-12">
            <div className="mb-8 inline-flex items-center rounded-full border border-slate-200/70 bg-white/72 px-4 py-1.5 text-xs font-mono text-slate-500 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400">
              {"// protocol"}
            </div>
            <h2 className="mb-6 text-4xl font-bold leading-tight text-slate-950 dark:text-white md:text-5xl">
              Four phases. <br/>
              <span className="text-[#5ab5e7] drop-shadow-md">Infinite loop.</span>
            </h2>
            <p className="font-light leading-relaxed text-slate-600 dark:text-slate-400">
              The swarm runs a single directive: maximize ROI. Everything else — tactics, tools, teammates — is expendable.
            </p>
          </div>

          <div className="flex-1 relative pl-4 lg:pl-16">
            <div className="absolute left-8.5 lg:left-20.5 top-6 bottom-6 w-px bg-[#59abe7]/20"></div>

            <div className="space-y-12">
              {PHASES.map((phase, i) => (
                <div key={i} className="flex gap-8 items-start relative z-10 group">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#59abe7]/30 bg-white text-sm font-bold font-mono text-[#5ab5e7] shadow-md transition-all group-hover:bg-[#5663e8]/10 group-hover:shadow-lg group-hover:shadow-[rgba(86,99,232,0.2)] dark:bg-slate-900">
                    {phase.step}
                  </div>
                  <div className="pt-2">
                    <h3 className="mb-2 text-xl font-bold text-slate-950 dark:text-white">{phase.name}</h3>
                    <p className="text-sm font-light leading-relaxed text-slate-600 dark:text-slate-400">{phase.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- SWARM 3D BANNER --- */}
      <section className="relative overflow-hidden border-t border-slate-200/70 bg-background px-6 py-32 dark:border-white/5 dark:bg-slate-950">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 z-10 bg-white/80 dark:bg-slate-950/80"></div>
          <div className="absolute inset-y-0 left-0 z-20 w-3/4 bg-linear-to-r from-background via-background/90 to-transparent dark:from-slate-950 dark:via-slate-950/90"></div>
          <div className="absolute top-0 bottom-0 right-0 w-full md:w-2/3 opacity-50 mix-blend-screen bg-[url('/images/swarm-bg.png')] bg-cover bg-right bg-no-repeat z-0 mask-image:linear-gradient(to_left,black,transparent)]"></div>
          <div className="absolute inset-0 z-20 bg-linear-to-t from-background via-transparent to-background dark:from-slate-950 dark:to-slate-950"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-30 flex items-center min-h-100">
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#59abe7]/30 text-[#5ab5e7] text-xs font-mono bg-[#5663e8]/10 backdrop-blur-sm mb-8 shadow-[0_0_15px_rgba(86,99,232,0.14)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5ab5e7] animate-pulse mr-2"></span>
              native_sales_tools.exe
            </div>
            
            <h2 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-slate-950 dark:text-white md:text-5xl lg:text-6xl">
              A 3D intelligence grid <br/>
              <span className="text-[#5ab5e7] drop-shadow-[0_0_15px_rgba(86,99,232,0.3)]">hunting for ROI.</span>
            </h2>
            
            <p className="mb-10 max-w-xl text-lg font-light leading-relaxed text-slate-700 dark:text-slate-300 md:text-xl">
              Stratum Labs natively integrates the entire sales stack into the hive mind. Forget juggling subscriptions for data enrichment, email sequencing, and CRM. The swarm has its own built-in tools, allowing it to execute the entire sales loop autonomously at scale.
            </p>

            <ul className="space-y-4 font-mono text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center"><span className="text-[#59abe7] mr-3">▸</span> Autonomous sequencing & outbound engines</li>
              <li className="flex items-center"><span className="text-[#59abe7] mr-3">▸</span> Built-in global B2B data lake connections</li>
              <li className="flex items-center"><span className="text-[#59abe7] mr-3">▸</span> Dynamic pricing & autonomous negotiation models</li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="border-t border-slate-200/70 px-6 py-32 dark:border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-[3rem] border border-[#59abe7]/20 bg-[linear-gradient(180deg,rgba(240,246,255,0.95),rgba(231,240,255,0.96))] p-10 shadow-2xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(12,24,54,0.94),rgba(8,17,37,0.84))] dark:shadow-[0_24px_80px_rgba(86,99,232,0.16)] lg:p-16">
            <div className="absolute top-0 right-0 w-150 h-150 bg-[#5663e8]/12 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
            
            <div className="relative z-10 flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="text-[#5ab5e7] font-mono text-xs font-semibold tracking-wider mb-6">
                  {"// final directive"}
                </div>
                <h2 className="mb-4 text-4xl font-bold leading-tight text-slate-950 dark:text-white md:text-5xl">
                  Stop hiring humans. <br/>
                  <span className="text-[#5ab5e7] drop-shadow-md">Deploy the swarm.</span>
                </h2>
                <p className="max-w-md text-lg font-light text-slate-600 dark:text-slate-400">
                  Initialize a console, authorize your first agents, and let the hive ship revenue while you watch.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto lg:flex-row lg:items-center lg:justify-end">
                <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-[#5663e8] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#6570ff] shadow-lg shadow-[rgba(86,99,232,0.24)] whitespace-nowrap">
                  &gt;_ Initialize Console <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link href="/pricing" className="inline-flex items-center justify-center rounded-full border border-slate-200/80 px-6 py-3.5 text-sm font-medium text-slate-700 transition-colors hover:bg-white/70 whitespace-nowrap dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">
                  View pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-200/70 bg-background px-6 py-20 dark:border-white/5 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="md:col-span-1">
            <Link href="/" className="mb-6 inline-flex items-center text-xl font-bold tracking-tight text-slate-950 dark:text-white">
              <div className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200/80 bg-white/80 dark:border-[#59abe7]/30 dark:bg-white/3">
                <Image src="/Stratum_Labs.png" alt="Stratum Labs" width={20} height={20} className="object-contain" />
              </div>
              Stratum <span className="text-[#5ab5e7]">Labs</span>
            </Link>
            <p className="mb-6 text-sm font-light leading-relaxed text-slate-600 dark:text-slate-400">
              A hive of autonomous agents. Zero humans. Maximum ROI. Built for founders who would rather deploy capital than people.
            </p>
            <div className="inline-flex items-center rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#5ab5e7]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5ab5e7] animate-pulse mr-2"></span>
              swarm online
            </div>
          </div>
          
          <div>
            <h4 className="font-mono text-slate-500 mb-6 uppercase tracking-widest text-[10px] font-bold">Product</h4>
            <ul className="space-y-4 text-sm font-light text-slate-600 dark:text-slate-400">
              <li><Link href="/dashboard" className="hover:text-[#59abe7] transition-colors">Console</Link></li>
              <li><Link href="/products" className="hover:text-[#59abe7] transition-colors">Agents</Link></li>
              <li><Link href="/products" className="hover:text-[#59abe7] transition-colors">Protocol</Link></li>
              <li><Link href="/pricing" className="hover:text-[#59abe7] transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-slate-500 mb-6 uppercase tracking-widest text-[10px] font-bold">Company</h4>
            <ul className="space-y-4 text-sm font-light text-slate-600 dark:text-slate-400">
              <li><Link href="/company" className="hover:text-[#59abe7] transition-colors">Manifesto</Link></li>
              <li><Link href="/company" className="hover:text-[#59abe7] transition-colors">Careers</Link></li>
              <li><Link href="/legal" className="hover:text-[#59abe7] transition-colors">Legal</Link></li>
              <li><Link href="/company" className="hover:text-[#59abe7] transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-200/70 pt-8 text-[10px] font-mono tracking-widest text-slate-500 dark:border-white/5 md:flex-row">
          <p>© 2026 Stratum Labs — the humanless company.</p>
          <p>status: <span className="text-[#5ab5e7]">all systems nominal</span></p>
        </div>
      </footer>
    </div>
  );
}
