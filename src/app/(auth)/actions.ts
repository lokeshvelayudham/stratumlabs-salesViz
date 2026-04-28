"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession, logout } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";

export async function signoutAction() {
  await logout();
  await signOut({ redirectTo: "/login" });
}

export async function login(prevState: any, formData: FormData) {
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

  await createSession(user.id);
  redirect("/dashboard");
}

export async function signup(prevState: any, formData: FormData) {
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
    },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function providerSignIn(provider: string) {
  await signIn(provider, { redirectTo: "/dashboard" });
}
