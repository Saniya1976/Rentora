import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const clerkId = 'user_39O6gpcKdINfe9Vbmx1jGH5wPGM';

    console.log('Starting Manager setup...');

    // Create manager record if not exists
    let manager = await prisma.manager.findUnique({ where: { clerkId } });
    if (!manager) {
        console.log('Creating manager record...');
        const tenant = await prisma.tenant.findUnique({ where: { clerkId } });
        manager = await prisma.manager.create({
            data: {
                clerkId,
                name: tenant?.name || 'Sassy Sanya',
                email: tenant?.email || 'manager@example.com',
                phoneNumber: tenant?.phoneNumber || '1234567890'
            }
        });
    }

    // Assign it some vacant properties
    console.log('Assigning properties...');
    // Update properties 1, 2, 3 to belong to this manager
    await prisma.property.updateMany({
        where: { id: { in: [1, 2, 3, 4, 5] } },
        data: { managerClerkId: clerkId }
    });

    console.log('Manager setup complete! You should now see 5 properties in your manager dashboard.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
