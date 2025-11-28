export default function Privacy() {
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h1 className="mb-4">Privacy Policy</h1>
          <p className="text-muted mb-5">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-5">
            <h2 className="h4 mb-3">1. Introduction</h2>
            <p>
              Welcome to The Art Exchange ("we," "us," or "our"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
            <p>
              If you have any questions or concerns about this policy or our practices with regard to your personal information, please contact us at{' '}
              <a href="mailto:hello@theartexch.com">hello@theartexch.com</a>.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">2. Information We Collect</h2>

            <h3 className="h5 mb-3">2.1 Personal Information You Provide</h3>
            <p>We collect personal information that you voluntarily provide to us when you:</p>
            <ul>
              <li>Register for an account (email address, username, password)</li>
              <li>Create or update your profile (name, bio, location, collector information)</li>
              <li>Add posters to your collection (poster details, condition notes, edition information)</li>
              <li>Contact us for support or inquiries</li>
            </ul>

            <h3 className="h5 mb-3 mt-4">2.2 Automatically Collected Information</h3>
            <p>When you visit our website, we automatically collect certain information about your device and usage, including:</p>
            <ul>
              <li>Log data (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, time spent, features used)</li>
              <li>Device information (device type, screen resolution)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3 className="h5 mb-3 mt-4">2.3 Image Data</h3>
            <p>
              When you upload images of posters to your collection, we store these images on cloud storage services (AWS S3).
              We may use AI services (Anthropic Claude API) to analyze poster images for metadata extraction, categorization,
              and enhanced search functionality.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Create and manage your account</li>
              <li>Enable you to catalog and track your poster collection</li>
              <li>Analyze usage patterns and improve user experience</li>
              <li>Send you administrative messages, updates, and security alerts</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">4. Information Sharing and Disclosure</h2>

            <h3 className="h5 mb-3">4.1 Third-Party Service Providers</h3>
            <p>We share your information with third-party service providers who perform services on our behalf, including:</p>
            <ul>
              <li><strong>Cloud Storage:</strong> AWS S3 for storing images and data</li>
              <li><strong>Analytics:</strong> Google Analytics or similar services for usage analytics</li>
              <li><strong>Email Services:</strong> Email service providers for sending notifications and communications</li>
              <li><strong>AI Services:</strong> Anthropic Claude API for image analysis and metadata extraction</li>
            </ul>

            <h3 className="h5 mb-3 mt-4">4.2 Legal Requirements</h3>
            <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities.</p>

            <h3 className="h5 mb-3 mt-4">4.3 Business Transfers</h3>
            <p>
              In the event of a merger, acquisition, or sale of assets, your information may be transferred.
              We will provide notice before your information is transferred and becomes subject to a different privacy policy.
            </p>

            <h3 className="h5 mb-3 mt-4">4.4 With Your Consent</h3>
            <p>We may share your information for any other purpose with your consent.</p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information.
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to
              use commercially acceptable means to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">6. Your Privacy Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul>
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Data Portability:</strong> Request a copy of your data in a structured format</li>
              <li><strong>Opt-Out:</strong> Opt out of marketing communications</li>
              <li><strong>Withdrawal of Consent:</strong> Withdraw consent where we rely on consent for processing</li>
            </ul>
            <p>
              To exercise these rights, please contact us at{' '}
              <a href="mailto:hello@theartexch.com">hello@theartexch.com</a>.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">7. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our service and store certain information.
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you
              do not accept cookies, you may not be able to use some portions of our service.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">8. Third-Party Links</h2>
            <p>
              Our service may contain links to third-party websites. We are not responsible for the privacy practices of these
              external sites. We encourage you to review the privacy policies of any third-party sites you visit.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">9. Children's Privacy</h2>
            <p>
              While our service does not have a specific age restriction, we do not knowingly collect personal information from
              children under 13 without parental consent. If you are a parent or guardian and believe your child has provided
              us with personal information, please contact us so we can take appropriate action.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and maintained on computers located outside of your state, province,
              country, or other governmental jurisdiction where data protection laws may differ. By using our service, you
              consent to the transfer of your information to the United States and other locations as necessary to provide
              our services.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">11. Data Retention</h2>
            <p>
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this
              Privacy Policy, unless a longer retention period is required or permitted by law. When you delete your account,
              we will delete or anonymize your information within a reasonable timeframe.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">12. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy
              Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">13. California Privacy Rights</h2>
            <p>
              If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA),
              including the right to request disclosure of information we collect, the right to request deletion of your
              information, and the right to opt-out of the sale of personal information. We do not sell your personal
              information.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">14. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-unstyled">
              <li>Email: <a href="mailto:hello@theartexch.com">hello@theartexch.com</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
