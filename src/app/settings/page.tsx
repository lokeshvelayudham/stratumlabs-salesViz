import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const scoringSettings = await prisma.appSetting.findUnique({
    where: { key: 'scoring_weights' }
  });

  const parsedWeights = scoringSettings ? JSON.parse(scoringSettings.value) : {
    'preclinical mouse model': 20,
    'whole-organ': 25,
    'spatial biology': 15
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 font-mono text-[10px] text-[#5ab5e7] tracking-widest mb-3 shadow-[0_0_18px_rgba(86,99,232,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5ab5e7] animate-pulse mr-2"></span>
            // system_config
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Settings</h1>
          <p className="text-slate-400 mt-1 font-light">Configure AI scoring, target terms, and system parameters.</p>
        </div>
      </div>

      <Tabs defaultValue="scoring" className="w-full max-w-4xl">
        <TabsList className="bg-slate-900/50 border border-white/5 p-1 rounded-lg">
          <TabsTrigger value="scoring" className="data-[state=active]:bg-[#5663e8]/10 data-[state=active]:text-[#5ab5e7] data-[state=active]:shadow-none font-mono text-xs uppercase tracking-wider text-slate-500 hover:text-slate-300">Scoring logic & ICP</TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-[#5663e8]/10 data-[state=active]:text-[#5ab5e7] data-[state=active]:shadow-none font-mono text-xs uppercase tracking-wider text-slate-500 hover:text-slate-300">Integrations (API)</TabsTrigger>
          <TabsTrigger value="outreach" className="data-[state=active]:bg-[#5663e8]/10 data-[state=active]:text-[#5ab5e7] data-[state=active]:shadow-none font-mono text-xs uppercase tracking-wider text-slate-500 hover:text-slate-300">Outreach Rules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scoring" className="mt-6 space-y-6">
          <Card className="shadow-2xl bg-slate-900/40 backdrop-blur-sm border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-[#5663e8]/0 via-[#59abe7]/30 to-[#5663e8]/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-white font-mono text-sm tracking-widest uppercase">Fit Scoring Weights</CardTitle>
              <CardDescription className="text-slate-400 font-light">Adjust how much each keyword or workflow impacts the overall fit score (0-100 scale).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {Object.entries(parsedWeights).map(([key, val]) => (
                <div key={key} className="flex items-center gap-4">
                  <div className="w-1/2">
                    <Label className="capitalize text-slate-300 font-mono text-xs">{key}</Label>
                  </div>
                  <div className="w-1/4">
                    <Input type="number" defaultValue={val as number} className="bg-slate-950/50 border-white/10 text-[#5ab5e7] font-bold font-mono focus-visible:ring-[#59abe7]/30 focus-visible:border-[#59abe7]/30" />
                  </div>
                </div>
              ))}
              <div className="pt-4 mt-6 border-t border-white/5 flex items-center gap-4">
                <div className="w-1/2"><Input placeholder="New Criterion (e.g. Biodistribution)" className="bg-slate-950/50 border-white/10 text-slate-300 font-mono text-xs placeholder:text-slate-600 focus-visible:ring-[#59abe7]/30 focus-visible:border-[#59abe7]/30" /></div>
                <div className="w-1/4"><Input type="number" placeholder="Weight" className="bg-slate-950/50 border-white/10 text-slate-300 font-mono text-xs placeholder:text-slate-600 focus-visible:ring-[#59abe7]/30 focus-visible:border-[#59abe7]/30" /></div>
                <Button variant="secondary" className="bg-slate-800 text-[#5ab5e7] hover:bg-slate-700 hover:text-[#8dcff1] font-mono text-xs uppercase tracking-wider border border-white/5">Add</Button>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-950/80 border-t border-white/5 py-4">
              <Button className="bg-[#5663e8] hover:bg-[#6570ff] text-white font-bold shadow-[0_0_15px_rgba(86,99,232,0.22)]">Save Weights</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6 space-y-6">
          <Card className="shadow-2xl bg-slate-900/40 backdrop-blur-sm border-white/5 relative overflow-hidden opacity-75">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-white font-mono text-sm tracking-widest uppercase">AI Provider</CardTitle>
              <CardDescription className="text-slate-400 font-light">Configure OpenAI or Anthropic for enrichment and draft generation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label className="text-slate-300 font-mono text-xs uppercase tracking-widest">Provider</Label>
                <div className="flex gap-2">
                  <Badge variant="default" className="bg-[#5663e8]/10 text-[#5ab5e7] border border-[#59abe7]/30 font-mono text-[10px] uppercase tracking-wider">Mock LLM (Active)</Badge>
                  <Badge variant="outline" className="bg-slate-950/50 text-slate-500 border border-white/10 font-mono text-[10px] uppercase tracking-wider">OpenAI</Badge>
                  <Badge variant="outline" className="bg-slate-950/50 text-slate-500 border border-white/10 font-mono text-[10px] uppercase tracking-wider">Anthropic</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-slate-300 font-mono text-xs uppercase tracking-widest">API Key</Label>
                <Input type="password" placeholder="sk-..." disabled className="bg-slate-950/50 border-white/10 text-slate-500 font-mono text-xs opacity-50" />
              </div>
            </CardContent>
            <CardFooter className="bg-slate-950/80 border-t border-white/5 py-4">
              <Button disabled className="bg-slate-800 text-slate-500 font-mono text-xs uppercase tracking-wider border border-white/5 opacity-50">Save Integration</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="outreach" className="mt-6">
          <Card className="shadow-2xl bg-slate-900/40 backdrop-blur-sm border-white/5 relative overflow-hidden opacity-75">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-white font-mono text-sm tracking-widest uppercase">Outreach Rules</CardTitle>
              <CardDescription className="text-slate-400 font-light">Rules for automated drafting.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-xs font-mono text-slate-500">Auto-drafting is enabled for <span className="text-amber-400 border border-amber-500/30 bg-amber-500/10 px-1 py-0.5 rounded">TIER1</span> leads by default.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
