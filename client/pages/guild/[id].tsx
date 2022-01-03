import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'

const Home: NextPage = () => {
  const { query } = useRouter()
  const [user, setUser] = useState<User | null>(null)

  const handleAuthChange = (session: Session | null) => {
    setUser(supabase.auth.user())

    if (!session || !session.provider_token) return

    // axios
    //   .get('/api/updateUserGuilds', {
    //     headers: {
    //       Authorization: `Bearer ${session.provider_token}`,
    //     },
    //   })
    //   .then((res) => res.data)
    //   .then((data) => setGuilds(data))
    //   .catch((err) => console.error(err))
  }

  useEffect(() => {
    handleAuthChange(supabase.auth.session())

    supabase.auth.onAuthStateChange((event, session) =>
      handleAuthChange(session),
    )
  }, [])

  if (!user)
    return (
      <button
        onClick={() =>
          supabase.auth.signIn(
            { provider: 'discord' },
            { scopes: `identify guilds` },
          )
        }
      >
        Log In
      </button>
    )

  return (
    <div>
      <button onClick={() => supabase.auth.signOut()}>Log Out</button>
    </div>
  )
}

export default Home
