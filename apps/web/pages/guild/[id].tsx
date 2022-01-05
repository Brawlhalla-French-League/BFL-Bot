import type { NextPage } from 'next'
import { supabase } from 'db/supabase/client'
import { LobbysModule, TicketsModule, MomentsModule } from '@prisma/client'
import { useAuth } from '../../providers/AuthProvider'
import axios from 'axios'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Guild } from 'db/types'
import { APIChannel, APIGuild, APIRole } from 'discord-api-types'
import { LobbysModuleEditor } from '../../components/LobbysModuleEditor'
import { TicketsModuleEditor } from '../../components/TicketsModuleEditor'
import Image from 'next/image'
import { Tab } from '@headlessui/react'

const Home: NextPage = () => {
  const { user } = useAuth()
  const [guild, setGuild] = useState<APIGuild | null>(null)
  const [lobbysModule, setLobbysModule] = useState<LobbysModule>(undefined)
  const [ticketsModule, setTicketsModule] = useState<TicketsModule>(undefined)
  const [momentsModule, setMomentsModule] = useState<MomentsModule>(undefined)
  const [hasChanges, setHasChanges] = useState(false)
  const [guildChannels, setGuildChannels] = useState<APIChannel[]>([])
  const [guildRoles, setGuildRoles] = useState<APIRole[]>([])
  const [guildCategories, setGuildCategories] = useState<APIChannel[]>([])

  const { id } = useRouter().query

  const fetchDBGuild = useCallback(async () => {
    if (!user) return

    if (!id || typeof id !== 'string') return

    const session = supabase.auth.session()

    if (!session || !session.provider_token) return

    axios
      .get<{ guild: APIGuild; guildDB: Guild }>('/api/fetchDBGuild', {
        params: { id },
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
        },
      })
      .then((res) => res.data)
      .then(({ guild, guildDB }) => {
        setGuild(guild)
        setLobbysModule(guildDB.lobbysModule)
        setTicketsModule(guildDB.ticketsModule)
        setMomentsModule(guildDB.momentsModule)
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

  const updateTicketsModule = (newModule: Partial<TicketsModule>) => {
    setHasChanges(true)
    setTicketsModule((prev) => ({ ...prev, ...newModule }))
  }

  const handleSubmit = async () => {
    if (!hasChanges) return
    setHasChanges(false)

    if (!user) return

    if (!id || typeof id !== 'string') return

    const session = supabase.auth.session()

    if (!session || !session.provider_token) return

    await axios
      .post(
        '/api/updateGuild',
        { guild: { id, lobbysModule, ticketsModule } },
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
          },
        },
      )
      .then((data) => console.log(data))
      .catch((err) => {
        console.error(err)
        setHasChanges(true)
      })
  }

  const fetchGuildChannels = useCallback(async () => {
    if (!user) return

    if (!id || typeof id !== 'string') return

    const session = supabase.auth.session()

    if (!session || !session.provider_token) return

    await axios
      .get(`/api/fetchGuildChannels`, { params: { id } })
      .then((res) => res.data)
      .then((data) => {
        setGuildChannels(data.channels)
        setGuildRoles(data.roles)
      })
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

  if (!user || !guild) return <div>Loading...</div>

  return (
    <>
      <div className="p-4 flex items-center ">
        <figure className="relative w-20 h-20 rounded-xl overflow-hidden shadow-lg">
          <Image
            src={
              guild.icon
                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`
                : `https://eu.ui-avatars.com/api/?name=${guild.name.replace(
                    / /g,
                    '+',
                  )}`
            }
            alt={guild.name}
            layout="fill"
          />
        </figure>
        <h1 className="text-2xl font-medium ml-4">{guild.name}</h1>
      </div>
      <Tab.Group>
        <Tab.List className="flex border-b border-b-gray-900">
          {['Lobbys', 'Tickets', 'Moments'].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                [
                  'w-full py-2.5 text-sm leading-5 font-medium ',
                  selected
                    ? 'border-b border-blue-500'
                    : ' hover:bg-gray-900/40',
                ].join(' ')
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-4">
          <Tab.Panel>
            <LobbysModuleEditor
              lobbysModule={lobbysModule}
              updateLobbysModule={updateLobbysModule}
              guildCategories={guildCategories}
            />
          </Tab.Panel>
          <Tab.Panel>
            <TicketsModuleEditor
              ticketsModule={ticketsModule}
              updateTicketsModule={updateTicketsModule}
              guildCategories={guildCategories}
              guildRoles={guildRoles}
            />
          </Tab.Panel>
          <Tab.Panel>Moments</Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
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
