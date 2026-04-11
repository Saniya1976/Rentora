import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const managers = await prisma.manager.findMany({ take: 5 });
    console.log("Managers:", JSON.stringify(managers, null, 2));
}
main().finally(() => prisma.$disconnect());
