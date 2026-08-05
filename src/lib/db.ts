import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 requires an explicit driver adapter instead of a schema-embedded
// connection string. DATABASE_URL should be Supabase's pooled (pgbouncer,
// port 6543) connection string — this is the app's runtime connection, used
// for many short-lived requests. Migrations use DIRECT_URL instead (see
// prisma.config.ts) since pgbouncer's transaction mode can't run them.
const adapter = new PrismaPg(process.env.DATABASE_URL!);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
