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

    if (!session || !session.provider_token) return

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

  return (
    <div
      style={{
        backgroundColor: 'rgb(15, 23, 42)',
        color: 'white',
        height: '100vh',
      }}
    >
      {guilds.length > 0 && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            {guilds.map((guild) => (
              <Link key={guild.id} href={`/guild/${guild.id}`}>
                <a
                  style={{
                    backgroundColor: 'rgb(30, 41, 59)',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: '1rem',
                    borderRadius: '4px',
                  }}
                >
                  <div
                    style={{
                      borderRadius: '50%',
                      overflow: 'hidden',
                      width: '64px',
                      height: '64px',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <Image
                      src={guild.avatar}
                      alt={guild.name}
                      width={64}
                      height={64}
                    />
                  </div>
                  {guild.name}
                </a>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Home
