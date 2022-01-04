import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { prisma } from 'db/prisma/client'
import { Guild } from 'db/types'

const isAdmin = (guild: any) => ((guild.permissions >> 3) & 1) === 1

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST')
    return res.status(405).json({
      error: 'Method not allowed.',
    })

  const { authorization } = req.headers
  const { id, lobbysModule, momentsModule, ticketsModule } = req.body
    .guild as Guild

  if (!authorization) {
    return res.status(401).json({
      error: 'Unauthorized',
    })
  }

  try {
    const { data } = await axios.get(
      'https://discord.com/api/users/@me/guilds',
      {
        headers: {
          authorization,
        },
      },
    )

    const guild = data.find((guild: any) => guild.id === id && isAdmin(guild))

    if (!guild) {
      return res.status(404).json({
        error: 'Discord Guild not found.',
      })
    }

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

export default handler
