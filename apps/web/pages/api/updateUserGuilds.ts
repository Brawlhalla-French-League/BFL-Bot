import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { prisma } from 'db/prisma/client'

const isAdmin = (guild: any) => ((guild.permissions >> 3) & 1) === 1

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { authorization } = req.headers

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

    const dbGuilds = await prisma.guildProfile.findMany({
      where: {
        id: {
          in: data.map((guild: any) => guild.id),
        },
      },
    })

    const guilds = data.filter(isAdmin).map((guild: any) => ({
      name: guild.name,
      id: guild.id,
      hasBot: dbGuilds.find((g) => g.id === guild.id),
      avatar: guild.icon
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`
        : `https://eu.ui-avatars.com/api/?name=${guild.name.replace(
            / /g,
            '+',
          )}`,
    }))

    res.status(200).json(guilds)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: 'Internal Server Error',
    })
  }
}

export default handler
