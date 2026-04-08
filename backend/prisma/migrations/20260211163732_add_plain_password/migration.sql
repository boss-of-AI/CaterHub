/*
  Warnings:

  - Added the required column `plainPassword` to the `Caterer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Caterer" ADD COLUMN     "plainPassword" TEXT NOT NULL;
