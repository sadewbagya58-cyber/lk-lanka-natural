import { defineConfig } from "prisma/config";

// Read DATABASE_URL from process.env with a placeholder fallback
// to prevent build-time crashes when DB is not yet provisioned.
const databaseUrl = process.env.DATABASE_URL || "mysql://username:password@localhost:3306/dbname";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
