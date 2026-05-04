"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession, logout } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { ensureUserProvisionedById, isSuperAdminEmail } from "@/lib/auth/provisioning";

type AuthFormState = {
  error?: string;
} | null;

export async function signoutAction() {
  await logout();
  await signOut({ redirectTo: "/login" });
}

export async function login(_prevState: AuthFormState, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    return { error: "Invalid email or password" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return { error: "Invalid email or password" };
  }

  await ensureUserProvisionedById(user.id);
  await createSession(user.id);
  redirect("/dashboard");
}

export async function signup(_prevState: AuthFormState, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "User with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: isSuperAdminEmail(email) ? "SUPER_ADMIN" : "USER",
    },
  });

  await ensureUserProvisionedById(user.id);
  await createSession(user.id);
  redirect("/organization?onboarding=1");
}

async function providerSignIn(provider: string, redirectTo: string) {
  await signIn(provider, { redirectTo });
}

export async function signInWithGoogle() {
  await providerSignIn("google", "/dashboard");
}

export async function signInWithGitHub() {
  await providerSignIn("github", "/dashboard");
}

export async function signInWithMicrosoft() {
  await providerSignIn("microsoft-entra-id", "/dashboard");
}

export async function signUpWithGoogle() {
  await providerSignIn("google", "/organization?onboarding=1");
}

export async function signUpWithGitHub() {
  await providerSignIn("github", "/organization?onboarding=1");
}

export async function signUpWithMicrosoft() {
  await providerSignIn("microsoft-entra-id", "/organization?onboarding=1");
}
