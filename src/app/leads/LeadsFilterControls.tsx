"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";

export function LeadsFilterControls({ totalLeads, campaigns }: { totalLeads: number, campaigns: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  const handleFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchValue) {
        if (params.get("search") !== searchValue) {
          params.set("search", searchValue);
          router.push(`?${params.toString()}`);
        }
      } else if (params.has("search")) {
        params.delete("search");
        router.push(`?${params.toString()}`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, router, searchParams]);

  return (
    <div className="p-4 border-b border-white/5 flex sm:items-center justify-between gap-4 flex-col sm:flex-row bg-slate-900/40 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
        <div className="relative w-full max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-hover:text-[#5ab5e7] transition-colors" />
          <Input 
            type="search" 
            placeholder="Query leads databank..." 
            className="pl-9 bg-slate-950/50 border-white/10 text-slate-200 focus-visible:ring-[#59abe7]/30 focus-visible:border-[#59abe7]/30 placeholder:text-slate-600 font-mono text-xs transition-all hover:bg-slate-900" 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto font-mono text-xs">
          {campaigns && campaigns.length > 0 && (
            <Select 
              value={searchParams.get("eventName") || "all"} 
              onValueChange={(value) => handleFilterChange("eventName", value)}
            >
              <SelectTrigger className="w-45 bg-slate-950/50 border-white/10 text-slate-300 hover:bg-slate-900 hover:text-[#5ab5e7] hover:border-[#59abe7]/25 transition-all focus:ring-[#59abe7]/30">
                <SelectValue placeholder="Campaign Segment" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                <SelectItem value="all" className="focus:bg-[#5663e8]/10 focus:text-[#5ab5e7] cursor-pointer">All Segments</SelectItem>
                {campaigns.map(c => (
                  <SelectItem key={c} value={c} className="focus:bg-[#5663e8]/10 focus:text-[#5ab5e7] cursor-pointer">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select 
            value={searchParams.get("status") || "all"} 
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="w-35 bg-slate-950/50 border-white/10 text-slate-300 hover:bg-slate-900 hover:text-[#5ab5e7] hover:border-[#59abe7]/25 transition-all focus:ring-[#59abe7]/30">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
              <SelectItem value="all" className="focus:bg-[#5663e8]/10 focus:text-[#5ab5e7] cursor-pointer">All Statuses</SelectItem>
              <SelectItem value="NEW" className="focus:bg-[#5663e8]/10 focus:text-[#5ab5e7] cursor-pointer">NEW</SelectItem>
              <SelectItem value="REVIEW" className="focus:bg-[#5663e8]/10 focus:text-[#5ab5e7] cursor-pointer">REVIEW</SelectItem>
              <SelectItem value="APPROVED" className="focus:bg-[#5663e8]/10 focus:text-[#5ab5e7] cursor-pointer">APPROVED</SelectItem>
              <SelectItem value="CONTACTED" className="focus:bg-[#5663e8]/10 focus:text-[#5ab5e7] cursor-pointer">CONTACTED</SelectItem>
              <SelectItem value="INTERESTED" className="focus:bg-[#5663e8]/10 focus:text-[#5ab5e7] cursor-pointer">INTERESTED</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={searchParams.get("sort") || "fitScore_desc"} 
            onValueChange={(value) => handleFilterChange("sort", value)}
          >
            <SelectTrigger className="w-40 bg-slate-950/50 border-white/10 text-slate-300 hover:bg-slate-900 hover:text-[#5ab5e7] hover:border-[#59abe7]/25 transition-all focus:ring-[#59abe7]/30">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
              <SelectItem value="fitScore_desc" className="focus:bg-[#5663e8]/10 focus:text-[#5ab5e7] cursor-pointer">Sort: Score</SelectItem>
              <SelectItem value="createdAt_desc" className="focus:bg-[#5663e8]/10 focus:text-[#5ab5e7] cursor-pointer">Sort: Newest</SelectItem>
              <SelectItem value="tier_asc" className="focus:bg-[#5663e8]/10 focus:text-[#5ab5e7] cursor-pointer">Sort: Tier</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="text-sm text-slate-500 font-mono tracking-wider whitespace-nowrap">
        <span className="text-[#59abe7] font-bold mr-1">{totalLeads}</span>
        records indexed
      </div>
    </div>
  );
}
