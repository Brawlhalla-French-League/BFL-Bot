import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { prisma } from 'db/prisma/client'

const isAdmin = (guild: any) => ((guild.permissions >> 3) & 1) === 1

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { authorization } = req.headers
  const { id } = req.query as { id: string }

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

    const guildDB = await prisma.guildProfile.findUnique({
      where: { id },
      select: {
        id: true,
        lobbysModule: true,
        momentsModule: true,
        ticketsModule: true,
      },
    })

    if (!guildDB)
      return res.status(404).json({
        error: 'DB Guild not found.',
      })

    res.status(200).json({ guild, guildDB })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: 'Internal Server Error',
    })
  }
}

export default handler
