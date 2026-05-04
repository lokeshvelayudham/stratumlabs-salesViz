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
      <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/5">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 px-3 py-1 font-mono text-[10px] tracking-widest text-[#5663e8] shadow-[0_0_18px_rgba(86,99,232,0.08)] dark:text-[#5ab5e7] dark:shadow-[0_0_18px_rgba(86,99,232,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5ab5e7] animate-pulse mr-2"></span>
            {"// system_config"}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 font-sans dark:text-white">Settings</h1>
          <p className="mt-1 font-light text-slate-600 dark:text-slate-400">Configure AI scoring, target terms, and system parameters.</p>
        </div>
      </div>

      <Tabs defaultValue="scoring" className="w-full max-w-4xl">
        <TabsList className="rounded-lg border border-slate-200/70 bg-white/78 p-1 dark:border-white/5 dark:bg-slate-900/50">
          <TabsTrigger value="scoring" className="font-mono text-xs uppercase tracking-wider text-slate-500 hover:text-slate-700 data-[state=active]:bg-[#5663e8]/10 data-[state=active]:text-[#5663e8] data-[state=active]:shadow-none dark:hover:text-slate-300 dark:data-[state=active]:text-[#5ab5e7]">Scoring logic & ICP</TabsTrigger>
          <TabsTrigger value="integrations" className="font-mono text-xs uppercase tracking-wider text-slate-500 hover:text-slate-700 data-[state=active]:bg-[#5663e8]/10 data-[state=active]:text-[#5663e8] data-[state=active]:shadow-none dark:hover:text-slate-300 dark:data-[state=active]:text-[#5ab5e7]">Integrations (API)</TabsTrigger>
          <TabsTrigger value="outreach" className="font-mono text-xs uppercase tracking-wider text-slate-500 hover:text-slate-700 data-[state=active]:bg-[#5663e8]/10 data-[state=active]:text-[#5663e8] data-[state=active]:shadow-none dark:hover:text-slate-300 dark:data-[state=active]:text-[#5ab5e7]">Outreach Rules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scoring" className="mt-6 space-y-6">
          <Card className="group relative overflow-hidden border-slate-200/70 bg-white/78 shadow-2xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40">
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-[#5663e8]/0 via-[#59abe7]/30 to-[#5663e8]/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="border-b border-slate-200/70 pb-4 dark:border-white/5">
              <CardTitle className="text-slate-950 font-mono text-sm tracking-widest uppercase dark:text-white">Fit Scoring Weights</CardTitle>
              <CardDescription className="font-light text-slate-600 dark:text-slate-400">Adjust how much each keyword or workflow impacts the overall fit score (0-100 scale).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {Object.entries(parsedWeights).map(([key, val]) => (
                <div key={key} className="flex items-center gap-4">
                  <div className="w-1/2">
                    <Label className="capitalize text-slate-700 font-mono text-xs dark:text-slate-300">{key}</Label>
                  </div>
                  <div className="w-1/4">
                    <Input type="number" defaultValue={val as number} className="border-slate-200 bg-white text-[#5663e8] font-bold font-mono focus-visible:border-[#59abe7]/30 focus-visible:ring-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/50 dark:text-[#5ab5e7]" />
                  </div>
                </div>
              ))}
              <div className="mt-6 flex items-center gap-4 border-t border-slate-200/70 pt-4 dark:border-white/5">
                <div className="w-1/2"><Input placeholder="New Criterion (e.g. Biodistribution)" className="border-slate-200 bg-white text-slate-700 font-mono text-xs placeholder:text-slate-400 focus-visible:border-[#59abe7]/30 focus-visible:ring-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300 dark:placeholder:text-slate-600" /></div>
                <div className="w-1/4"><Input type="number" placeholder="Weight" className="border-slate-200 bg-white text-slate-700 font-mono text-xs placeholder:text-slate-400 focus-visible:border-[#59abe7]/30 focus-visible:ring-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300 dark:placeholder:text-slate-600" /></div>
                <Button variant="secondary" className="border border-slate-200 bg-white text-[#5663e8] font-mono text-xs uppercase tracking-wider hover:bg-slate-50 hover:text-[#5663e8] dark:border-white/5 dark:bg-slate-800 dark:text-[#5ab5e7] dark:hover:bg-slate-700 dark:hover:text-[#8dcff1]">Add</Button>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-200/70 bg-slate-50/80 py-4 dark:border-white/5 dark:bg-slate-950/80">
              <Button className="bg-[#5663e8] hover:bg-[#6570ff] text-white font-bold shadow-[0_0_15px_rgba(86,99,232,0.22)]">Save Weights</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6 space-y-6">
          <Card className="relative overflow-hidden border-slate-200/70 bg-white/78 opacity-75 shadow-2xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40">
            <CardHeader className="border-b border-slate-200/70 pb-4 dark:border-white/5">
              <CardTitle className="text-slate-950 font-mono text-sm tracking-widest uppercase dark:text-white">AI Provider</CardTitle>
              <CardDescription className="font-light text-slate-600 dark:text-slate-400">Configure OpenAI or Anthropic for enrichment and draft generation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label className="text-slate-700 font-mono text-xs uppercase tracking-widest dark:text-slate-300">Provider</Label>
                <div className="flex gap-2">
                  <Badge variant="default" className="bg-[#5663e8]/10 text-[#5ab5e7] border border-[#59abe7]/30 font-mono text-[10px] uppercase tracking-wider">Mock LLM (Active)</Badge>
                  <Badge variant="outline" className="border border-slate-200 bg-white text-slate-500 font-mono text-[10px] uppercase tracking-wider dark:border-white/10 dark:bg-slate-950/50">OpenAI</Badge>
                  <Badge variant="outline" className="border border-slate-200 bg-white text-slate-500 font-mono text-[10px] uppercase tracking-wider dark:border-white/10 dark:bg-slate-950/50">Anthropic</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-slate-700 font-mono text-xs uppercase tracking-widest dark:text-slate-300">API Key</Label>
                <Input type="password" placeholder="sk-..." disabled className="border-slate-200 bg-white text-slate-500 font-mono text-xs opacity-50 dark:border-white/10 dark:bg-slate-950/50" />
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-200/70 bg-slate-50/80 py-4 dark:border-white/5 dark:bg-slate-950/80">
              <Button disabled className="border border-slate-200 bg-white text-slate-500 font-mono text-xs uppercase tracking-wider opacity-50 dark:border-white/5 dark:bg-slate-800">Save Integration</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="outreach" className="mt-6">
          <Card className="relative overflow-hidden border-slate-200/70 bg-white/78 opacity-75 shadow-2xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40">
            <CardHeader className="border-b border-slate-200/70 pb-4 dark:border-white/5">
              <CardTitle className="text-slate-950 font-mono text-sm tracking-widest uppercase dark:text-white">Outreach Rules</CardTitle>
              <CardDescription className="font-light text-slate-600 dark:text-slate-400">Rules for automated drafting.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-xs font-mono text-slate-500">Auto-drafting is enabled for <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1 py-0.5 text-amber-500 dark:text-amber-400">TIER1</span> leads by default.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
