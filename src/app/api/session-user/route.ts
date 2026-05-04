import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";

type SessionUserResponse = {
  name: string;
  email: string;
  image: string | null;
  initials: string;
  planName: string;
  planDetail: string;
  isSuperAdmin: boolean;
  organizationName: string | null;
  organizationRole: string;
  processAccess: boolean;
};

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json<SessionUserResponse | null>(null);
  }

  return NextResponse.json<SessionUserResponse>({
    name: user.name,
    email: user.email,
    image: user.image,
    initials: user.initials,
    planName: user.planName,
    planDetail: `${user.activeSwarms} active swarms · ${user.organizationName || "Independent workspace"}`,
    isSuperAdmin: user.role === "SUPER_ADMIN",
    organizationName: user.organizationName,
    organizationRole: user.organizationRole,
    processAccess: user.processAccess,
  });
}
