import { prisma } from "@/lib/db";
import Link from "next/link";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MoreHorizontal, Terminal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LeadsFilterControls } from "./LeadsFilterControls";

export const dynamic = "force-dynamic";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  
  // Parse params
  const search = typeof params.search === "string" ? params.search : undefined;
  const status = typeof params.status === "string" && params.status !== "all" ? params.status : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "fitScore_desc";
  const eventName = typeof params.eventName === "string" && params.eventName !== "all" ? params.eventName : undefined;

  // Build where clause
  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (eventName) {
    where.eventName = eventName;
  }
  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { institution: { contains: search } },
      { researchArea: { contains: search } },
      { role: { contains: search } },
    ];
  }

  // Build orderBy
  let orderBy: any = {};
  switch (sort) {
    case "fitScore_desc":
      orderBy = { fitScore: 'desc' };
      break;
    case "createdAt_desc":
      orderBy = { createdAt: 'desc' };
      break;
    case "createdAt_asc":
      orderBy = { createdAt: 'asc' };
      break;
    case "tier_asc":
      orderBy = { tier: 'asc' }; // TIER1 before TIER2
      break;
    default:
      orderBy = { fitScore: 'desc' };
  }

  const leads = await prisma.lead.findMany({
    where,
    orderBy,
  });

  // Get distinct campaign headings for filter dropdown
  const distinctEvents = await prisma.lead.findMany({
    where: { eventName: { not: null } },
    select: { eventName: true },
    distinct: ['eventName']
  });
  const campaigns = distinctEvents.map(e => e.eventName).filter(Boolean) as string[];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'TIER1': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'TIER2': return 'bg-[#5663e8]/10 text-[#5ab5e7] border-[#59abe7]/30';
      case 'TIER3': return 'bg-slate-800 text-slate-400 border-slate-700';
      default: return 'bg-slate-800/50 text-slate-500 border-white/5';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-slate-800 text-slate-300 border-white/10';
      case 'REVIEW': return 'bg-[#5663e8]/10 text-[#5ab5e7] border-[#59abe7]/30';
      case 'APPROVED': return 'bg-[#59abe7]/12 text-[#5ab5e7] border-[#59abe7]/35';
      case 'REJECTED': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'CONTACTED': return 'bg-[#5663e8]/12 text-[#5ab5e7] border-[#59abe7]/30';
      case 'REPLIED': return 'bg-[#5663e8]/16 text-[#8dcff1] border-[#59abe7]/30';
      case 'INTERESTED': return 'bg-[#59abe7]/18 text-[#5ab5e7] border-[#59abe7]/45 font-bold shadow-[0_0_10px_rgba(90,181,231,0.22)]';
      default: return 'bg-slate-800 text-slate-400 border-white/5';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 font-mono text-[10px] text-[#5ab5e7] tracking-widest mb-3 shadow-[0_0_18px_rgba(86,99,232,0.12)]">
            <Terminal className="w-3 h-3 mr-2" />
            // prospect_databank
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Leads DB</h1>
          <p className="text-slate-400 mt-1 font-light">Manage and review your AI-discovered prospects.</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 font-mono text-xs tracking-widest uppercase">Export</Button>
          <Button className="bg-[#5663e8] hover:bg-[#6570ff] text-white font-bold shadow-[0_0_15px_rgba(86,99,232,0.22)]">Execute Outreach</Button>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-[#5663e8]/0 via-[#59abe7]/30 to-[#5663e8]/0"></div>
        
        <LeadsFilterControls totalLeads={leads.length} campaigns={campaigns} />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-950/80 border-b border-white/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Prospect</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Research Area</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Source</TableHead>
                <TableHead className="text-center font-mono text-[10px] uppercase tracking-widest text-slate-500">Score</TableHead>
                <TableHead className="text-center font-mono text-[10px] uppercase tracking-widest text-slate-500">Tier</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Status</TableHead>
                <TableHead className="text-right font-mono text-[10px] uppercase tracking-widest text-slate-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableCell colSpan={7} className="text-center py-16 text-slate-500">
                    <Terminal className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="font-mono text-xs tracking-widest uppercase">No records found</p>
                    <p className="text-[10px] mt-1 opacity-50">Run the extraction pipeline to populate</p>
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-slate-800/30 transition-colors border-white/5 group">
                    <TableCell>
                      <Link href={`/leads/${lead.id}`} className="block">
                        <div className="font-semibold text-slate-200 group-hover:text-[#5ab5e7] transition-colors truncate max-w-50">{lead.fullName}</div>
                        <div className="text-sm text-slate-500 truncate max-w-50">{lead.institution}</div>
                        {lead.role && <div className="text-[10px] font-mono text-slate-600 truncate max-w-50 mt-1 tracking-wider uppercase">{lead.role}</div>}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-400 line-clamp-2 max-w-62.5 font-light">
                        {lead.researchArea || "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] text-slate-400 font-mono tracking-wider bg-slate-950/50 border-white/10 uppercase">
                        {lead.sourceName}
                      </Badge>
                      {lead.eventName && (
                        <div className="text-[10px] font-mono text-slate-600 mt-1 max-w-30 truncate tracking-wider uppercase" title={lead.eventName}>
                          {lead.eventName}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {lead.fitScore ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded border border-[#59abe7]/25 bg-[#5663e8]/10 text-sm font-bold text-[#5ab5e7] shadow-[0_0_10px_rgba(86,99,232,0.16)] font-mono">
                          {lead.fitScore}
                        </div>
                      ) : (
                        <span className="text-slate-600 font-mono">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`${getTierColor(lead.tier)} font-mono text-[10px] tracking-wider uppercase`}>
                        {lead.tier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${getStatusColor(lead.status)} border text-[10px] font-mono tracking-wider uppercase`}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "h-8 w-8 p-0 text-slate-500 hover:text-[#5ab5e7] hover:bg-[#5663e8]/10" })}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-slate-300">
                          <div className="px-2 py-1.5 text-[10px] font-mono tracking-widest uppercase text-slate-500">Actions</div>
                          <DropdownMenuItem className="focus:bg-slate-800 focus:text-slate-200 cursor-pointer">
                            <Link href={`/leads/${lead.id}`} className="w-full relative z-10">View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="focus:bg-slate-800 focus:text-slate-200 cursor-pointer">Generate Outreach</DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem className="focus:bg-[#5663e8]/10 focus:text-[#5ab5e7] text-[#5ab5e7] cursor-pointer font-bold">Approve Lead</DropdownMenuItem>
                          <DropdownMenuItem className="focus:bg-rose-500/10 focus:text-rose-400 text-rose-500 cursor-pointer font-bold">Reject Lead</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
