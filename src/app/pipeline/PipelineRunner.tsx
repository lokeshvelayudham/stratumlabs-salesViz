"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Sparkles, X, Plus } from "lucide-react";
import { runDiscoveryPipeline } from "@/lib/pipeline/pipelineOrchestrator";
import { toast } from "sonner";
import { discoverUrlsWithAi } from "@/lib/ai/aiActions";
import { Input } from "@/components/ui/input";

export function PipelineRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [manualUrl, setManualUrl] = useState("");

  const [heading, setHeading] = useState("");

  const handleAiDiscovery = async () => {
    if (!aiPrompt.trim()) return toast.error("Please describe your product or target audience first.");
    
    setIsDiscovering(true);
    toast("AI Auto-Discovery Started", { description: "Translating intent and scouring databases..." });
    
    // Auto-set the heading based on AI prompt if not already set
    if (!heading.trim()) {
      setHeading(aiPrompt.substring(0, 40) + (aiPrompt.length > 40 ? "..." : ""));
    }
    
    const res = await discoverUrlsWithAi(aiPrompt);
    
    if (res.success && res.urls) {
      // Merge unique URLs safely
      const newUrls = Array.from(new Set([...urls, ...res.urls]));
      setUrls(newUrls);
      toast.success("Targets Acquired", { description: `Found ${res.urls.length} highly relevant URLs!` });
      setAiPrompt(""); // Clear input
    } else {
      toast.error("Discovery Failed", { description: res.error });
    }
    setIsDiscovering(false);
  };

  const addManualUrl = () => {
    if (!manualUrl.trim() || urls.includes(manualUrl.trim())) return;
    setUrls([manualUrl.trim(), ...urls]);
    setManualUrl("");
  };

  const removeUrl = (urlToRemove: string) => {
    setUrls(urls.filter(u => u !== urlToRemove));
  };

  const handleRun = async () => {
    if (urls.length === 0) {
      return toast.error("No sources configured", { description: "Please discover or add URLs first." });
    }
    if (!heading.trim()) {
      return toast.error("Campaign heading required", { description: "Please enter a heading to group these leads." });
    }

    setIsRunning(true);
    toast("Pipeline started", { description: "Scraping and analyzing leads..." });
    
    const res = await runDiscoveryPipeline(urls, heading);
    
    if (res.success) {
      toast.success("Pipeline completed", { description: `Processed ${urls.length} targets successfully.` });
      setUrls([]); // Clear queue after successful run
      setHeading(""); // Reset heading
    } else {
      toast.error("Pipeline failed", { description: res.error });
    }
    setIsRunning(false);
  };

  return (
    <div className="group relative mb-6 w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200/70 bg-white/78 shadow-2xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40">
      <div className="absolute top-0 left-0 w-px h-full bg-[#59abe7]/60 shadow-[0_0_15px_rgba(90,181,231,0.65)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="border-b border-slate-200/70 bg-slate-50/80 p-5 dark:border-white/5 dark:bg-slate-950/80">
        <h3 className="text-lg font-mono tracking-widest uppercase font-bold text-[#5ab5e7] flex items-center mb-1">
          <Sparkles className="w-4 h-4 mr-2" /> Target_Acquisition
        </h3>
        <p className="mb-4 text-xs font-mono text-slate-600 dark:text-slate-400">Describe parameters. AI will autonomously hunt targets and build the scraping queue.</p>
        
        {/* Chatbot Discovery Input */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <Input 
            placeholder="e.g. Find leads for CryoViz, targeting researchers in spatial biology & whole organ imaging..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={isDiscovering || isRunning}
            className="flex-1 border-slate-200 bg-white text-slate-900 font-mono text-xs placeholder:text-slate-400 focus-visible:border-[#59abe7]/30 focus-visible:ring-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-200 dark:placeholder:text-slate-600"
            onKeyDown={(e) => e.key === 'Enter' && handleAiDiscovery()}
          />
          <Button 
            onClick={handleAiDiscovery} 
            disabled={isDiscovering || isRunning || !aiPrompt.trim()}
            variant="outline"
            className="min-w-35 border-[#59abe7]/25 bg-[#5663e8]/10 font-mono text-xs uppercase tracking-wider text-[#5663e8] hover:bg-[#5663e8]/14 dark:text-[#5ab5e7]"
          >
            {isDiscovering ? <span className="animate-pulse">Searching...</span> : "Auto-Discover"}
          </Button>
        </div>

        {/* Manual Add Input */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-2">
            <Input 
              placeholder="Or inject specific URL manually (e.g. biorxiv.org/...)"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              disabled={isRunning}
              className="border-slate-200 bg-white text-slate-900 font-mono text-xs placeholder:text-slate-400 focus-visible:border-[#59abe7]/30 focus-visible:ring-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-200 dark:placeholder:text-slate-600"
              onKeyDown={(e) => e.key === 'Enter' && addManualUrl()}
            />
            <Button onClick={addManualUrl} disabled={!manualUrl.trim() || isRunning} variant="secondary" size="icon" className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-white/5 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Visual URL Queue */}
      <div className="bg-white/72 p-5 dark:bg-slate-900/30">
        <div className="flex justify-between items-end mb-3">
          <span className="text-xs font-mono tracking-widest uppercase text-slate-500">Scraping_Queue <span className="text-[#5ab5e7]">[{urls.length}]</span></span>
        </div>
        
        <div className="min-h-30 max-h-62.5 w-full space-y-2 overflow-y-auto rounded-md border border-slate-200/70 bg-slate-50/80 p-2 dark:border-white/5 dark:bg-slate-950/80">
          {urls.length === 0 ? (
            <div className="flex h-full items-center justify-center font-mono text-xs text-slate-600 py-10 uppercase tracking-widest opacity-50">
              Queue Empty. Awaiting Directives.
            </div>
          ) : (
            urls.map((url, idx) => (
              <div key={idx} className="group/item flex items-center justify-between rounded border border-slate-200/70 bg-white/80 px-3 py-2 text-sm transition-colors hover:border-[#59abe7]/25 dark:border-white/5 dark:bg-slate-900/50">
                <span className="line-clamp-1 truncate mr-4 text-[#59abe7]/80 group-hover/item:text-[#8dcff1] font-mono text-xs transition-colors">{url}</span>
                <button 
                  onClick={() => removeUrl(url)} 
                  disabled={isRunning}
                  className="text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 p-1 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Action Bar */}
        <div className="mt-5 flex flex-col sm:flex-row gap-4 items-end justify-between">
          <div className="w-full sm:w-1/2">
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-slate-500">Campaign Segment <span className="text-rose-500">*</span></label>
            <Input 
              placeholder="e.g. Immunology Conference Q3..."
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              disabled={isRunning}
              className="border-slate-200 bg-white text-slate-900 font-mono text-xs placeholder:text-slate-400 focus-visible:border-[#59abe7]/30 focus-visible:ring-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-200 dark:placeholder:text-slate-600"
            />
          </div>
          <Button 
            onClick={handleRun} 
            disabled={isRunning || urls.length === 0}
            className="bg-[#5663e8] hover:bg-[#6570ff] shadow-[0_0_15px_rgba(86,99,232,0.22)] text-white font-bold w-full sm:w-auto px-8 h-10 tracking-wide"
          >
            <Play className={`w-4 h-4 mr-2 ${isRunning ? 'animate-pulse' : ''}`} />
            {isRunning ? "Executing Swarm..." : `Deploy Pipeline (${urls.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
