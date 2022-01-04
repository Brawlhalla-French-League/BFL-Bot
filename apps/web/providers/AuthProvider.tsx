import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from 'db/supabase/client'

interface AuthContext {
  user: User | null
}

const authContext = createContext<AuthContext>({
  user: null,
})

export const useAuth = () => useContext(authContext)

interface Props {
  children: ReactNode
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null)

  const handleAuthChange = () => {
    setUser(supabase.auth.user())
  }

  useEffect(() => {
    handleAuthChange()
    supabase.auth.onAuthStateChange(() => handleAuthChange())
  }, [])

  return (
    <authContext.Provider value={{ user }}>{children}</authContext.Provider>
  )
}
