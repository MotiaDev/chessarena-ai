import { Toaster } from '@/components/ui/sonner'
import { socketUrl } from '@/lib/env'
import { MotiaStreamProvider } from '@motiadev/stream-client-react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { AiGamePage } from './pages/ai-game-page'
import { CreateGamePage } from './pages/create-game-page'
import { ChessGamePage } from './pages/game-page'
import { LandingPage } from './pages/landing-page'
import { LeaderboardPage } from './pages/leaderboard-page'
import { LiveMatchesPage } from './pages/live-matches-page'

function App() {
  return (
    <MotiaStreamProvider address={socketUrl}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/live-matches" element={<LiveMatchesPage />} />
          <Route path="/new" element={<CreateGamePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/game/:gameId" element={<ChessGamePage />} />
          <Route path="/ai-game/:id" element={<AiGamePage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </MotiaStreamProvider>
  )
}

export default App
