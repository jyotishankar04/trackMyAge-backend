/*
  Warnings:

  - Added the required column `isActive` to the `Targets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Targets" ADD COLUMN     "isActive" BOOLEAN NOT NULL;
