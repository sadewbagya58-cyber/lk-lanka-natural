import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || "mysql://username:password@localhost:3306/dbname";

  try {
    const rawUrl = databaseUrl.replace(/^mysql:\/\//, 'http://').replace(/^mariadb:\/\//, 'http://');
    const url = new URL(rawUrl);

    const poolConfig = {
      host: url.hostname || 'localhost',
      port: url.port ? parseInt(url.port, 10) : 3306,
      user: decodeURIComponent(url.username || ''),
      password: decodeURIComponent(url.password || ''),
      database: url.pathname ? url.pathname.replace(/^\//, '') : '',
      connectionLimit: 15,
      connectTimeout: 8000,
      acquireTimeout: 8000,
      idleTimeout: 30000,
      minimumIdle: 2,
    };

    const adapter = new PrismaMariaDb(poolConfig as any);
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error("Failed to initialize database driver adapter:", error);
    return new PrismaClient();
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
