declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export {}
