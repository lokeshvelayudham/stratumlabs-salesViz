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
    <div className="flex flex-col justify-between gap-4 border-b border-slate-200/70 bg-white/72 p-4 backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40 sm:flex-row sm:items-center">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
        <div className="relative w-full max-w-sm group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-hover:text-[#5663e8] dark:group-hover:text-[#5ab5e7]" />
          <Input 
            type="search" 
            placeholder="Query leads databank..." 
            className="border-slate-200 bg-white pl-9 text-slate-900 font-mono text-xs placeholder:text-slate-400 transition-all hover:bg-slate-50 focus-visible:border-[#59abe7]/30 focus-visible:ring-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-200 dark:placeholder:text-slate-600 dark:hover:bg-slate-900" 
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
              <SelectTrigger className="w-45 border-slate-200 bg-white text-slate-700 transition-all hover:border-[#59abe7]/25 hover:bg-slate-50 hover:text-[#5663e8] focus:ring-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-[#5ab5e7]">
                <SelectValue placeholder="Campaign Segment" />
              </SelectTrigger>
              <SelectContent className="border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
                <SelectItem value="all" className="cursor-pointer focus:bg-[#5663e8]/10 focus:text-[#5663e8] dark:focus:text-[#5ab5e7]">All Segments</SelectItem>
                {campaigns.map(c => (
                  <SelectItem key={c} value={c} className="cursor-pointer focus:bg-[#5663e8]/10 focus:text-[#5663e8] dark:focus:text-[#5ab5e7]">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select 
            value={searchParams.get("status") || "all"} 
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="w-35 border-slate-200 bg-white text-slate-700 transition-all hover:border-[#59abe7]/25 hover:bg-slate-50 hover:text-[#5663e8] focus:ring-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-[#5ab5e7]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
              <SelectItem value="all" className="cursor-pointer focus:bg-[#5663e8]/10 focus:text-[#5663e8] dark:focus:text-[#5ab5e7]">All Statuses</SelectItem>
              <SelectItem value="NEW" className="cursor-pointer focus:bg-[#5663e8]/10 focus:text-[#5663e8] dark:focus:text-[#5ab5e7]">NEW</SelectItem>
              <SelectItem value="REVIEW" className="cursor-pointer focus:bg-[#5663e8]/10 focus:text-[#5663e8] dark:focus:text-[#5ab5e7]">REVIEW</SelectItem>
              <SelectItem value="APPROVED" className="cursor-pointer focus:bg-[#5663e8]/10 focus:text-[#5663e8] dark:focus:text-[#5ab5e7]">APPROVED</SelectItem>
              <SelectItem value="CONTACTED" className="cursor-pointer focus:bg-[#5663e8]/10 focus:text-[#5663e8] dark:focus:text-[#5ab5e7]">CONTACTED</SelectItem>
              <SelectItem value="INTERESTED" className="cursor-pointer focus:bg-[#5663e8]/10 focus:text-[#5663e8] dark:focus:text-[#5ab5e7]">INTERESTED</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={searchParams.get("sort") || "fitScore_desc"} 
            onValueChange={(value) => handleFilterChange("sort", value)}
          >
            <SelectTrigger className="w-40 border-slate-200 bg-white text-slate-700 transition-all hover:border-[#59abe7]/25 hover:bg-slate-50 hover:text-[#5663e8] focus:ring-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-[#5ab5e7]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
              <SelectItem value="fitScore_desc" className="cursor-pointer focus:bg-[#5663e8]/10 focus:text-[#5663e8] dark:focus:text-[#5ab5e7]">Sort: Score</SelectItem>
              <SelectItem value="createdAt_desc" className="cursor-pointer focus:bg-[#5663e8]/10 focus:text-[#5663e8] dark:focus:text-[#5ab5e7]">Sort: Newest</SelectItem>
              <SelectItem value="tier_asc" className="cursor-pointer focus:bg-[#5663e8]/10 focus:text-[#5663e8] dark:focus:text-[#5ab5e7]">Sort: Tier</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="text-sm text-slate-500 font-mono tracking-wider whitespace-nowrap">
        <span className="mr-1 font-bold text-[#5663e8] dark:text-[#59abe7]">{totalLeads}</span>
        records indexed
      </div>
    </div>
  );
}
