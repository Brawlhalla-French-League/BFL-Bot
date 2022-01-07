import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'db/prisma/client'
import { moduleTypes } from 'db/types'
import { APIGuild } from 'discord-api-types'
import axios from 'axios'
import {
  LobbysModule,
  TicketsModule,
  MomentsModule,
  TagsModule,
} from '@prisma/client'

const isAdmin = (guild: any) => ((guild.permissions >> 3) & 1) === 1

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed.',
    })
  }

  const { authorization } = req.headers
  const { moduleType, guildId } = req.query as {
    guildId: string
    moduleType: typeof moduleTypes[number]
  }

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
    (guild: any) => guild.id === guildId && isAdmin(guild),
  )

  if (!guild) {
    return res.status(404).json({
      error: 'Discord Guild not found.',
    })
  }

  console.log({ moduleName: moduleType, guildId })

  switch (moduleType) {
    case 'lobbys': {
      const { module } = req.body as { module: LobbysModule }
      console.log(module)

      await prisma.lobbysModule.update({
        where: { guildId },
        data: module,
      })
      break
    }
    case 'tickets': {
      const { module } = req.body as { module: TicketsModule }

      await prisma.ticketsModule.update({
        where: { guildId },
        data: module,
      })
      break
    }
    case 'moments': {
      const { module } = req.body as { module: MomentsModule }

      await prisma.momentsModule.update({
        where: { guildId },
        data: module,
      })
      break
    }
    case 'tags': {
      const { module } = req.body as { module: TagsModule }

      await prisma.tagsModule.update({
        where: { guildId },
        data: module,
      })
      break
    }
  }

  return res.status(201).json('ok')
}

export default handler
