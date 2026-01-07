export const metadata = {
  title: 'Privacy Policy - Rocket Solutions',
  description: 'Privacy Policy for Rocket Solutions LLC',
}

export default function PrivacyPage() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">
          <strong>Effective Date:</strong> January 6, 2026<br />
          <strong>Last Updated:</strong> January 6, 2026
        </p>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">1. Introduction</h2>
            <p>
              Rocket Solutions LLC ("Rocket Solutions," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or communicate with us via SMS text messaging.
            </p>
            <p className="mt-4">
              Our business address is:
            </p>
            <p className="ml-4">
              Rocket Solutions LLC<br />
              2855 Broome Rd.<br />
              Gainesville, GA<br />
              Hall County, GA
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">2. Information We Collect</h2>
            <p>We collect personal information that you voluntarily provide when you fill out forms, sign up for services, or opt-in to receive SMS messages, including:</p>
            <ul className="list-disc ml-6 space-y-2 mt-4">
              <li>Full name</li>
              <li>Business name</li>
              <li>Email address</li>
              <li>Phone number (including mobile for SMS)</li>
              <li>Business type/industry</li>
              <li>IP address and device information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">3. SMS Text Messaging</h2>
            <p>
              When you opt-in to receive SMS messages from Rocket Solutions, we collect and store your mobile phone number, consent records (including date, time, IP address, and device information).
            </p>
            <p className="mt-4">
              <strong>How We Use SMS:</strong> We send transactional messages related to your account, service updates, important notifications, and customer support communications.
            </p>
            <p className="mt-4">
              <strong>Message Frequency:</strong> Message frequency varies based on your account activity. You may receive 10-50 messages per day during active periods.
            </p>
            <p className="mt-4">
              <strong>Message and Data Rates:</strong> Standard message and data rates may apply based on your mobile carrier's plan.
            </p>
            <p className="mt-4">
              <strong>Opt-Out:</strong> You may opt-out at any time by texting STOP to any message. You'll receive a confirmation that you've been unsubscribed.
            </p>
            <p className="mt-4">
              <strong>Help:</strong> For assistance, text HELP to any message or contact us at support@rocketsolutions.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">4. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc ml-6 space-y-2 mt-4">
              <li>Provide, operate, and maintain our website building services</li>
              <li>Process your requests and fulfill orders</li>
              <li>Send you transactional SMS messages and service updates</li>
              <li>Provide customer support</li>
              <li>Improve our website and services</li>
              <li>Prevent fraud and enhance security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">5. Information Sharing</h2>
            <p>We do not sell your personal information. We may share your information with:</p>
            <ul className="list-disc ml-6 space-y-2 mt-4">
              <li>Service providers (SMS platforms, hosting, payment processors, analytics)</li>
              <li>Legal authorities when required by law</li>
              <li>Potential buyers in a business transfer or acquisition</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-900">SMS Opt-In Data Protection</h3>
            <p className="font-semibold">
              Your mobile information will not be sold or shared with third parties for promotional or marketing purposes.
            </p>
            <p className="mt-4">
              All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.
            </p>
            <p className="mt-4">
              We will not share your opt-in to an SMS campaign with any third party for purposes unrelated to providing you with the services of that campaign. We may share your Personal Data, including your SMS opt-in or consent status, with third parties that help us provide our messaging services, including but not limited to platform providers, phone companies, and any other vendors who assist us in the delivery of text messages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc ml-6 space-y-2 mt-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of SMS messages (text STOP)</li>
              <li>Data portability</li>
            </ul>
            <p className="mt-4">To exercise these rights, contact us at support@rocketsolutions.com.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">7. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">8. Children's Privacy</h2>
            <p>
              Our services are not directed to children under 13. We do not knowingly collect information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">9. Contact Us</h2>
            <div className="ml-4 mt-4">
              <p><strong>Rocket Solutions LLC</strong></p>
              <p>2855 Broome Rd.</p>
              <p>Gainesville, GA</p>
              <p>Hall County, GA</p>
              <p className="mt-2">Email: support@rocketsolutions.com</p>
              <p>SMS: Text HELP for assistance</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}