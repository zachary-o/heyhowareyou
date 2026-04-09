import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivacyPage() {
  return (
    <div className="relative z-10 w-full max-w-2xl px-4 py-16">
      <h1
        className="text-3xl font-bold text-white mb-2"
        style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.03em" }}
      >
        Privacy Policy
      </h1>
      <p className="text-white/30 text-sm mb-10">Last updated: March 2026</p>

      <div className="flex flex-col gap-8 text-white/60 text-sm leading-relaxed">
        <section>
          <h2 className="text-white/80 font-semibold mb-2">1. Introduction</h2>
          <p>
            Hey How Are You (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;)
            operates heyhowareyou.vercel.app. This Privacy Policy explains what
            data we collect, how we use it, and your rights regarding your
            personal information. By using the service you agree to the
            practices described in this policy.
          </p>
        </section>

        <section>
          <h2 className="text-white/80 font-semibold mb-2">2. Data We Collect</h2>
          <p className="mb-3">We collect the following categories of data:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-white/60">Account information</strong> —
              your name and email address, collected when you sign in via Google
              or other providers through Clerk.
            </li>
            <li>
              <strong className="text-white/60">Opener content</strong> — the
              dating app opening messages you submit for rating. If you choose
              to make an opener public, it is stored and displayed on the
              platform.
            </li>
            <li>
              <strong className="text-white/60">Profile screenshots</strong> —
              images you optionally upload for full context ratings. These are
              processed by Google Gemini and are not stored on our servers.
            </li>
            <li>
              <strong className="text-white/60">Payment information</strong> —
              we do not store your payment details. All transactions are handled
              by Paddle, our payment processor. We only store your payment
              status (premium or not) and credit balance.
            </li>
            <li>
              <strong className="text-white/60">Usage data</strong> — basic
              analytics such as pages visited and features used, collected to
              improve the service.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-white/80 font-semibold mb-2">
            3. How We Use Your Data
          </h2>
          <p className="mb-3">We use your data to:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Provide and operate the service</li>
            <li>Process payments and manage your credit balance</li>
            <li>Display your public openers to other premium users</li>
            <li>Send transactional emails (e.g. payment confirmation) via Clerk</li>
            <li>Improve our AI rating system over time</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p className="mt-3">
            We do not use your data for advertising purposes and we do not sell
            your personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-white/80 font-semibold mb-2">
            4. Third-Party Services
          </h2>
          <p className="mb-3">
            We use the following third-party services to operate the platform.
            Each has their own privacy policy governing how they handle data:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-white/60">Clerk</strong> — authentication
              and user management. Handles your login, name, and email.{" "}
              <a
                href="https://clerk.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400/60 hover:text-pink-400 transition-colors"
              >
                clerk.com/privacy
              </a>
            </li>
            <li>
              <strong className="text-white/60">Supabase</strong> — database
              hosting. Stores your openers, credit balance, and premium status.{" "}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400/60 hover:text-pink-400 transition-colors"
              >
                supabase.com/privacy
              </a>
            </li>
            <li>
              <strong className="text-white/60">Paddle</strong> — payment
              processing. Handles all billing and stores your payment details.{" "}
              <a
                href="https://www.paddle.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400/60 hover:text-pink-400 transition-colors"
              >
                paddle.com/legal/privacy
              </a>
            </li>
            <li>
              <strong className="text-white/60">Groq</strong> — AI inference
              for basic opener ratings. Your opener text is sent to Groq for
              processing.{" "}
              <a
                href="https://groq.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400/60 hover:text-pink-400 transition-colors"
              >
                groq.com/privacy-policy
              </a>
            </li>
            <li>
              <strong className="text-white/60">Google Gemini</strong> — AI
              inference for full context ratings including image analysis. Your
              opener text and any uploaded screenshots are sent to Google for
              processing. On the free tier, this data may be used by Google to
              improve their models.{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400/60 hover:text-pink-400 transition-colors"
              >
                policies.google.com/privacy
              </a>
            </li>
            <li>
              <strong className="text-white/60">Vercel</strong> — hosting and
              infrastructure.{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400/60 hover:text-pink-400 transition-colors"
              >
                vercel.com/legal/privacy-policy
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-white/80 font-semibold mb-2">5. Cookies</h2>
          <p>
            We use cookies strictly necessary for the operation of the service,
            including authentication session cookies managed by Clerk. We do not
            use advertising or tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="text-white/80 font-semibold mb-2">
            6. Data Retention
          </h2>
          <p>
            We retain your account data and saved openers for as long as your
            account is active. If you delete your account, your personal data
            and private openers are deleted within 30 days. Public openers may
            be retained in anonymized form for platform quality purposes.
          </p>
        </section>

        <section>
          <h2 className="text-white/80 font-semibold mb-2">
            7. Your Rights (GDPR)
          </h2>
          <p className="mb-3">
            If you are located in the European Economic Area, you have the
            following rights regarding your personal data:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-white/60">Access</strong> — request a
              copy of the data we hold about you
            </li>
            <li>
              <strong className="text-white/60">Rectification</strong> — request
              correction of inaccurate data
            </li>
            <li>
              <strong className="text-white/60">Erasure</strong> — request
              deletion of your personal data
            </li>
            <li>
              <strong className="text-white/60">Portability</strong> — request
              your data in a machine-readable format
            </li>
            <li>
              <strong className="text-white/60">Objection</strong> — object to
              certain types of processing
            </li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, contact us at{" "}
            <strong className="text-white/60">rateyouropener@gmail.com</strong>.
            We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-white/80 font-semibold mb-2">
            8. Children&apos;s Privacy
          </h2>
          <p>
            This service is intended for users aged 18 and over. We do not
            knowingly collect personal data from anyone under the age of 18. If
            you believe a minor has submitted data to our service, contact us
            and we will delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-white/80 font-semibold mb-2">
            9. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of significant changes by updating the date at the top of this
            page. Continued use of the service after changes constitutes
            acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-white/80 font-semibold mb-2">10. Contact</h2>
          <p>
            For any privacy-related questions or requests, contact us at{" "}
            <strong className="text-white/60">rateyouropener@gmail.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}