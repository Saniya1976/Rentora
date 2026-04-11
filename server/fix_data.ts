import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedManagerIds = [
    "010be580-60a1-70ae-780e-18a6fd94ad32",
    "u-eat-2:23456789-90ab-cdef-1234-567890abcdef",
    "u-eat-2:34567890-90ab-cdef-1234-567890abcdef",
    "u-eat-2:45678901-90ab-cdef-1234-567890abcdef",
    "u-eat-2:56789012-90ab-cdef-1234-567890abcdef",
    "u-eat-2:67890123-90ab-cdef-1234-567890abcdef",
    "u-eat-2:78901234-90ab-cdef-1234-567890abcdef",
    "u-eat-2:89012345-90ab-cdef-1234-567890abcdef",
    "u-eat-2:90123456-90ab-cdef-1234-567890abcdef",
    "u-eat-2:01234567-90ab-cdef-1234-567890abcdef",
];

async function main() {
    console.log("Identifying real-user managers with auto-assigned data...");

    // Find all managers who are NOT seed managers
    const realManagers = await prisma.manager.findMany({
        where: {
            clerkId: { notIn: seedManagerIds }
        },
        select: { clerkId: true, name: true }
    });

    for (const manager of realManagers) {
        console.log(`Cleaning up data for manager: ${manager.name || manager.clerkId}`);

        // Find properties assigned to this manager
        const properties = await prisma.property.findMany({
            where: { managerClerkId: manager.clerkId },
            select: { id: true, name: true }
        });

        for (const prop of properties) {
            console.log(`  Unassigning property [${prop.id}] ${prop.name}`);
            // Reassign to the first seed manager to keep the data in the DB but off the user's dashboard
            await prisma.property.update({
                where: { id: prop.id },
                data: { managerClerkId: seedManagerIds[0] }
            });
        }
    }

    console.log("Global cleanup complete. Real users should now see 0 data.");
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
