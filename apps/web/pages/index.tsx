import axios from 'axios'
import { supabase } from 'db/supabase/client'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '../providers/AuthProvider'

const Home: NextPage = () => {
  const { user } = useAuth()
  const [guilds, setGuilds] = useState<
    { name: string; id: string; hasBot: boolean; avatar: string }[]
  >([])

  useEffect(() => {
    const session = supabase.auth.session()

    if (!session || !session.provider_token) {
      setGuilds([])
      return
    }

    axios
      .get('/api/guilds', {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
        },
      })
      .then((res) => res.data)
      .then((data) => setGuilds(data))
      .catch((err) => console.error(err))
  }, [user])

  if (guilds.length < 0) return null

  return (
    <>
      <Head>
        <title>Meyers</title>
        <link rel="icon" href="/icon.png" />
      </Head>
      {user ? (
        <>
          <div className="py-16 px-8">
            <figure className="w-32 h-32 overflow-hidden relative rounded-full">
              <Image
                src={user.identities[0].identity_data.avatar_url}
                alt={user.identities[0].identity_data.name}
                layout="fill"
                objectFit="cover"
                objectPosition="center"
                className="relative"
              />
            </figure>
          </div>
          <div className="grid auto-cols-fr px-8 py-8 gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {guilds.map((guild, i) => (
              <Link key={guild.id} href={`/guild/${guild.id}`}>
                <a className="flex items-center bg-gray-800 hover:bg-gray-900/50 rounded-md p-4 text-white">
                  <figure className="w-16 h-16 overflow-hidden rounded-xl relative mr-4 shadow-lg">
                    <Image
                      src={guild.avatar}
                      alt={guild.name}
                      layout="fill"
                      objectFit="cover"
                      objectPosition="center"
                    />
                  </figure>
                  <p>
                    <span className="text-white text-lg font-medium block">
                      {guild.name.length > 20
                        ? `${guild.name.slice(0, 20)}...`
                        : guild.name}
                    </span>
                    {guild.hasBot ? (
                      <span className="text-green-400 text-sm">
                        Bot Added ✅
                      </span>
                    ) : (
                      <span className="text-red-400 text-sm">
                        Bot not in server. ❌
                      </span>
                    )}
                  </p>
                </a>
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </>
  )
}

export default Home
