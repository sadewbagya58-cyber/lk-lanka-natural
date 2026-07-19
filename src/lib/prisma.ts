import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || "mysql://username:password@localhost:3306/dbname";
  
  try {
    const dbUrl = new URL(databaseUrl);
    const adapter = new PrismaMariaDb({
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port || "3306"),
      user: dbUrl.username,
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.replace("/", ""),
      connectionLimit: 5,
    });
    
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error("Failed to parse database connection URL for driver adapter:", error);
    // Fallback to standard client (which will try to construct using default options)
    return new PrismaClient();
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
