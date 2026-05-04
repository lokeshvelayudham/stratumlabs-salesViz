import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { ensureUserProvisionedById } from "@/lib/auth/provisioning";

type RawUserRecord = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  planName: string;
  monthlySpend: number;
  activeSwarms: number;
  processAccess: boolean;
  organizationRole: string;
  organizationId: string | null;
  organization: {
    id: string;
    name: string;
    brandColor: string;
    logoUrl: string | null;
  } | null;
  accounts: { provider: string }[];
};

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  initials: string;
  role: string;
  planName: string;
  monthlySpend: number;
  activeSwarms: number;
  processAccess: boolean;
  organizationRole: string;
  organizationId: string | null;
  organizationName: string | null;
  organizationBrandColor: string | null;
  organizationLogoUrl: string | null;
  provider: string;
};

async function readUserById(userId: string): Promise<RawUserRecord | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      planName: true,
      monthlySpend: true,
      activeSwarms: true,
      processAccess: true,
      organizationRole: true,
      organizationId: true,
      organization: {
        select: {
          id: true,
          name: true,
          brandColor: true,
          logoUrl: true,
        },
      },
      accounts: {
        take: 1,
        select: { provider: true },
      },
    },
  });
}

async function readUserByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return null;
  return readUserById(user.id);
}

function mapCurrentUser(user: RawUserRecord): CurrentUser {
  const displayName = user.name?.trim() || user.email?.split("@")[0] || "Admin User";
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "A";

  return {
    id: user.id,
    name: displayName,
    email: user.email || "Authenticated user",
    image: user.image,
    initials,
    role: user.role,
    planName: user.planName,
    monthlySpend: user.monthlySpend,
    activeSwarms: user.activeSwarms,
    processAccess: user.processAccess,
    organizationRole: user.organizationRole,
    organizationId: user.organizationId,
    organizationName: user.organization?.name || null,
    organizationBrandColor: user.organization?.brandColor || null,
    organizationLogoUrl: user.organization?.logoUrl || null,
    provider: user.accounts[0]?.provider || "credentials",
  };
}

export async function getCurrentUser() {
  const nextAuthSession = await auth();

  if (nextAuthSession?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: nextAuthSession.user.email },
      select: { id: true },
    });

    if (dbUser) {
      await ensureUserProvisionedById(dbUser.id);
      const hydratedUser = await readUserByEmail(nextAuthSession.user.email);
      if (hydratedUser) {
        return mapCurrentUser(hydratedUser);
      }
    }
  }

  const customSession = await getSession();

  if (customSession?.userId && typeof customSession.userId === "string") {
    await ensureUserProvisionedById(customSession.userId);
    const hydratedUser = await readUserById(customSession.userId);

    if (hydratedUser) {
      return mapCurrentUser(hydratedUser);
    }
  }

  return null;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireSuperAdminUser() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }
  return user;
}