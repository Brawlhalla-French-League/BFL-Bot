import axios from 'axios'
import { supabase } from 'db/supabase/client'
import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '../providers/AuthProvider'

const Home: NextPage = () => {
  const { user } = useAuth()
  const [guilds, setGuilds] = useState<any[]>([])

  useEffect(() => {
    const session = supabase.auth.session()

    if (!session || !session.provider_token) {
      setGuilds([])
      return
    }

    axios
      .get('/api/updateUserGuilds', {
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
      <div
        className="grid auto-cols-fr px-8 py-8 gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        // style={{
        //   display: 'grid',
        //   gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        //   gap: '1rem',
        //   maxWidth: '1200px',
        //   margin: '0 auto',
        // }}
      >
        {guilds.map((guild, i) => (
          <Link key={guild.id} href={`/guild/${guild.id}`}>
            <a
              className="flex items-center bg-gray-800 hover:bg-gray-900 rounded-md p-4 text-white"
              // style={{
              //   backgroundColor: 'rgb(30, 41, 59)',
              //   color: 'white',
              //   fontSize: '1rem',
              //   fontWeight: 'bold',
              //   display: 'flex',
              //   flexDirection: 'column',
              //   alignItems: 'center',
              //   justifyContent: 'center',
              //   cursor: 'pointer',
              //   padding: '1rem',
              //   borderRadius: '4px',
              // }}
            >
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
                {i % 5 === 0 ? (
                  <span className="text-green-400 text-sm">Bot Added ✅</span>
                ) : (
                  <span className="text-red-400 text-sm">
                    Bot is not in server ❌
                  </span>
                )}
              </p>
            </a>
          </Link>
        ))}
      </div>
    </>
  )
}

export default Home
