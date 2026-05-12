import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | ChatBot SaaS",
  description: "Learn how we collect, use, and protect your data at ChatBot SaaS.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 font-outfit py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-orange-500 hover:text-orange-400 transition-colors mb-8 inline-block font-bold">
          ← Back to Home
        </Link>
        <h1 className="text-4xl font-black text-white mb-8 tracking-tight">Privacy Policy</h1>
        <div className="space-y-8 leading-relaxed text-zinc-400">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p>
              ChatBot SaaS collects information to provide better services to our users. This includes:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Contact details (Name, Email, Phone number) captured via chatbot lead forms.</li>
              <li>Business information provided during registration.</li>
              <li>Usage data and interaction history with our AI chatbots.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Data Storage and Handling</h2>
            <p>
              Your data is stored securely using industry-standard encryption. If you enable third-party integrations (like Google Sheets or CRMs), data will be synced according to your configuration.
            </p>
            <p className="mt-4 text-zinc-500">
              <strong>WhatsApp Data:</strong> When using WhatsApp Sync, we process messages to facilitate AI responses. We do not store your personal WhatsApp messages beyond what is necessary for the chatbot service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Indian Data Protection (DPDPA 2023)</h2>
            <p>
              In compliance with the Digital Personal Data Protection Act (DPDPA) 2023 of India, we recognize your rights to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Request access to your personal data.</li>
              <li>Request correction or erasure of your data.</li>
              <li>Withdraw consent at any time.</li>
              <li>Nominate a person to exercise your rights in case of death or incapacity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Contact Information</h2>
            <p>
              For any data-related requests or privacy concerns, please contact our Data Protection Officer at:
              <br />
              <a href="mailto:privacy@chatbotsaas.in" className="text-orange-500 font-bold hover:underline">privacy@chatbotsaas.in</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
