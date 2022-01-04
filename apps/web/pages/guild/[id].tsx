import type { NextPage } from 'next'
import { supabase } from 'db/supabase/client'
import { LobbysModule } from '@prisma/client'
import { useAuth } from '../../providers/AuthProvider'
import axios from 'axios'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Guild } from 'db/types'
import { APIChannel } from 'discord-api-types'

const Home: NextPage = () => {
  const { user } = useAuth()
  const [lobbysModule, setLobbysModule] = useState<LobbysModule>(undefined)
  const [hasChanges, setHasChanges] = useState(false)
  const [guildChannels, setGuildChannels] = useState<APIChannel[]>([])
  const [guildCategories, setGuildCategories] = useState<APIChannel[]>([])

  const { id } = useRouter().query

  const fetchDBGuild = useCallback(async () => {
    if (!user) return

    if (!id || typeof id !== 'string') return

    const session = supabase.auth.session()

    if (!session || !session.provider_token) return

    axios
      .get<Guild>('/api/fetchDBGuild', {
        params: { id },
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
        },
      })
      .then((res) => res.data)
      .then((data) => {
        setLobbysModule(data.lobbysModule)
      })
      .catch((err) => console.error(err))
  }, [user, id])

  useEffect(() => {
    fetchDBGuild()
  }, [fetchDBGuild])

  const updateLobbysModule = (newModule: Partial<LobbysModule>) => {
    setHasChanges(true)
    setLobbysModule((prev) => ({ ...prev, ...newModule }))
  }

  const handleSubmit = async () => {
    if (!hasChanges) return

    if (!user) return

    if (!id || typeof id !== 'string') return

    const session = supabase.auth.session()

    if (!session || !session.provider_token) return

    await axios
      .post(
        '/api/updateGuild',
        { guild: { id, lobbysModule } },
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
          },
        },
      )
      .then((data) => console.log(data))
      .catch((err) => console.error(err))

    setHasChanges(false)
  }

  const fetchGuildChannels = useCallback(async () => {
    if (!user) return

    if (!id || typeof id !== 'string') return

    const session = supabase.auth.session()

    if (!session || !session.provider_token) return

    await axios
      .get(`/api/fetchGuildChannels`, { params: { id } })
      .then((res) => res.data)
      .then((data) => setGuildChannels(data))
      .catch((err) => console.error(err))
  }, [id, user])

  useEffect(() => {
    setTimeout(() => {
      fetchGuildChannels()
    }, 1000)
  }, [fetchGuildChannels])

  useEffect(() => {
    setGuildCategories(guildChannels.filter((channel) => channel.type === 4))
  }, [guildChannels])

  if (!user) return <div>Loading...</div>

  return (
    <div
      style={{
        backgroundColor: 'rgb(15, 23, 42)',
        color: 'white',
        height: '100vh',
      }}
    >
      <>
        <pre>
          {JSON.stringify(
            guildCategories.map((category) => ({
              name: category.name,
              id: category.id,
            })),
            null,
            2,
          )}
        </pre>
        {lobbysModule && (
          <>
            <h3>
              Lobbys{' '}
              <input
                type="checkbox"
                checked={lobbysModule.enabled}
                onChange={(e) =>
                  updateLobbysModule({ enabled: e.target.checked })
                }
              />
            </h3>
            <div>
              Generator Channels Category
              <select
                value={lobbysModule.generatorCategoryId}
                onChange={(e) =>
                  updateLobbysModule({ generatorCategoryId: e.target.value })
                }
              >
                <option value="">No Channel Selected</option>
                {guildCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>
                Generator Channel Prefix
                <input
                  value={lobbysModule.generatorPrefix}
                  onChange={(e) =>
                    updateLobbysModule({ generatorPrefix: e.target.value })
                  }
                />
              </label>
            </div>
            <div>
              Temporary Channels Category
              <br />
              (Can be the same as the Generator)
              <select
                value={lobbysModule.categoryId}
                onChange={(e) =>
                  updateLobbysModule({ categoryId: e.target.value })
                }
              >
                <option value="">No Channel Selected</option>
                {guildCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>
                Temporary Channels Prefix
                <input
                  value={lobbysModule.prefix}
                  onChange={(e) =>
                    updateLobbysModule({ prefix: e.target.value })
                  }
                />
              </label>
            </div>
            <pre>{JSON.stringify(lobbysModule, null, 2)}</pre>
          </>
        )}
        <button onClick={handleSubmit} disabled={!hasChanges}>
          Submit changes
        </button>
      </>

      {/* <Link href="/">
          <a>Invite bot to server</a>
        </Link> */}
    </div>
  )
}

export default Home
