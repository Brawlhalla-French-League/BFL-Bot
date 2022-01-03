import type { NextPage } from 'next'
import { useState, useEffect, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import Image from 'next/image'

const Home: NextPage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [guilds, setGuilds] = useState<any[]>([])
  const [guild, setGuild] = useState<any | null>(null)

  const [] = useState(null)

  const handleAuthChange = (session: Session | null) => {
    setUser(supabase.auth.user())

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
  }

  useEffect(() => {
    handleAuthChange(supabase.auth.session())

    supabase.auth.onAuthStateChange((event, session) =>
      handleAuthChange(session),
    )
  }, [])

  const fetchDBGuild = useCallback(async () => {
    if (!guild) return

    const session = supabase.auth.session()
    if (!session || !session.provider_token) return

    axios
      .get('/api/fetchDBGuild', {
        params: {
          id: guild.id,
        },
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
        },
      })
      .then((res) => res.data)
      .then((data) => console.log(data))
      .catch((err) => console.error(err))
  }, [guild])

  useEffect(() => {
    fetchDBGuild()
  }, [fetchDBGuild])

  if (!user)
    return (
      <button
        onClick={() =>
          supabase.auth.signIn(
            { provider: 'discord' },
            { scopes: `identify guilds guilds.members.read` },
          )
        }
      >
        Log In
      </button>
    )

  return (
    <div
      style={{
        backgroundColor: 'rgb(15, 23, 42)',
        color: 'white',
        height: '100vh',
      }}
    >
      {user.identities && (
        <>
          <Image
            src={user.identities[0].identity_data.avatar_url}
            alt={user.identities[0].identity_data.name}
            width={64}
            height={64}
          />
          <span>{user.identities[0].identity_data.name}</span>
        </>
      )}
      <button onClick={() => supabase.auth.signOut()}>Log Out</button>
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
              <button
                key={guild.id}
                style={{
                  border: 'none',
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
                onClick={() => setGuild(guild)}
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
              </button>
            ))}
          </div>
          {guild && (
            <>
              <h1>{guild.name}</h1>
              <span>{guild.id}</span>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Home
