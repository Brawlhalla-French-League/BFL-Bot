/*
  Warnings:

  - The primary key for the `GuildTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `GuildTag` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GuildTag" DROP CONSTRAINT "GuildTag_pkey",
DROP COLUMN "id";
