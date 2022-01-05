import { AppProps } from 'next/app'
import Head from 'next/head'
import { Header } from '../components/Header'
import { AuthProvider } from '../providers/AuthProvider'

import '../styles/globals.css'

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <AuthProvider>
      <Head>
        <title>Meyers</title>
        <link rel="icon" href="/icon.png" />
      </Head>
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
