import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash("admin123", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@fechatto.com" },
    update: {},
    create: {
      email: "admin@fechatto.com",
      name: "Admin",
      password: hash,
    },
  });

  console.log("Usuário criado:", user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
