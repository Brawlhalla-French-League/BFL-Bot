import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../providers/AuthProvider'
import { supabase } from 'db/supabase/client'

export const Header = () => {
  const { user } = useAuth()

  return (
    <header>
      <Link href="/">
        <a>Home</a>
      </Link>
      {user ? (
        <>
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
        </>
      ) : (
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
      )}
    </header>
  )
}
