// import '@/styles/globals.css'
import { SocketProvider } from '@/contexts/socketContext'

// CSS
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {

  return (
    <SocketProvider>
      <Component {...pageProps} />
    </SocketProvider>
  )

}
