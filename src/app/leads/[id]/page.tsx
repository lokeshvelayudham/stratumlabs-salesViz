import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, Building2, Mail, Briefcase, ExternalLink, Activity, Network, PenLine, Cpu, MessageSquareReply, HandCoins, ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { addLeadSignal, createOutreachDraft, recordLeadAttribution, recordLeadFeedback, saveLeadNote, setDraftStatus, updateLeadProfile } from "../actions";
import { CRM_STATUS_OPTIONS, LEAD_TIER_OPTIONS } from "@/lib/crm";
import { getLeadRelationGraph } from "@/lib/graph/relation-graph";
import { computeLeadIntelligence, getPriorityBand } from "@/lib/lead-intelligence";

export const dynamic = "force-dynamic";

function getTierBadgeClass(tier: string) {
  if (tier === "TIER1") {
    return "border-[#59abe7]/25 bg-[#5663e8]/10 text-[#5663e8] dark:bg-[#5663e8]/18 dark:text-[#8dcff1] dark:border-[#59abe7]/30";
  }

  if (tier === "TIER2") {
    return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30";
  }

  return "border-slate-200/80 bg-white/80 text-slate-600 dark:border-white/10 dark:bg-slate-950/75 dark:text-slate-300";
}

function getStatusBadgeClass(status: string) {
  if (status === "INTERESTED") {
    return "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/18 dark:text-emerald-300";
  }

  if (status === "CONTACTED") {
    return "bg-[#5663e8]/10 text-[#5663e8] dark:bg-[#5663e8]/18 dark:text-[#8dcff1]";
  }

  if (status === "APPROVED") {
    return "bg-cyan-500/12 text-cyan-700 dark:bg-cyan-500/18 dark:text-cyan-300";
  }

  return "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950";
}

function formatRelationLabel(value: string) {
  return value.toLowerCase().split("_").join(" ");
}

function formatRelationEntityLabel(value: string) {
  return value.toLowerCase().split("_").join(" ");
}

function getRelationEntityTone(entityType: string) {
  if (entityType === "LEAD") {
    return "border-[#59abe7]/25 bg-[#5663e8]/10 text-[#5663e8] dark:border-[#59abe7]/35 dark:bg-[#5663e8]/18 dark:text-[#8dcff1]";
  }

  if (entityType === "AGENT") {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/35 dark:bg-emerald-500/18 dark:text-emerald-300";
  }

  if (entityType === "INBOX_THREAD") {
    return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-500/35 dark:bg-amber-500/18 dark:text-amber-300";
  }

  return "border-slate-200/80 bg-white/80 text-slate-600 dark:border-white/10 dark:bg-slate-950/75 dark:text-slate-300";
}

