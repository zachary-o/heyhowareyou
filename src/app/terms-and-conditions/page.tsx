import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TermsPage() {
  return (
    <div className="relative z-10 w-full max-w-2xl px-4 py-16">
      <h1
        className="text-3xl font-bold text-white mb-2"
        style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.03em" }}
      >
        Terms & Conditions
      </h1>
      <p className="text-white/30 text-sm mb-10">Last updated: March 2026</p>

      <div className="flex flex-col gap-8 text-white/60 text-sm leading-relaxed">
        <section>
          <h2 className="text-white/80 font-semibold mb-2">
            1. About the Service
          </h2>
          <p>
            Hey How Are You (
            <strong className="text-white/60">heyhowareyou.vercel.app</strong>)
            is an AI-powered tool that rates dating app opening messages. The
            service provides feedback and scores based on AI analysis. Results
            are for entertainment and informational purposes only.
          </p>
        </section>

        <section>
          <h2 className="text-white/80 font-semibold mb-2">
            2. Use of the Service
          </h2>
          <p>
            By using this service you agree to use it only for lawful purposes.
            You must not submit content that is offensive, abusive, or violates
            the rights of others. We reserve the right to suspend access to
            users who misuse the service.
          </p>
        </section>

        <section>
          <h2 className="text-white/80 font-semibold mb-2">
            3. Payments & Refunds
          </h2>
          <p>
            Access to Top Openers is available for a one-time payment of $4.99
            USD, processed securely via Paddle. Flames (credits) are available
            as one-time purchases and are non-refundable once used. Unused
            Flames may be refunded within 14 days of purchase. To request a
            refund contact us at{" "}
            <strong className="text-white/60">rateyouropener@gmail.com</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-white/80 font-semibold mb-2">4. User Content</h2>
          <p>
            You retain ownership of any opening messages you submit to the
            service. When you choose to make an opener public, you grant us a
            non-exclusive, royalty-free, worldwide, perpetual license to
            display, reproduce, and distribute that content on the platform and
            in promotional materials. You represent that you have the right to
            submit and share any content you make public, and that doing so does
            not violate any third-party rights.
          </p>
        </section>

        <section>
          <h2 className="text-white/80 font-semibold mb-2">
            5. Intellectual Property
          </h2>
          <p>
            By making an opener public on the platform, you acknowledge and
            agree that Hey How Are You may use, feature, adapt, and display that
            content across the platform, including in the Top Openers section,
            marketing materials, and social media, without additional
            compensation beyond any earn-back credits already provided by the
            platform. You waive any right to claim additional remuneration for
            such use.
          </p>
          <p className="mt-3">
            All other intellectual property on the platform — including but not
            limited to the name, logo, design, software, AI models, scoring
            system, and written content — is the exclusive property of Hey How
            Are You. You may not copy, reproduce, modify, distribute, or create
            derivative works from any part of the platform without our prior
            written consent.
          </p>
          <p className="mt-3">
            If you believe any content on the platform infringes your
            intellectual property rights, please contact us at{" "}
            <strong className="text-white/60">rateyouropener@gmail.com</strong>{" "}
            and we will promptly investigate.
          </p>
        </section>

        <section>
          <h2 className="text-white/80 font-semibold mb-2">6. Privacy</h2>
          <p>
            We collect your email address and name via Google/Facebook
            authentication (powered by Clerk). We store your saved openers and
            payment status in our database. We do not sell your personal data to
            third parties. For more information see our <Link href="/privacy" className="text-pink-400/60 hover:text-pink-400 transition-colors">
              Privacy Policy
            </Link>.
          </p>
        </section>

        <section>
          <h2 className="text-white/80 font-semibold mb-2">7. AI Disclaimer</h2>
          <p>
            Ratings and feedback are generated by AI and are not guaranteed to
            be accurate or effective. Results may vary. We are not responsible
            for outcomes of using openers on dating platforms.
          </p>
        </section>

        <section>
          <h2 className="text-white/80 font-semibold mb-2">
            8. Limitation of Liability
          </h2>
          <p>
            The service is provided &apos;as is&apos; without warranties of any
            kind. We are not liable for any damages arising from your use of the
            service, including but not limited to loss of data, revenue, or
            romantic opportunities.
          </p>
        </section>

        <section>
          <h2 className="text-white/80 font-semibold mb-2">
            9. Changes to Terms
          </h2>
          <p>
            We reserve the right to update these terms at any time. Continued
            use of the service after changes constitutes acceptance of the new
            terms.
          </p>
        </section>

        <section>
          <h2 className="text-white/80 font-semibold mb-2">10. Contact</h2>
          <p>
            For any questions regarding these terms or to request a refund,
            contact us at{" "}
            <strong className="text-white/60">rateyouropener@gmail.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}