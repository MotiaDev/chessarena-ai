import { Toaster } from '@/components/ui/sonner'
import { socketUrl } from '@/lib/env'
import { MotiaStreamProvider } from '@motiadev/stream-client-react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { CreateGamePage } from './pages/create-game-page'
import { ChessGamePage } from './pages/game-page'
import { LandingPage } from './pages/landing-page'

function App() {
  return (
    <MotiaStreamProvider address={socketUrl}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/new" element={<CreateGamePage />} />
          <Route path="/game/:gameId" element={<ChessGamePage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </MotiaStreamProvider>
  )
}

export default App
