import { Bot, Building2, DollarSign, Eye, ShieldUser, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { requireSuperAdminUser } from "@/lib/auth/current-user";
import { formatCurrency } from "@/lib/plans";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireSuperAdminUser();

  const [users, totalOrganizations, liveProcesses] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
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
        organization: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.organization.count(),
    prisma.pipelineRun.count({
      where: {
        status: {
          in: ["RUNNING", "QUEUED", "IN_PROGRESS", "STARTED"],
        },
      },
    }),
  ]);

  const totalMonthlyRevenue = users.reduce((sum, user) => sum + user.monthlySpend, 0);
  const totalSwarms = users.reduce((sum, user) => sum + user.activeSwarms, 0);
  const usersWithProcessAccess = users.filter((user) => user.processAccess).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/5">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full border border-[#59abe7]/25 bg-[#5663e8]/10 px-3 py-1 font-mono text-[10px] tracking-widest text-[#5663e8] shadow-[0_0_18px_rgba(86,99,232,0.08)] dark:text-[#5ab5e7] dark:shadow-[0_0_18px_rgba(86,99,232,0.12)]">
            <ShieldUser className="mr-2 h-3 w-3" />
            {"// super_admin_console"}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Super Admin</h1>
          <p className="mt-1 font-light text-slate-600 dark:text-slate-400">
            Monitor organizations, user plans, active swarms, process access, and recurring revenue in one place.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              <Users className="h-4 w-4 text-[#5ab5e7]" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-950 dark:text-white">{users.length}</div>
            <p className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Authenticated seats in the system</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              <Building2 className="h-4 w-4 text-[#5ab5e7]" />
              Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-950 dark:text-white">{totalOrganizations}</div>
            <p className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Provisioned workspaces</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              <Bot className="h-4 w-4 text-[#5ab5e7]" />
              Active Swarms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-950 dark:text-white">{totalSwarms}</div>
            <p className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Assigned across all users</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              <DollarSign className="h-4 w-4 text-[#5ab5e7]" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-950 dark:text-white">{formatCurrency(totalMonthlyRevenue)}</div>
            <p className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Sum of active plan spend</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              <Eye className="h-4 w-4 text-[#5ab5e7]" />
              Process Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-950 dark:text-white">{usersWithProcessAccess}</div>
            <p className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Users enabled · {liveProcesses} live runs</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white/78 shadow-lg backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-slate-950 dark:text-white">Customer Accounts</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Every user, their plan, total active swarms, monthly spend, organization role, and whether they can view the process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200/70 dark:border-white/10">
                <TableHead className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">User</TableHead>
                <TableHead className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Global Role</TableHead>
                <TableHead className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Organization</TableHead>
                <TableHead className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Org Role</TableHead>
                <TableHead className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Plan</TableHead>
                <TableHead className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Swarms</TableHead>
                <TableHead className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Monthly Spend</TableHead>
                <TableHead className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Process</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-slate-200/70 dark:border-white/10">
                  <TableCell className="align-top">
                    <div className="font-medium text-slate-950 dark:text-slate-100">{user.name || user.email}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-700 dark:text-slate-300">{user.role}</TableCell>
                  <TableCell className="text-sm text-slate-700 dark:text-slate-300">{user.organization?.name || "Unassigned"}</TableCell>
                  <TableCell className="text-sm text-slate-700 dark:text-slate-300">{user.organizationRole}</TableCell>
                  <TableCell className="text-sm text-slate-700 dark:text-slate-300">{user.planName}</TableCell>
                  <TableCell className="text-sm text-slate-700 dark:text-slate-300">{user.activeSwarms}</TableCell>
                  <TableCell className="text-sm text-slate-700 dark:text-slate-300">{formatCurrency(user.monthlySpend)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] ${user.processAccess ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-200/70 text-slate-600 dark:bg-white/10 dark:text-slate-400"}`}>
                      {user.processAccess ? "Enabled" : "Disabled"}
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