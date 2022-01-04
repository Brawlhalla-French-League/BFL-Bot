import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../providers/AuthProvider'
import { supabase } from 'db/supabase/client'

export const Header = () => {
  const { user } = useAuth()

  return (
    <header className="flex items-center h-16 bg-gray-900 px-8">
      <Link href="/">
        <a className="text-white mr-auto hover:underline hover:underline-offset-2 font-medium text-lg">
          Home
        </a>
      </Link>
      {user ? (
        <>
          {user.identities && (
            <>
              <figure className="w-8 h-8 overflow-hidden relative rounded-full">
                <Image
                  src={user.identities[0].identity_data.avatar_url}
                  alt={user.identities[0].identity_data.name}
                  layout="fill"
                  objectFit="cover"
                  objectPosition="center"
                  className="relative"
                />
              </figure>
              <span className="text-white ml-2 mr-8">
                {user.identities[0].identity_data.name}
              </span>
            </>
          )}
          <button
            className="px-3 py-1 rounded-sm bg-red-500 text-white hover:bg-red-400"
            onClick={() => supabase.auth.signOut()}
          >
            Log Out
          </button>
        </>
      ) : (
        <button
          className="px-3 py-1 rounded-sm bg-blue-500 text-white"
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
