/*
  Warnings:

  - You are about to drop the column `catererId` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `Caterer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `Caterer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Caterer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `eventType` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_catererId_fkey";

-- AlterTable
ALTER TABLE "Caterer" ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "catererId",
ADD COLUMN     "eventType" TEXT NOT NULL,
ADD COLUMN     "finalCatererId" TEXT,
ADD COLUMN     "otherEventDetails" VARCHAR(25);

-- CreateTable
CREATE TABLE "OrderAssignment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "catererId" TEXT NOT NULL,
    "adminSetPrice" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Caterer_username_key" ON "Caterer"("username");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_finalCatererId_fkey" FOREIGN KEY ("finalCatererId") REFERENCES "Caterer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderAssignment" ADD CONSTRAINT "OrderAssignment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderAssignment" ADD CONSTRAINT "OrderAssignment_catererId_fkey" FOREIGN KEY ("catererId") REFERENCES "Caterer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
