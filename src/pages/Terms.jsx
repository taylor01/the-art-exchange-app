export default function Terms() {
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h1 className="mb-4">Terms and Conditions</h1>
          <p className="text-muted mb-5">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-5">
            <h2 className="h4 mb-3">1. Acceptance of Terms</h2>
            <p>
              Welcome to The Art Exchange. By accessing or using our website and services (collectively, the "Service"),
              you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, please
              do not use the Service.
            </p>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the
              new Terms on this page and updating the "Last Updated" date. Your continued use of the Service after any
              such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">2. Description of Service</h2>
            <p>
              The Art Exchange is a platform for art poster collectors to catalog, track, and manage their collections.
              Our Service allows you to:
            </p>
            <ul>
              <li>Create and maintain a digital catalog of your poster collection</li>
              <li>Track poster details including condition, edition, and provenance</li>
              <li>Discover and browse posters from various artists, venues, and events</li>
              <li>Connect with other collectors (future feature)</li>
              <li>Buy, sell, or trade posters (planned future feature)</li>
            </ul>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">3. User Accounts</h2>

            <h3 className="h5 mb-3">3.1 Account Creation</h3>
            <p>
              To use certain features of the Service, you must register for an account. You agree to provide accurate,
              current, and complete information during registration and to update such information to keep it accurate,
              current, and complete.
            </p>

            <h3 className="h5 mb-3 mt-4">3.2 Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities
              that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>

            <h3 className="h5 mb-3 mt-4">3.3 Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account at any time for any reason, including but not
              limited to violation of these Terms. You may delete your account at any time through your account settings.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">4. User Content</h2>

            <h3 className="h5 mb-3">4.1 Your Content</h3>
            <p>
              You retain ownership of any content you submit, post, or upload to the Service ("User Content"), including
              images, descriptions, and other information about your poster collection.
            </p>

            <h3 className="h5 mb-3 mt-4">4.2 License to Use Content</h3>
            <p>
              By submitting User Content to the Service, you grant us a worldwide, non-exclusive, royalty-free license to
              use, reproduce, modify, adapt, publish, and display such content for the purpose of operating and improving
              the Service. This includes using AI services to analyze poster images for metadata extraction and categorization.
            </p>

            <h3 className="h5 mb-3 mt-4">4.3 Content Standards</h3>
            <p>You agree that your User Content will not:</p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Contain offensive, inappropriate, or harmful content</li>
              <li>Include false or misleading information</li>
              <li>Contain viruses, malware, or other harmful code</li>
            </ul>

            <h3 className="h5 mb-3 mt-4">4.4 Content Removal</h3>
            <p>
              We reserve the right to remove any User Content that violates these Terms or that we deem inappropriate,
              without prior notice.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">5. Intellectual Property</h2>

            <h3 className="h5 mb-3">5.1 Our Intellectual Property</h3>
            <p>
              The Service and its original content (excluding User Content), features, and functionality are owned by
              The Art Exchange and are protected by international copyright, trademark, patent, trade secret, and other
              intellectual property laws.
            </p>

            <h3 className="h5 mb-3 mt-4">5.2 Third-Party Content</h3>
            <p>
              Images and information about art posters may be subject to copyright and other intellectual property rights
              held by artists, venues, or other third parties. Users are responsible for ensuring they have the right to
              upload and share images of posters in their collection.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">6. Prohibited Uses</h2>
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Violate any laws or regulations</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Engage in unauthorized scraping, data mining, or harvesting</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Upload malicious code or attempt to gain unauthorized access</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Engage in fraudulent activities or scams</li>
              <li>Use the Service for any commercial purpose without our permission</li>
            </ul>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">7. Future E-Commerce Features</h2>
            <p>
              We plan to introduce marketplace features that will allow users to buy, sell, or trade posters. When these
              features become available, additional terms and conditions will apply. These may include:
            </p>
            <ul>
              <li>Transaction fees and payment processing terms</li>
              <li>Seller and buyer obligations</li>
              <li>Dispute resolution procedures</li>
              <li>Shipping and delivery policies</li>
            </ul>
            <p>
              We are not responsible for transactions between users. Users enter into such transactions at their own risk.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">8. Disclaimers</h2>

            <h3 className="h5 mb-3">8.1 Service "As Is"</h3>
            <p>
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
              PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h3 className="h5 mb-3 mt-4">8.2 No Warranty</h3>
            <p>
              We do not warrant that the Service will be uninterrupted, secure, or error-free, or that defects will be
              corrected. We make no warranties about the accuracy, reliability, or completeness of any content on the Service.
            </p>

            <h3 className="h5 mb-3 mt-4">8.3 Valuation and Authentication</h3>
            <p>
              We do not provide professional appraisal, authentication, or valuation services. Any price information,
              condition assessments, or other data provided through the Service is for informational purposes only and
              should not be relied upon as professional advice.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE ART EXCHANGE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY
              OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
            </p>
            <ul>
              <li>Your use or inability to use the Service</li>
              <li>Any unauthorized access to or use of your account or data</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Any User Content or materials transmitted through the Service</li>
              <li>Any transactions between users</li>
            </ul>
            <p>
              IN NO EVENT SHALL OUR AGGREGATE LIABILITY EXCEED THE AMOUNT PAID BY YOU TO US IN THE TWELVE (12) MONTHS
              PRECEDING THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">10. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless The Art Exchange and its officers, directors, employees,
              and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable
              attorneys' fees, arising out of or in any way connected with:
            </p>
            <ul>
              <li>Your access to or use of the Service</li>
              <li>Your User Content</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
            </ul>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">11. Governing Law and Dispute Resolution</h2>

            <h3 className="h5 mb-3">11.1 Governing Law</h3>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of North Carolina,
              United States, without regard to its conflict of law provisions.
            </p>

            <h3 className="h5 mb-3 mt-4">11.2 Dispute Resolution</h3>
            <p>
              Any disputes arising out of or relating to these Terms or the Service shall be resolved through binding
              arbitration in accordance with the rules of the American Arbitration Association, except that either party
              may seek injunctive or equitable relief in a court of competent jurisdiction.
            </p>

            <h3 className="h5 mb-3 mt-4">11.3 Class Action Waiver</h3>
            <p>
              You agree to resolve disputes with us on an individual basis and waive your right to participate in class
              actions or class-wide arbitration.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">12. Modifications to Service</h2>
            <p>
              We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof)
              with or without notice. We shall not be liable to you or any third party for any modification, suspension,
              or discontinuance of the Service.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">13. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or
              eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">14. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and The Art
              Exchange regarding the use of the Service and supersede all prior agreements and understandings.
            </p>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">15. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us:
            </p>
            <ul className="list-unstyled">
              <li>Email: <a href="mailto:hello@theartexch.com">hello@theartexch.com</a></li>
            </ul>
          </section>

          <section className="mb-5">
            <h2 className="h4 mb-3">16. Acknowledgment</h2>
            <p>
              BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS AND AGREE TO BE BOUND BY THEM.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
