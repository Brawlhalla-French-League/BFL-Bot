/*
  Warnings:

  - You are about to drop the column `momentRoleChannelId` on the `MomentsModule` table. All the data in the column will be lost.
  - You are about to drop the column `momentRoleChannelId` on the `TicketsModule` table. All the data in the column will be lost.
  - You are about to drop the column `momentRoleId` on the `TicketsModule` table. All the data in the column will be lost.
  - Added the required column `momentChannelId` to the `MomentsModule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketsCategoryId` to the `TicketsModule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketsRoleId` to the `TicketsModule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MomentsModule" DROP COLUMN "momentRoleChannelId",
ADD COLUMN     "momentChannelId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TicketsModule" DROP COLUMN "momentRoleChannelId",
DROP COLUMN "momentRoleId",
ADD COLUMN     "ticketsCategoryId" TEXT NOT NULL,
ADD COLUMN     "ticketsRoleId" TEXT NOT NULL;
