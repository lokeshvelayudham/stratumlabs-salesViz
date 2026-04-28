import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function OutreachPage() {
  const drafts = await prisma.outreachDraft.findMany({
    where: { status: 'PENDING_REVIEW' },
    include: { lead: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Outreach Drafts</h1>
        <p className="text-slate-500 dark:text-slate-400">Review, edit, and approve AI-generated emails.</p>
      </div>

      <div className="grid gap-6">
        {drafts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">No Drafts Pending</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">All caught up! Run the pipeline to discover more leads.</p>
          </div>
        ) : (
          drafts.map(draft => (
            <Card key={draft.id} className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row justify-between items-start pb-4 border-b border-slate-100">
                <div>
                  <CardTitle className="text-lg">
                    To: <Link href={`/leads/${draft.leadId}`} className="text-[#5663e8] dark:text-[#5ab5e7] hover:underline">{draft.lead.fullName}</Link>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {draft.lead.institution} • {draft.lead.role}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="mb-1">{draft.status}</Badge>
                  <div className="text-xs text-slate-400 font-mono">Model: {draft.aiModel}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{formatDistanceToNow(new Date(draft.createdAt), {addSuffix: true})}</div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Subject: </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-50">{draft.subject}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-md p-4 border border-slate-100 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {draft.body}
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 pt-4 flex justify-end gap-3">
                <Button variant="outline">Edit in Leads</Button>
                <Button variant="destructive" className="bg-red-50 text-red-700 hover:bg-red-100 border-0">Reject</Button>
                <Button className="bg-[#5663e8] hover:bg-[#6570ff] text-white">Approve & Send</Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
