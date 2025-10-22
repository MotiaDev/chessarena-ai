import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { PageGrid, PageGridRightColumn } from '@/components/page-grid'
import { BaseButton } from '@/components/ui/base-button'
import { Input } from '@/components/ui/input'
import { ChessArenaLogo } from '@/components/ui/chess-arena-logo'
import { usePageTitle } from '@/lib/use-page-title'
import { TopBar } from '@/components/ui/top-bar'
import { OtpInput } from '../components/ui/otp-input'
import { useLogin } from '../lib/auth/use-login'
import { useQueryParam } from '../lib/use-query-param'

export const LoginPage = () => {
  const [isOtpEnabled, setIsOtpEnabled] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [redirect] = useQueryParam('redirect')

  const { handleLogin, verifyOtp, isAuthenticating, error, successMessage } = useLogin()

  const onEmailLogin = () => {
    setIsOtpEnabled(true)
    return handleLogin('email', { email })
  }

  useEffect(() => {
    localStorage.setItem('chessarena-redirect', redirect ?? '')
  }, [redirect])

  const navigate = useNavigate()
  const onBack = () => navigate('/')

  usePageTitle('Login')

  return (
    <PageGrid>
      <PageGridRightColumn>
        <TopBar onBack={onBack} />
        <div className="flex flex-col gap-4 items-center justify-center grow">
          <ChessArenaLogo />
        </div>
        {successMessage ? (
          <div className="flex flex-col justify-center h-[348px] gap-6">
            <div className="space-y-1">
              <p className="text-center text-2xl font-semibold">{successMessage.title}</p>
              <p className="text-muted-foreground text-center">{successMessage.description}</p>
            </div>
            {isOtpEnabled && (
              <div className="space-y-4">
                <OtpInput value={otp} onChange={setOtp} />
                <BaseButton className="w-full" onClick={() => verifyOtp(email, otp)} isLoading={isAuthenticating}>
                  Verify
                </BaseButton>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {error && <p className="text-red-500 text-center font-semibold first-letter:uppercase">{error}</p>}
            {!isAuthenticating && (
              <>
                <BaseButton className="w-full" onClick={() => handleLogin('google')}>
                  <img src="/login/google-logo.svg" alt="Google" className="size-6" />
                  Continue with Google
                </BaseButton>
                {/* <BaseButton className="w-full" onClick={() => handleLogin('twitter')}>
                  <img src="/login/x-logo.svg" alt="X" className="size-6" />
                  Continue with X
                </BaseButton> */}
                <div className="flex flex-row gap-2 items-center justify-center w-full text-muted-foreground text-md font-semibold">
                  <div className="h-[1px] flex-1 bg-white/10" />
                  Or
                  <div className="h-[1px] flex-1 bg-white/10" />
                </div>
              </>
            )}
            <Input
              type="email"
              placeholder="Enter your email"
              className="w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <BaseButton className="w-full" onClick={onEmailLogin} isLoading={isAuthenticating}>
              Continue
            </BaseButton>
            <p className="text-muted-foreground text-center">
              If no accounts are found under this email, we'll create an account for you. By creating an account you
              agree with the{' '}
              <a href="/privacy-policy" target="_blank" className="font-semibold underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        )}
      </PageGridRightColumn>
    </PageGrid>
  )
}
