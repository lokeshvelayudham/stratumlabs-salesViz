import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setDraftStatus } from "@/app/leads/actions";

export const dynamic = "force-dynamic";

export default async function OutreachPage() {
  const drafts = await prisma.outreachDraft.findMany({
    where: { status: { in: ['PENDING_REVIEW', 'APPROVED'] } },
    include: { lead: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-6 dark:border-white/5">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 px-3 py-1 font-mono text-[10px] tracking-widest text-[#5663e8] shadow-[0_0_18px_rgba(86,99,232,0.08)] dark:text-[#5ab5e7] dark:shadow-[0_0_18px_rgba(86,99,232,0.12)]">
            <Terminal className="mr-2 h-3 w-3" />
            {"// outreach_review"}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 font-sans dark:text-slate-50">Outreach Drafts</h1>
          <p className="mt-1 font-light text-slate-600 dark:text-slate-400">Review, edit, and approve AI-generated emails.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {drafts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white/82 py-16 text-center shadow-sm dark:border-white/10 dark:bg-slate-900/60">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">No Drafts Pending</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">All caught up! Run the pipeline to discover more leads.</p>
          </div>
        ) : (
          drafts.map(draft => (
            <Card key={draft.id} className="border-slate-200/70 bg-white/78 shadow-2xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40">
              <CardHeader className="flex flex-row items-start justify-between border-b border-slate-200/70 pb-4 dark:border-white/5">
                <div>
                  <CardTitle className="text-lg">
                    To: <Link href={`/leads/${draft.leadId}`} className="text-[#5663e8] dark:text-[#5ab5e7] hover:underline">{draft.lead.fullName}</Link>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {draft.lead.institution} • {draft.lead.role}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="mb-1 border border-slate-200/80 bg-white/80 text-slate-600 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-300">{draft.status}</Badge>
                  <div className="text-xs text-slate-400 font-mono">Model: {draft.aiModel}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{formatDistanceToNow(new Date(draft.createdAt), {addSuffix: true})}</div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Subject: </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-50">{draft.subject}</span>
                </div>
                <div className="whitespace-pre-wrap rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 leading-relaxed text-slate-800 dark:border-white/10 dark:bg-slate-950/75 dark:text-slate-200">
                  {draft.body}
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap justify-end gap-3 border-t border-slate-200/70 bg-slate-50/80 pt-4 dark:border-white/5 dark:bg-slate-950/70">
                <Link href={`/leads/${draft.leadId}`} className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5">
                  Edit in Leads
                </Link>
                {draft.status === 'PENDING_REVIEW' ? (
                  <>
                    <form action={setDraftStatus.bind(null, draft.id, 'REJECTED', '/outreach')}>
                      <Button type="submit" variant="destructive" className="border-0 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25">Reject</Button>
                    </form>
                    <form action={setDraftStatus.bind(null, draft.id, 'APPROVED', '/outreach')}>
                      <Button type="submit" className="bg-[#5663e8] hover:bg-[#6570ff] text-white">Approve</Button>
                    </form>
                  </>
                ) : null}
                {draft.status === 'APPROVED' ? (
                  <form action={setDraftStatus.bind(null, draft.id, 'SENT', '/outreach')}>
                    <Button type="submit" className="bg-[#5663e8] hover:bg-[#6570ff] text-white">Mark Sent</Button>
                  </form>
                ) : null}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
