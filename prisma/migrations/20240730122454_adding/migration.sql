/*
  Warnings:

  - Added the required column `idProductive` to the `productivityLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "productivityLog" ADD COLUMN     "idProductive" BOOLEAN NOT NULL;
