import { prisma } from "@/lib/db";
import { 
  Users, 
  Star, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Terminal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { format, formatDistanceToNow, isSameMonth, startOfMonth, subMonths } from "date-fns";
import { CRM_STAGE_CONFIG, CRM_STATUS_ORDER } from "@/lib/crm";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { PerformanceCharts } from "@/components/dashboard/PerformanceCharts";

type RunMetadata = {
  sourceCount?: number;
  newLeadsCount?: number;
  deletedNoiseCount?: number;
};

const ROI_STAGE_MULTIPLIERS: Record<string, number> = {
  NEW: 0.24,
  REVIEW: 0.38,
  APPROVED: 0.56,
  CONTACTED: 0.82,
  REPLIED: 1.18,
  INTERESTED: 1.84,
  CLOSED: 2.9,
  REJECTED: 0,
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

function estimateLeadReturn(status: string, fitScore: number | null) {
  const scoreFloor = Math.max(fitScore ?? 42, 30);
  const multiplier = ROI_STAGE_MULTIPLIERS[status] ?? 0.2;
  return Math.round(scoreFloor * 18 * multiplier);
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const currentUser = await requireCurrentUser();
  const roiWindowStart = startOfMonth(subMonths(new Date(), 5));

  const [
    totalLeads,
    tier1Leads,
    pendingDrafts,
    interestedLeads,
    recentActivities,
    statusCounts,
    pipelineLeads,
    draftQueue,
    roiLeads,
    recentRuns,
    recentAttributions,
    totalAttributedRevenue,
    activeAgents,
    openThreads,
    recentFeedback,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { tier: 'TIER1' } }),
    prisma.outreachDraft.count({ where: { status: { in: ['PENDING_REVIEW', 'APPROVED'] } } }),
    prisma.lead.count({ where: { status: 'INTERESTED' } }),
    prisma.activityLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { lead: true }
    }),
    prisma.lead.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.lead.findMany({
      select: {
        id: true,
        fullName: true,
        institution: true,
        status: true,
        fitScore: true,
        tier: true,
      },
      orderBy: [
        { fitScore: 'desc' },
        { updatedAt: 'desc' },
      ],
      take: 28,
    }),
    prisma.outreachDraft.findMany({
      where: { status: { in: ['PENDING_REVIEW', 'APPROVED'] } },
      include: { lead: true },
      orderBy: { updatedAt: 'desc' },
      take: 4,
    }),
    prisma.lead.findMany({
      where: { createdAt: { gte: roiWindowStart } },
      select: {
        createdAt: true,
        fitScore: true,
        status: true,
      },
    }),
    prisma.pipelineRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 6,
      select: {
        startedAt: true,
        metadata: true,
      },
    }),
    prisma.revenueAttribution.findMany({
      orderBy: { closedAt: "desc" },
      take: 12,
      include: {
        lead: {
          select: {
            id: true,
            fullName: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.revenueAttribution.aggregate({
      _sum: { amount: true },
    }),
    prisma.swarmAgent.findMany({
      orderBy: [{ revenue: "desc" }, { updatedAt: "desc" }],
      take: 4,
      select: {
        id: true,
        name: true,
        state: true,
        spend: true,
        revenue: true,
      },
    }),
    prisma.inboxThread.count({
      where: {
        status: {
          in: ["OPEN", "NEEDS_REVIEW"],
        },
      },
    }),
    prisma.feedbackEntry.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        lead: { select: { id: true, fullName: true } },
        agent: { select: { id: true, name: true } },
      },
    }),
  ]);

  const statusCountMap = Object.fromEntries(statusCounts.map((entry) => [entry.status, entry._count._all]));
  const pipelineColumns = CRM_STATUS_ORDER.map((status) => ({
    status,
    count: statusCountMap[status] ?? 0,
    leads: pipelineLeads.filter((lead) => lead.status === status).slice(0, 4),
    config: CRM_STAGE_CONFIG[status],
  }));
  const brandColor = currentUser.organizationBrandColor || "#5663e8";
  const usesAttributedRevenue = recentAttributions.length > 0;
  const roiChartData = Array.from({ length: 6 }, (_, index) => {
    const monthDate = startOfMonth(subMonths(new Date(), 5 - index));
    const monthLeads = roiLeads.filter((lead) => isSameMonth(lead.createdAt, monthDate));
    const attributedRevenue = recentAttributions
      .filter((attribution) => isSameMonth(attribution.closedAt, monthDate))
      .reduce((sum, attribution) => sum + attribution.amount, 0);
    const projectedReturn = usesAttributedRevenue
      ? attributedRevenue
      : monthLeads.reduce((sum, lead) => sum + estimateLeadReturn(lead.status, lead.fitScore), 0);
    const spend = currentUser.monthlySpend;

    return {
      label: format(monthDate, "MMM"),
      spend,
      projectedReturn,
      roi: spend > 0 ? ((projectedReturn - spend) / spend) * 100 : 0,
    };
  });
  const swarmPerformanceData = recentRuns
    .slice()
    .reverse()
    .map((run) => {
      const metadata = parseRunMetadata(run.metadata);
      const qualified = metadata.newLeadsCount ?? 0;
      const rejected = metadata.deletedNoiseCount ?? 0;
      const sources = metadata.sourceCount ?? 0;

      return {
        label: format(new Date(run.startedAt), "MMM d"),
        qualified,
        rejected,
        efficiency: sources > 0 ? (qualified / sources) * 100 : 0,
      };
    })
    .filter((run) => run.qualified > 0 || run.rejected > 0 || run.efficiency > 0);
  const averageAgentRoi = activeAgents.length > 0
    ? Math.round(
        activeAgents.reduce((sum, agent) => {
          if (agent.spend <= 0) {
            return sum;
          }

          return sum + ((agent.revenue - agent.spend) / agent.spend) * 100;
        }, 0) / activeAgents.filter((agent) => agent.spend > 0).length,
      )
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/5">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 px-3 py-1 font-mono text-[10px] tracking-widest text-[#5663e8] shadow-[0_0_18px_rgba(86,99,232,0.08)] dark:text-[#5ab5e7] dark:shadow-[0_0_18px_rgba(86,99,232,0.12)]">
            <Terminal className="w-3 h-3 mr-2" />
            {"// dashboard_module"}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 font-sans dark:text-white">Swarm Overview</h1>
          <p className="mt-1 font-light text-slate-600 dark:text-slate-400">Real-time telemetry from your autonomous sales hive.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/manual-intake" className={buttonVariants({ variant: "outline", className: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5" })}>Add Lead</Link>
          <Link href="/pipeline" className={buttonVariants({ variant: "default", className: "bg-[#5663e8] hover:bg-[#6570ff] text-white font-bold shadow-[0_0_15px_rgba(86,99,232,0.22)]" })}>Initialize Agents</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm transition-all hover:border-[#59abe7]/25 dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-500 transition-colors group-hover:text-[#5663e8] dark:text-slate-400 dark:group-hover:text-[#5ab5e7]">Total Leads</CardTitle>
            <Users className="w-4 h-4 text-[#59abe7]/60 group-hover:text-[#5ab5e7] transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-950 font-mono dark:text-white">{totalLeads}</div>
            <p className="text-[10px] text-slate-500 mt-2 uppercase font-mono tracking-wider">Indexed across grid</p>
          </CardContent>
        </Card>
        
        <Card className="group border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm transition-all hover:border-amber-500/20 dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-500 transition-colors group-hover:text-amber-500 dark:text-slate-400 dark:group-hover:text-amber-400">Tier 1 Fits</CardTitle>
            <Star className="w-4 h-4 text-amber-500/50 group-hover:text-amber-400 transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-950 font-mono dark:text-white">{tier1Leads}</div>
            <p className="text-[10px] text-slate-500 mt-2 uppercase font-mono tracking-wider">High Priority Targets</p>
          </CardContent>
        </Card>

        <Card className="group border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm transition-all hover:border-rose-500/20 dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-500 transition-colors group-hover:text-rose-500 dark:text-slate-400 dark:group-hover:text-rose-400">Open Drafts</CardTitle>
            <Mail className="w-4 h-4 text-rose-500/50 group-hover:text-rose-400 transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-950 font-mono dark:text-white">{pendingDrafts}</div>
            <p className="text-[10px] text-slate-500 mt-2 uppercase font-mono tracking-wider">Active review queue</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm transition-all hover:border-[#59abe7]/30 dark:border-white/5 dark:bg-slate-900/50">
          <div className="absolute inset-0 bg-linear-to-r from-[#5663e8]/0 via-[#5663e8]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-400 group-hover:text-[#5ab5e7] transition-colors">Interested</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-[#5ab5e7]" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-[#5ab5e7] font-mono drop-shadow-[0_0_10px_rgba(90,181,231,0.24)]">{interestedLeads}</div>
            <p className="text-[10px] text-slate-500 mt-2 uppercase font-mono tracking-wider">Ready for demo</p>
          </CardContent>
        </Card>
      </div>

      <PerformanceCharts
        roiData={roiChartData}
        swarmPerformanceData={swarmPerformanceData}
        brandColor={brandColor}
        revenueLabel={usesAttributedRevenue ? "Attributed Revenue" : "Projected Return"}
        usesAttributedRevenue={usesAttributedRevenue}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-slate-950 dark:text-white">Active Agents</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Top swarm workers ranked by revenue contribution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Average ROI</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{Number.isFinite(averageAgentRoi) ? `${averageAgentRoi}%` : "--"}</div>
            </div>
            {activeAgents.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Spawn agents in the Swarm page to track memory, budget, and ROI.</p>
            ) : (
              activeAgents.map((agent) => (
                <Link key={agent.id} href="/swarm" className="block rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 transition-colors hover:border-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/70">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-950 dark:text-white">{agent.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{agent.state} · spend {agent.spend > 0 ? `$${agent.spend.toLocaleString()}` : "$0"}</div>
                    </div>
                    <div className="text-sm font-semibold text-slate-950 dark:text-white">${agent.revenue.toLocaleString()}</div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-slate-950 dark:text-white">Inbox Control</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Reply handling and human-in-the-loop feedback.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Open Threads</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{openThreads}</div>
            </div>
            {recentFeedback.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Feedback entries will appear here after inbox triage and agent review.</p>
            ) : (
              recentFeedback.map((entry) => (
                <Link key={entry.id} href={entry.lead ? `/leads/${entry.lead.id}` : "/inbox"} className="block rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 transition-colors hover:border-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/70">
                  <div className="text-sm font-semibold text-slate-950 dark:text-white">{entry.feedbackType}</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{entry.note}</p>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{entry.agent?.name || entry.lead?.fullName || "Feedback"}</div>
                </Link>
              ))
            )}
            <Link href="/inbox" className={buttonVariants({ variant: "outline", className: "w-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5" })}>Open Inbox</Link>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-slate-950 dark:text-white">Attribution Feed</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Closed revenue mapped to specific leads, campaigns, and agents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Total Attributed</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">${(totalAttributedRevenue._sum.amount ?? 0).toLocaleString()}</div>
            </div>
            {recentAttributions.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Record attributed revenue on a lead to activate this feed.</p>
            ) : (
              recentAttributions.slice(0, 4).map((attribution) => (
                <Link key={attribution.id} href={`/leads/${attribution.leadId}`} className="block rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 transition-colors hover:border-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/70">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-950 dark:text-white">{attribution.lead.fullName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{attribution.agent?.name || "No agent"}{attribution.strategyLabel ? ` · ${attribution.strategyLabel}` : ""}</div>
                    </div>
                    <div className="text-sm font-semibold text-slate-950 dark:text-white">${attribution.amount.toLocaleString()}</div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-slate-950 font-mono text-sm tracking-wider dark:text-white">REVENUE_PIPELINE</CardTitle>
            <CardDescription className="font-light text-slate-600 dark:text-slate-400">Live CRM board grouped by lead stage, with the strongest records pinned first.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pipelineColumns.map((column) => (
                <div key={column.status} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/70">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">{column.config.label}</div>
                      <div className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{column.count}</div>
                    </div>
                    <div className="rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-[#5663e8] dark:text-[#5ab5e7]">
                      {column.status}
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{column.config.description}</p>
                  <div className="mt-4 space-y-2.5">
                    {column.leads.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200/80 px-3 py-4 text-center text-[11px] font-mono uppercase tracking-[0.16em] text-slate-400 dark:border-white/10 dark:text-slate-500">
                        No active records
                      </div>
                    ) : (
                      column.leads.map((lead) => (
                        <Link
                          key={lead.id}
                          href={`/leads/${lead.id}`}
                          className="block rounded-xl border border-slate-200/80 bg-white/90 px-3 py-3 transition-colors hover:border-[#59abe7]/30 hover:bg-white dark:border-white/10 dark:bg-slate-900/80 dark:hover:bg-slate-900"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{lead.fullName}</div>
                              <div className="truncate text-xs text-slate-500 dark:text-slate-400">{lead.institution || 'Unknown account'}</div>
                            </div>
                            <div className="rounded-full border border-[#59abe7]/20 bg-[#5663e8]/10 px-2 py-1 text-[10px] font-mono text-[#5663e8] dark:text-[#5ab5e7]">
                              {lead.fitScore ?? '--'}
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-slate-950 font-mono text-sm tracking-wider dark:text-white">CRM_ACTIVITY</CardTitle>
            <CardDescription className="font-light text-slate-600 dark:text-slate-400">Review queue and the latest actions taken across the workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {draftQueue.length > 0 ? (
              <div className="mb-6 space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/70">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">review queue</div>
                {draftQueue.map((draft) => (
                  <Link key={draft.id} href={`/leads/${draft.leadId}`} className="block rounded-xl border border-slate-200/80 bg-white/90 px-3 py-3 transition-colors hover:border-[#59abe7]/30 dark:border-white/10 dark:bg-slate-900/80">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{draft.lead.fullName}</div>
                        <div className="truncate text-xs text-slate-500 dark:text-slate-400">{draft.status === 'APPROVED' ? 'Approved and ready to send' : 'Pending human review'}</div>
                      </div>
                      <div className="rounded-full border border-[#59abe7]/20 bg-[#5663e8]/10 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-[#5663e8] dark:text-[#5ab5e7]">
                        {draft.status}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}

            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500">
                <Clock className="mx-auto h-8 w-8 mb-2 opacity-20" />
                No recent activity.
              </div>
            ) : (
              <div className="space-y-5">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex gap-4 items-start group">
                    <div className="w-1.5 h-1.5 mt-2 rounded-full bg-[#59abe7] shadow-[0_0_8px_rgba(90,181,231,0.55)] shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <p className="text-sm font-medium leading-none text-slate-700 transition-colors group-hover:text-[#5663e8] dark:text-slate-200 dark:group-hover:text-[#8dcff1]">
                        {activity.message}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500 flex items-center tracking-wider uppercase">
                        <Calendar className="mr-1.5 h-3 w-3 opacity-50" />
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        {activity.lead && (
                          <>
                            <span className="mx-2 opacity-30">|</span>
                            <Link href={`/leads/${activity.lead.id}`} className="text-[#59abe7]/80 hover:text-[#5ab5e7] hover:underline">
                              {activity.lead.fullName}
                            </Link>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-white/5">
              <Link href="/activity" className={buttonVariants({ variant: "ghost", className: "w-full font-mono text-xs uppercase tracking-widest text-[#5663e8] hover:bg-[#5663e8]/10 hover:text-[#5663e8] dark:text-[#59abe7]/80 dark:hover:text-[#5ab5e7]" })}>View all telemetry</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
