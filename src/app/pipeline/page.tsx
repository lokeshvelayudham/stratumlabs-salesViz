import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import { PipelineRunner } from "./PipelineRunner";

export const dynamic = "force-dynamic";

type RunMetadata = {
  sourceCount?: number;
  newLeadsCount?: number;
  deletedNoiseCount?: number;
};

function parseRunMetadata(metadata: string | null): RunMetadata {
  if (!metadata) {
    return {};
  }

  try {
    const parsed = JSON.parse(metadata) as RunMetadata;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export default async function PipelinePage() {
  const runs = await prisma.pipelineRun.findMany({
    orderBy: { startedAt: 'desc' },
    take: 10,
    include: { steps: true }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/5">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 px-3 py-1 font-mono text-[10px] tracking-widest text-[#5663e8] shadow-[0_0_18px_rgba(86,99,232,0.08)] dark:text-[#5ab5e7] dark:shadow-[0_0_18px_rgba(86,99,232,0.12)]">
            <Play className="w-3 h-3 mr-2" />
            {"// pipeline_orchestrator"}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 font-sans dark:text-white">Pipeline Control</h1>
          <p className="mt-1 font-light text-slate-600 dark:text-slate-400">Deploy autonomous discovery and enrichment swarms.</p>
        </div>
      </div>

      <PipelineRunner />

      <Card className="mt-8 border-slate-200/70 bg-white/78 shadow-2xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40">
        <CardHeader className="border-b border-slate-200/70 pb-4 dark:border-white/5">
          <CardTitle className="text-slate-950 font-mono text-sm tracking-widest uppercase dark:text-white">Telemetry History</CardTitle>
          <CardDescription className="font-light text-slate-600 dark:text-slate-400">Recent swarm execution jobs and pipeline results.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-950/80">
              <TableRow className="border-slate-200/70 hover:bg-transparent dark:border-white/5">
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
                <TableRow className="border-slate-200/70 hover:bg-transparent dark:border-white/5">
                  <TableCell colSpan={8} className="text-center py-12 text-slate-500 font-mono text-xs uppercase tracking-widest opacity-50">
                    No pipeline runs recorded
                  </TableCell>
                </TableRow>
              ) : (
                runs.map(run => {
                  const metadata = parseRunMetadata(run.metadata);

                  return (
                  <TableRow key={run.id} className="border-slate-200/70 transition-colors hover:bg-slate-100/60 dark:border-white/5 dark:hover:bg-slate-800/30">
                    <TableCell className="font-mono text-xs text-slate-700 dark:text-slate-300">{run.type}</TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-400">{format(new Date(run.startedAt), "MMM d, h:mm a")}</TableCell>
                    <TableCell className="text-xs font-mono text-slate-500">
                      {run.finishedAt ? `${Math.round((new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)}s` : '--'}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">
                      {metadata.sourceCount ?? 0}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-[#5ab5e7] drop-shadow-[0_0_8px_rgba(90,181,231,0.3)]">
                      {metadata.newLeadsCount ?? 0}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-rose-500">
                      {metadata.deletedNoiseCount ?? 0}
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
                );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
