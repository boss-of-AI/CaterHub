/*
  Warnings:

  - You are about to drop the column `username` on the `Customer` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Customer_username_key";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "username";
