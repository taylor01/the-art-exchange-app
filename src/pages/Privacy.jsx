// Plain-language privacy policy. Keep it true to what the app and API
// actually do; update UPDATED whenever the substance changes.
const UPDATED = 'November 23, 2026';
const CONTACT = <a href="mailto:hello@theartexch.com">hello@theartexch.com</a>;

export default function Privacy() {
  return (
    <article className="prose">
      <h1>Privacy Policy</h1>
      <p className="muted"><strong>Last updated:</strong> {UPDATED}</p>

      <p>
        The Art Exchange (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a catalog of concert posters and a place for collectors to
        track their collections and buy, sell and trade with each other. This policy says what we collect, what we do with it
        and what you can do about it. Questions: {CONTACT}.
      </p>

      <section>
        <h2>1. What we collect</h2>
        <h3>When you browse</h3>
        <p>
          You can browse the archive without an account. Like most websites, our servers and our hosting provider keep
          request logs (IP address, browser, the page asked for and the time) for security and troubleshooting. We don&apos;t
          use advertising or analytics trackers.
        </p>
        <h3>When you have an account</h3>
        <ul>
          <li><strong>Your email address.</strong> We sign you in by emailing a one-time code; there is no password.</li>
          <li><strong>Your profile:</strong> a handle (we generate one, and you can change it), and optionally your name and city.</li>
          <li><strong>Your wall:</strong> the posters you own, want or have for sale, with any edition, condition, price, notes and photos you add, and the shows you&apos;ve been to.</li>
          <li><strong>Messages</strong> you send other collectors about a copy for sale, and the trades you record and confirm.</li>
          <li><strong>Recordings</strong> you upload, and the descriptions that come with them.</li>
        </ul>
      </section>

      <section>
        <h2>2. What other people can see</h2>
        <ul>
          <li>Your <strong>hunt list</strong> and <strong>for-sale list</strong> are private until you make them public in Settings. A public list appears on your collector page (<code>theartexch.com/c/your-handle</code>) under your handle, and copies on a public for-sale list appear on that poster&apos;s page.</li>
          <li>The rest of your wall, your email address, your notes and what you paid are never shown to anyone else.</li>
          <li>A <strong>conversation</strong> about a copy is visible only to the buyer and the seller. Neither sees the other&apos;s email address. If one of you reports a conversation, we read it to deal with the report.</li>
          <li>The price of a <strong>confirmed trade</strong> can appear in that poster&apos;s price history, with no names attached.</li>
        </ul>
      </section>

      <section>
        <h2>3. How we use it</h2>
        <ul>
          <li>To run the service: sign you in, keep your wall, show your public lists and deliver messages.</li>
          <li>To email you: sign-in codes, a note when someone messages you (it doesn&apos;t include the message), and notes about trades you&apos;re part of. We don&apos;t send marketing email.</li>
          <li>To keep the service safe: rate limits, investigating reports, and stopping abuse and fraud.</li>
          <li>To build the archive: poster images in the catalog and the descriptions of uploaded recordings may be processed by an AI model (Anthropic&apos;s Claude, through Amazon Bedrock) to fill in details such as the band, venue and setlist. Your email address and private wall aren&apos;t sent.</li>
        </ul>
        <p>We don&apos;t sell your personal information or share it for advertising.</p>
      </section>

      <section>
        <h2>4. Who processes it for us</h2>
        <p>
          Everything is hosted on Amazon Web Services in the United States: our servers and database, photo and file storage,
          email delivery (Amazon SES) and the AI model above (Amazon Bedrock). Beyond these, we disclose information only if
          the law requires it, or to protect people from fraud or harm.
        </p>
      </section>

      <section>
        <h2>5. Cookies and storage in your browser</h2>
        <p>
          We don&apos;t set tracking cookies. When you sign in, your browser stores a sign-in token on your device so you stay
          signed in; signing out removes it.
        </p>
      </section>

      <section>
        <h2>6. Deleting your account</h2>
        <p>
          You can delete your account from Settings at any time. We ask for a fresh code from your email first. Deleting it
          removes your profile, your wall and its photos, your shows and your sign-in straight away. What other people rely
          on stays, without your name: conversations you were in remain with the other person, with your messages blanked;
          confirmed trades stay, anonymized, in price history. Database backups kept for recovery are deleted after 7 days.
        </p>
      </section>

      <section>
        <h2>7. Your rights</h2>
        <p>
          Depending on where you live, you may have the right to see the personal information we hold about you, correct it,
          get a copy of it, or have it deleted. Most of it you can see and change yourself in the app. For anything else, email{' '}
          {CONTACT} and we&apos;ll answer within 30 days. If you&apos;re in California, the same applies under the CCPA, and we
          don&apos;t sell personal information.
        </p>
      </section>

      <section>
        <h2>8. Children</h2>
        <p>
          The Art Exchange isn&apos;t meant for children under 13, and we don&apos;t knowingly collect their information. If you
          think a child has made an account, email {CONTACT} and we&apos;ll delete it.
        </p>
      </section>

      <section>
        <h2>9. Security</h2>
        <p>
          Data is encrypted in transit and at rest, access is limited to the people who run the service, and sign-in codes are
          single-use and short-lived. No system is perfectly secure, so we can&apos;t promise nothing will ever go wrong, but if
          a breach affects your information we&apos;ll tell you.
        </p>
      </section>

      <section>
        <h2>10. Changes</h2>
        <p>
          If we change this policy, we&apos;ll update the date at the top. If a change affects how your information is shared,
          we&apos;ll tell you by email before it takes effect.
        </p>
      </section>
    </article>
  );
}
