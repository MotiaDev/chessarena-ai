import { MotiaStreamProvider } from '@motiadev/stream-client-react'
import { Chat } from './chat/Chat'

function App() {
  return (
    <MotiaStreamProvider address="ws://localhost:3000">
      <Chat />
    </MotiaStreamProvider>
  )
}

export default App
