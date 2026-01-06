export const metadata = {
  title: 'Terms of Service - Rocket Solutions',
  description: 'Terms of Service for Rocket Solutions LLC',
}

export default function TermsPage() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Terms of Service</h1>
        <p className="text-gray-600 mb-8">
          <strong>Effective Date:</strong> January 6, 2026<br />
          <strong>Last Updated:</strong> January 6, 2026
        </p>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">1. Agreement to Terms</h2>
            <p>
              These Terms of Service ("Terms") constitute a legally binding agreement between you and Rocket Solutions LLC concerning your access to and use of our website, services, and SMS messaging program.
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
            <h2 className="text-2xl font-bold mb-4 text-gray-900">2. SMS Text Messaging Terms</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Consent to Receive Messages</h3>
            <p>
              By providing your mobile phone number and opting-in to our SMS program, you expressly consent to receive automated text messages from Rocket Solutions at the phone number you provided. These messages may include account updates, service information, transactional messages, and customer support communications.
            </p>
            <p className="mt-4">
              <strong>Your consent is not a condition of purchase.</strong> You can use our services without opting into SMS messages.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4 text-gray-900">Message Frequency and Charges</h3>
            <p>
              <strong>Message Frequency:</strong> You may receive 10-50 messages per day during active periods.
            </p>
            <p className="mt-2">
              <strong>Charges:</strong> Message and data rates may apply based on your mobile carrier's plan.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4 text-gray-900">Opt-Out and Help</h3>
            <p>
              <strong>To Opt-Out:</strong> Text STOP, UNSUBSCRIBE, CANCEL, END, or QUIT to any message. You'll receive a confirmation and will no longer receive messages unless you re-opt-in.
            </p>
            <p className="mt-2">
              <strong>For Help:</strong> Text HELP to any message or contact support@rocketsolutions.com.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4 text-gray-900">Supported Carriers</h3>
            <p>
              Our SMS program is available on all major U.S. carriers including AT&T, T-Mobile, Verizon, Sprint, and others.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">3. Services</h2>
            <p>
              Rocket Solutions provides custom website design and development services for home service businesses, including website hosting, maintenance, self-editing tools, and customer support.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">4. User Accounts</h2>
            <p>
              You agree to provide accurate information, maintain secure credentials, and accept responsibility for all activities under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">5. Acceptable Use</h2>
            <p>
              You agree to use our services lawfully and not to violate any laws, infringe on others' rights, transmit harmful code, or attempt unauthorized access to our systems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">6. Intellectual Property</h2>
            <p>
              All content and functionality of our services are owned by Rocket Solutions or our licensors. You retain ownership of content you provide and grant us a license to use it in connection with our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">7. Disclaimers and Limitations</h2>
            <p>
              OUR SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES. WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID IN THE TWELVE MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">8. Governing Law</h2>
            <p>
              These Terms are governed by Georgia law. Disputes shall be resolved in the courts located in Hall County, Georgia.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">9. Contact Information</h2>
            <div className="ml-4 mt-4">
              <p><strong>Rocket Solutions LLC</strong></p>
              <p>2855 Broome Rd.</p>
              <p>Gainesville, GA</p>
              <p>Hall County, GA</p>
              <p className="mt-2">Email: support@rocketsolutions.com</p>
              <p>SMS: Text HELP for assistance</p>
            </div>
          </section>

          <section className="mt-12 pt-8 border-t border-gray-300">
            <p className="text-sm text-gray-600">
              <strong>SMS Program Quick Reference:</strong><br />
              • Text STOP to opt-out<br />
              • Text HELP for assistance<br />
              • Message frequency: 10-50 messages per day during active periods<br />
              • Message and data rates may apply<br />
              • Consent not required to purchase services<br />
              • Contact: support@rocketsolutions.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
