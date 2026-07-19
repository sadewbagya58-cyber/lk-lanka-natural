import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || "mysql://username:password@localhost:3306/dbname";
  
  try {
    // Map mysql:// protocol to mariadb:// for compatibility with the mariadb driver
    const mariadbUrl = databaseUrl.replace(/^mysql:\/\//, 'mariadb://');
    const adapter = new PrismaMariaDb(mariadbUrl);
    
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error("Failed to initialize database driver adapter:", error);
    return new PrismaClient();
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
