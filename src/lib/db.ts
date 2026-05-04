import { PrismaClient } from "@prisma/client";

const REQUIRED_MODEL_DELEGATES = [
  "revenueAttribution",
  "swarmAgent",
  "inboxThread",
  "feedbackEntry",
  "relationGraphNode",
  "relationGraphEdge",
] as const;

type PrismaClientWithDelegates = PrismaClient & Record<string, unknown>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function hasRequiredDelegates(client: PrismaClient) {
  const prismaClient = client as PrismaClientWithDelegates;

  return REQUIRED_MODEL_DELEGATES.every((delegate) => typeof prismaClient[delegate] !== "undefined");
}

function createPrismaClient() {
  return new PrismaClient();
}

const cachedPrisma = globalForPrisma.prisma;

// Turbopack can preserve a Prisma singleton that was created before a new client was generated.
// If that happens, new delegates like revenueAttribution or relationGraphNode stay undefined until the process restarts.
export const prisma = cachedPrisma && hasRequiredDelegates(cachedPrisma) ? cachedPrisma : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
