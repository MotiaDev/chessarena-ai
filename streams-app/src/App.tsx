import { Toaster } from '@/components/ui/sonner'
import { socketUrl } from '@/lib/env'
import { MotiaStreamProvider } from '@motiadev/stream-client-react'
import { LandingPage } from './components/landing-page'

function App() {
  return (
    <MotiaStreamProvider address={socketUrl}>
      <LandingPage />

      <Toaster />
    </MotiaStreamProvider>
  )
}

export default App
