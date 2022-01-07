import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { prisma } from 'db/prisma/client'
import { APIGuild, APIChannel, APIRole } from 'discord-api-types'
import { Guild } from 'db/types'

const isAdmin = (guild: any) => ((guild.permissions >> 3) & 1) === 1

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed.',
    })
  }

  const { authorization } = req.headers
  const { guildId } = req.query as { guildId: string }

  if (!authorization) {
    return res.status(401).json({
      error: 'Unauthorized',
    })
  }

  let userGuilds: APIGuild[]
  let guildChannels: APIChannel[]
  let guildRoles: APIRole[]

  const botAuthorization = `Bot ${process.env.DISCORD_TOKEN}`

  try {
    const [userGuildsRes, channelsRes, rolesRes] = await Promise.all([
      axios
        .get('https://discord.com/api/users/@me/guilds', {
          headers: {
            authorization,
          },
        })
        .catch(() => {
          throw new Error('User is not in guild.')
        }),
      axios
        .get(`https://discord.com/api/guilds/${guildId}/channels`, {
          headers: {
            authorization: botAuthorization,
          },
        })
        .catch(() => {
          throw new Error('Bot is not in guild.')
        }),
      axios
        .get(`https://discord.com/api/guilds/${guildId}/roles`, {
          headers: {
            authorization: botAuthorization,
          },
        })
        .catch(() => {
          throw new Error('Bot is not in guild.')
        }),
    ])

    userGuilds = userGuildsRes.data
    guildChannels = channelsRes.data
    guildRoles = rolesRes.data
  } catch (error) {
    return res.status(400).json({
      error: error.msg,
    })
  }

  const guild = userGuilds.find(
    (guild: any) => guild.id === guildId && isAdmin(guild),
  )

  if (!guild) {
    return res.status(404).json({
      error: 'User is not admin of the guild.',
    })
  }

  let dbGuild: Guild

  try {
    dbGuild = await prisma.guildProfile.findUnique({
      where: { id: guildId },
      include: {
        lobbysModule: true,
        momentsModule: true,
        ticketsModule: true,
        tagsModule: {
          include: {
            tags: true,
          },
        },
      },
    })
  } catch (error) {
    throw error
  }

  return res.status(200).json({
    guild,
    dbGuild,
    guildChannels,
    guildRoles,
  })
}

export default handler
