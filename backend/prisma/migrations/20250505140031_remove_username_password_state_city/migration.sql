/*
  Warnings:

  - You are about to drop the column `city` on the `Proxy` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Proxy` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Proxy` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `Proxy` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[host,port]` on the table `Proxy` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Proxy" DROP COLUMN "city",
DROP COLUMN "password",
DROP COLUMN "state",
DROP COLUMN "username";

-- CreateIndex
CREATE UNIQUE INDEX "Proxy_host_port_key" ON "Proxy"("host", "port");
