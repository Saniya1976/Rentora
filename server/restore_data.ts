import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Re-assigning to the specific managers I wiped earlier
const saniyaKumariClerkId = "user_2lI6q6pS8pX7lR9r6q4r5t6u7v8"; // I need to find the actual IDs from my logs
// Wait, I can just look at my console output from the previous step.
// "Cleaning up data for manager: Saniya Kumari"
// "Cleaning up data for manager: Saniya"

async function main() {
    console.log("Restoring example data assignments...");

    // Let's find those specific managers again by name
    const managers = await prisma.manager.findMany({
        where: {
            OR: [
                { name: "Saniya Kumari" },
                { name: "Saniya" }
            ]
        }
    });

    const sk = managers.find(m => m.name === "Saniya Kumari");
    const s = managers.find(m => m.name === "Saniya");

    if (sk) {
        console.log(`Restoring properties to Saniya Kumari [${sk.clerkId}]`);
        const propIds = [6, 7, 2, 3, 4, 5, 8, 9, 10];
        for (const id of propIds) {
            await prisma.property.update({
                where: { id },
                data: { managerClerkId: sk.clerkId }
            });
        }
    }

    if (s) {
        console.log(`Restoring properties to Saniya [${s.clerkId}]`);
        const propIds = [11, 12, 13, 16, 17];
        for (const id of propIds) {
            await prisma.property.update({
                where: { id },
                data: { managerClerkId: s.clerkId }
            });
        }
    }

    console.log("Restoration complete.");
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
