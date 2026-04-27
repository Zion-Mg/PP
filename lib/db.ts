import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const createPrismaClient = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

export let prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

const isClosedConnectionError = (error: unknown) =>
  error instanceof Error &&
  (error.message.includes("Error in PostgreSQL connection: Error { kind: Closed") ||
    error.message.includes("Can't reach database server") ||
    error.message.includes("Connection closed"));

export const resetPrismaClient = async () => {
  try {
    await prisma.$disconnect();
  } catch {
    // Ignore disconnect failures while replacing the client.
  }

  prisma = createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
};

export const withPrismaRetry = async <T>(operation: (client: PrismaClient) => Promise<T>) => {
  try {
    return await operation(prisma);
  } catch (error) {
    if (!isClosedConnectionError(error)) {
      throw error;
    }

    const freshClient = await resetPrismaClient();
    return operation(freshClient);
  }
};
