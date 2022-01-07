-- CreateTable
CREATE TABLE "TagsModule" (
    "guildId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TagsModule_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "GuildTag" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuildTag_name_key" ON "GuildTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GuildTag_guildId_name_key" ON "GuildTag"("guildId", "name");

-- AddForeignKey
ALTER TABLE "TagsModule" ADD CONSTRAINT "TagsModule_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "GuildProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildTag" ADD CONSTRAINT "GuildTag_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "TagsModule"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;
