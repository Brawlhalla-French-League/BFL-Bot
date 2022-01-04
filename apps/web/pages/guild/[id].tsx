import type { NextPage } from 'next'
import { supabase } from 'db/supabase/client'
import { LobbysModule } from '@prisma/client'
import { useAuth } from '../../providers/AuthProvider'
import axios from 'axios'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Guild } from 'db/types'
import { APIChannel } from 'discord-api-types'
import { Select } from '../../components/Select'
import { VolumeUpIcon } from '@heroicons/react/solid'

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
    <>
      {lobbysModule && (
        <>
          <h3 className="text-3xl uppercase font-bold text-gray-200">Lobbys</h3>
          <label>
            Activate Module
            <input
              type="checkbox"
              checked={lobbysModule.enabled}
              onChange={(e) =>
                updateLobbysModule({ enabled: e.target.checked })
              }
            />
          </label>
          {lobbysModule.enabled && (
            <>
              <div className="mt-4">
                <span className="uppercase text-gray-200 text-sm">
                  Generator Channels Category
                </span>
                <Select
                  options={guildCategories.map((category) => ({
                    label: category.name,
                    value: category.id,
                  }))}
                  selected={lobbysModule.generatorCategoryId}
                  onSelect={(value) => {
                    console.log('select', value)
                    updateLobbysModule({ generatorCategoryId: value })
                  }}
                />
              </div>
              <div className="mt-4">
                <label>
                  <span className="uppercase text-gray-200 text-sm">
                    Generator Channel Prefix
                  </span>
                  <input
                    className="block max-w-md w-full mb-2 py-2 pl-3 pr-10 text-left bg-gray-900 font-medium uppercase rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-blue-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm"
                    value={lobbysModule.generatorPrefix}
                    onChange={(e) =>
                      updateLobbysModule({ generatorPrefix: e.target.value })
                    }
                  />
                </label>
                <p className="flex items-center mb-2">
                  Example{' '}
                  <span className="ml-2 bg-gray-700 px-2 py-1 rounded-md inline-flex items-center text-gray-300 font-medium">
                    <VolumeUpIcon
                      className="w-5 h-5 inline-block mr-1"
                      aria-hidden="true"
                    />
                    {lobbysModule.generatorPrefix}Lobby 1v1
                  </span>
                </p>
              </div>
              <div className="mt-4">
                <span className="uppercase text-gray-200 text-sm">
                  Temporary Channels Category
                </span>
                <Select
                  options={guildCategories.map((category) => ({
                    label: category.name,
                    value: category.id,
                  }))}
                  selected={lobbysModule.categoryId}
                  onSelect={(value) => {
                    console.log('select', value)
                    updateLobbysModule({ categoryId: value })
                  }}
                />
              </div>
              <div className="mt-4">
                <label>
                  <span className="uppercase text-gray-200 text-sm">
                    Temporary Channel Prefix
                  </span>
                  <input
                    className="block max-w-md w-full mb-2 py-2 pl-3 pr-10 text-left bg-gray-900 font-medium uppercase rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-blue-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm"
                    value={lobbysModule.prefix}
                    onChange={(e) =>
                      updateLobbysModule({ prefix: e.target.value })
                    }
                  />
                </label>
                <p className="flex items-center mb-2">
                  Example{' '}
                  <span className="ml-2 bg-gray-700 px-2 py-1 rounded-md inline-flex items-center text-gray-300 font-medium">
                    <VolumeUpIcon
                      className="w-5 h-5 inline-block mr-1"
                      aria-hidden="true"
                    />
                    {lobbysModule.prefix}Lobby 1v1
                  </span>
                </p>
              </div>
            </>
          )}
        </>
      )}
      <button
        className="mt-8 block px-2 py-1 rounded-sm bg-blue-600 hover:bg-blue-500 disabled:bg-gray-400 disabled:text-gray-900"
        onClick={handleSubmit}
        disabled={!hasChanges}
      >
        Submit changes
      </button>

      {/* <Link href="/">
          <a>Invite bot to server</a>
        </Link> */}
    </>
  )
}

export default Home
