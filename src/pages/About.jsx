import { Link } from 'react-router-dom';
import { accountsEnabled } from '../config/features';

export default function About() {
  return (
    <article className="prose">
      <h1>About The Art Exchange</h1>
      <p className="body-l">
        Where concert poster collectors come together to catalog, discover, and share their passion for art.
      </p>

      <h2>How It All Started</h2>
      <p>
        Like many great ideas, The Art Exchange was born out of necessity. As a lifelong poster collector,
        I found myself drowning in spreadsheets, scattered photos, and handwritten notes trying to keep
        track of my growing collection. There had to be a better way.
      </p>
      <p>
        After years of collecting concert posters from shows, artists, and venues around the world, I
        realized I wasn&apos;t alone in this struggle. Collectors everywhere were using makeshift systems to
        catalog their prized pieces. We deserved something better—something built by collectors, for collectors.
      </p>
      <p>
        So I built The Art Exchange: a platform that combines my love for concert poster art with modern
        technology to make collecting easier, more organized, and a whole lot more fun.
      </p>

      <h2>Our Mission</h2>
      <p>We&apos;re on a mission to make poster collecting accessible, organized, and connected.</p>
      <h3>Preserve Art History</h3>
      <p>
        Concert posters are more than art—they&apos;re cultural artifacts. We&apos;re building a comprehensive
        archive to preserve this important history for future generations.
      </p>
      <h3>Connect Collectors</h3>
      <p>
        Collecting is better together. We&apos;re building a community where enthusiasts can share,
        discover, and connect over their love of poster art.
      </p>
      <h3>Simplify Collecting</h3>
      <p>
        No more spreadsheets or shoeboxes. We&apos;ve built tools that make cataloging, organizing,
        and managing your collection effortless.
      </p>

      <h2>What Makes Us Different</h2>
      <h3>AI-Powered Intelligence</h3>
      <p>
        We use cutting-edge AI to automatically analyze and categorize your posters, extracting
        details like artists, venues, dates, and visual elements—so you don&apos;t have to.
      </p>
      <h3>Built by Collectors</h3>
      <p>
        We&apos;re not outsiders trying to capitalize on a trend. We&apos;re collectors ourselves, building
        the tools we wish existed when we started our own collections.
      </p>
      <h3>Comprehensive Database</h3>
      <p>
        We&apos;ve curated a massive catalog of concert posters from artists, venues, and shows worldwide.
        Whether you&apos;re tracking rare finds or common pieces, we&apos;ve got you covered.
      </p>
      <h3>Simple &amp; Intuitive</h3>
      <p>
        We believe great software shouldn&apos;t need a manual. Our clean, user-friendly interface makes
        it easy to get started, whether you&apos;re a tech wizard or just getting comfortable online.
      </p>

      <h2>Join Thousands of Collectors</h2>
      <p>
        From casual fans to serious archivists, our community includes collectors of all levels who share
        a passion for concert poster art.
      </p>
      <p>
        Whether you&apos;re just starting your collection or you&apos;ve been at it for decades, you&apos;ll find
        like-minded enthusiasts, helpful resources, and maybe even that poster you&apos;ve been hunting for years.
      </p>

      <h2>Looking Forward</h2>
      <p>
        We&apos;re just getting started. Our roadmap includes marketplace features for buying, selling, and trading
        posters, enhanced social features for connecting with other collectors, and even more powerful tools
        for managing and showcasing your collection.
      </p>
      <p>
        This platform is built <em>with</em> our community, not just <em>for</em> them. We&apos;re always listening
        to feedback and ideas. Got suggestions? We&apos;d love to hear from you at{' '}
        <a href="mailto:hello@theartexch.com">hello@theartexch.com</a>.
      </p>

      <section className="tax-panel stack" style={{ marginTop: 'var(--space-7)', padding: 'var(--space-6)', background: 'var(--accent)', boxShadow: 'var(--shadow-lg)' }}>
        {accountsEnabled ? (
          <>
            <h3 className="display-s" style={{ margin: 0 }}>Ready to start your wall?</h3>
            <p style={{ margin: 0 }}>Join and start cataloging your posters today.</p>
            <Link to="/join" className="tax-btn tax-btn--ink" style={{ alignSelf: 'flex-start' }}>Start your wall</Link>
          </>
        ) : (
          <>
            <h3 className="display-s" style={{ margin: 0 }}>Explore the archive</h3>
            <p style={{ margin: 0 }}>Browse concert posters and the shows behind them.</p>
            <Link to="/gallery" className="tax-btn tax-btn--ink" style={{ alignSelf: 'flex-start' }}>Browse the archive</Link>
          </>
        )}
      </section>
    </article>
  );
}
