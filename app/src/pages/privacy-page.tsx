import { MotiaPowered } from '@/components/motia-powered'
import { Page } from '@/components/page'
import { usePageTitle } from '@/lib/use-page-title'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import type React from 'react'
import { useNavigate } from 'react-router'

type ParagraphProps = React.PropsWithChildren<{ className?: string }>

const Paragraph: React.FC<ParagraphProps> = ({ children, className }) => {
  return <p className={cn('font-medium text-white/90 w-full text-justify [&+p]:mt-4', className)}>{children}</p>
}

export const PrivacyPage = () => {
  const navigate = useNavigate()
  const onBack = () => navigate('/')

  usePageTitle('Privacy Policy')

  return (
    <Page className="p-6 md:max-w-[500px] md:ml-auto md:border-l-2 md:border-white/5 max-md:bg-black/60 md:backdrop-blur-lg overflow-y-auto">
      <div className="flex flex-col flex-1 gap-4 items-center justify-between w-full h-full">
        <div className="relative flex flex-row items-center justify-center w-full">
          <ArrowLeft className="absolute left-0 top-0 size-6 cursor-pointer" onClick={onBack} />
          <MotiaPowered size="sm" />
        </div>
        <div className="flex flex-col gap-2 items-center justify-center">
          <img src="/horse.png" alt="Chessarena.ai" className="h-[160px] w-auto" />
          <h1 className="text-6xl font-title text-white mb-6">Chessarena.ai</h1>

          <div className="p-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-title text-white my-4">Privacy Policy</h2>
            <Paragraph>
              <strong>Effective Date:</strong> August 16, 2025
            </Paragraph>
            <Paragraph>
              Motia ("we," "our," or "us") respects your privacy and is committed to protecting it. This Privacy Policy
              explains how we collect, use, and share information when you use our application.
            </Paragraph>

            <h2 className="text-2xl font-title text-white my-4">1. Information We Collect</h2>
            <Paragraph>
              When you sign in to Motia with your Google account, we only request access to the following public
              information:
            </Paragraph>
            <ul className="list-disc list-inside text-white ml-4">
              <li>Name</li>
              <li>Profile Picture</li>
              <li>Email Address</li>
            </ul>

            <h2 className="text-2xl font-title text-white my-4">2. How We Use Your Information</h2>
            <Paragraph>
              <strong>Name and Profile Picture:</strong> Displayed to other users within the app to help identify you.
            </Paragraph>
            <Paragraph>
              <strong>Email Address:</strong> Kept private and never shared with other users. It may only be used
              internally for authentication, account management, or to contact you about your account.
            </Paragraph>
            <Paragraph>
              We do <strong>not</strong> collect or request any additional Google account data beyond what is listed
              above.
            </Paragraph>

            <h2 className="text-2xl font-title text-white my-4">3. Data Sharing</h2>
            <Paragraph>
              We do not sell, rent, or share your personal data with third parties. The only information visible to
              other users is your <strong>name</strong> and <strong>profile picture</strong>. Your{' '}
              <strong>email address</strong> is strictly private and never disclosed to other users.
            </Paragraph>

            <h2 className="text-2xl font-title text-white my-4">4. Data Security</h2>
            <Paragraph>
              We implement reasonable technical and organizational measures to protect your information from
              unauthorized access, loss, or misuse. However, no system is completely secure, and we cannot guarantee
              absolute protection.
            </Paragraph>

            <h2 className="text-2xl font-title text-white my-4">5. Your Choices</h2>
            <Paragraph>
              You may disconnect your Google account at any time through your account settings. Doing so will revoke our
              access to your Google information.
            </Paragraph>
            <Paragraph>
              If you wish to delete your account and associated data, you may contact us at{' '}
              <strong>contact@motia.dev</strong>.
            </Paragraph>

            <h2 className="text-2xl font-title text-white my-4">6. Children’s Privacy</h2>
            <Paragraph>
              Our app is not directed to individuals under 13. We do not knowingly collect personal data from children.
            </Paragraph>

            <h2 className="text-2xl font-title text-white my-4">7. Changes to This Policy</h2>
            <Paragraph>
              We may update this Privacy Policy from time to time. Any changes will be reflected with a revised
              “Effective Date” at the top of this page.
            </Paragraph>

            <h2 className="text-2xl font-title text-white my-4">8. Contact Us</h2>
            <Paragraph>If you have any questions about this Privacy Policy, please contact us at:</Paragraph>
            <Paragraph>
              <strong>Email:</strong> contact@motia.dev
            </Paragraph>
          </div>
        </div>
      </div>
    </Page>
  )
}
