import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import MicrosoftEntraId from "next-auth/providers/microsoft-entra-id"
import { prisma } from "@/lib/db"

const providers: any[] = [];

if (process.env.GOOGLE_CLIENT_ID) {
  providers.push(Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }));
}

if (process.env.GITHUB_ID) {
  providers.push(GitHub({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  }));
}

if (process.env.AUTH_MICROSOFT_ENTRA_ID_ID) {
  providers.push(MicrosoftEntraId({
    clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
    clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
    tenantId: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID,
  }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
})
