import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { execSync } from 'child_process';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  migrated: boolean | undefined;
};

function runMigrations() {
  if (globalForPrisma.migrated) return;
  
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl && !databaseUrl.includes('username:password')) {
    try {
      console.log("Running database migrations via Prisma CLI...");
      // Runs migrations on startup/first load using the runtime credentials
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      globalForPrisma.migrated = true;
      console.log("Database migrations applied successfully!");
    } catch (error) {
      console.error("Failed to run database migrations:", error);
    }
  }
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || "mysql://username:password@localhost:3306/dbname";
  
  // Ensure database tables are created and up to date
  runMigrations();
  
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