function getRelationHref(entityType: string, entityId: string) {
  if (entityType === "LEAD") {
    return `/leads/${entityId}`;
  }

  if (entityType === "AGENT") {
    return "/swarm";
  }

  if (entityType === "INBOX_THREAD") {
    return "/inbox";
  }

  return null;
}

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const [lead, agents, relationGraph] = await Promise.all([
    prisma.lead.findUnique({
      where: { id: resolvedParams.id },
      include: {
        tags: true,
        scoreBreakdowns: true,
        signals: {
          orderBy: { createdAt: "desc" },
          take: 8,
        },
        outreachDrafts: {
          orderBy: { createdAt: 'desc' }
        },
        inboxThreads: {
          orderBy: { lastMessageAt: "desc" },
          include: {
            agent: true,
            messages: {
              orderBy: { createdAt: "desc" },
              take: 2,
            },
          },
          take: 4,
        },
        attributions: {
          orderBy: { closedAt: "desc" },
          include: {
            agent: true,
          },
          take: 10,
        },
        feedbackEntries: {
          orderBy: { createdAt: "desc" },
          include: {
            agent: true,
            draft: true,
            createdBy: true,
          },
          take: 8,
        },
        assignedAgent: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    }),
    prisma.swarmAgent.findMany({
      select: {
        id: true,
        name: true,
        state: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 24,
    }),
    getLeadRelationGraph(resolvedParams.id),
  ]);

  if (!lead) return notFound();

  const crmFieldClassName = "mt-1.5 w-full rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-[#59abe7]/35 focus:bg-white dark:border-white/10 dark:bg-slate-950/75 dark:text-slate-100 dark:focus:border-[#59abe7]/35";
  const crmLabelClassName = "text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400";
  const derivedScores = computeLeadIntelligence(lead.fitScore, lead.signals);
  const intentScore = Math.max(lead.intentScore, derivedScores.intentScore);
  const icpScore = Math.max(lead.icpScore, derivedScores.icpScore);
  const priorityScore = Math.max(lead.priorityScore, derivedScores.priorityScore);
  const priorityBand = getPriorityBand(priorityScore);
  const totalAttributedRevenue = lead.attributions.reduce((sum, attribution) => sum + attribution.amount, 0);
  const liveGraphContextCount = (relationGraph?.countsByEntityType.LEAD_SIGNAL ?? 0) + (relationGraph?.countsByEntityType.INBOX_THREAD ?? 0) + (relationGraph?.countsByEntityType.FEEDBACK ?? 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Link href="/leads" className={buttonVariants({ variant: "ghost", className: "mb-4 -ml-4 text-slate-500 dark:text-slate-400 hover:text-[#5663e8] dark:hover:text-[#8dcff1]" })}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Leads
        </Link>
        <div className="mb-3 inline-flex items-center rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 px-3 py-1 font-mono text-[10px] tracking-widest text-[#5663e8] shadow-[0_0_18px_rgba(86,99,232,0.08)] dark:text-[#5ab5e7] dark:shadow-[0_0_18px_rgba(86,99,232,0.12)]">
          {"// lead_profile"}
        </div>
      </div>

      {/* Header Info */}
      <div className="flex flex-col justify-between gap-6 rounded-[1.75rem] border border-slate-200/70 bg-white/78 p-6 shadow-2xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40 md:flex-row md:items-start">
        <div className="space-y-4 max-w-2xl">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{lead.fullName}</h1>
              <Badge variant="outline" className={getTierBadgeClass(lead.tier)}>{lead.tier}</Badge>
              <Badge className={getStatusBadgeClass(lead.status)}>{lead.status}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-2">
              {lead.institution && <div className="flex items-center"><Building2 className="w-4 h-4 mr-1.5 opacity-70" />{lead.institution}</div>}
              {lead.role && <div className="flex items-center"><Briefcase className="w-4 h-4 mr-1.5 opacity-70" />{lead.role}</div>}
              {lead.email && <div className="flex items-center"><Mail className="w-4 h-4 mr-1.5 opacity-70" />{lead.email}</div>}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {lead.tags.map(tag => (
              <Badge key={tag.id} variant="secondary" className="border border-slate-200/80 bg-white/80 text-slate-600 font-normal dark:border-white/10 dark:bg-slate-950/75 dark:text-slate-300">
                {tag.value}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0 gap-4">
          <div className="text-right">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Agent Fit Score</div>
            <div className="text-4xl font-bold text-[#5663e8] dark:text-[#5ab5e7] font-mono tracking-tighter">
              {lead.fitScore || '--'}<span className="text-lg text-slate-400">/100</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="#crm-controls"
              className={buttonVariants({ variant: "outline", className: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5" })}
            >
              CRM Controls
            </Link>
            <form action={createOutreachDraft.bind(null, lead.id, `/leads/${lead.id}`)}>
              <Button className="bg-[#5663e8] hover:bg-[#6570ff] text-white">Create Draft</Button>
            </form>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="h-12 w-full justify-start rounded-xl border border-slate-200/70 bg-white/78 p-1 text-slate-600 dark:border-white/5 dark:bg-slate-900/50 dark:text-slate-400">
          <TabsTrigger value="overview" className="h-9 px-4 text-slate-600 data-active:bg-[#5663e8]/10 data-active:text-[#5663e8] dark:text-slate-400 dark:data-active:text-[#8dcff1]">Overview</TabsTrigger>
          <TabsTrigger value="research" className="h-9 px-4 text-slate-600 data-active:bg-[#5663e8]/10 data-active:text-[#5663e8] dark:text-slate-400 dark:data-active:text-[#8dcff1]">AI Research</TabsTrigger>
          <TabsTrigger value="outreach" className="h-9 px-4 text-slate-600 data-active:bg-[#5663e8]/10 data-active:text-[#5663e8] dark:text-slate-400 dark:data-active:text-[#8dcff1]">Drafts ({lead.outreachDrafts.length})</TabsTrigger>
          <TabsTrigger value="activity" className="h-9 px-4 text-slate-600 data-active:bg-[#5663e8]/10 data-active:text-[#5663e8] dark:text-slate-400 dark:data-active:text-[#8dcff1]">Activity</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="overview" className="m-0 space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card className="border-slate-200/70 bg-white/78 shadow-xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center"><Activity className="w-5 h-5 mr-2 text-[#5663e8] dark:text-[#5ab5e7]"/> Why Relevant for Platform</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {lead.whyRelevant ? <p>{lead.whyRelevant}</p> : <p className="text-slate-400 italic">No relevance summary generated yet.</p>}
                  </CardContent>
                </Card>

                <Card className="border-slate-200/70 bg-white/78 shadow-xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center"><Network className="w-5 h-5 mr-2 text-[#5663e8] dark:text-[#5ab5e7]"/> Source & Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Source Type</div>
                        <div className="text-sm text-slate-900 dark:text-slate-50">{lead.sourceType} {lead.sourceName && `(${lead.sourceName})`}</div>
                      </div>
                      {lead.sourceUrl && (
                        <div>
                          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Source URL</div>
                          <a href={lead.sourceUrl} target="_blank" rel="noreferrer" className="text-sm text-[#5663e8] dark:text-[#5ab5e7] flex items-center hover:underline">
                            View original source <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      )}
                    </div>
                    <form action={saveLeadNote.bind(null, lead.id, `/leads/${lead.id}`)} className="pt-4 border-t border-slate-200/70 dark:border-white/5">
                      <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Manual Notes</div>
                      <textarea
                        name="notes"
                        placeholder="Add a note about this lead..."
                        defaultValue={lead.notes || ""}
                        className="min-h-25 w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-[#59abe7]/30 focus:bg-white dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-200 dark:focus:border-[#59abe7]/35"
                      />
                      <div className="mt-2 text-right">
                        <Button size="sm" type="submit" variant="secondary" className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Save Note</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-slate-200/70 bg-white/78 shadow-xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center"><MessageSquareReply className="w-5 h-5 mr-2 text-[#5663e8] dark:text-[#5ab5e7]"/> Inbox Context</CardTitle>
                    <CardDescription>Recent reply threads tied to this lead.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {lead.inboxThreads.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No inbox threads yet. Mark a draft as sent and conversations will start appearing here.</p>
                    ) : (
                      lead.inboxThreads.map((thread) => (
                        <div key={thread.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/70">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{thread.subject || "Untitled thread"}</div>
                              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{thread.agent?.name || "Unassigned agent"} · {thread.classification}</div>
                            </div>
                            <Link href="/inbox" className="text-sm text-[#5663e8] hover:underline dark:text-[#5ab5e7]">Open Inbox</Link>
                          </div>
                          {thread.messages[0] ? (
                            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{thread.messages[0].body}</p>
                          ) : null}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200/70 bg-white/78 shadow-xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center"><Network className="w-5 h-5 mr-2 text-[#5663e8] dark:text-[#5ab5e7]"/> Relation Graph</CardTitle>
                    <CardDescription>Graph-connected context across agents, threads, revenue, feedback, and similar leads.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Connections</div>
                        <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{relationGraph?.totalRelations ?? 0}</div>
                      </div>
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Lead matches</div>
                        <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{relationGraph?.countsByEntityType.LEAD ?? 0}</div>
                      </div>
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Live context</div>
                        <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{liveGraphContextCount}</div>
                      </div>
                    </div>

                    {!relationGraph || relationGraph.items.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">Graph relations will appear here as more signals, replies, and cross-lead context accumulate.</p>
                    ) : (
                      <div className="space-y-3">
                        {relationGraph.items.map((item) => {
                          const href = getRelationHref(item.target.entityType, item.target.entityId);

                          return (
                            <div key={item.edgeId} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/70">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                  {href ? (
                                    <Link href={href} className="text-sm font-semibold text-[#5663e8] hover:underline dark:text-[#5ab5e7]">
                                      {item.target.label}
                                    </Link>
                                  ) : (
                                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.target.label}</div>
                                  )}
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    <Badge variant="outline" className={getRelationEntityTone(item.target.entityType)}>{formatRelationEntityLabel(item.target.entityType)}</Badge>
                                    <Badge variant="outline" className="text-[10px] uppercase">{formatRelationLabel(item.relationType)}</Badge>
                                    {typeof item.target.healthScore === "number" ? <Badge variant="outline" className="text-[10px] uppercase">health {item.target.healthScore}</Badge> : null}
                                  </div>
                                </div>
                                <div className="shrink-0 text-right text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
                                  <div>strength {item.strength}</div>
                                  <div className="mt-1">confidence {item.confidence}</div>
                                </div>
                              </div>

                              {item.target.summary ? (
                                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.target.summary}</p>
                              ) : null}

                              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.rationale}</p>

                              {item.highlights.length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {item.highlights.map((highlight) => (
                                    <span key={highlight} className="rounded-full border border-slate-200/80 bg-white/90 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300">
                                      {highlight}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card id="crm-controls" className="border-slate-200/70 bg-white/78 shadow-xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">CRM Controls</CardTitle>
                    <CardDescription>Update the live record without leaving the lead profile.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form action={updateLeadProfile.bind(null, lead.id, `/leads/${lead.id}`)} className="space-y-4">
                      <div>
                        <label htmlFor="fullName" className={crmLabelClassName}>Full Name</label>
                        <input id="fullName" name="fullName" defaultValue={lead.fullName} className={crmFieldClassName} />
                      </div>
                      <div>
                        <label htmlFor="email" className={crmLabelClassName}>Email</label>
                        <input id="email" name="email" type="email" defaultValue={lead.email || ""} className={crmFieldClassName} />
                      </div>
                      <div>
                        <label htmlFor="institution" className={crmLabelClassName}>Company / Institution</label>
                        <input id="institution" name="institution" defaultValue={lead.institution || ""} className={crmFieldClassName} />
                      </div>
                      <div>
                        <label htmlFor="role" className={crmLabelClassName}>Role</label>
                        <input id="role" name="role" defaultValue={lead.role || ""} className={crmFieldClassName} />
                      </div>
                      <div>
                        <label htmlFor="researchArea" className={crmLabelClassName}>Research Area</label>
                        <input id="researchArea" name="researchArea" defaultValue={lead.researchArea || ""} className={crmFieldClassName} />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="status" className={crmLabelClassName}>Pipeline Stage</label>
                          <select id="status" name="status" defaultValue={lead.status} className={crmFieldClassName}>
                            {CRM_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="tier" className={crmLabelClassName}>Lead Tier</label>
                          <select id="tier" name="tier" defaultValue={lead.tier} className={crmFieldClassName}>
                            {LEAD_TIER_OPTIONS.map((tier) => (
                              <option key={tier} value={tier}>{tier}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-[#5663e8] hover:bg-[#6570ff] text-white">Save CRM Record</Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-slate-200/70 bg-white/78 shadow-xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center"><Brain className="w-5 h-5 mr-2 text-[#5663e8] dark:text-[#5ab5e7]"/> Lead Intelligence</CardTitle>
                    <CardDescription>Fit, intent, ICP, and priority scoring with signal ingestion.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Fit</div>
                        <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{lead.fitScore ?? derivedScores.fitScore}</div>
                      </div>
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Intent</div>
                        <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{intentScore}</div>
                      </div>
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">ICP</div>
                        <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{icpScore}</div>
                      </div>
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Priority</div>
                        <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-950 dark:text-white">
                          {priorityScore}
                          <Badge variant="outline" className="text-[10px] uppercase">{priorityBand}</Badge>
                        </div>
                      </div>
                    </div>

                    {lead.scoreBreakdowns.length > 0 ? (
                      <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/70">
                        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Existing breakdown</div>
                        {lead.scoreBreakdowns.map((score, i) => (
                          <div key={i} className="flex items-center justify-between border-b border-slate-200/70 pb-2 last:border-0 last:pb-0 dark:border-white/5">
                            <div className="text-sm text-slate-600 dark:text-slate-400">{score.criterion}</div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">+{score.score}</div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/70">
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Signals</div>
                      {lead.signals.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">No custom signals yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {lead.signals.map((signal) => (
                            <div key={signal.id} className="rounded-xl border border-slate-200/80 bg-white/90 p-3 dark:border-white/10 dark:bg-slate-900/80">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{signal.label}</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">{signal.signalType}{signal.source ? ` · ${signal.source}` : ""}</div>
                                </div>
                                <Badge variant="outline">+{signal.score}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <form action={addLeadSignal.bind(null, lead.id, `/leads/${lead.id}`)} className="space-y-3 pt-2">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <select name="signalType" defaultValue="INTENT" className={crmFieldClassName}>
                            <option value="INTENT">INTENT</option>
                            <option value="ICP">ICP</option>
                            <option value="FIT">FIT</option>
                            <option value="TIMING">TIMING</option>
                            <option value="REPLY">REPLY</option>
                          </select>
                          <input name="score" type="number" min="0" max="100" defaultValue="15" className={crmFieldClassName} />
                        </div>
                        <input name="label" placeholder="Raised new fund, changed job, replied quickly" className={crmFieldClassName} />
                        <input name="source" placeholder="Source (optional)" className={crmFieldClassName} />
                        <Button type="submit" className="w-full bg-[#5663e8] hover:bg-[#6570ff] text-white">Add Signal</Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200/70 bg-white/78 shadow-xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center"><HandCoins className="w-5 h-5 mr-2 text-[#5663e8] dark:text-[#5ab5e7]"/> Attribution Engine</CardTitle>
                    <CardDescription>Attribute revenue to agents, campaigns, and strategies.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/70">
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Attributed revenue</div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">${totalAttributedRevenue.toLocaleString()}</div>
                    </div>
                    {lead.attributions.length > 0 ? (
                      <div className="space-y-2">
                        {lead.attributions.map((attribution) => (
                          <div key={attribution.id} className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">${attribution.amount.toLocaleString()}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{attribution.agent?.name || "No agent"}{attribution.strategyLabel ? ` · ${attribution.strategyLabel}` : ""}</div>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(attribution.closedAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <form action={recordLeadAttribution.bind(null, lead.id, `/leads/${lead.id}`)} className="space-y-3 pt-2">
                      <select name="agentId" defaultValue={lead.assignedAgentId || ""} className={crmFieldClassName}>
                        <option value="">No agent</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id}>{agent.name} · {agent.state}</option>
                        ))}
                      </select>
                      <input name="amount" type="number" min="1" placeholder="5000" className={crmFieldClassName} />
                      <input name="campaignName" placeholder="Campaign name" className={crmFieldClassName} />
                      <input name="strategyLabel" placeholder="Strategy label" className={crmFieldClassName} />
                      <textarea name="note" placeholder="What touchpoints or campaign elements closed this deal?" className="min-h-24 w-full rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-[#59abe7]/35 focus:bg-white dark:border-white/10 dark:bg-slate-950/75 dark:text-slate-100 dark:focus:border-[#59abe7]/35" />
                      <Button type="submit" className="w-full bg-[#5663e8] hover:bg-[#6570ff] text-white">Record Attribution</Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-slate-200/70 bg-white/78 shadow-xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center"><ThumbsUp className="w-5 h-5 mr-2 text-[#5663e8] dark:text-[#5ab5e7]"/> Feedback Loop</CardTitle>
                    <CardDescription>Capture operator feedback and feed it back into the swarm memory.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {lead.feedbackEntries.length > 0 ? (
                      <div className="space-y-2">
                        {lead.feedbackEntries.map((entry) => (
                          <div key={entry.id} className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{entry.feedbackType}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{entry.agent?.name || "No agent"}{entry.createdBy?.name ? ` · ${entry.createdBy.name}` : ""}</div>
                              </div>
                              {typeof entry.score === "number" ? <Badge variant="outline">{entry.score}</Badge> : null}
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{entry.note}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No feedback captured yet.</p>
                    )}

                    <form action={recordLeadFeedback.bind(null, lead.id, `/leads/${lead.id}`)} className="space-y-3 pt-2">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <select name="feedbackType" defaultValue="TRAINING" className={crmFieldClassName}>
                          <option value="TRAINING">TRAINING</option>
                          <option value="APPROVED">APPROVED</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="OVERRIDE">OVERRIDE</option>
                          <option value="EDITED">EDITED</option>
                        </select>
                        <select name="sentiment" defaultValue="NEUTRAL" className={crmFieldClassName}>
                          <option value="POSITIVE">POSITIVE</option>
                          <option value="NEUTRAL">NEUTRAL</option>
                          <option value="NEGATIVE">NEGATIVE</option>
                        </select>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <select name="agentId" defaultValue={lead.assignedAgentId || ""} className={crmFieldClassName}>
                          <option value="">No agent</option>
                          {agents.map((agent) => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                          ))}
                        </select>
                        <select name="draftId" defaultValue="" className={crmFieldClassName}>
                          <option value="">No draft</option>
                          {lead.outreachDrafts.map((draft) => (
                            <option key={draft.id} value={draft.id}>{draft.subject}</option>
                          ))}
                        </select>
                      </div>
                      <input name="score" type="number" min="0" max="100" placeholder="Optional score" className={crmFieldClassName} />
                      <textarea name="note" placeholder="What should the agent learn from this? What worked or failed?" className="min-h-24 w-full rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-[#59abe7]/35 focus:bg-white dark:border-white/10 dark:bg-slate-950/75 dark:text-slate-100 dark:focus:border-[#59abe7]/35" />
                      <Button type="submit" className="w-full bg-[#5663e8] hover:bg-[#6570ff] text-white">Store Feedback</Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="research" className="m-0">
            <Card className="border-slate-200/70 bg-white/78 shadow-xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40">
              <CardHeader>
                <CardTitle className="flex items-center"><Cpu className="w-5 h-5 mr-2 text-[#5663e8] dark:text-[#5ab5e7]"/> AI Research Summary</CardTitle>
                <CardDescription>Synthesized from {lead.sourceName} and external lookups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6 leading-relaxed text-slate-800 shadow-inner dark:border-white/10 dark:bg-slate-950/75 dark:text-slate-200">
                  {lead.aiSummary || "Run enrichment to generate an AI summary."}
                </div>
                
                <div className="mt-8">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3 uppercase tracking-wider">Raw Extracted Source Text</h4>
                  <div className="bg-slate-900 text-slate-300 font-mono text-xs rounded-md p-4 overflow-auto max-h-60">
                    {lead.rawSourceText || "// No raw source payload retained"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outreach" className="m-0 space-y-6">
            {lead.outreachDrafts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white/82 py-16 text-center dark:border-white/10 dark:bg-slate-900/60">
                <PenLine className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">No Drafts Generated</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1 mb-4">You have not generated any outreach drafts for this lead yet.</p>
                <form action={createOutreachDraft.bind(null, lead.id, `/leads/${lead.id}`)}>
                  <Button type="submit">Generate AI Draft</Button>
                </form>
              </div>
            ) : (
              lead.outreachDrafts.map(draft => (
                <Card key={draft.id} className="border-slate-200/70 bg-white/78 shadow-xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40">
                  <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                      <CardTitle className="text-base font-semibold">Subject: {draft.subject}</CardTitle>
                      <CardDescription>Drafted using {draft.aiModel} • {formatDistanceToNow(new Date(draft.createdAt), {addSuffix:true})}</CardDescription>
                    </div>
                    <Badge variant={draft.status === "PENDING_REVIEW" ? "secondary" : "default"} className="border border-slate-200/80 bg-white/80 text-slate-600 dark:border-white/10 dark:bg-slate-950/75 dark:text-slate-300">{draft.status}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 font-sans leading-relaxed text-slate-700 shadow-inner dark:border-white/10 dark:bg-slate-950/75 dark:text-slate-300">
                      {draft.body}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {draft.status === "PENDING_REVIEW" ? (
                        <>
                          <form action={setDraftStatus.bind(null, draft.id, "APPROVED", `/leads/${lead.id}`)}>
                            <Button className="bg-[#5663e8] hover:bg-[#6570ff] text-white" size="sm" type="submit">Approve Draft</Button>
                          </form>
                          <form action={setDraftStatus.bind(null, draft.id, "REJECTED", `/leads/${lead.id}`)}>
                            <Button variant="outline" size="sm" type="submit" className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20">Reject Draft</Button>
                          </form>
                        </>
                      ) : null}
                      {draft.status === "APPROVED" ? (
                        <form action={setDraftStatus.bind(null, draft.id, "SENT", `/leads/${lead.id}`)}>
                          <Button className="bg-[#5663e8] hover:bg-[#6570ff] text-white" size="sm" type="submit">Mark Sent</Button>
                        </form>
                      ) : null}
                      {draft.status === "SENT" ? (
                        <Badge className="bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/18 dark:text-emerald-300">Email Sent</Badge>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="activity" className="m-0">
            <Card className="border-slate-200/70 bg-white/78 shadow-xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40">
              <CardContent className="pt-6">
                {lead.activities.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No activity logged.</p>
                ) : (
                  <div className="space-y-4">
                    {lead.activities.map(act => (
                      <div key={act.id} className="flex gap-4">
                        <div className="w-2 h-2 mt-2 rounded-full bg-[#59abe7] ring-4 ring-white dark:ring-slate-900 shrink-0" />
                        <div>
                          <p className="text-sm text-slate-900 dark:text-slate-50">{act.message}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{formatDistanceToNow(new Date(act.createdAt), {addSuffix: true})}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}
