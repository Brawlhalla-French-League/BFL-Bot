-- CreateTable
CREATE TABLE "GuildProfile" (
    "id" TEXT NOT NULL,
    "ticketsRoleId" TEXT NOT NULL,
    "ticketsCategoryId" TEXT NOT NULL,

    CONSTRAINT "GuildProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LobbysModule" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "lobbyGeneratorCategoryId" TEXT NOT NULL,
    "lobbyCategoryId" TEXT NOT NULL,

    CONSTRAINT "LobbysModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MomentsModule" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "momentRoleId" TEXT NOT NULL,
    "momentRoleChannelId" TEXT NOT NULL,

    CONSTRAINT "MomentsModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketsModule" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "momentRoleId" TEXT NOT NULL,
    "momentRoleChannelId" TEXT NOT NULL,

    CONSTRAINT "TicketsModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LobbysModule_guildId_key" ON "LobbysModule"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "MomentsModule_guildId_key" ON "MomentsModule"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketsModule_guildId_key" ON "TicketsModule"("guildId");

-- AddForeignKey
ALTER TABLE "LobbysModule" ADD CONSTRAINT "LobbysModule_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "GuildProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MomentsModule" ADD CONSTRAINT "MomentsModule_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "GuildProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketsModule" ADD CONSTRAINT "TicketsModule_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "GuildProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
