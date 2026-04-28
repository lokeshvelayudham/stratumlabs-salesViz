import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

type SessionUserResponse = {
  name: string;
  email: string;
  image: string | null;
  initials: string;
  planName: string;
  planDetail: string;
};

function buildSessionUser(input: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  provider?: string | null;
}): SessionUserResponse {
  const displayName = input.name?.trim() || input.email?.split("@")[0] || "Admin User";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "A";

  const providerDetailMap: Record<string, string> = {
    google: "Connected via Google SSO",
    github: "Connected via GitHub SSO",
    credentials: "Connected via email login",
    oauth: "Connected via single sign-on",
  };

  return {
    name: displayName,
    email: input.email || "Authenticated user",
    image: input.image || null,
    initials,
    planName: "Core Workspace",
    planDetail: providerDetailMap[input.provider || "oauth"] || "Connected access",
  };
}

export async function GET() {
  const nextAuthSession = await auth();

  if (nextAuthSession?.user) {
    const email = nextAuthSession.user.email;
    const dbUser = email
      ? await prisma.user.findUnique({
          where: { email },
          select: {
            name: true,
            email: true,
            image: true,
            accounts: {
              take: 1,
              select: { provider: true },
            },
          },
        })
      : null;

    return NextResponse.json(
      buildSessionUser({
        name: dbUser?.name || nextAuthSession.user.name,
        email: dbUser?.email || nextAuthSession.user.email,
        image: dbUser?.image || nextAuthSession.user.image,
        provider: dbUser?.accounts[0]?.provider || "oauth",
      })
    );
  }

  const customSession = await getSession();

  if (customSession?.userId && typeof customSession.userId === "string") {
    const dbUser = await prisma.user.findUnique({
      where: { id: customSession.userId },
      select: {
        name: true,
        email: true,
        image: true,
      },
    });

    if (dbUser) {
      return NextResponse.json(
        buildSessionUser({
          ...dbUser,
          provider: "credentials",
        })
      );
    }
  }

  return NextResponse.json(null);
}