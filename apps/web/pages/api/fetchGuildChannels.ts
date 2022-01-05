import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET')
    return res.status(405).json({
      error: 'Method not allowed.',
    })

  const { id } = req.query as { id: string }

  const authorization = `Bot ${process.env.DISCORD_TOKEN}`

  try {
    const [channelsRes, rolesRes] = await Promise.all([
      axios.get(`https://discord.com/api/guilds/${id}/channels`, {
        headers: {
          authorization,
        },
      }),
      axios.get(`https://discord.com/api/guilds/${id}/roles`, {
        headers: {
          authorization,
        },
      }),
    ])

    res.status(200).json({
      channels: channelsRes.data,
      roles: rolesRes.data,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: 'Internal Server Error',
    })
  }
}

export default handler
