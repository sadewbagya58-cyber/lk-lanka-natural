# Hostinger Deployment Guide — KL Lanka Natural

This guide outlines the steps to deploy the application on Hostinger using the Hostinger VPS or Hostinger hPanel Node.js application hosting environment.

---

## Prerequisites & Stack
- **Database**: Hostinger MySQL or MariaDB Database
- **ORM**: Prisma ORM
- **Authentication**: NextAuth.js
- **Node.js**: Version 18 or above (compatible with Next.js 16)

---

## Step 1: Set Up MySQL Database on Hostinger
1. Log into your **Hostinger hPanel**.
2. Navigate to **Databases** &rarr; **MySQL Databases**.
3. Create a new database:
   - **Database Name**: E.g., `u123456789_kllanka`
   - **MySQL User**: E.g., `u123456789_admin`
   - **Password**: E.g., `SecurePassword123!`
4. Copy the connection string details.

---

## Step 2: Configure Environment Variables
Create or upload a `.env` file in the root of your Hostinger app directory. Configure it with the following keys:

```env
# 1. Database Connection String
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="mysql://u123456789_admin:SecurePassword123!@127.0.0.1:3306/u123456789_kllanka"

# 2. NextAuth Configuration
# Run `openssl rand -hex 32` or use a secure random 32-char string for NEXTAUTH_SECRET
NEXTAUTH_SECRET="your-32-character-secret-goes-here"
AUTH_SECRET="your-32-character-secret-goes-here"

# Set your production URL for NextAuth callbacks
NEXTAUTH_URL="https://yourdomain.com"
AUTH_URL="https://yourdomain.com"

# 3. Google OAuth Credentials (Optional, configure in Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

---

## Step 3: Run Database Migrations
Prisma migrations are generated inside the `prisma/migrations` folder. To push the tables into your Hostinger MySQL database, run one of the following commands from your deployment terminal:

```bash
# Push tables directly based on the Prisma schema definition
npx prisma db push

# OR execute the migration history tracking deploying scripts
npx prisma migrate deploy
```

---

## Step 4: Build and Start Application
Run the standard build commands to compile the Next.js application:

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client bindings
npx prisma generate

# 3. Build optimized production client
npm run build

# 4. Start production Node server
npm run start
```

---

## Notes on Next.js 16 Proxy Convention
This project is configured with the new **`proxy.ts`** file (located at `src/proxy.ts`). Next.js 16 has deprecated the `middleware.ts` convention in favor of `proxy.ts`. No actions are required, as it runs out-of-the-box on Hostinger's standard Node.js server.
