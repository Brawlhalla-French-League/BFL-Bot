import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { prisma } from 'db/prisma/client'
import { APIGuild } from 'discord-api-types'
import { TagsModule } from '@prisma/client'

const isAdmin = (guild: any) => ((guild.permissions >> 3) & 1) === 1

const updateGuildHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  console.log(req.body)
  const { tags } = req.body as { tags: TagsModule[] }

  if (!tags) return res.status(400).json({ error: 'No guild data.' })

  const { id, tagsModule, lobbysModule, momentsModule, ticketsModule } =
    guildData

  try {
    await prisma.guildProfile.update({
      where: { id },
      data: {
        lobbysModule: lobbysModule
          ? {
              update: {
                enabled: lobbysModule.enabled,
                categoryId: lobbysModule.categoryId,
                generatorCategoryId: lobbysModule.generatorCategoryId,
                generatorPrefix: lobbysModule.generatorPrefix,
                prefix: lobbysModule.prefix,
              },
            }
          : undefined,
        ticketsModule: ticketsModule
          ? {
              update: {
                enabled: ticketsModule.enabled,
                categoryId: ticketsModule.categoryId,
                closedPrefix: ticketsModule.closedPrefix,
                prefix: ticketsModule.prefix,
                duration: ticketsModule.duration,
                roleId: ticketsModule.roleId,
              },
            }
          : undefined,
        momentsModule: momentsModule
          ? {
              update: {
                enabled: momentsModule.enabled,
                channelId: momentsModule.channelId,
                roleId: momentsModule.roleId,
              },
            }
          : undefined,
        tagsModule: tagsModule
          ? {
              update: {
                enabled: tagsModule.enabled,
              },
            }
          : undefined,
      },
    })

    res.status(201).json('ok')
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: 'Internal Server Error',
    })
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({
      error: 'Method not allowed.',
    })
  }

  const { authorization } = req.headers
  const { id } = req.query as { id: string }

  if (!authorization) {
    return res.status(401).json({
      error: 'Unauthorized',
    })
  }

  let discordGuilds: APIGuild[]

  try {
    const axiosRes = await axios.get(
      'https://discord.com/api/users/@me/guilds',
      {
        headers: {
          authorization,
        },
      },
    )
    discordGuilds = axiosRes.data
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch guilds from discord.',
    })
  }

  const guild = discordGuilds.find(
    (guild: any) => guild.id === id && isAdmin(guild),
  )

  if (!guild) {
    return res.status(404).json({
      error: 'Discord Guild not found.',
    })
  }

  if (req.method === 'GET') return fetchGuildHandler(req, res, guild)
  if (req.method === 'POST') return updateGuildHandler(req, res)
}

export default handler
