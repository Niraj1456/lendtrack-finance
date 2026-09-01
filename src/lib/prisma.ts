import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  
  // If user configured a cloud database (Postgres, Supabase, Neon), use it directly
  if (envUrl && (envUrl.startsWith('postgresql://') || envUrl.startsWith('postgres://') || envUrl.startsWith('mysql://'))) {
    return envUrl;
  }

  // When running on Vercel serverless with SQLite, the root directory is read-only.
  // /tmp is the only writable directory for SQLite WAL journals.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = path.join('/tmp', 'dev.db');
    if (!fs.existsSync(tmpDbPath)) {
      try {
        const prismaDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
        const rootDbPath = path.join(process.cwd(), 'dev.db');
        
        if (fs.existsSync(prismaDbPath)) {
          fs.copyFileSync(prismaDbPath, tmpDbPath);
        } else if (fs.existsSync(rootDbPath)) {
          fs.copyFileSync(rootDbPath, tmpDbPath);
        }
      } catch (e) {
        console.warn('Could not copy initial db to /tmp, will initialize fresh:', e);
      }
    }
    return `file:${tmpDbPath}`;
  }

  return envUrl || 'file:./dev.db';
}

const activeDbUrl = getDatabaseUrl();
process.env.DATABASE_URL = activeDbUrl;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: activeDbUrl,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
