import { createRoute, Link } from '@tanstack/react-router'
import { rootRoute } from '@/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Lock, Eye, FileText, Users, Database, Globe, Mail } from 'lucide-react'

export const PrivacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy-policy',
  component: PrivacyPolicyPage,
})

function PrivacyPolicyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/home" className="flex items-center gap-2 transition-transform hover:scale-105">
            <img
              src="/SVG/Darween.svg"
              alt="Darween Logo"
              className="h-8 w-8 dark:invert"
            />
            <span className="text-xl font-bold">Darween ERP</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/home">Back to Home</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: {lastUpdated}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray dark:prose-invert max-w-none">
            <p>
              At Darween ERP, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
              Enterprise Resource Planning (ERP) platform and services.
            </p>
            <p>
              By using Darween ERP, you agree to the collection and use of information in accordance with this policy. 
              If you do not agree with our policies and practices, please do not use our services.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold">1. Personal Information</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                When you register for an account or use our services, we may collect:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 ml-4">
                <li>Name and contact information (email address, phone number)</li>
                <li>Company information (company name, address, business details)</li>
                <li>Account credentials (encrypted passwords)</li>
                <li>Billing and payment information</li>
                <li>Profile information and preferences</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">2. Business Data</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                As part of our ERP services, we collect and store:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 ml-4">
                <li>Product information and inventory data</li>
                <li>Order and transaction records</li>
                <li>Supplier and customer information</li>
                <li>Warehouse and inventory management data</li>
                <li>Sales and financial records</li>
                <li>Franchise and location data</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">3. Authentication Data</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                When you use third-party authentication services (such as Google Sign-In), we may receive:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 ml-4">
                <li>Your name and email address from the authentication provider</li>
                <li>Profile picture (if provided by the authentication provider)</li>
                <li>Authentication tokens and identifiers</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm italic">
                Note: We only receive information that you explicitly authorize the authentication provider to share with us.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">4. Usage and Technical Data</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                We automatically collect certain information when you use our services:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 ml-4">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and features used</li>
                <li>Time and date of access</li>
                <li>Error logs and performance data</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
              <li>
                <strong>Service Delivery:</strong> To provide, maintain, and improve our ERP platform and services
              </li>
              <li>
                <strong>Account Management:</strong> To create and manage your account, process transactions, and send service-related communications
              </li>
              <li>
                <strong>Authentication:</strong> To verify your identity and enable secure access to your account through various authentication methods
              </li>
              <li>
                <strong>Customer Support:</strong> To respond to your inquiries, provide technical support, and address service issues
              </li>
              <li>
                <strong>Business Operations:</strong> To process orders, manage inventory, track sales, and perform other ERP functions
              </li>
              <li>
                <strong>Security:</strong> To detect, prevent, and address security issues, fraud, and unauthorized access
              </li>
              <li>
                <strong>Analytics:</strong> To analyze usage patterns, improve our services, and develop new features
              </li>
              <li>
                <strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Third-Party Services and Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold">Google Authentication</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                When you choose to sign in with Google, you are redirected to Google's authentication service. 
                Google may collect certain information as described in their Privacy Policy. We receive:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 ml-4">
                <li>Your Google account email address</li>
                <li>Your name (as stored in your Google account)</li>
                <li>Profile picture (if available)</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-3 text-sm">
                We use this information solely to create and manage your Darween ERP account. 
                We do not store your Google password or have access to other Google account information 
                beyond what you explicitly authorize.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">
                For more information about how Google handles your data, please review{' '}
                <a 
                  href="https://policies.google.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google's Privacy Policy
                </a>.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">E-commerce Integrations</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Our platform integrates with third-party e-commerce platforms such as Shopify and WooCommerce. 
                When you connect these services:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 ml-4">
                <li>We access order data, product information, and inventory levels</li>
                <li>We synchronize data between your e-commerce store and our ERP system</li>
                <li>We process webhooks and API calls from these platforms</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">
                These integrations are governed by the privacy policies and terms of service of the respective platforms.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">Other Third-Party Services</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                We may use other third-party services for:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 ml-4">
                <li>Email delivery and communication</li>
                <li>Payment processing</li>
                <li>Analytics and performance monitoring</li>
                <li>Cloud hosting and infrastructure</li>
                <li>Customer support tools</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">
                These service providers are contractually obligated to protect your information and use it only 
                for the purposes we specify.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
              <li>Encryption of data in transit using SSL/TLS protocols</li>
              <li>Encryption of sensitive data at rest</li>
              <li>Secure authentication mechanisms</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and role-based permissions</li>
              <li>Regular backups and disaster recovery procedures</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. 
              While we strive to use commercially acceptable means to protect your information, 
              we cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Data Sharing and Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
              <li>
                <strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our platform, 
                conducting business, or serving users, provided they agree to keep this information confidential
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with any merger, sale of company assets, financing, 
                or acquisition of all or a portion of our business
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law, court order, or government regulation, 
                or to protect our rights, property, or safety
              </li>
              <li>
                <strong>With Your Consent:</strong> When you explicitly authorize us to share your information
              </li>
              <li>
                <strong>Within Your Organization:</strong> With other users in your company or organization 
                as part of the normal operation of our ERP services
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Rights and Choices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
              <li>
                <strong>Access:</strong> Request access to your personal information and data stored in our system
              </li>
              <li>
                <strong>Correction:</strong> Update or correct inaccurate or incomplete information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your account and associated data (subject to legal and contractual obligations)
              </li>
              <li>
                <strong>Data Portability:</strong> Request a copy of your data in a structured, machine-readable format
              </li>
              <li>
                <strong>Opt-Out:</strong> Unsubscribe from marketing communications (service-related communications may still be sent)
              </li>
              <li>
                <strong>Authentication:</strong> Choose your preferred authentication method or disconnect third-party authentication
              </li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">
              We retain your personal information and business data for as long as necessary to provide our services 
              and fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required 
              or permitted by law. When you delete your account, we will delete or anonymize your personal information, 
              except where we are required to retain it for legal, regulatory, or business purposes.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              International Data Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">
              Your information may be transferred to and processed in countries other than your country of residence. 
              These countries may have data protection laws that differ from those in your country. 
              We take appropriate safeguards to ensure that your information receives an adequate level of protection 
              regardless of where it is processed.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Children's Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect 
              personal information from children. If you become aware that a child has provided us with personal 
              information, please contact us immediately, and we will take steps to delete such information.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Changes to This Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Privacy Policy from time to time to reflect changes in our practices, 
              technology, legal requirements, or other factors. We will notify you of any material changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date. 
              We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
              please contact us:
            </p>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p>
                <strong>Email:</strong> privacy@darween.app
              </p>
              <p>
                <strong>Support:</strong> support@darween.app
              </p>
              <p>
                We will respond to your inquiry within a reasonable timeframe.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button variant="outline" asChild>
            <Link to="/home">Back to Home</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-background mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} Darween ERP. All rights reserved.</p>
            <div className="mt-4 flex justify-center gap-6">
              <Link to="/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
              <Link to="/home" className="hover:underline">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

