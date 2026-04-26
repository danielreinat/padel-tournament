import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { createHash } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

async function main() {
  // Create default admin
  await prisma.admin.upsert({
    where: { email: "admin@padel.local" },
    update: {},
    create: {
      email: "admin@padel.local",
      passwordHash: hashPassword("admin123"),
      name: "Admin",
      role: "SUPER",
    },
  });

  console.log("Seed completed: default admin created (admin@padel.local / admin123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
