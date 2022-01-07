import type { NextPage } from 'next'
import { supabase } from 'db/supabase/client'
import { useAuth } from '../../providers/AuthProvider'
import axios from 'axios'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import { APIChannel, APIGuild, APIRole } from 'discord-api-types'
import { LobbysModuleEditor } from '../../components/LobbysModuleEditor'
import { TicketsModuleEditor } from '../../components/TicketsModuleEditor'
import Image from 'next/image'
import { Tab } from '@headlessui/react'
import { MomentsModuleEditor } from '../../components/MomentsModuleEditor'
import Head from 'next/head'
import Link from 'next/link'
import { Guild } from 'db/types'

const GuildPage: NextPage = () => {
  const [guild, setGuild] = useState<APIGuild>(undefined)
  const [dbGuild, setDBGuild] = useState<Guild>(undefined)
  const [loadingGuild, setLoadingGuild] = useState(true)
  const [botInGuild, setBotInGuild] = useState(false)

  const [guildChannels, setGuildChannels] = useState<APIChannel[]>([])
  const [guildRoles, setGuildRoles] = useState<APIRole[]>([])
  const [guildCategories, setGuildCategories] = useState<APIChannel[]>([])
  const [guildTextChannels, setGuildTextChannels] = useState<APIChannel[]>([])

  const router = useRouter()
  const { id } = router.query

  const fetchGuild = useCallback(async () => {
    if (!id || typeof id !== 'string') return

    const session = supabase.auth.session()

    if (!session || !session.provider_token) return

    await axios
      .get(`/api/guild/${id}`, {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
        },
      })
      .then((res) => {
        setBotInGuild(true)
        return res.data
      })
      .then((data) => {
        setGuild(data.guild)
        setDBGuild(data.dbGuild)
        setGuildChannels(data.guildChannels)
        setGuildRoles(data.guildRoles)
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingGuild(false))
  }, [id])

  useEffect(() => {
    fetchGuild()
  }, [fetchGuild])

  useEffect(() => {
    setGuildCategories(guildChannels.filter((channel) => channel.type === 4))
    setGuildTextChannels(guildChannels.filter((channel) => channel.type === 0))
  }, [guildChannels])

  if (loadingGuild) return <div>Loading Guild</div>

  if (!guild || !botInGuild)
    return (
      <div className="w-full h-4/6 flex flex-col items-center">
        Bot is not in server
        <Link
          href={`https://discord.com/api/oauth2/authorize?client_id=901949735911424020&permissions=8&scope=bot%20applications.commands
        &guild_id=${id}&disable_guild_select=1`}
        >
          <a
            target="_blank"
            rel="noreferrer"
            className="px-6 py-4 bg-blue-700 rounded-sm"
          >
            Invite bot to server
          </a>
        </Link>
        <Link href="/">
          <a
            rel="noreferrer"
            className="px-6 py-4 bg-blue-700 rounded-sm"
            onClick={(e) => {
              e.preventDefault()
              router.reload()
            }}
          >
            Refresh
          </a>
        </Link>
      </div>
    )

  const guildAvatar = guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`
    : `https://eu.ui-avatars.com/api/?name=${guild.name.replace(/ /g, '+')}`

  return (
    <>
      <Head>
        <title>{guild.name} • Meyers</title>
        <link rel="icon" href={guildAvatar} />
      </Head>
      <div className="p-4 flex items-center ">
        <figure className="relative w-20 h-20 rounded-xl overflow-hidden shadow-lg">
          <Image src={guildAvatar} alt={guild.name} layout="fill" />
        </figure>
        <h1 className="text-2xl font-medium ml-4">{guild.name}</h1>
      </div>
      <Tab.Group>
        <Tab.List className="flex border-b border-b-gray-900/50">
          {['Lobbys', 'Tickets', 'Moments', 'Tags'].map((tab) => (
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
              guildId={guild.id}
              baseModule={dbGuild.lobbysModule}
              guildCategories={guildCategories}
            />
          </Tab.Panel>
          <Tab.Panel>
            <TicketsModuleEditor
              guildId={guild.id}
              baseModule={dbGuild.ticketsModule}
              guildCategories={guildCategories}
              guildRoles={guildRoles}
            />
          </Tab.Panel>
          <Tab.Panel>
            <MomentsModuleEditor
              guildId={guild.id}
              baseModule={dbGuild.momentsModule}
              guildTextChannels={guildTextChannels}
              guildRoles={guildRoles}
            />
          </Tab.Panel>
          <Tab.Panel>
            {/* TODO: XD */}
            {/* <TagsModuleEditor
              tagsModule={tagsModule}
              updateTagsModule={updateTagsModule}
            /> */}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </>
  )
}

export default GuildPage
