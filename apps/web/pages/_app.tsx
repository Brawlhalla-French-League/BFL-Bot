import { AppProps } from 'next/app'
import { Header } from '../components/Header'
import { AuthProvider } from '../providers/AuthProvider'

import '../styles/globals.css'

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-800 text-white">
        <Header />
        <div className="max-w-screen-xl mx-auto">
          <Component {...pageProps} />
        </div>
      </div>
    </AuthProvider>
  )
}

export default App
