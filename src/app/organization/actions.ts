"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getPlanSnapshot } from "@/lib/plans";
import { isSuperAdminEmail } from "@/lib/auth/provisioning";

const MANAGER_ROLES = new Set(["OWNER", "ADMIN"]);

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeBrandColor(value: string) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ? value : "#5663e8";
}

async function requireOrganizationManager() {
  const currentUser = await requireCurrentUser();

  if (!currentUser.organizationId || !MANAGER_ROLES.has(currentUser.organizationRole)) {
    return null;
  }

  return currentUser;
}

export async function saveOrganizationProfile(formData: FormData) {
  const currentUser = await requireOrganizationManager();

  if (!currentUser?.organizationId) {
    return;
  }

  const name = readString(formData, "name") || currentUser.organizationName || "Stratum Workspace";
  const vision = readString(formData, "vision");
  const mission = readString(formData, "mission");
  const brandColor = normalizeBrandColor(readString(formData, "brandColor") || "#5663e8");
  const logoUrl = readString(formData, "logoUrl");

  await prisma.organization.update({
    where: { id: currentUser.organizationId },
    data: {
      name,
      vision: vision || null,
      mission: mission || null,
      brandColor,
      logoUrl: logoUrl || null,
    },
  });

  revalidatePath("/organization");
  revalidatePath("/admin");
}

export async function createOrganizationMember(formData: FormData) {
  const currentUser = await requireOrganizationManager();

  if (!currentUser?.organizationId) {
    return;
  }

  const name = readString(formData, "memberName");
  const email = readString(formData, "memberEmail").toLowerCase();
  const password = readString(formData, "memberPassword");
  const planName = readString(formData, "planName");
  const organizationRole = readString(formData, "organizationRole") || "VIEWER";
  const processAccess = formData.get("processAccess") === "on";

  if (!name || !email || !password) {
    return;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return;
  }

  const plan = getPlanSnapshot(planName);
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: isSuperAdminEmail(email) ? "SUPER_ADMIN" : "USER",
      planName: plan.name,
      monthlySpend: plan.monthlySpend,
      activeSwarms: plan.activeSwarms,
      processAccess,
      organizationId: currentUser.organizationId,
      organizationRole,
    },
  });

  revalidatePath("/organization");
  revalidatePath("/admin");
}
