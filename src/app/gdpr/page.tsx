import Link from "next/link";

export const metadata = {
  title: "GDPR Compliance | ChatBot SaaS",
  description: "Learn about our commitment to GDPR and your data rights.",
};

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 font-outfit py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-orange-500 hover:text-orange-400 transition-colors mb-8 inline-block font-bold">
          ← Back to Home
        </Link>
        <h1 className="text-4xl font-black text-white mb-8 tracking-tight">GDPR Compliance</h1>
        <div className="space-y-8 leading-relaxed text-zinc-400">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Data Processing Basis</h2>
            <p>
              We process personal data based on your consent and for the performance of our contract with you. For users in the EU, we adhere to the General Data Protection Regulation (GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Your Rights</h2>
            <p>
              Under GDPR, you have the following rights:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of the data we hold about you.</li>
              <li><strong>Right to Erasure:</strong> Request that we delete your personal data.</li>
              <li><strong>Right to Portability:</strong> Request that we transfer your data to another service.</li>
              <li><strong>Right to Object:</strong> Object to the processing of your data for specific purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Data Retention</h2>
            <p>
              We retain personal data only for as long as necessary to provide our services or as required by law. Typically, data is kept for the duration of your active subscription plus 12 months for compliance records.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Contact for GDPR Requests</h2>
            <p>
              To exercise your rights under GDPR, please email us at:
              <br />
              <a href="mailto:gdpr@chatbotsaas.in" className="text-orange-500 font-bold hover:underline">gdpr@chatbotsaas.in</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
