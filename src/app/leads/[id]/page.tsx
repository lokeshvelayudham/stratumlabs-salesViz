import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Building2, Mail, Briefcase, ExternalLink, Activity, Network, PenLine, Cpu } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const lead = await prisma.lead.findUnique({
    where: { id: resolvedParams.id },
    include: {
      tags: true,
      scoreBreakdowns: true,
      outreachDrafts: {
        orderBy: { createdAt: 'desc' }
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });

  if (!lead) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/leads" className={buttonVariants({ variant: "ghost", className: "mb-4 -ml-4 text-slate-500 dark:text-slate-400 hover:text-[#5663e8] dark:hover:text-[#8dcff1]" })}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Leads
        </Link>
      </div>

      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{lead.fullName}</h1>
              <Badge variant="outline" className="bg-[#5663e8]/10 text-[#5663e8] border-[#59abe7]/25 dark:bg-[#5663e8]/18 dark:text-[#8dcff1] dark:border-[#59abe7]/30">{lead.tier}</Badge>
              <Badge className="bg-slate-900">{lead.status}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-2">
              {lead.institution && <div className="flex items-center"><Building2 className="w-4 h-4 mr-1.5 opacity-70" />{lead.institution}</div>}
              {lead.role && <div className="flex items-center"><Briefcase className="w-4 h-4 mr-1.5 opacity-70" />{lead.role}</div>}
              {lead.email && <div className="flex items-center"><Mail className="w-4 h-4 mr-1.5 opacity-70" />{lead.email}</div>}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {lead.tags.map(tag => (
              <Badge key={tag.id} variant="secondary" className="bg-slate-100 text-slate-700 dark:text-slate-300 font-normal">
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
            <Button variant="outline">Edit Info</Button>
            <Button className="bg-[#5663e8] hover:bg-[#6570ff] text-white relative">
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              Create Draft
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 p-1 w-full justify-start rounded-lg h-12">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#5663e8]/10 data-[state=active]:text-[#5663e8] dark:data-[state=active]:text-[#8dcff1] text-slate-600 dark:text-slate-400 h-9 px-4">Overview</TabsTrigger>
          <TabsTrigger value="research" className="data-[state=active]:bg-[#5663e8]/10 data-[state=active]:text-[#5663e8] dark:data-[state=active]:text-[#8dcff1] text-slate-600 dark:text-slate-400 h-9 px-4">AI Research</TabsTrigger>
          <TabsTrigger value="outreach" className="data-[state=active]:bg-[#5663e8]/10 data-[state=active]:text-[#5663e8] dark:data-[state=active]:text-[#8dcff1] text-slate-600 dark:text-slate-400 h-9 px-4">Drafts ({lead.outreachDrafts.length})</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-[#5663e8]/10 data-[state=active]:text-[#5663e8] dark:data-[state=active]:text-[#8dcff1] text-slate-600 dark:text-slate-400 h-9 px-4">Activity</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="overview" className="m-0 space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center"><Activity className="w-5 h-5 mr-2 text-[#5663e8] dark:text-[#5ab5e7]"/> Why Relevant for Platform</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {lead.whyRelevant ? <p>{lead.whyRelevant}</p> : <p className="text-slate-400 italic">No relevance summary generated yet.</p>}
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
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
                    <div className="pt-4 border-t border-slate-100">
                      <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Manual Notes</div>
                      <Textarea placeholder="Add a note about this lead..." defaultValue={lead.notes || ""} className="min-h-25 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" />
                      <div className="mt-2 text-right">
                        <Button size="sm" variant="secondary">Save Note</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Scoring Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lead.scoreBreakdowns.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No strict breakdown available.</p>
                    ) : (
                      <div className="space-y-3">
                        {lead.scoreBreakdowns.map((score, i) => (
                          <div key={i} className="flex justify-between items-center pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                            <div className="text-sm text-slate-600 dark:text-slate-400">{score.criterion}</div>
                            <div className="font-medium text-sm">+{score.score}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="research" className="m-0">
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center"><Cpu className="w-5 h-5 mr-2 text-[#5663e8] dark:text-[#5ab5e7]"/> AI Research Summary</CardTitle>
                <CardDescription>Synthesized from {lead.sourceName} and external lookups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-md p-6 border border-slate-100 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner">
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
              <div className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                <PenLine className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">No Drafts Generated</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1 mb-4">You have not generated any outreach drafts for this lead yet.</p>
                <Button>Generate AI Draft</Button>
              </div>
            ) : (
              lead.outreachDrafts.map(draft => (
                <Card key={draft.id} className="shadow-sm border-slate-200 dark:border-slate-800">
                  <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                      <CardTitle className="text-base font-semibold">Subject: {draft.subject}</CardTitle>
                      <CardDescription>Drafted using {draft.aiModel} • {formatDistanceToNow(new Date(draft.createdAt), {addSuffix:true})}</CardDescription>
                    </div>
                    <Badge variant={draft.status === "PENDING_REVIEW" ? "secondary" : "default"}>{draft.status}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300 leading-relaxed shadow-inner">
                      {draft.body}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">Edit Draft</Button>
                      <Button className="bg-[#5663e8] hover:bg-[#6570ff] text-white" size="sm">Approve for Sending</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="activity" className="m-0">
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
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
