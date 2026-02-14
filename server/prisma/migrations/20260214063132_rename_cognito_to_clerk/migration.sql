-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_tenantCognitoId_fkey";

-- DropForeignKey
ALTER TABLE "Lease" DROP CONSTRAINT "Lease_tenantCognitoId_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_managerCognitoId_fkey";

-- DropIndex
DROP INDEX "Manager_cognitoId_key";

-- DropIndex
DROP INDEX "Tenant_cognitoId_key";

-- AlterTable (Rename Columns)
ALTER TABLE "Application" RENAME COLUMN "tenantCognitoId" TO "tenantClerkId";
ALTER TABLE "Lease" RENAME COLUMN "tenantCognitoId" TO "tenantClerkId";
ALTER TABLE "Manager" RENAME COLUMN "cognitoId" TO "clerkId";
ALTER TABLE "Property" RENAME COLUMN "managerCognitoId" TO "managerClerkId";
ALTER TABLE "Tenant" RENAME COLUMN "cognitoId" TO "clerkId";

-- CreateIndex
CREATE UNIQUE INDEX "Manager_clerkId_key" ON "Manager"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_clerkId_key" ON "Tenant"("clerkId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_managerClerkId_fkey" FOREIGN KEY ("managerClerkId") REFERENCES "Manager"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_tenantClerkId_fkey" FOREIGN KEY ("tenantClerkId") REFERENCES "Tenant"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_tenantClerkId_fkey" FOREIGN KEY ("tenantClerkId") REFERENCES "Tenant"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;
