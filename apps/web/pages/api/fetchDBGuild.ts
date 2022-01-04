import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { supabase } from 'db/supabase/admin'

const isAdmin = (guild: any) => ((guild.permissions >> 3) & 1) === 1

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { authorization } = req.headers
  const { id } = req.query

  if (!authorization) {
    return res.status(401).json({
      error: 'Unauthorized',
    })
  }

  console.log({
    id,
    authorization,
  })

  try {
    const { data } = await axios.get(
      'https://discord.com/api/users/@me/guilds',
      {
        headers: {
          authorization,
        },
      },
    )

    const guild = data.filter(isAdmin).find((guild: any) => guild.id === id)

    if (!guild) {
      return res.status(404).json({
        error: 'Guild not found',
      })
    }

    const { data: guildDB, error } = await supabase
      .from('GuildProfile')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    if (error) {
      console.error(error)
      return
    }

    res.status(200).json(guild)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: 'Internal Server Error',
    })
  }
}

export default handler
