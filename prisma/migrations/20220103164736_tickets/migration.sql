-- AlterTable
ALTER TABLE "TicketsModule" ADD COLUMN     "closedPrefix" TEXT DEFAULT E'📩-closed-',
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 172800000,
ADD COLUMN     "prefix" TEXT DEFAULT E'📩-ticket-';
