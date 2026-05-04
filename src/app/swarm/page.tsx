import { Bot, DollarSign, Gauge, MemoryStick, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { formatCurrency } from "@/lib/plans";
import { addAgentMemoryEntry, createSwarmAgent, recordAgentSpend, setAgentState } from "./actions";

export const dynamic = "force-dynamic";

function getAgentRoi(spend: number, revenue: number) {
  if (spend <= 0) {
    return null;
  }

  return Math.round(((revenue - spend) / spend) * 100);
}

export default async function SwarmPage() {
  const currentUser = await requireCurrentUser();

  const agents = await prisma.swarmAgent.findMany({
    where:
      currentUser.role === "SUPER_ADMIN"
        ? undefined
        : currentUser.organizationId
          ? {
              OR: [
                { organizationId: currentUser.organizationId },
                { ownerId: currentUser.id },
              ],
            }
          : { ownerId: currentUser.id },
    include: {
      memoryEntries: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
      feedbackEntries: {
        orderBy: { createdAt: "desc" },
        take: 2,
      },
      _count: {
        select: {
          leads: true,
          attributions: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  const totalBudget = agents.reduce((sum, agent) => sum + agent.budget, 0);
  const totalSpend = agents.reduce((sum, agent) => sum + agent.spend, 0);
  const totalRevenue = agents.reduce((sum, agent) => sum + agent.revenue, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/5">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 px-3 py-1 font-mono text-[10px] tracking-widest text-[#5663e8] shadow-[0_0_18px_rgba(86,99,232,0.08)] dark:text-[#5ab5e7] dark:shadow-[0_0_18px_rgba(86,99,232,0.12)]">
            <Bot className="mr-2 h-3 w-3" />
            {"// swarm_engine"}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Swarm Engine</h1>
          <p className="mt-1 font-light text-slate-600 dark:text-slate-400">Persistent agent memory, capital allocation, and swarm-level feedback loops.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              <MemoryStick className="h-4 w-4 text-[#5ab5e7]" /> Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-950 dark:text-white">{agents.length}</div>
            <p className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Persistent swarm workers</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              <DollarSign className="h-4 w-4 text-[#5ab5e7]" /> Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-950 dark:text-white">{formatCurrency(totalBudget)}</div>
            <p className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Capital allocated to the swarm</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              <Gauge className="h-4 w-4 text-[#5ab5e7]" /> Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-950 dark:text-white">{formatCurrency(totalSpend)}</div>
            <p className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Execution burn already deployed</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              <TrendingUp className="h-4 w-4 text-[#5ab5e7]" /> Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-950 dark:text-white">{formatCurrency(totalRevenue)}</div>
            <p className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Attributed back to live agents</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-slate-950 dark:text-white">Spawn Agent</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">Create a persistent worker with a goal, strategy, and capital allocation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createSwarmAgent} className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_180px]">
            <input name="name" placeholder="Closer-01" className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#59abe7]/35 dark:border-white/10 dark:bg-slate-950/75 dark:text-slate-100" />
            <input name="goal" placeholder="Book meetings for operator-tier B2B leads" className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#59abe7]/35 dark:border-white/10 dark:bg-slate-950/75 dark:text-slate-100" />
            <input name="strategy" placeholder="Email + enrichment + follow-up" className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#59abe7]/35 dark:border-white/10 dark:bg-slate-950/75 dark:text-slate-100" />
            <div className="flex gap-3">
              <input name="budget" type="number" min="0" placeholder="2500" className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#59abe7]/35 dark:border-white/10 dark:bg-slate-950/75 dark:text-slate-100" />
              <Button type="submit" className="bg-[#5663e8] hover:bg-[#6570ff] text-white">Spawn</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        {agents.length === 0 ? (
          <Card className="xl:col-span-2 border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
            <CardContent className="py-16 text-center text-slate-500 dark:text-slate-400">No agents yet. Spawn the first worker to start building agent memory and attribution.</CardContent>
          </Card>
        ) : (
          agents.map((agent) => {
            const roi = getAgentRoi(agent.spend, agent.revenue);

            return (
              <Card key={agent.id} className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-slate-950 dark:text-white">{agent.name}</CardTitle>
                      <CardDescription className="mt-1 text-slate-600 dark:text-slate-400">{agent.goal}</CardDescription>
                    </div>
                    <Badge variant="outline" className="border-[#59abe7]/25 bg-[#5663e8]/10 text-[#5663e8] dark:text-[#5ab5e7]">{agent.state}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Budget</div>
                      <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{formatCurrency(agent.budget)}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Spend</div>
                      <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{formatCurrency(agent.spend)}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Revenue</div>
                      <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{formatCurrency(agent.revenue)}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">ROI</div>
                      <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{roi === null ? "--" : `${roi}%`}</div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Strategy</div>
                      <div className="mt-2 text-sm text-slate-900 dark:text-slate-100">{agent.strategy}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Assigned Leads</div>
                      <div className="mt-2 text-sm text-slate-900 dark:text-slate-100">{agent._count.leads}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-950/70">
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Closed Touches</div>
                      <div className="mt-2 text-sm text-slate-900 dark:text-slate-100">{agent._count.attributions}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {agent.state !== "HUNT" ? (
                      <form action={setAgentState.bind(null, agent.id, "HUNT", "/swarm")}>
                        <Button type="submit" size="sm" className="bg-[#5663e8] hover:bg-[#6570ff] text-white">Deploy</Button>
                      </form>
                    ) : null}
                    {agent.state !== "PAUSED" ? (
                      <form action={setAgentState.bind(null, agent.id, "PAUSED", "/swarm")}>
                        <Button type="submit" size="sm" variant="outline" className="border-slate-200 bg-white dark:border-white/10 dark:bg-transparent">Pause</Button>
                      </form>
                    ) : null}
                    {agent.state !== "KILL" ? (
                      <form action={setAgentState.bind(null, agent.id, "KILL", "/swarm")}>
                        <Button type="submit" size="sm" variant="destructive" className="bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25">Kill</Button>
                      </form>
                    ) : null}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/70">
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Latest Memory</div>
                      {agent.memoryEntries.length === 0 ? (
                        <div className="text-sm text-slate-500 dark:text-slate-400">No memory recorded yet.</div>
                      ) : (
                        agent.memoryEntries.map((entry) => (
                          <div key={entry.id} className="rounded-xl border border-slate-200/80 bg-white/90 p-3 dark:border-white/10 dark:bg-slate-900/80">
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{entry.title}</div>
                              <Badge variant="outline" className="text-[10px]">{entry.memoryType}</Badge>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{entry.content}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/70">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Log Capital Burn</div>
                        <form action={recordAgentSpend.bind(null, agent.id, "/swarm")} className="mt-3 grid gap-3 sm:grid-cols-[140px_1fr_auto]">
                          <input name="amount" type="number" min="1" placeholder="250" className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#59abe7]/35 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100" />
                          <input name="note" placeholder="Apollo credits, scraping APIs, testing" className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#59abe7]/35 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100" />
                          <Button type="submit" size="sm" className="bg-[#5663e8] hover:bg-[#6570ff] text-white">Log</Button>
                        </form>
                      </div>

                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Add Memory</div>
                        <form action={addAgentMemoryEntry.bind(null, agent.id, "/swarm")} className="mt-3 space-y-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <select name="memoryType" defaultValue="SUCCESS" className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#59abe7]/35 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100">
                              <option value="SUCCESS">SUCCESS</option>
                              <option value="FAILURE">FAILURE</option>
                              <option value="PLAYBOOK">PLAYBOOK</option>
                              <option value="OBJECTION">OBJECTION</option>
                              <option value="CONTEXT">CONTEXT</option>
                            </select>
                            <input name="impactScore" type="number" min="0" max="100" defaultValue="50" className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#59abe7]/35 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100" />
                          </div>
                          <input name="title" placeholder="What changed?" className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#59abe7]/35 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100" />
                          <textarea name="content" placeholder="Store the winning pattern, objection, or failure so this agent learns next time." className="min-h-24 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#59abe7]/35 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100" />
                          <input name="campaignKey" placeholder="Optional campaign key" className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#59abe7]/35 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100" />
                          <Button type="submit" size="sm" className="bg-[#5663e8] hover:bg-[#6570ff] text-white">Store Memory</Button>
                        </form>
                      </div>

                      {agent.feedbackEntries.length > 0 ? (
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Feedback Loop</div>
                          <div className="mt-3 space-y-2">
                            {agent.feedbackEntries.map((entry) => (
                              <div key={entry.id} className="rounded-xl border border-slate-200/80 bg-white/90 p-3 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300">
                                <div className="font-semibold text-slate-900 dark:text-slate-100">{entry.feedbackType}</div>
                                <p className="mt-1 leading-relaxed">{entry.note}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}