import type React from 'react'
import { useNavigate } from 'react-router'
import { PageGrid, PageGridRightColumn } from '@/components/page-grid'
import { ChessArenaLogo } from '@/components/ui/chess-arena-logo'
import { usePageTitle } from '@/lib/use-page-title'
import { cn } from '@/lib/utils'
import { TopBar } from '@/components/ui/top-bar'

type ParagraphProps = React.PropsWithChildren<{ className?: string }>

const Paragraph: React.FC<ParagraphProps> = ({ children, className }) => {
  return <p className={cn('font-medium text-white/90 w-full text-justify [&+p]:mt-4', className)}>{children}</p>
}

export const PrivacyPage = () => {
  const navigate = useNavigate()
  const onBack = () => navigate('/')

  usePageTitle('Privacy Policy')

  return (
    <PageGrid>
      <PageGridRightColumn>
        <TopBar onBack={onBack} />
        <div className="flex flex-col gap-6">
          <ChessArenaLogo />
          <div>
            <h2 className="text-2xl font-title text-white mb-4">Privacy Policy</h2>
            <Paragraph>
              <strong>Effective Date:</strong> August 16, 2025
            </Paragraph>
            <Paragraph>
              Motia ("we," "our," or "us") respects your privacy and is committed to protecting it. This Privacy Policy
              explains how we collect, use, and share information when you use our application.
            </Paragraph>

            <h3 className="text-2xl font-title text-white my-4">1. Information We Collect</h3>
            <Paragraph>
              When you sign in to Motia with your Google account, we only request access to the following public
              information:
            </Paragraph>
            <ul className="list-disc list-inside text-white ml-4">
              <li>Name</li>
              <li>Profile Picture</li>
              <li>Email Address</li>
            </ul>

            <h3 className="text-2xl font-title text-white my-4">2. How We Use Your Information</h3>
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

            <h3 className="text-2xl font-title text-white my-4">3. Data Sharing</h3>
            <Paragraph>
              We do not sell, rent, or share your personal data with third parties. The only information visible to
              other users is your <strong>name</strong> and <strong>profile picture</strong>. Your{' '}
              <strong>email address</strong> is strictly private and never disclosed to other users.
            </Paragraph>

            <h3 className="text-2xl font-title text-white my-4">4. Data Security</h3>
            <Paragraph>
              We implement reasonable technical and organizational measures to protect your information from
              unauthorized access, loss, or misuse. However, no system is completely secure, and we cannot guarantee
              absolute protection.
            </Paragraph>

            <h3 className="text-2xl font-title text-white my-4">5. Your Choices</h3>
            <Paragraph>
              You may disconnect your Google account at any time through your account settings. Doing so will revoke our
              access to your Google information.
            </Paragraph>
            <Paragraph>
              If you wish to delete your account and associated data, you may contact us at{' '}
              <strong>contact@motia.dev</strong>.
            </Paragraph>

            <h3 className="text-2xl font-title text-white my-4">6. Children’s Privacy</h3>
            <Paragraph>
              Our app is not directed to individuals under 13. We do not knowingly collect personal data from children.
            </Paragraph>

            <h3 className="text-2xl font-title text-white my-4">7. Changes to This Policy</h3>
            <Paragraph>
              We may update this Privacy Policy from time to time. Any changes will be reflected with a revised
              “Effective Date” at the top of this page.
            </Paragraph>

            <h3 className="text-2xl font-title text-white my-4">8. Contact Us</h3>
            <Paragraph>If you have any questions about this Privacy Policy, please contact us at:</Paragraph>
            <Paragraph>
              <strong>Email:</strong> contact@motia.dev
            </Paragraph>
          </div>
        </div>
      </PageGridRightColumn>
    </PageGrid>
  )
}
