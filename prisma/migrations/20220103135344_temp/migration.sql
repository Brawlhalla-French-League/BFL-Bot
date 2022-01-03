/*
  Warnings:

  - You are about to drop the column `lobbyCategoryId` on the `LobbysModule` table. All the data in the column will be lost.
  - You are about to drop the column `lobbyGeneratorCategoryId` on the `LobbysModule` table. All the data in the column will be lost.
  - You are about to drop the column `momentChannelId` on the `MomentsModule` table. All the data in the column will be lost.
  - You are about to drop the column `momentRoleId` on the `MomentsModule` table. All the data in the column will be lost.
  - You are about to drop the column `ticketsCategoryId` on the `TicketsModule` table. All the data in the column will be lost.
  - You are about to drop the column `ticketsRoleId` on the `TicketsModule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LobbysModule" DROP COLUMN "lobbyCategoryId",
DROP COLUMN "lobbyGeneratorCategoryId",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "generatorCategoryId" TEXT,
ALTER COLUMN "enabled" SET DEFAULT false;

-- AlterTable
ALTER TABLE "MomentsModule" DROP COLUMN "momentChannelId",
DROP COLUMN "momentRoleId",
ADD COLUMN     "channelId" TEXT,
ADD COLUMN     "roleId" TEXT,
ALTER COLUMN "enabled" SET DEFAULT false;

-- AlterTable
ALTER TABLE "TicketsModule" DROP COLUMN "ticketsCategoryId",
DROP COLUMN "ticketsRoleId",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "roleId" TEXT,
ALTER COLUMN "enabled" SET DEFAULT false;

CREATE OR REPLACE FUNCTION trigger_guild_create()
RETURNS TRIGGER
AS $$
BEGIN
  INSERT INTO public."LobbysModule" ("guildId", "categoryId", "generatorCategoryId", "enabled")
  values(NEW.id, '', '', false) ON CONFLICT ("guildId") DO NOTHING;
  INSERT INTO public."TicketsModule" ("guildId", "categoryId", "roleId", "enabled")
  values(NEW.id, '', '', false) ON CONFLICT ("guildId") DO NOTHING;
  INSERT INTO public."MomentsModule" ("guildId", "channelId", "roleId", "enabled")
  values(NEW.id, '', '', false) ON CONFLICT ("guildId") DO NOTHING;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_guild_modules_trigger
  AFTER INSERT OR UPDATE ON public."GuildProfile"
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_guild_create();