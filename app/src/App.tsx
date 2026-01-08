import { Toaster } from '@/components/ui/sonner'
import { socketUrl } from '@/lib/env'
import { MotiaStreamProvider } from '@motiadev/stream-client-react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { CreateGamePage } from './pages/create-game-page'
import { ChessGamePage } from './pages/game-page'
import { LandingPage } from './pages/landing-page'
import { LeaderboardPage } from './pages/leaderboard-page'
import { LiveMatchesPage } from './pages/live-matches-page'
import { AboutPage } from './pages/about-page'
import { LoginPage } from './pages/login-page'
import { AuthProvider } from './components/auth/auth-provider'
import { PrivacyPage } from './pages/privacy-page'
import { MethodologyPage } from './pages/methodology-page'
import { GameHistoryPage } from './pages/game-history-page'
import { GameReplayPage } from './pages/game-replay-page'
import { PlayAIPage } from './pages/play-ai-page'
import { BenchPage } from './pages/bench-page'
import { ArenaPage } from './pages/arena-page'

function App() {
  return (
    <MotiaStreamProvider address={socketUrl}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/live-matches" element={<LiveMatchesPage />} />
            <Route path="/new" element={<CreateGamePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/game/:gameId" element={<ChessGamePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/methodology" element={<MethodologyPage />} />
            <Route path="/history" element={<GameHistoryPage />} />
            <Route path="/history/:gameId" element={<GameReplayPage />} />
            <Route path="/play-ai" element={<PlayAIPage />} />
            <Route path="/bench" element={<BenchPage />} />
            <Route path="/arena" element={<ArenaPage />} />
            <Route path="/privacy-policy" element={<PrivacyPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster />
    </MotiaStreamProvider>
  )
}

export default App
