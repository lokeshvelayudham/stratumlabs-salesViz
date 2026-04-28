import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const activities = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: { lead: true },
    take: 50
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Activity Log</h1>
        <p className="text-slate-500 dark:text-slate-400">Audit trail of system events, enrichments, and user actions.</p>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardContent className="pt-6">
          {activities.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">No activities recorded yet.</div>
          ) : (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {activities.map((activity) => (
                <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#5663e8]/12 text-[#5663e8] dark:bg-[#5663e8]/20 dark:text-[#8dcff1] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 font-bold text-xs">
                    {activity.type.slice(0, 2)}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900 dark:text-slate-50 text-sm">{activity.type}</span>
                      <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(activity.createdAt), {addSuffix: true})}</span>
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
