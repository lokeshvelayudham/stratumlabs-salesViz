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
      <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/5">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 px-3 py-1 font-mono text-[10px] tracking-widest text-[#5663e8] shadow-[0_0_18px_rgba(86,99,232,0.08)] dark:text-[#5ab5e7] dark:shadow-[0_0_18px_rgba(86,99,232,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5ab5e7] animate-pulse mr-2"></span>
            {"// manual_injection"}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 font-sans dark:text-white">Manual Intake</h1>
          <p className="mt-1 font-light text-slate-600 dark:text-slate-400">Record a lead you met at a conference or through networking.</p>
        </div>
      </div>

      <Card className="group relative overflow-hidden border-slate-200/70 bg-white/78 shadow-2xl backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/40">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-[#5663e8]/0 via-[#59abe7]/30 to-[#5663e8]/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <form action={createManualLead}>
          <CardHeader className="border-b border-slate-200/70 pb-4 dark:border-white/5">
            <CardTitle className="text-slate-950 font-mono text-sm tracking-widest uppercase dark:text-white">Lead Information</CardTitle>
            <CardDescription className="font-light text-slate-600 dark:text-slate-400">Enter details about the prospect. We will optionally enrich this profile later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="firstName" className="text-slate-700 font-mono text-xs uppercase tracking-widest dark:text-slate-300">First Name</Label>
                <Input id="firstName" name="firstName" required placeholder="Dr. Jane" className="border-slate-200 bg-white text-slate-900 font-mono text-xs placeholder:text-slate-400 focus-visible:border-[#59abe7]/30 focus-visible:ring-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-200 dark:placeholder:text-slate-600" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="lastName" className="text-slate-700 font-mono text-xs uppercase tracking-widest dark:text-slate-300">Last Name</Label>
                <Input id="lastName" name="lastName" required placeholder="Doe" className="border-slate-200 bg-white text-slate-900 font-mono text-xs placeholder:text-slate-400 focus-visible:border-[#59abe7]/30 focus-visible:ring-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-200 dark:placeholder:text-slate-600" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-slate-700 font-mono text-xs uppercase tracking-widest dark:text-slate-300">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="jane@stanford.edu" className="border-slate-200 bg-white text-slate-900 font-mono text-xs placeholder:text-slate-400 focus-visible:border-[#59abe7]/30 focus-visible:ring-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-200 dark:placeholder:text-slate-600" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="institution" className="text-slate-700 font-mono text-xs uppercase tracking-widest dark:text-slate-300">Institution / Company</Label>
                <Input id="institution" name="institution" required placeholder="Stanford University" className="border-slate-200 bg-white text-slate-900 font-mono text-xs placeholder:text-slate-400 focus-visible:border-[#59abe7]/30 focus-visible:ring-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-200 dark:placeholder:text-slate-600" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="role" className="text-slate-700 font-mono text-xs uppercase tracking-widest dark:text-slate-300">Role / Title</Label>
                <Input id="role" name="role" placeholder="Principal Investigator" className="border-slate-200 bg-white text-slate-900 font-mono text-xs placeholder:text-slate-400 focus-visible:border-[#59abe7]/30 focus-visible:ring-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-200 dark:placeholder:text-slate-600" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="eventName" className="text-slate-700 font-mono text-xs uppercase tracking-widest dark:text-slate-300">Event / Conference Met</Label>
                <Input id="eventName" name="eventName" placeholder="e.g. WMIC 2025" className="border-slate-200 bg-white text-slate-900 font-mono text-xs placeholder:text-slate-400 focus-visible:border-[#59abe7]/30 focus-visible:ring-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-200 dark:placeholder:text-slate-600" />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="notes" className="text-slate-700 font-mono text-xs uppercase tracking-widest dark:text-slate-300">Notes & Context</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                placeholder="What did you discuss? What are their pain points?" 
                className="min-h-30 border-slate-200 bg-white text-slate-900 font-mono text-xs placeholder:text-slate-400 focus-visible:border-[#59abe7]/30 focus-visible:ring-[#59abe7]/30 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-200 dark:placeholder:text-slate-600"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 rounded-b-xl border-t border-slate-200/70 bg-slate-50/80 py-4 dark:border-white/5 dark:bg-slate-950/80">
            <Button variant="outline" type="button" className="border-slate-200 bg-transparent text-slate-600 font-mono text-xs uppercase tracking-wider hover:bg-white hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200">Cancel</Button>
            <Button type="submit" className="bg-[#5663e8] hover:bg-[#6570ff] text-white font-bold shadow-[0_0_15px_rgba(86,99,232,0.22)] font-mono text-xs uppercase tracking-wider">Inject Lead</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
