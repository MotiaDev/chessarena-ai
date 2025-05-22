import { MotiaStreamProvider } from '@motiadev/stream-client-react'
import { Chat } from './chat/Chat'

function App() {
  return (
    <MotiaStreamProvider address="wss://b0e0-168-0-235-200.ngrok-free.app">
      <Chat />
    </MotiaStreamProvider>
  )
}

export default App
