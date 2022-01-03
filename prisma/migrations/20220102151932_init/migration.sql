/*
  Warnings:

  - You are about to drop the column `ticketsCategoryId` on the `GuildProfile` table. All the data in the column will be lost.
  - You are about to drop the column `ticketsRoleId` on the `GuildProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GuildProfile" DROP COLUMN "ticketsCategoryId",
DROP COLUMN "ticketsRoleId";
