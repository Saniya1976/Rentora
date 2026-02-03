/*
  Warnings:

  - The primary key for the `_TenantFavorites` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_TenantProperties` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_TenantFavorites` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_TenantProperties` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_TenantFavorites" DROP CONSTRAINT "_TenantFavorites_AB_pkey";

-- AlterTable
ALTER TABLE "_TenantProperties" DROP CONSTRAINT "_TenantProperties_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_TenantFavorites_AB_unique" ON "_TenantFavorites"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_TenantProperties_AB_unique" ON "_TenantProperties"("A", "B");
