/*
  Warnings:

  - You are about to drop the column `proxyMappingId` on the `EmailAccount` table. All the data in the column will be lost.
  - You are about to drop the `ProxyMapping` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[proxyId]` on the table `EmailAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "EmailAccount" DROP CONSTRAINT "EmailAccount_proxyMappingId_fkey";

-- DropForeignKey
ALTER TABLE "ProxyMapping" DROP CONSTRAINT "ProxyMapping_proxyId_fkey";

-- AlterTable
ALTER TABLE "EmailAccount" DROP COLUMN "proxyMappingId",
ADD COLUMN     "proxyId" TEXT;

-- DropTable
DROP TABLE "ProxyMapping";

-- CreateIndex
CREATE UNIQUE INDEX "EmailAccount_proxyId_key" ON "EmailAccount"("proxyId");

-- AddForeignKey
ALTER TABLE "EmailAccount" ADD CONSTRAINT "EmailAccount_proxyId_fkey" FOREIGN KEY ("proxyId") REFERENCES "Proxy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
