import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
    const tenants = await prisma.tenant.findMany();
    console.log("TENANTS:", JSON.stringify(tenants, null, 2));

    const properties = await prisma.property.findMany({ include: { leases: { include: { payments: true } } } });
    console.log("PROPERTIES WITH LEASES:", JSON.stringify(properties, null, 2));
}

check().catch(console.error);
