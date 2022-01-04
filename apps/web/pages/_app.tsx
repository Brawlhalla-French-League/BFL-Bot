import { AppProps } from 'next/app'
import { Header } from '../components/Header'
import { AuthProvider } from '../providers/AuthProvider'

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <AuthProvider>
      <Header />
      <Component {...pageProps} />
    </AuthProvider>
  )
}

export default App
