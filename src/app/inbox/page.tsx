import Link from "next/link";
import { Inbox, MessageSquareReply, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { classifyInboxThread, sendInboxReply } from "./actions";

export const dynamic = "force-dynamic";

function getClassificationTone(classification: string) {
  if (classification === "INTERESTED") return "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/18 dark:text-emerald-300";
  if (classification === "OBJECTION") return "bg-amber-500/12 text-amber-700 dark:bg-amber-500/18 dark:text-amber-300";
  if (classification === "SPAM") return "bg-rose-500/10 text-rose-600 dark:bg-rose-500/18 dark:text-rose-300";
  if (classification === "NOT_NOW") return "bg-slate-900/10 text-slate-700 dark:bg-white/10 dark:text-slate-300";
  return "bg-[#5663e8]/10 text-[#5663e8] dark:bg-[#5663e8]/18 dark:text-[#8dcff1]";
}

export default async function InboxPage() {
  await requireCurrentUser();

  const threads = await prisma.inboxThread.findMany({
    orderBy: { lastMessageAt: "desc" },
    include: {
      lead: true,
      agent: true,
      messages: {
        orderBy: { createdAt: "asc" },
        take: 6,
      },
    },
  });

  const openCount = threads.filter((thread) => thread.status === "OPEN" || thread.status === "NEEDS_REVIEW").length;
  const interestedCount = threads.filter((thread) => thread.classification === "INTERESTED").length;
  const needsReviewCount = threads.filter((thread) => thread.status === "NEEDS_REVIEW").length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-6 dark:border-white/5">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 px-3 py-1 font-mono text-[10px] tracking-widest text-[#5663e8] shadow-[0_0_18px_rgba(86,99,232,0.08)] dark:text-[#5ab5e7] dark:shadow-[0_0_18px_rgba(86,99,232,0.12)]">
            <Inbox className="mr-2 h-3 w-3" />
            {"// inbox_control"}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Inbox + Replies</h1>
          <p className="mt-1 font-light text-slate-600 dark:text-slate-400">Classify inbound replies, send operator responses, and feed conversation outcomes back into lead priority.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50"><CardContent className="pt-6"><div className="text-sm font-mono uppercase tracking-[0.18em] text-slate-500">Open Threads</div><div className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{openCount}</div></CardContent></Card>
        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50"><CardContent className="pt-6"><div className="text-sm font-mono uppercase tracking-[0.18em] text-slate-500">Interested Replies</div><div className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{interestedCount}</div></CardContent></Card>
        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50"><CardContent className="pt-6"><div className="text-sm font-mono uppercase tracking-[0.18em] text-slate-500">Needs Review</div><div className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{needsReviewCount}</div></CardContent></Card>
      </div>

      <div className="grid gap-6">
        {threads.length === 0 ? (
          <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
            <CardContent className="py-16 text-center text-slate-500 dark:text-slate-400">No inbox threads yet. Mark a draft as sent or seed sample replies to activate inbox handling.</CardContent>
          </Card>
        ) : (
          threads.map((thread) => (
            <Card key={thread.id} className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle className="text-slate-950 dark:text-white">{thread.subject || "Untitled thread"}</CardTitle>
                    <CardDescription className="mt-2 text-slate-600 dark:text-slate-400">
                      <Link href={`/leads/${thread.leadId}`} className="text-[#5663e8] hover:underline dark:text-[#5ab5e7]">{thread.lead.fullName}</Link>
                      {" · "}
                      {thread.lead.institution || "Unknown organization"}
                      {thread.agent ? ` · ${thread.agent.name}` : " · Unassigned agent"}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{thread.status}</Badge>
                    <Badge className={getClassificationTone(thread.classification)}>{thread.classification}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {thread.summary ? (
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-600 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-300">
                    {thread.summary}
                  </div>
                ) : null}

                <div className="space-y-3">
                  {thread.messages.map((message) => (
                    <div key={message.id} className={`rounded-2xl border p-4 text-sm leading-relaxed ${message.direction === "INBOUND" ? "border-slate-200/80 bg-slate-50/80 text-slate-700 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-200" : "border-[#59abe7]/20 bg-[#5663e8]/8 text-slate-700 dark:border-[#59abe7]/20 dark:bg-[#5663e8]/12 dark:text-slate-100"}`}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        <span>{message.direction}</span>
                        <span>{message.senderEmail || message.senderName || "System"}</span>
                      </div>
                      <p>{message.body}</p>
                      {message.aiSuggestedReply ? (
                        <div className="mt-3 rounded-xl border border-[#59abe7]/20 bg-white/80 p-3 dark:bg-slate-900/70">
                          <div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#5663e8] dark:text-[#5ab5e7]">
                            <Sparkles className="h-3 w-3" /> Suggested reply
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{message.aiSuggestedReply}</p>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
                  <form action={sendInboxReply.bind(null, thread.id, "/inbox")} className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/70">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
                      <MessageSquareReply className="h-3 w-3" /> Reply composer
                    </div>
                    <textarea name="body" placeholder="Send a manual or agent-assisted reply..." className="min-h-24 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#59abe7]/35 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100" />
                    <Button type="submit" className="bg-[#5663e8] hover:bg-[#6570ff] text-white">Send Reply</Button>
                  </form>

                  <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/70">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Classification</div>
                    <div className="grid gap-2">
                      <form action={classifyInboxThread.bind(null, thread.id, "INTERESTED", "/inbox")}><Button type="submit" className="w-full bg-emerald-600 text-white hover:bg-emerald-500">Interested</Button></form>
                      <form action={classifyInboxThread.bind(null, thread.id, "OBJECTION", "/inbox")}><Button type="submit" variant="outline" className="w-full border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20">Objection</Button></form>
                      <form action={classifyInboxThread.bind(null, thread.id, "NOT_NOW", "/inbox")}><Button type="submit" variant="outline" className="w-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5">Not Now</Button></form>
                      <form action={classifyInboxThread.bind(null, thread.id, "SPAM", "/inbox")}><Button type="submit" variant="destructive" className="w-full bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25">Spam</Button></form>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}