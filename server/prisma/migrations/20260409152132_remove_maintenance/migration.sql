/*
  Warnings:

  - You are about to drop the `MaintenanceRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MaintenanceRequest" DROP CONSTRAINT "MaintenanceRequest_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "MaintenanceRequest" DROP CONSTRAINT "MaintenanceRequest_tenantClerkId_fkey";

-- DropTable
DROP TABLE "MaintenanceRequest";

-- DropEnum
DROP TYPE "MaintenanceRequestPriority";

-- DropEnum
DROP TYPE "MaintenanceRequestStatus";
