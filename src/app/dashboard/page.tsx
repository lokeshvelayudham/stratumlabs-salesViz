import { prisma } from "@/lib/db";
import { 
  Users, 
  Star, 
  Mail, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Calendar,
  Layers,
  Terminal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    totalLeads,
    tier1Leads,
    pendingDrafts,
    contactedLeads,
    interestedLeads,
    recentActivities,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { tier: 'TIER1' } }),
    prisma.outreachDraft.count({ where: { status: 'PENDING_REVIEW' } }),
    prisma.lead.count({ where: { status: 'CONTACTED' } }),
    prisma.lead.count({ where: { status: 'INTERESTED' } }),
    prisma.activityLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { lead: true }
    })
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 font-mono text-[10px] text-[#5ab5e7] tracking-widest mb-3 shadow-[0_0_18px_rgba(86,99,232,0.12)]">
            <Terminal className="w-3 h-3 mr-2" />
            // dashboard_module
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Swarm Overview</h1>
          <p className="text-slate-400 mt-1 font-light">Real-time telemetry from your autonomous sales hive.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/manual-intake" className={buttonVariants({ variant: "outline", className: "border-white/10 hover:bg-white/5 text-slate-300" })}>Add Lead</Link>
          <Link href="/pipeline" className={buttonVariants({ variant: "default", className: "bg-[#5663e8] hover:bg-[#6570ff] text-white font-bold shadow-[0_0_15px_rgba(86,99,232,0.22)]" })}>Initialize Agents</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg bg-slate-900/50 backdrop-blur-sm border-white/5 hover:border-[#59abe7]/25 transition-all group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-400 group-hover:text-[#5ab5e7] transition-colors">Total Leads</CardTitle>
            <Users className="w-4 h-4 text-[#59abe7]/60 group-hover:text-[#5ab5e7] transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white font-mono">{totalLeads}</div>
            <p className="text-[10px] text-slate-500 mt-2 uppercase font-mono tracking-wider">Indexed across grid</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg bg-slate-900/50 backdrop-blur-sm border-white/5 hover:border-amber-500/20 transition-all group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-400 group-hover:text-amber-400 transition-colors">Tier 1 Fits</CardTitle>
            <Star className="w-4 h-4 text-amber-500/50 group-hover:text-amber-400 transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white font-mono">{tier1Leads}</div>
            <p className="text-[10px] text-slate-500 mt-2 uppercase font-mono tracking-wider">High Priority Targets</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-slate-900/50 backdrop-blur-sm border-white/5 hover:border-rose-500/20 transition-all group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-400 group-hover:text-rose-400 transition-colors">Pending Drafts</CardTitle>
            <Mail className="w-4 h-4 text-rose-500/50 group-hover:text-rose-400 transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white font-mono">{pendingDrafts}</div>
            <p className="text-[10px] text-slate-500 mt-2 uppercase font-mono tracking-wider">Awaiting human review</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-slate-900/50 backdrop-blur-sm border-white/5 hover:border-[#59abe7]/30 transition-all group relative overflow-hidden">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 shadow-lg bg-slate-900/50 backdrop-blur-sm border-white/5">
          <CardHeader>
            <CardTitle className="text-white font-mono text-sm tracking-wider">PIPELINE_ANALYTICS</CardTitle>
            <CardDescription className="text-slate-400 font-light">Visual summary of the lead extraction pipeline</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center bg-slate-950/50 rounded-lg border border-dashed border-white/10 mx-6 mb-6">
            <div className="text-center text-slate-500 flex flex-col items-center">
              <TrendingUp className="h-10 w-10 mb-3 opacity-40 text-[#5ab5e7]" />
              <p className="font-mono text-xs tracking-widest uppercase">Analytics Stream Offline</p>
              <p className="text-[10px] mt-2 opacity-50">Awaiting Recharts Integration</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3 shadow-lg bg-slate-900/50 backdrop-blur-sm border-white/5">
          <CardHeader>
            <CardTitle className="text-white font-mono text-sm tracking-wider">SYSTEM_LOGS</CardTitle>
            <CardDescription className="text-slate-400 font-light">Latest actions taken by the swarm</CardDescription>
          </CardHeader>
          <CardContent>
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
                      <p className="text-sm font-medium leading-none text-slate-200 group-hover:text-[#8dcff1] transition-colors">
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
              <Link href="/activity" className={buttonVariants({ variant: "ghost", className: "w-full text-[#59abe7]/80 hover:text-[#5ab5e7] hover:bg-[#5663e8]/10 font-mono text-xs tracking-widest uppercase" })}>View all telemetry</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
