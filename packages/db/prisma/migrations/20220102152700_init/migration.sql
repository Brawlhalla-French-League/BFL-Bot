/*
  Warnings:

  - The primary key for the `LobbysModule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `LobbysModule` table. All the data in the column will be lost.
  - The primary key for the `MomentsModule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `MomentsModule` table. All the data in the column will be lost.
  - The primary key for the `TicketsModule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `TicketsModule` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "LobbysModule_guildId_key";

-- DropIndex
DROP INDEX "MomentsModule_guildId_key";

-- DropIndex
DROP INDEX "TicketsModule_guildId_key";

-- AlterTable
ALTER TABLE "LobbysModule" DROP CONSTRAINT "LobbysModule_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "LobbysModule_pkey" PRIMARY KEY ("guildId");

-- AlterTable
ALTER TABLE "MomentsModule" DROP CONSTRAINT "MomentsModule_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "MomentsModule_pkey" PRIMARY KEY ("guildId");

-- AlterTable
ALTER TABLE "TicketsModule" DROP CONSTRAINT "TicketsModule_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "TicketsModule_pkey" PRIMARY KEY ("guildId");
