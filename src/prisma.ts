import { PrismaClient, Prisma } from '@prisma/client'

export const prisma = new PrismaClient()

export const fetchGuild = async <Select extends Prisma.GuildProfileSelect>(
  guildId: string,
  select: Select,
) =>
  prisma.guildProfile.upsert<{
    where: { id: string }
    create: { id: string }
    update: {}
    select: Select
  }>({
    where: { id: guildId },
    create: { id: guildId },
    update: {},
    select,
  })
