import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const isAdmin = (guild: any) => ((guild.permissions >> 3) & 1) === 1

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET')
    return res.status(405).json({
      error: 'Method not allowed.',
    })

  const { id } = req.query as { id: string }

  try {
    const { data } = await axios.get(
      `https://discord.com/api/guilds/${id}/channels`,
      {
        headers: {
          authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        },
      },
    )

    res.status(200).json(data)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: 'Internal Server Error',
    })
  }
}

export default handler
