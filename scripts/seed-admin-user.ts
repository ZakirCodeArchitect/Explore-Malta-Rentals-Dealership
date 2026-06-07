import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "../src/generated/prisma/index";
import { hashAdminPassword } from "../src/lib/admin-auth/password";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "Admin User";
const role = process.env.ADMIN_ROLE === "STAFF" ? "STAFF" : "ADMIN";

if (!email || !password) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const normalizedEmail = email!;
  const plainPassword = password!;
  const passwordHash = await hashAdminPassword(plainPassword);
  const user = await prisma.adminUser.upsert({
    where: { email: normalizedEmail },
    update: {
      name,
      passwordHash,
      role,
      isActive: true,
    },
    create: {
      email: normalizedEmail,
      name,
      passwordHash,
      role,
      isActive: true,
    },
  });

  console.log(`Admin user ready: ${user.email} (${user.role})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
