import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Terminal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const activities = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: { lead: true },
    take: 50
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-6 dark:border-white/5">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 px-3 py-1 font-mono text-[10px] tracking-widest text-[#5663e8] shadow-[0_0_18px_rgba(86,99,232,0.08)] dark:text-[#5ab5e7] dark:shadow-[0_0_18px_rgba(86,99,232,0.12)]">
            <Terminal className="mr-2 h-3 w-3" />
            {"// activity_log"}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 font-sans dark:text-slate-50">Activity Log</h1>
          <p className="mt-1 font-light text-slate-600 dark:text-slate-400">Audit trail of system events, enrichments, and user actions.</p>
        </div>
      </div>

      <Card className="border-slate-200/70 bg-white/78 shadow-2xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40">
        <CardContent className="pt-6">
          {activities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/80 py-16 text-center text-slate-500 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-400">
              No activities recorded yet.
            </div>
          ) : (
            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-linear-to-b before:from-transparent before:via-slate-200 before:to-transparent dark:before:via-slate-800 md:before:mx-auto md:before:translate-x-0">
              {activities.map((activity) => (
                <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-slate-50 bg-[#5663e8]/12 text-[#5663e8] shadow-sm font-bold text-xs dark:border-slate-950 dark:bg-[#5663e8]/20 dark:text-[#8dcff1] md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    {activity.type.slice(0, 2)}
                  </div>
                  <div className="w-[calc(100%-4rem)] rounded-xl border border-slate-200/80 bg-white/88 p-4 shadow-sm transition-colors group-hover:border-[#59abe7]/25 dark:border-white/8 dark:bg-slate-950/70 md:w-[calc(50%-2.5rem)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900 dark:text-slate-50 text-sm">{activity.type}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{formatDistanceToNow(new Date(activity.createdAt), {addSuffix: true})}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{activity.message}</p>
                    {activity.lead && (
                      <div className="mt-2 text-xs">
                        <Link href={`/leads/${activity.lead.id}`} className="text-[#5663e8] dark:text-[#5ab5e7] hover:underline">
                          &rarr; View Lead: {activity.lead.fullName}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
