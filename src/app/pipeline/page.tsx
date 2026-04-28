import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import { PipelineRunner } from "./PipelineRunner";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const runs = await prisma.pipelineRun.findMany({
    orderBy: { startedAt: 'desc' },
    take: 10,
    include: { steps: true }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 font-mono text-[10px] text-[#5ab5e7] tracking-widest mb-3 shadow-[0_0_18px_rgba(86,99,232,0.12)]">
            <Play className="w-3 h-3 mr-2" />
            // pipeline_orchestrator
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Pipeline Control</h1>
          <p className="text-slate-400 mt-1 font-light">Deploy autonomous discovery and enrichment swarms.</p>
        </div>
      </div>

      <PipelineRunner />

      <Card className="shadow-2xl bg-slate-900/40 backdrop-blur-sm border-white/5 mt-8">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="text-white font-mono text-sm tracking-widest uppercase">Telemetry History</CardTitle>
          <CardDescription className="text-slate-400 font-light">Recent swarm execution jobs and pipeline results.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-950/80">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Type</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Started</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Duration</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Sources</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Leads</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Noise</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Status</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Steps</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.length === 0 ? (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell colSpan={8} className="text-center py-12 text-slate-500 font-mono text-xs uppercase tracking-widest opacity-50">
                    No pipeline runs recorded
                  </TableCell>
                </TableRow>
              ) : (
                runs.map(run => (
                  <TableRow key={run.id} className="border-white/5 hover:bg-slate-800/30 transition-colors">
                    <TableCell className="font-mono text-xs text-slate-300">{run.type}</TableCell>
                    <TableCell className="text-xs text-slate-400">{format(new Date(run.startedAt), "MMM d, h:mm a")}</TableCell>
                    <TableCell className="text-xs font-mono text-slate-500">
                      {run.finishedAt ? `${Math.round((new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)}s` : '--'}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">
                      {run.metadata ? (JSON.parse(run.metadata as string) as any).sourceCount || 0 : 0}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-[#5ab5e7] drop-shadow-[0_0_8px_rgba(90,181,231,0.3)]">
                      {run.metadata ? (JSON.parse(run.metadata as string) as any).newLeadsCount || 0 : 0}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-rose-500">
                      {run.metadata ? (JSON.parse(run.metadata as string) as any).deletedNoiseCount || 0 : 0}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider ${run.status === "COMPLETED" ? "bg-[#59abe7]/12 text-[#5ab5e7] border-[#59abe7]/35" : run.status === "FAILED" ? "bg-rose-500/10 text-rose-500 border-rose-500/30" : "bg-slate-800 text-slate-400 border-white/5"}`}>
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 font-mono text-xs">
                      {run.steps.length}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
