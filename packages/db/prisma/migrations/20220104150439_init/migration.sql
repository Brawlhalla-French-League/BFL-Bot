-- CreateTable
CREATE TABLE "GuildProfile" (
    "id" TEXT NOT NULL,

    CONSTRAINT "GuildProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LobbysModule" (
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "generatorCategoryId" TEXT DEFAULT E'',
    "categoryId" TEXT DEFAULT E'',
    "generatorPrefix" TEXT DEFAULT E'➕ ',
    "prefix" TEXT DEFAULT E'⚔ ',

    CONSTRAINT "LobbysModule_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "MomentsModule" (
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "roleId" TEXT DEFAULT E'',
    "channelId" TEXT DEFAULT E'',

    CONSTRAINT "MomentsModule_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "TicketsModule" (
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "roleId" TEXT DEFAULT E'',
    "categoryId" TEXT DEFAULT E'',
    "prefix" TEXT DEFAULT E'📩-ticket-',
    "closedPrefix" TEXT DEFAULT E'📩-closed-',
    "duration" INTEGER NOT NULL DEFAULT 172800000,

    CONSTRAINT "TicketsModule_pkey" PRIMARY KEY ("guildId")
);

-- AddForeignKey
ALTER TABLE "LobbysModule" ADD CONSTRAINT "LobbysModule_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "GuildProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MomentsModule" ADD CONSTRAINT "MomentsModule_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "GuildProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketsModule" ADD CONSTRAINT "TicketsModule_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "GuildProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
