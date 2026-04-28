import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createManualLead } from "./actions";

export const dynamic = "force-dynamic";

export default function ManualIntakePage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 font-mono text-[10px] text-[#5ab5e7] tracking-widest mb-3 shadow-[0_0_18px_rgba(86,99,232,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5ab5e7] animate-pulse mr-2"></span>
            // manual_injection
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Manual Intake</h1>
          <p className="text-slate-400 mt-1 font-light">Record a lead you met at a conference or through networking.</p>
        </div>
      </div>

      <Card className="shadow-2xl bg-slate-900/40 backdrop-blur-sm border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-[#5663e8]/0 via-[#59abe7]/30 to-[#5663e8]/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <form action={createManualLead}>
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-white font-mono text-sm tracking-widest uppercase">Lead Information</CardTitle>
            <CardDescription className="text-slate-400 font-light">Enter details about the prospect. We will optionally enrich this profile later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="firstName" className="text-slate-300 font-mono text-xs uppercase tracking-widest">First Name</Label>
                <Input id="firstName" name="firstName" required placeholder="Dr. Jane" className="bg-slate-950/50 border-white/10 text-slate-200 focus-visible:ring-[#59abe7]/30 focus-visible:border-[#59abe7]/30 placeholder:text-slate-600 font-mono text-xs" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="lastName" className="text-slate-300 font-mono text-xs uppercase tracking-widest">Last Name</Label>
                <Input id="lastName" name="lastName" required placeholder="Doe" className="bg-slate-950/50 border-white/10 text-slate-200 focus-visible:ring-[#59abe7]/30 focus-visible:border-[#59abe7]/30 placeholder:text-slate-600 font-mono text-xs" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-slate-300 font-mono text-xs uppercase tracking-widest">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="jane@stanford.edu" className="bg-slate-950/50 border-white/10 text-slate-200 focus-visible:ring-[#59abe7]/30 focus-visible:border-[#59abe7]/30 placeholder:text-slate-600 font-mono text-xs" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="institution" className="text-slate-300 font-mono text-xs uppercase tracking-widest">Institution / Company</Label>
                <Input id="institution" name="institution" required placeholder="Stanford University" className="bg-slate-950/50 border-white/10 text-slate-200 focus-visible:ring-[#59abe7]/30 focus-visible:border-[#59abe7]/30 placeholder:text-slate-600 font-mono text-xs" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="role" className="text-slate-300 font-mono text-xs uppercase tracking-widest">Role / Title</Label>
                <Input id="role" name="role" placeholder="Principal Investigator" className="bg-slate-950/50 border-white/10 text-slate-200 focus-visible:ring-[#59abe7]/30 focus-visible:border-[#59abe7]/30 placeholder:text-slate-600 font-mono text-xs" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="eventName" className="text-slate-300 font-mono text-xs uppercase tracking-widest">Event / Conference Met</Label>
                <Input id="eventName" name="eventName" placeholder="e.g. WMIC 2025" className="bg-slate-950/50 border-white/10 text-slate-200 focus-visible:ring-[#59abe7]/30 focus-visible:border-[#59abe7]/30 placeholder:text-slate-600 font-mono text-xs" />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="notes" className="text-slate-300 font-mono text-xs uppercase tracking-widest">Notes & Context</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                placeholder="What did you discuss? What are their pain points?" 
                className="min-h-30 bg-slate-950/50 border-white/10 text-slate-200 focus-visible:ring-[#59abe7]/30 focus-visible:border-[#59abe7]/30 placeholder:text-slate-600 font-mono text-xs"
              />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-950/80 border-t border-white/5 flex justify-end gap-3 rounded-b-xl py-4">
            <Button variant="outline" type="button" className="bg-transparent border-white/10 text-slate-400 hover:bg-white/5 hover:text-slate-200 font-mono text-xs uppercase tracking-wider">Cancel</Button>
            <Button type="submit" className="bg-[#5663e8] hover:bg-[#6570ff] text-white font-bold shadow-[0_0_15px_rgba(86,99,232,0.22)] font-mono text-xs uppercase tracking-wider">Inject Lead</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
