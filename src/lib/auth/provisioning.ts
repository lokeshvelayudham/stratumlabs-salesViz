import { prisma } from "@/lib/db";
import { getPlanSnapshot } from "@/lib/plans";

const DEFAULT_SUPER_ADMIN_EMAILS = ["admin@stratumlabs.app"];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function getSuperAdminEmails() {
  const configured = (process.env.SUPER_ADMIN_EMAILS || process.env.SUPER_ADMIN_EMAIL || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return new Set([...DEFAULT_SUPER_ADMIN_EMAILS, ...configured]);
}

export function isSuperAdminEmail(email?: string | null) {
  if (!email) return false;
  return getSuperAdminEmails().has(email.trim().toLowerCase());
}

async function generateUniqueOrganizationSlug(baseName: string) {
  const baseSlug = slugify(baseName) || "organization";
  let slug = baseSlug;
  let suffix = 1;

  while (await prisma.organization.findUnique({ where: { slug }, select: { id: true } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
}

export async function ensureOrganizationForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      organizationId: true,
      organizationRole: true,
    },
  });

  if (!user) return null;

  if (user.organizationId) {
    return prisma.organization.findUnique({ where: { id: user.organizationId } });
  }

  const displayBase = user.name?.trim() || user.email?.split("@")[0] || "Stratum";
  const organizationName = `${displayBase} Workspace`;
  const slug = await generateUniqueOrganizationSlug(organizationName);

  const organization = await prisma.organization.create({
    data: {
      name: organizationName,
      slug,
      createdById: user.id,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      organizationId: organization.id,
      organizationRole: user.organizationRole || "OWNER",
    },
  });

  return organization;
}

export async function ensureUserProvisionedById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      planName: true,
      monthlySpend: true,
      activeSwarms: true,
      processAccess: true,
      organizationRole: true,
      organizationId: true,
    },
  });

  if (!user) return null;

  const plan = getPlanSnapshot(user.planName);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: isSuperAdminEmail(user.email) ? "SUPER_ADMIN" : user.role,
      planName: user.planName || plan.name,
      monthlySpend: user.monthlySpend || plan.monthlySpend,
      activeSwarms: user.activeSwarms || plan.activeSwarms,
      processAccess: typeof user.processAccess === "boolean" ? user.processAccess : true,
      organizationRole: user.organizationRole || "OWNER",
    },
  });

  await ensureOrganizationForUser(user.id);

  return prisma.user.findUnique({
    where: { id: user.id },
    include: { organization: true },
  });
}

export async function ensureUserProvisionedByEmail(
  email: string,
  profile?: { name?: string | null; image?: string | null }
) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  if (!existingUser) return null;

  if ((profile?.name && !existingUser.name) || (profile?.image && !existingUser.image)) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: existingUser.name || profile?.name || undefined,
        image: existingUser.image || profile?.image || undefined,
      },
    });
  }

  return ensureUserProvisionedById(existingUser.id);
}