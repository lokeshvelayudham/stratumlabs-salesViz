import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { Provider } from "next-auth/providers"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import { prisma } from "@/lib/db"
import { ensureUserProvisionedByEmail } from "@/lib/auth/provisioning"

const providers: Provider[] = [];

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


export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        await ensureUserProvisionedByEmail(user.email, {
          name: user.name,
          image: user.image,
        });
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
})
