import { redirect } from "next/navigation";
import { Building2, Eye, Palette, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { formatCurrency, PLAN_OPTIONS } from "@/lib/plans";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { createOrganizationMember, saveOrganizationProfile } from "./actions";

export const dynamic = "force-dynamic";

const MANAGER_ROLES = new Set(["OWNER", "ADMIN"]);

export default async function OrganizationPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const isOnboarding = resolvedSearchParams.onboarding === "1";
  const currentUser = await requireCurrentUser();

  if (!currentUser.organizationId) {
    redirect("/dashboard");
  }

  const [organization, members, liveProcesses] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: currentUser.organizationId },
      select: {
        id: true,
        name: true,
        vision: true,
        mission: true,
        brandColor: true,
        logoUrl: true,
      },
    }),
    prisma.user.findMany({
      where: { organizationId: currentUser.organizationId },
      orderBy: [{ role: "desc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        planName: true,
        monthlySpend: true,
        activeSwarms: true,
        processAccess: true,
        organizationRole: true,
      },
    }),
    prisma.pipelineRun.count({
      where: {
        status: {
          in: ["RUNNING", "QUEUED", "IN_PROGRESS", "STARTED"],
        },
      },
    }),
  ]);

  if (!organization) {
    redirect("/dashboard");
  }

  const canManage = MANAGER_ROLES.has(currentUser.organizationRole);
  const membersWithProcessAccess = members.filter((member) => member.processAccess).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isOnboarding ? (
        <div className="rounded-[2rem] border border-[#59abe7]/25 bg-[linear-gradient(180deg,rgba(240,246,255,0.92),rgba(231,240,255,0.96))] p-6 shadow-[0_24px_80px_rgba(86,99,232,0.1)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(12,24,54,0.9),rgba(8,17,37,0.82))]">
          <div className="inline-flex items-center rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-[#5663e8] dark:text-[#5ab5e7]">
            onboarding
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Set up your organization before you start the swarm.</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Add your organization name, mission, vision, brand color, and logo first. Then invite teammates and decide who can view live swarm progress.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/5">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 px-3 py-1 font-mono text-[10px] tracking-widest text-[#5663e8] shadow-[0_0_18px_rgba(86,99,232,0.08)] dark:text-[#5ab5e7] dark:shadow-[0_0_18px_rgba(86,99,232,0.12)]">
            <Building2 className="mr-2 h-3 w-3" />
            {"// organization_control"}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Organization</h1>
          <p className="mt-1 font-light text-slate-600 dark:text-slate-400">
            Define your brand, mission, and the team members allowed to see the swarm process.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-[#59abe7]/25 bg-white/78 px-4 py-2 text-xs font-mono uppercase tracking-[0.18em] text-[#5663e8] shadow-[0_0_18px_rgba(86,99,232,0.08)] dark:bg-slate-900/50 dark:text-[#5ab5e7]">
          {organization.name}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-mono tracking-widest uppercase text-slate-500 dark:text-slate-400">
              <Users className="h-4 w-4 text-[#5ab5e7]" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-950 dark:text-white">{members.length}</div>
            <p className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Accounts inside the org</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-mono tracking-widest uppercase text-slate-500 dark:text-slate-400">
              <Sparkles className="h-4 w-4 text-[#5ab5e7]" />
              Active Swarms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-950 dark:text-white">{members.reduce((sum, member) => sum + member.activeSwarms, 0)}</div>
            <p className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Provisioned across your team</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-mono tracking-widest uppercase text-slate-500 dark:text-slate-400">
              <Palette className="h-4 w-4 text-[#5ab5e7]" />
              Brand Color
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="h-5 w-5 rounded-full border border-slate-200/70 dark:border-white/10" style={{ backgroundColor: organization.brandColor }} />
              <div className="text-lg font-semibold text-slate-950 dark:text-white">{organization.brandColor}</div>
            </div>
            <p className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Applied across team branding</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-mono tracking-widest uppercase text-slate-500 dark:text-slate-400">
              <Eye className="h-4 w-4 text-[#5ab5e7]" />
              Process Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-950 dark:text-white">{membersWithProcessAccess}</div>
            <p className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Users who can view the process · {liveProcesses} live runs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-slate-950 dark:text-white">Brand, Vision, And Mission</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Set the story and visual identity each team member sees inside the organization workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveOrganizationProfile} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Organization Name</label>
                <input
                  name="name"
                  defaultValue={organization.name}
                  disabled={!canManage}
                  className="flex h-8 w-full rounded-lg border border-slate-200/70 bg-white px-2.5 py-1 text-sm text-slate-950 outline-none focus:border-[#59abe7] focus:ring-3 focus:ring-[#59abe7]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100"
                />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Brand Color</label>
                  <input
                    name="brandColor"
                    defaultValue={organization.brandColor}
                    disabled={!canManage}
                    className="flex h-8 w-full rounded-lg border border-slate-200/70 bg-white px-2.5 py-1 text-sm text-slate-950 outline-none focus:border-[#59abe7] focus:ring-3 focus:ring-[#59abe7]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Logo URL</label>
                  <input
                    name="logoUrl"
                    defaultValue={organization.logoUrl || ""}
                    disabled={!canManage}
                    className="flex h-8 w-full rounded-lg border border-slate-200/70 bg-white px-2.5 py-1 text-sm text-slate-950 outline-none focus:border-[#59abe7] focus:ring-3 focus:ring-[#59abe7]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Vision</label>
                <textarea
                  name="vision"
                  defaultValue={organization.vision || ""}
                  disabled={!canManage}
                  className="min-h-24 w-full rounded-lg border border-slate-200/70 bg-white px-2.5 py-2 text-sm text-slate-950 outline-none focus:border-[#59abe7] focus:ring-3 focus:ring-[#59abe7]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Mission</label>
                <textarea
                  name="mission"
                  defaultValue={organization.mission || ""}
                  disabled={!canManage}
                  className="min-h-24 w-full rounded-lg border border-slate-200/70 bg-white px-2.5 py-2 text-sm text-slate-950 outline-none focus:border-[#59abe7] focus:ring-3 focus:ring-[#59abe7]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100"
                />
              </div>
              <Button type="submit" disabled={!canManage} className="bg-[#5663e8] text-white hover:bg-[#6570ff]">
                Save Organization Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-slate-950 dark:text-white">Team Access</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Add internal users, choose their plan, and decide whether they can view live swarm progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canManage ? (
              <form action={createOrganizationMember} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Full Name</label>
                    <Input name="memberName" placeholder="Ada Lovelace" className="border-slate-200/70 bg-white dark:border-white/10 dark:bg-slate-950/60" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Email</label>
                    <Input name="memberEmail" type="email" placeholder="ada@company.com" className="border-slate-200/70 bg-white dark:border-white/10 dark:bg-slate-950/60" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Temporary Password</label>
                  <Input name="memberPassword" type="password" placeholder="Set an initial password" className="border-slate-200/70 bg-white dark:border-white/10 dark:bg-slate-950/60" />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Plan</label>
                    <select name="planName" defaultValue="Launch" className="flex h-8 w-full rounded-lg border border-slate-200/70 bg-white px-2.5 py-1 text-sm text-slate-950 outline-none focus:border-[#59abe7] dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100">
                      {PLAN_OPTIONS.map((plan) => (
                        <option key={plan.name} value={plan.name}>
                          {plan.name} · {formatCurrency(plan.monthlySpend)} · {plan.activeSwarms} swarms
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Organization Role</label>
                    <select name="organizationRole" defaultValue="VIEWER" className="flex h-8 w-full rounded-lg border border-slate-200/70 bg-white px-2.5 py-1 text-sm text-slate-950 outline-none focus:border-[#59abe7] dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100">
                      <option value="OWNER">Owner</option>
                      <option value="ADMIN">Admin</option>
                      <option value="MEMBER">Member</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300">
                  <input name="processAccess" type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-[#5663e8]" />
                  Give this user access to view the swarm process and live operations.
                </label>

                <Button type="submit" className="bg-[#5663e8] text-white hover:bg-[#6570ff]">
                  Add Team Member
                </Button>
              </form>
            ) : (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-4 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-400">
                Your role is <span className="font-semibold text-slate-950 dark:text-slate-200">{currentUser.organizationRole}</span>. You can view organization state, but only owners and admins can edit branding or add new users.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-slate-950 dark:text-white">Organization Team</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Every user in the workspace, their assigned plan, and whether they can see the live process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200/70 dark:border-white/10">
                <TableHead className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">User</TableHead>
                <TableHead className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Role</TableHead>
                <TableHead className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Plan</TableHead>
                <TableHead className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Swarms</TableHead>
                <TableHead className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Monthly Spend</TableHead>
                <TableHead className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Process Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id} className="border-slate-200/70 dark:border-white/10">
                  <TableCell className="align-top">
                    <div className="font-medium text-slate-950 dark:text-slate-100">{member.name || member.email}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{member.email}</div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-700 dark:text-slate-300">{member.organizationRole}</TableCell>
                  <TableCell className="text-sm text-slate-700 dark:text-slate-300">{member.planName}</TableCell>
                  <TableCell className="text-sm text-slate-700 dark:text-slate-300">{member.activeSwarms}</TableCell>
                  <TableCell className="text-sm text-slate-700 dark:text-slate-300">{formatCurrency(member.monthlySpend)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] ${member.processAccess ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-200/70 text-slate-600 dark:bg-white/10 dark:text-slate-400"}`}>
                      {member.processAccess ? "Enabled" : "Disabled"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
