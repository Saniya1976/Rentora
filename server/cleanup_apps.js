const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const all = await prisma.application.findMany({
        include: { tenant: { select: { clerkId: true, name: true } } }
    });

    const mockedApps = all.filter(a => !a.tenant.clerkId.startsWith('user_'));
    const mockedIds = mockedApps.map(a => a.id);
    const mockedLeaseIds = mockedApps.map(a => a.leaseId).filter(id => id !== null);

    console.log('Mocked app IDs to delete:', mockedIds);

    if (mockedIds.length > 0) {
        const delApps = await prisma.application.deleteMany({ where: { id: { in: mockedIds } } });
        console.log('Deleted mocked applications:', delApps.count);
    }

    if (mockedLeaseIds.length > 0) {
        const delLeases = await prisma.lease.deleteMany({ where: { id: { in: mockedLeaseIds } } });
        console.log('Deleted mocked leases:', delLeases.count);
    }

    const remaining = await prisma.application.findMany({
        include: { property: { select: { name: true } }, tenant: { select: { name: true, email: true } } }
    });
    console.log('Remaining real applications count:', remaining.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
